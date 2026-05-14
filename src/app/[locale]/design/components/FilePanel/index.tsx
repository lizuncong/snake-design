'use client';

import { useCallback, useMemo, useState } from 'react';
import { useFileStore } from '../../lib/useFileStore';

type FilePanelProps = {
  activeFile: string | null;
  onSelectFile: (path: string) => void;
  onTogglePreview: () => void;
  showPreview: boolean;
};

type TreeNode = {
  name: string;
  path: string;
  isFolder: boolean;
  children: TreeNode[];
};

const FILE_ICONS: Record<string, string> = {
  html: '\u{1F310}',
  htm: '\u{1F310}',
  css: '\u{1F3A8}',
  js: '\u{1F4D3}',
  jsx: '\u{1F4D3}',
  json: '\u{1F4C4}',
  md: '\u{1F4DD}',
  svg: '\u{1F3B5}',
};

function getFileIcon(path: string): string {
  const ext = path.split('.').pop()?.toLowerCase() || '';
  return FILE_ICONS[ext] || '\u{1F4C4}';
}

function buildTree(files: { path: string }[]): TreeNode[] {
  const root: TreeNode[] = [];

  for (const file of files) {
    const parts = file.path.split('/');
    let current = root;

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i]!;
      const isLast = i === parts.length - 1;
      const fullPath = parts.slice(0, i + 1).join('/');

      const existing = current.find(n => n.name === part);

      if (existing) {
        if (isLast) {
          existing.isFolder = false;
        }
        current = existing.children;
      } else {
        const node: TreeNode = {
          name: part,
          path: fullPath,
          isFolder: !isLast,
          children: [],
        };
        current.push(node);
        current = node.children;
      }
    }
  }

  const sortNode = (nodes: TreeNode[]) => {
    nodes.sort((a, b) => {
      if (a.isFolder !== b.isFolder) {
        return a.isFolder ? -1 : 1;
      }
      return a.name.localeCompare(b.name);
    });
    nodes.forEach(n => sortNode(n.children));
  };

  sortNode(root);
  return root;
}

function TreeNodeItem({
  node,
  depth,
  activeFile,
  onSelectFile,
}: {
  node: TreeNode;
  depth: number;
  activeFile: string | null;
  onSelectFile: (path: string) => void;
}) {
  const [expanded, setExpanded] = useState(true);

  const handleClick = useCallback(() => {
    if (node.isFolder) {
      setExpanded(e => !e);
    } else {
      onSelectFile(node.path);
    }
  }, [node.isFolder, node.path, onSelectFile]);

  const isActive = !node.isFolder && node.path === activeFile;

  return (
    <div>
      <button
        onClick={handleClick}
        title={node.path}
        className={`flex w-full cursor-pointer items-center gap-1.5 rounded-md px-2 py-1.5 text-left text-[13px] transition-colors duration-150 ${
          isActive
            ? 'bg-[#0f3460] text-[#8bb4f9]'
            : 'hover:bg-[#1a3050]'
        }`}
        style={{ paddingLeft: `${8 + depth * 16}px` }}
      >
        {node.isFolder
          ? (
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className={`shrink-0 transition-transform duration-150 ${expanded ? 'rotate-90' : ''}`}
              >
                <polyline points="9 18 15 12 9 6" />
              </svg>
            )
          : (
              <span className="w-[12px] shrink-0 text-center text-[12px] leading-none">
                {getFileIcon(node.path)}
              </span>
            )}
        <span className="flex-1 truncate">{node.name}</span>
      </button>
      {node.isFolder && expanded && (
        <div>
          {node.children.map(child => (
            <TreeNodeItem
              key={child.path}
              node={child}
              depth={depth + 1}
              activeFile={activeFile}
              onSelectFile={onSelectFile}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function FilePanel({ activeFile, onSelectFile, onTogglePreview, showPreview }: FilePanelProps) {
  const files = useFileStore();

  const tree = useMemo(() => buildTree(files), [files]);

  return (
    <aside className="flex h-full min-w-[150px] flex-col border-r border-[#2a2a4a] bg-[#16213e]">
      <div className="flex items-center gap-2 border-b border-[#2a2a4a] bg-[#0f3460] px-4 py-3">
        <span className="h-1.75 w-1.75 rounded-full bg-[#e6c07b]" />
        <span className="text-[13px] font-semibold text-[#e6c07b]">设计产物</span>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {tree.length === 0
          ? (
              <div className="py-10 text-center text-sm leading-relaxed text-[#555]">
                暂无文件
                <br />
                LLM 生成的代码将显示在这里
              </div>
            )
          : (
              tree.map(node => (
                <TreeNodeItem
                  key={node.path}
                  node={node}
                  depth={0}
                  activeFile={activeFile}
                  onSelectFile={onSelectFile}
                />
              ))
            )}
      </div>

      {files.length > 0 && (
        <div className="border-t border-[#2a2a4a] p-2">
          <button
            onClick={onTogglePreview}
            className={`flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-[13px] font-medium transition-all duration-200 ${
              showPreview
                ? 'bg-[#0f3460] text-[#7ec699] shadow-[0_0_12px_rgba(126,198,153,0.15)]'
                : 'bg-[#1a2744] text-[#8bb4f9] hover:bg-[#243355] hover:text-[#a0c8ff]'
            }`}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 14 20 9 15 4" />
              <path d="M4 20v-7a4 4 0 014-4h12" />
            </svg>
            {showPreview ? '返回源码' : '效果预览'}
          </button>
        </div>
      )}
    </aside>
  );
}
