import type { SkillDefinition, StoredCustomSkill } from './types';
import { BUILTIN_SKILLS } from './skills';

const DB_NAME = 'snake_design';
const DB_VERSION = 1;
const STORE_NAME = 'skills';

export class SkillManager {
  private skills: Map<string, SkillDefinition> = new Map();
  private db: IDBDatabase | null = null;

  // ---- 加载 ----

  /** 加载所有 Skill（内置同步 + 自定义异步 IndexedDB） */
  async loadAll(): Promise<void> {
    this.skills.clear();

    for (const raw of BUILTIN_SKILLS) {
      const parsed = this.parseSkillMd(raw.content, raw.files, 'builtin');
      if (parsed) {
        this.skills.set(parsed.name, parsed);
      }
    }

    try {
      const custom = await this.loadCustomSkillsFromIndexedDB();
      for (const [name, skill] of custom) {
        this.skills.set(name, skill);
      }
    } catch (e) {
      console.warn('[SkillManager] IndexedDB 加载失败，仅使用内置 Skill:', e);
    }
  }

  // ---- 解析 ----

  /** 解析单个 SKILL.md 原始文本为 SkillDefinition */
  parseSkillMd(
    rawContent: string,
    files?: Record<string, string>,
    source: 'builtin' | 'custom' = 'custom',
  ): SkillDefinition | null {
    const trimmed = rawContent.trim();
    if (!trimmed) {
      return null;
    }

    const frontmatterRegex = /^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/;
    const match = trimmed.match(frontmatterRegex);

    if (!match) {
      console.warn('[SkillManager] SKILL.md 缺少 frontmatter，跳过');
      return null;
    }

    const yamlPart = match[1];
    if (!yamlPart) {
      return null;
    }

    const body = match[2]?.trim();
    if (!body) {
      console.warn('[SkillManager] SKILL.md body 为空，跳过');
      return null;
    }

    // eslint-disable-next-line regexp/no-super-linear-backtracking -- controlled YAML input
    const nameMatch = yamlPart.match(/^name:[ \t]*(.+)$/m);
    if (!nameMatch) {
      console.warn('[SkillManager] SKILL.md 缺少 name 字段，跳过');
      return null;
    }
    const name = nameMatch[1]!.trim();

    // eslint-disable-next-line regexp/no-super-linear-backtracking -- controlled YAML input
    const descMatch = yamlPart.match(/^description:[ \t]*["']?([\s\S]+?)["']?$/m);
    const description = descMatch ? descMatch[1]!.trim() : '';

    return { name, description, prompt: body, content: rawContent, source, files: files ?? {} };
  }

  // ---- 用户自定义 Skill 管理（IndexedDB）----

  /** 从 IndexedDB 加载用户自定义 Skill */
  private async loadCustomSkillsFromIndexedDB(): Promise<Map<string, SkillDefinition>> {
    const db = await this.getDB();
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const request = store.getAll();

    return new Promise<Map<string, SkillDefinition>>((resolve) => {
      request.onsuccess = () => {
        const stored = request.result as StoredCustomSkill[];
        const map = new Map<string, SkillDefinition>();
        for (const s of stored) {
          const parsed = this.parseSkillMd(s.content, s.files, 'custom');
          if (parsed) {
            map.set(parsed.name, parsed);
          }
        }
        resolve(map);
      };
      request.onerror = () => {
        console.warn('[SkillManager] IndexedDB 读取失败，使用空列表');
        resolve(new Map());
      };
    });
  }

  /** 保存用户自定义 Skill 到 IndexedDB */
  async saveCustomSkill(content: string, files?: Record<string, string>): Promise<SkillDefinition> {
    const parsed = this.parseSkillMd(content, files, 'custom');
    if (!parsed) {
      throw new Error('[SkillManager] SKILL.md 格式无效：缺少 frontmatter 或 name 字段');
    }

    const now = Date.now();
    const db = await this.getDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const existing = (await store.get(parsed.name)) as unknown as StoredCustomSkill | undefined;

    const stored: StoredCustomSkill = {
      name: parsed.name,
      description: parsed.description,
      content,
      files,
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
    };

    store.put(stored);

    return new Promise<SkillDefinition>((resolve, reject) => {
      tx.oncomplete = () => resolve(parsed);
      tx.onerror = () => reject(new Error('IndexedDB 写入失败'));
    });
  }

  /** 删除用户自定义 Skill */
  async deleteCustomSkill(name: string): Promise<boolean> {
    const db = await this.getDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const request = store.delete(name);

    return new Promise<boolean>((resolve) => {
      request.onsuccess = () => resolve(true);
      request.onerror = () => resolve(false);
    });
  }

  /** 获取所有用户自定义 Skill */
  getCustomSkills(): SkillDefinition[] {
    return Array.from(this.skills.values()).filter(s => s.source === 'custom');
  }

  // ---- 数据查询 ----

  getAllSkills(): SkillDefinition[] {
    return Array.from(this.skills.values());
  }

  getSkill(name: string): SkillDefinition | undefined {
    return this.skills.get(name);
  }

  getSkillFile(skillName: string, filePath: string): string | undefined {
    const skill = this.skills.get(skillName);
    return skill?.files[filePath];
  }

  listSkillFiles(skillName: string): string[] {
    const skill = this.skills.get(skillName);
    return skill ? Object.keys(skill.files) : [];
  }

  // ---- Prompt 生成（Level 1）----

  getSkillIndex(): string {
    const skills = this.getAllSkills();
    if (skills.length === 0) {
      return '';
    }

    const lines = skills.map(s => `- ${s.name}: ${s.description}`);
    return [
      '## Available Skills',
      'Use the "load_skill" tool to load a skill\'s full instructions when relevant to the current task.',
      '',
      ...lines,
      '',
    ].join('\n');
  }

  // ---- IndexedDB 连接管理 ----

  private getDB(): Promise<IDBDatabase> {
    if (this.db) {
      return Promise.resolve(this.db);
    }

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'name' });
        }
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve(request.result);
      };

      request.onerror = () => {
        console.error('[SkillManager] IndexedDB 打开失败:', request.error);
        reject(new Error('IndexedDB 不可用'));
      };
    });
  }
}
