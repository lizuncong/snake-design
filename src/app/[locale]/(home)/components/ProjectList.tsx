'use client';

import type { Project } from '@/types/models/project';
import { useCallback, useEffect, useState } from 'react';
import { deleteProject, getAllProjects } from '@/libs/db/projects';
import { ProjectCard } from './ProjectCard';

export function ProjectList() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadProjects = useCallback(async () => {
    try {
      const data = await getAllProjects();
      setProjects(data);
    } catch (error) {
      console.error('加载项目失败:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  const handleDelete = async (id: string) => {
    try {
      await deleteProject(id);
      setProjects((prev) => {
        return prev.filter(p => p.id !== id);
      });
    } catch (error) {
      console.error('删除项目失败:', error);
    }
  };

  if (isLoading) {
    return (
      <section className="px-4 py-8">
        <h3 className="mb-4 text-sm font-medium text-[#888]">最近项目</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map(i => (
            <div
              key={i}
              className="h-32 animate-pulse rounded-lg bg-[#1a2744]"
            />
          ))}
        </div>
      </section>
    );
  }

  if (projects.length === 0) {
    return (
      <section className="px-4 py-8">
        <h3 className="mb-4 text-sm font-medium text-[#888]">最近项目</h3>
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-[#334466] py-12">
          <svg
            className="mb-3 h-12 w-12 text-[#444]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"
            />
          </svg>
          <p className="text-sm text-[#666]">暂无项目</p>
          <p className="mt-1 text-xs text-[#555]">
            在上方输入需求，开始创建你的第一个项目
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="px-4 py-8">
      <h3 className="mb-4 text-sm font-medium text-[#888]">最近项目</h3>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map(project => (
          <ProjectCard
            key={project.id}
            project={project}
            onDelete={handleDelete}
          />
        ))}
      </div>
    </section>
  );
}
