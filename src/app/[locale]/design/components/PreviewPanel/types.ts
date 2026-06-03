import type { FileStore, SkillManager } from '@/libs/agent-sdk';

export type PreviewPanelProps = {
  activeFile: string | null;
  fileStore: FileStore;
  skillManager?: SkillManager;
};

export type DeviceMode = 'desktop' | 'mobile';
