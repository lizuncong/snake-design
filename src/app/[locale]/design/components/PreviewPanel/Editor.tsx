import type { FileStore, SkillManager } from '@/libs/agent-sdk';
import Editor from '@monaco-editor/react';
import { getLanguage, snakeDesignTheme } from './util';

type EditorCompProps = {
  activeFile: string | null;
  fileStore: FileStore;
  skillManager?: SkillManager;
  refreshKey: number;
};

const SKILL_PREFIX = '.agent/skills/';

function getSkillContent(skillManager: SkillManager, path: string): string | null {
  const rest = path.slice(SKILL_PREFIX.length);
  const slashIdx = rest.indexOf('/');
  if (slashIdx === -1) {
    return null;
  }

  const skillName = rest.slice(0, slashIdx);
  const filePath = rest.slice(slashIdx + 1);

  // SKILL.md → 返回完整原文（含 frontmatter）
  if (filePath === 'SKILL.md') {
    const skill = skillManager.getSkill(skillName);
    return skill?.content ?? null;
  }

  // 其他文件 → 返回 files 中的内容
  return skillManager.getSkillFile(skillName, filePath) ?? null;
}

const EditorComp = ({ activeFile, fileStore, skillManager, refreshKey }: EditorCompProps) => {
  let file = activeFile ? fileStore.getFile(activeFile) : null;

  // 回退：从 skillManager 读取虚拟 Skill 文件
  if (!file && activeFile?.startsWith(SKILL_PREFIX) && skillManager) {
    const content = getSkillContent(skillManager, activeFile);
    if (content !== null) {
      file = { path: activeFile, content, size: content.length, createdAt: 0, updatedAt: 0 };
    }
  }

  const language = activeFile ? getLanguage(activeFile) : 'plaintext';

  return (
    <>
      {
        file
          ? (
              <Editor
                key={`${activeFile}-${refreshKey}`}
                language={language}
                value={file.content}
                theme="vs-dark"
                beforeMount={(monaco) => {
                  monaco.editor.defineTheme('snakeDesign', snakeDesignTheme as Parameters<typeof monaco.editor.defineTheme>[1]);
                  monaco.editor.setTheme('snakeDesign');
                }}
                options={{
                  readOnly: true,
                  minimap: { enabled: false },
                  fontSize: 14,
                  lineHeight: 1.6,
                  fontFamily: '\'JetBrains Mono\', \'Fira Code\', \'Cascadia Code\', \'Consolas\', monospace',
                  fontLigatures: true,
                  lineNumbers: 'on',
                  scrollBeyondLastLine: false,
                  wordWrap: 'on',
                  padding: { top: 16, bottom: 16 },
                  automaticLayout: true,
                  renderLineHighlight: 'line',
                  cursorBlinking: 'smooth',
                  smoothScrolling: true,
                  bracketPairColorization: { enabled: true },
                  guides: {
                    indentation: true,
                    bracketPairs: true,
                  },
                  suggestOnTriggerCharacters: false,
                  parameterHints: { enabled: false },
                  folding: true,
                  foldingHighlight: true,
                  showFoldingControls: 'mouseover',
                  links: true,
                  colorDecorators: true,
                  contextmenu: false,
                  matchBrackets: 'always',
                  autoIndent: 'full',
                  formatOnPaste: true,
                  formatOnType: true,
                }}
                loading={(
                  <div className="flex h-full flex-col items-center justify-center gap-4 bg-[#0d1117]">
                    <div className="flex flex-col items-center gap-3">
                      <svg
                        className="h-12 w-12 animate-spin text-[#58a6ff]"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      <div className="text-center">
                        <p className="text-sm font-medium text-[#8b949e]">正在加载编辑器</p>
                        <p className="mt-1 text-xs text-[#6e7681]">首次加载可能需要几秒钟</p>
                      </div>
                    </div>
                  </div>
                )}
              />
            )
          : (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[#1e1e1e] text-[#666]">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="opacity-30">
                  <polyline points="16 18 22 12 16 6" />
                  <polyline points="8 6 2 12 8 18" />
                </svg>
                <span className="text-sm">选择文件查看源码，或点击「效果预览」查看页面</span>
              </div>
            )
      }
    </>
  );
};

export default EditorComp;
