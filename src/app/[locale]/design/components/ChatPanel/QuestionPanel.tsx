'use client';

import type { QuestionPanelData } from '../../lib/types';
import { useState } from 'react';

type OptionCardProps = {
  option: QuestionPanelData['questions'][number]['options'][number];
  selected: boolean;
  multiSelect: boolean;
  onClick: () => void;
};

function OptionCard({ option, selected, multiSelect, onClick }: OptionCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group relative flex w-full cursor-pointer items-start gap-3 rounded-xl border px-4 py-3 text-left transition-all duration-200 ${
        selected
          ? 'border-[#3b82f6]/50 bg-[#3b82f6]/10 shadow-[0_0_12px_rgba(59,130,246,0.15)]'
          : 'border-[#334155]/60 bg-[#1e293b]/50 hover:border-[#475569] hover:bg-[#1e293b]'
      }`}
    >
      <div
        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition-all duration-150 ${
          selected
            ? 'border-[#3b82f6] bg-[#3b82f6]'
            : 'border-[#475569] group-hover:border-[#64748b]'
        }`}
      >
        {selected && (
          <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        )}
        {!selected && multiSelect && (
          <div className="h-2 w-2 rounded-sm bg-[#475569]" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className={`text-[13px] leading-snug font-medium ${selected ? 'text-[#f1f5f9]' : 'text-[#cbd5e1]'}`}>
          {option.label}
        </p>
        {option.description && (
          <p className="mt-1 text-[11.5px] leading-relaxed text-[#64748b]">{option.description}</p>
        )}
      </div>
    </button>
  );
}

type QuestionPanelProps = {
  data: QuestionPanelData;
};

export function QuestionPanel({ data }: QuestionPanelProps) {
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [submitted, setSubmitted] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const questions = data.questions;
  const currentQ = questions[currentStep];
  const isLastQuestion = currentStep === questions.length - 1;

  const currentAnswered = (() => {
    if (!currentQ) {
      return false;
    }
    const ans = answers[currentQ.id];
    if (currentQ.multiSelect) {
      return Array.isArray(ans) && ans.length > 0;
    }
    return !!ans;
  })();

  const handleSelect = (qId: string, value: string) => {
    setAnswers((prev) => {
      const q = questions.find(x => x.id === qId);
      if (!q) {
        return prev;
      }

      if (q.multiSelect) {
        const prevArr = (Array.isArray(prev[qId]) ? prev[qId] : []) as string[];
        const nextArr = prevArr.includes(value)
          ? prevArr.filter(v => v !== value)
          : [...prevArr, value];
        return { ...prev, [qId]: nextArr };
      }
      return { ...prev, [qId]: value };
    });
  };

  const handleNext = () => {
    if (isLastQuestion) {
      setSubmitted(true);
      data.onAnswer(answers);
    } else {
      setCurrentStep(s => s + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(s => s - 1);
    }
  };

  if (submitted) {
    return (
      <div className="w-full rounded-xl border border-[#22c55e]/25 bg-[#0d1a12]/80 p-5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#22c55e]/15">
            <svg className="h-4.5 w-4.5 text-[#4ade80]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="text-[13px] font-semibold text-[#4ade80]">需求已确认</p>
            <p className="text-[11.5px] text-[#64748b]">正在基于你的选择开始设计...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!currentQ) {
    return null;
  }

  return (
    <div className="flex max-h-[50vh] flex-col overflow-hidden rounded-xl border border-[#334155]/60 bg-gradient-to-b from-[#1a2332] to-[#151d2b] shadow-lg shadow-black/20">
      {/* Header */}
      <div className="flex shrink-0 items-center justify-between border-b border-[#334155]/40 bg-[#1e293b]/30 px-5 py-3.5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#3b82f6]/15">
            <svg className="h-4 w-4 text-[#60a5fa]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
            </svg>
          </div>
          <div>
            <p className="text-[13px] font-semibold text-[#f1f5f9]">设计需求调研</p>
            <p className="text-[11px] text-[#64748b]">请回答以下问题，帮助我更好地理解你的设计目标</p>
          </div>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-1.5">
          <span className="text-[12px] font-medium text-[#60a5fa]">{currentStep + 1}</span>
          <span className="text-[12px] text-[#475569]">/</span>
          <span className="text-[12px] text-[#64748b]">{questions.length}</span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1 bg-[#1e293b]">
        <div
          className="h-full bg-gradient-to-r from-[#3b82f6] to-[#60a5fa] transition-all duration-300 ease-out"
          style={{ width: `${((currentStep + 1) / questions.length) * 100}%` }}
        />
      </div>

      {/* Question content - scrollable */}
      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-5">
        {/* Category header */}
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center rounded-md bg-[#3b82f6]/10 px-2 py-0.5 text-[11px] font-medium text-[#60a5fa]">
            {currentQ.header}
          </span>
        </div>

        {/* Question text */}
        <p className="text-[14px] leading-relaxed font-medium text-[#e2e8f0]">
          {currentQ.question}
        </p>

        {/* Options */}
        <div className="space-y-2">
          {currentQ.options.map((opt) => {
            const currentAns = answers[currentQ.id];
            const selected = currentQ.multiSelect
              ? Array.isArray(currentAns) && currentAns.includes(opt.value)
              : currentAns === opt.value;
            return (
              <OptionCard
                key={opt.value}
                option={opt}
                selected={selected}
                multiSelect={!!currentQ.multiSelect}
                onClick={() => handleSelect(currentQ.id, opt.value)}
              />
            );
          })}
        </div>
      </div>

      {/* Footer actions */}
      <div className="flex shrink-0 items-center justify-between border-t border-[#334155]/40 bg-[#1e293b]/20 px-5 py-3.5">
        <button
          type="button"
          onClick={handlePrev}
          disabled={currentStep === 0}
          className="flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-[12.5px] font-medium text-[#94a3b8] transition-colors hover:text-[#e2e8f0] disabled:cursor-not-allowed disabled:opacity-30"
        >
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
          上一步
        </button>

        <button
          type="button"
          onClick={handleNext}
          disabled={!currentAnswered}
          className="flex items-center gap-1.5 rounded-lg bg-[#3b82f6] px-4 py-2 text-[12.5px] font-semibold text-white shadow-md shadow-[#3b82f6]/20 transition-all hover:bg-[#2563eb] active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
        >
          {isLastQuestion
            ? (
                <>
                  确认提交
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                </>
              )
            : (
                <>
                  下一步
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                  </svg>
                </>
              )}
        </button>
      </div>
    </div>
  );
}
