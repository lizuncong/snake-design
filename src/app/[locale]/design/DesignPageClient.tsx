'use client';

import type { ChatMessage, DesignFile } from './lib/types';
import { useEffect, useState } from 'react';
import { getProject, updateProjectState } from '@/libs/db/projects';
import { DesignLayout } from './components/DesignLayout';

type DesignPageClientProps = {
  projectId: string;
};

export function DesignPageClient({ projectId }: DesignPageClientProps) {
  const [initialMessages, setInitialMessages] = useState<ChatMessage[]>([]);
  const [initialFiles, setInitialFiles] = useState<DesignFile[]>([]);
  const [initialActiveFile, setInitialActiveFile] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadProject = async () => {
      try {
        const project = await getProject(projectId);
        if (project) {
          setInitialMessages(project.state.messages as ChatMessage[]);
          setInitialFiles(project.state.files as DesignFile[]);
          setInitialActiveFile(project.state.activeFile);
        }
      } catch (error) {
        console.error('加载项目失败:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadProject();
  }, [projectId]);

  const handleStateChange = async (
    messages: ChatMessage[],
    files: DesignFile[],
    activeFile: string | null,
  ) => {
    try {
      await updateProjectState(projectId, {
        messages,
        files,
        activeFile,
      });
    } catch (error) {
      console.error('保存项目状态失败:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#1a1a2e]">
        <div className="text-sm text-[#888]">加载中...</div>
      </div>
    );
  }

  return (
    <DesignLayout
      initialMessages={initialMessages}
      initialFiles={initialFiles}
      initialActiveFile={initialActiveFile}
      onStateChange={handleStateChange}
    />
  );
}
