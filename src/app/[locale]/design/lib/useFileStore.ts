'use client';

import type { DesignFile } from './types';
import { useEffect, useState } from 'react';
import { fileStore } from './file-store';

export function useFileStore() {
  const [files, setFiles] = useState<DesignFile[]>(fileStore.getAllFiles());

  useEffect(() => {
    const unsubscribe = fileStore.subscribe(() => {
      setFiles(fileStore.getAllFiles());
    });

    return unsubscribe;
  }, []);

  return files;
}
