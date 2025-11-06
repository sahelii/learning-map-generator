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
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto">
      <div className="flex gap-2">
        <input
          type="text"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="Enter a topic to generate a learning map..."
          disabled={disabled}
          className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
        />
        <button
          type="submit"
          disabled={disabled || !topic.trim()}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? 'Generating...' : 'Generate Map'}
        </button>
      </div>
    </form>
  );
}

