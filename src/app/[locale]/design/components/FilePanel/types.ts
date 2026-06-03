import type { FileStore, SkillManager } from '@/libs/agent-sdk';

export const PREVIEW_PREFIX = 'preview:';

export type TreeNode = {
  name: string;
  path: string;
  isFolder: boolean;
  children: TreeNode[];
};

export type FilePanelProps = {
  activeFile: string | null;
  fileStore: FileStore;
  skillManager?: SkillManager;
  onSelectFile: (path: string) => void;
};
