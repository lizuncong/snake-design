'use client';

import { useState } from 'react';
import { createProject } from '@/libs/db/projects';
import { useRouter } from '@/libs/i18n/navigation';
import { hasApiKey } from '../../design/lib/llm';

import { ApiKeyModal } from './ApiKeyModal';

export function HeroSection() {
  const router = useRouter();
  const [requirement, setRequirement] = useState('');
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const handleGenerate = async () => {
    if (!requirement.trim()) {
      return;
    }

    if (!hasApiKey()) {
      setIsApiKeyModalOpen(true);
      return;
    }

    setIsCreating(true);
    try {
      const project = await createProject(requirement.trim());
      router.push(`/design?projectId=${project.id}`);
    } catch (error) {
      console.error('创建项目失败:', error);
      setIsCreating(false);
    }
  };

  const handleApiKeyModalClose = () => {
    setIsApiKeyModalOpen(false);
    if (hasApiKey() && requirement.trim()) {
      handleGenerate();
    }
  };

  return (
    <section className="flex flex-col items-center justify-center px-4 py-16">
      <h2 className="mb-3 text-center text-3xl font-bold tracking-tight text-[#e0e0e0]">
        创造你的下一个设计项目
      </h2>
      <p className="mb-8 text-center text-sm text-[#888]">
        描述你的需求，AI 将帮你完成设计和开发
      </p>
      <div className="flex w-full max-w-2xl flex-col items-center gap-4">
        <textarea
          value={requirement}
          onChange={(e) => {
            setRequirement(e.target.value);
          }}
          placeholder="描述你的需求... 例如：帮我创建一个用户登录页面，包含用户名、密码输入框和登录按钮"
          className="h-32 w-full resize-none rounded-lg border border-[#334466] bg-[#1a2744] px-4 py-3 text-sm text-[#e0e0e0] placeholder:text-[#666] focus:border-[#8bb4f9] focus:outline-none"
        />
        <button
          onClick={handleGenerate}
          disabled={!requirement.trim() || isCreating}
          className="cursor-pointer rounded-lg bg-[#059669] px-8 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#047857] disabled:cursor-not-allowed disabled:bg-[#334466] disabled:text-[#888]"
        >
          {isCreating ? '创建中...' : '开始生成'}
        </button>
      </div>
      <ApiKeyModal isOpen={isApiKeyModalOpen} onClose={handleApiKeyModalClose} />
    </section>
  );
}
