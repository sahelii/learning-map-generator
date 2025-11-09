'use client';

import { useState, FormEvent } from 'react';

interface TopicInputProps {
  onGenerate: (topic: string) => void;
  isLoading: boolean;
  disabled?: boolean;
}

export default function TopicInput({
  onGenerate,
  isLoading,
  disabled = false,
}: TopicInputProps) {
  const [topic, setTopic] = useState('');

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (topic.trim() && !disabled) {
      onGenerate(topic.trim());
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto flex w-full flex-col gap-3 sm:flex-row sm:items-stretch"
      role="search"
    >
      <div className="relative flex-1">
        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
          🔍
        </span>
        <input
          type="text"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="What do you want to learn next?"
          disabled={disabled}
          className="w-full rounded-2xl border border-slate-200 bg-white/90 py-3.5 pl-12 pr-4 text-base text-slate-900 shadow-sm transition focus:border-blue-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100"
        />
      </div>
      <button
        type="submit"
        disabled={disabled || !topic.trim()}
        className="group flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 px-6 py-3.5 text-sm font-semibold uppercase tracking-wide text-white shadow-lg transition hover:shadow-2xl focus:outline-none focus:ring-4 focus:ring-blue-200 disabled:cursor-not-allowed disabled:from-slate-300 disabled:via-slate-400 disabled:to-slate-500 disabled:opacity-70"
      >
        {isLoading ? (
          <>
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            Generating
          </>
        ) : (
          <>
            Let&apos;s map it
            <span className="transition-transform group-hover:translate-x-1">
              ➜
            </span>
          </>
        )}
      </button>
    </form>
  );
}

