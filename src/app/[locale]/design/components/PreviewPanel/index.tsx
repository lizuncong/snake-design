'use client';

import Editor from '@monaco-editor/react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { downloadAsZip } from '../../lib/download';
import { fileStore } from '../../lib/tools';

type PreviewPanelProps = {
  activeFile: string | null;
  showPreview: boolean;
};

const blobUrlCache = new Map<string, string>();

function getBlobUrl(path: string): string | null {
  if (blobUrlCache.has(path)) {
    return blobUrlCache.get(path) || null;
  }
  const file = fileStore.getFile(path);
  if (!file) {
    return null;
  }
  const ext = path.split('.').pop()?.toLowerCase() || '';
  const mime: Record<string, string> = {
    css: 'text/css',
    js: 'application/javascript',
    jsx: 'application/javascript',
    json: 'application/json',
    svg: 'image/svg+xml',
    html: 'text/html',
    htm: 'text/html',
  };
  const mimeType = mime[ext] || 'text/plain';
  const url = URL.createObjectURL(new Blob([file.content], { type: mimeType }));
  blobUrlCache.set(path, url);
  return url;
}

function invalidateBlobUrls(): void {
  for (const url of blobUrlCache.values()) {
    URL.revokeObjectURL(url);
  }
  blobUrlCache.clear();
}

