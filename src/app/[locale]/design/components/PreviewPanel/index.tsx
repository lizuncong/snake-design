'use client';

import type { DeviceMode, PreviewPanelProps } from './types';
import Editor from '@monaco-editor/react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { downloadAsZip } from '../../lib/download';
import { fileStore } from '../../lib/tools';
import { Toolbar } from './Toolbar';
import { getLanguage, invalidateBlobUrls, resolveWithBlobUrls } from './util';

export function PreviewPanel({ activeFile, showPreview }: PreviewPanelProps) {
  const [refreshKey, setRefreshKey] = useState(0);
  const [deviceMode, setDeviceMode] = useState<DeviceMode>('desktop');
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
      <Toolbar
        showPreview={showPreview}
        deviceMode={deviceMode}
        onDeviceChange={setDeviceMode}
        onRefresh={handleRefresh}
        onDownload={handleDownload}
      />

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
