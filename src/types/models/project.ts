import type { ChatMessage, DesignFile } from '../../app/[locale]/design/lib/types';

export type Project = {
  id: string;
  title: string;
  requirement: string;
  createdAt: number;
  updatedAt: number;
  state: ProjectState;
};

export type ProjectState = {
  messages: ChatMessage[];
  files: DesignFile[];
  activeFile: string | null;
};

export type ProjectSummary = Omit<Project, 'state'>;