function resolveWithBlobUrls(htmlContent: string, basePath: string): string {
  let resolved = htmlContent;
  const dir = basePath.substring(0, basePath.lastIndexOf('/') + 1);

  resolved = resolved.replace(
    /<link\s[^>]*rel=["']stylesheet["'][^>]*href=["']([^"']+)["'][^>]*>/gi,
    (match, href) => {
      const fullPath = href.startsWith('/') ? href.slice(1) : dir + href;
      const url = getBlobUrl(fullPath);
      if (url) {
        return match.replace(href, url);
      }
      return match;
    },
  );

  resolved = resolved.replace(
    /<script\s[^>]*src=["']([^"']+)["'][^>]*><\/script>/gi,
    (match, src) => {
      const fullPath = src.startsWith('/') ? src.slice(1) : dir + src;
      const url = getBlobUrl(fullPath);
      if (url) {
        return match.replace(src, url);
      }
      return match;
    },
  );

  return resolved;
}

const LANGUAGE_MAP: Record<string, string> = {
  html: 'html',
  htm: 'html',
  css: 'css',
  js: 'javascript',
  jsx: 'javascript',
  json: 'json',
  svg: 'xml',
  md: 'markdown',
};

function getLanguage(path: string): string {
  const ext = path.split('.').pop()?.toLowerCase() || '';
  return LANGUAGE_MAP[ext] || 'plaintext';
}

export function PreviewPanel({ activeFile, showPreview }: PreviewPanelProps) {
  const [refreshKey, setRefreshKey] = useState(0);
  const [deviceMode, setDeviceMode] = useState<'desktop' | 'mobile'>('desktop');
  const frameRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const unsubscribe = fileStore.subscribe(() => {
      invalidateBlobUrls();
      setRefreshKey(k => k + 1);
    });

    return () => {
      unsubscribe();
      invalidateBlobUrls();
    };
  }, []);

  const file = activeFile ? fileStore.getFile(activeFile) : null;

  const previewFile = useMemo(() => {
    void refreshKey;
    const files = fileStore.getAllFiles();
    const indexFile = files.find((f) => {
      const name = f.path.split('/').pop()?.toLowerCase();
      return name === 'index.html' || name === 'index.htm';
    });
    if (indexFile) {
      return indexFile;
    }
    if (activeFile) {
      const ext = activeFile.split('.').pop()?.toLowerCase();
      if (ext === 'html' || ext === 'htm') {
        return fileStore.getFile(activeFile);
      }
    }
    return null;
  }, [activeFile, refreshKey]);

  const previewContent = useMemo(() => {
    void refreshKey;
    if (!previewFile) {
      return '';
    }
    return resolveWithBlobUrls(previewFile.content, previewFile.path);
  }, [previewFile, refreshKey]);

  const handleRefresh = useCallback(() => {
    invalidateBlobUrls();
    setRefreshKey(k => k + 1);
  }, []);

  const handleDownload = useCallback(async () => {
    const files = fileStore.getAllFiles();
    if (files.length === 0) {
      return;
    }
    await downloadAsZip(files, 'design-project');
  }, []);

  const language = activeFile ? getLanguage(activeFile) : 'plaintext';

  return (
    <section className="flex h-full flex-col bg-[#0d1117]">
      <div className="flex items-center justify-between border-b border-[#2a2a4a] bg-[#0f3460] px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="h-1.75 w-1.75 rounded-full bg-[#7ec699]" />
          <span className="text-[13px] font-semibold text-[#7ec699]">
            {showPreview ? '效果预览' : '源码'}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          {showPreview && (
            <div className="flex rounded border border-solid border-[#334466] bg-[#1a2744] p-[2px]">
              <button
                onClick={() => setDeviceMode('desktop')}
                className={`cursor-pointer rounded px-2 py-1 text-[11px] transition-colors duration-150 outline-none ${
                  deviceMode === 'desktop'
                    ? 'bg-[#243355] text-[#8bb4f9]'
                    : 'text-[#666] hover:text-[#8bb4f9]'
                }`}
                title="PC端预览"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                  <line x1="8" y1="21" x2="16" y2="21" />
                  <line x1="12" y1="17" x2="12" y2="21" />
                </svg>
              </button>
              <button
                onClick={() => setDeviceMode('mobile')}
                className={`cursor-pointer rounded px-2 py-1 text-[11px] transition-colors duration-150 outline-none ${
                  deviceMode === 'mobile'
                    ? 'bg-[#243355] text-[#8bb4f9]'
                    : 'text-[#666] hover:text-[#8bb4f9]'
                }`}
                title="移动端预览"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
                  <line x1="12" y1="18" x2="12.01" y2="18" />
                </svg>
              </button>
            </div>
          )}
          {showPreview && (
            <button
              onClick={handleRefresh}
              className="cursor-pointer rounded border border-solid border-[#334466] bg-[#1a2744] px-2.5 py-1 text-[11px] text-[#8bb4f9] transition-colors duration-150 outline-none hover:bg-[#243355]"
            >
              刷新
            </button>
          )}
          <button
            onClick={handleDownload}
            className="cursor-pointer rounded border border-solid border-[#334466] bg-[#1a2744] px-2.5 py-1 text-[11px] text-[#8bb4f9] transition-colors duration-150 outline-none hover:bg-[#243355]"
            title="下载代码"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
          </button>
        </div>
      </div>

      <div className="relative flex-1">
        {showPreview
          ? (
              <div className={`h-full bg-white ${deviceMode === 'mobile' ? 'flex items-center justify-center overflow-auto' : ''}`}>
                {previewContent
                  ? (
                      <iframe
                        ref={frameRef}
                        key={`preview-${refreshKey}-${deviceMode}`}
                        srcDoc={previewContent}
                        sandbox="allow-scripts allow-same-origin allow-forms"
                        className={`h-full border-none ${deviceMode === 'mobile' ? 'h-[calc(100%-2rem)] max-h-[812px] w-[375px] rounded-xl shadow-2xl ring-1 ring-black/10' : 'w-full'}`}
                        title="Preview"
                      />
                    )
                  : (
                      <div className="flex h-full items-center justify-center text-sm text-[#888]">
                        暂无可预览的 HTML 文件
                      </div>
                    )}
              </div>
            )
          : activeFile && file
            ? (
                <Editor
                  key={`${activeFile}-${refreshKey}`}
                  language={language}
                  value={file.content}
                  theme="vs-dark"
                  options={{
                    readOnly: true,
                    minimap: { enabled: false },
                    fontSize: 13,
                    lineNumbers: 'on',
                    scrollBeyondLastLine: false,
                    wordWrap: 'on',
                    padding: { top: 8 },
                    automaticLayout: true,
                  }}
                  loading={(
                    <div className="flex h-full items-center justify-center bg-[#1e1e1e] text-sm text-[#888]">
                      加载编辑器...
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
              )}
      </div>

      {activeFile && !showPreview && (
        <div className="truncate border-t border-[#2a2a4e] bg-[#0f1929] px-4 py-1.5 text-[12px] text-[#aaa]">
          {activeFile}
        </div>
      )}
    </section>
  );
}
