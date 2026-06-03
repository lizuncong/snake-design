import type { FileStore } from '@/libs/agent-sdk';

const MIME_TYPES: Record<string, string> = {
  css: 'text/css',
  js: 'application/javascript',
  jsx: 'application/javascript',
  json: 'application/json',
  svg: 'image/svg+xml',
  html: 'text/html',
  htm: 'text/html',
};

export const LANGUAGE_MAP: Record<string, string> = {
  html: 'html',
  htm: 'html',
  css: 'css',
  js: 'javascript',
  jsx: 'javascript',
  json: 'json',
  svg: 'xml',
  md: 'markdown',
};

export const snakeDesignTheme: {
  base?: 'vs' | 'vs-dark' | 'hc-black';
  inherit?: boolean;
  rules?: Array<{ token: string; foreground?: string; fontStyle?: string }>;
  colors?: Record<string, string>;
} = {
  base: 'vs-dark',
  inherit: true,
  rules: [
    { token: 'comment', foreground: '6A737D', fontStyle: 'italic' },
    { token: 'keyword', foreground: 'F472B6' },
    { token: 'string', foreground: '86EFAC' },
    { token: 'number', foreground: 'FBBF24' },
    { token: 'tag', foreground: '60A5FA' },
    { token: 'attribute.name', foreground: 'C084FC' },
    { token: 'attribute.value', foreground: '86EFAC' },
    { token: 'type', foreground: '38BDF8' },
  ],
  colors: {
    'editor.background': '#0d1117',
    'editor.foreground': '#e6edf3',
    'editorLineNumber.foreground': '#484f58',
    'editorLineNumber.activeForeground': '#8b949e',
    'editor.selectionBackground': '#264f7840',
    'editor.lineHighlightBackground': '#161b2240',
    'editorCursor.foreground': '#58a6ff',
    'editor.inactiveSelectionBackground': '#264f7820',
    'editorIndentGuide.background': '#21262d',
    'editorIndentGuide.activeBackground': '#30363d',
  },
};

const blobUrlCache = new Map<string, string>();

/** 规范化文件路径：去除 ./ 前缀和多余斜杠 */
function normalizePath(path: string): string {
  return path.replace(/^\.\//, '').replace(/^\/+/, '');
}

export function getBlobUrl(fileStore: FileStore, path: string): string | null {
  const normalized = normalizePath(path);
  if (blobUrlCache.has(normalized)) {
    return blobUrlCache.get(normalized) || null;
  }
  // 先尝试精确匹配，再尝试规范化路径
  let file = fileStore.getFile(path);
  if (!file) {
    file = fileStore.getFile(normalized);
  }
  if (!file) {
    return null;
  }
  const ext = normalized.split('.').pop()?.toLowerCase() || '';
  const mimeType = MIME_TYPES[ext] || 'text/plain';
  const url = URL.createObjectURL(new Blob([file.content], { type: mimeType }));
  blobUrlCache.set(normalized, url);
  return url;
}

export function invalidateBlobUrls(): void {
  for (const url of blobUrlCache.values()) {
    URL.revokeObjectURL(url);
  }
  blobUrlCache.clear();
}

export function resolveWithBlobUrls(fileStore: FileStore, htmlContent: string, basePath: string): string {
  let resolved = htmlContent;
  const dir = basePath.substring(0, basePath.lastIndexOf('/') + 1);

  resolved = resolved.replace(
    /<link\s[^>]*rel=["']stylesheet["'][^>]*href=["']([^"']+)["'][^>]*>/gi,
    (match, href) => {
      const rawPath = href.startsWith('/') ? href.slice(1) : dir + href;
      const url = getBlobUrl(fileStore, rawPath);
      if (url) {
        return match.replace(href, url);
      }
      return match;
    },
  );

  resolved = resolved.replace(
    /<script\s[^>]*src=["']([^"']+)["'][^>]*><\/script>/gi,
    (match, src) => {
      const rawPath = src.startsWith('/') ? src.slice(1) : dir + src;
      const fullPath = normalizePath(rawPath);
      const isBabelScript = match.includes('type="text/babel"') || match.includes('type=\'text/babel\'');
      if (isBabelScript) {
        // 先精确匹配，再尝试规范化路径
        let file = fileStore.getFile(rawPath);
        if (!file) {
          file = fileStore.getFile(fullPath);
        }
        if (file) {
          const srcAttrMatch = match.match(/src=["'][^"']+["']/) ?? '';
          const restOfTag = match.replace(String(srcAttrMatch), '');
          return `<script type="text/babel"${restOfTag.replace('<script', '').replace('></script>', '')}>${file.content}</script>`;
        }
      }
      const url = getBlobUrl(fileStore, rawPath);
      if (url) {
        return match.replace(src, url);
      }
      return match;
    },
  );

  return resolved;
}

export function getLanguage(path: string): string {
  const ext = path.split('.').pop()?.toLowerCase() || '';
  return LANGUAGE_MAP[ext] || 'plaintext';
}
