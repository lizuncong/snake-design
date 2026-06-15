import { frontendDesignSkill } from './frontend-design';

// ui-ux-pro-max 已禁用，保留目录
// import { uiUxProMaxSkill } from './ui-ux-pro-max';

export const BUILTIN_SKILLS: Array<{
  source: 'builtin';
  content: string;
  files?: Record<string, string>;
}> = [
  frontendDesignSkill,
  // uiUxProMaxSkill,
];
