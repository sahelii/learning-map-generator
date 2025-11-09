'use client';

import { useState } from 'react';
import TopicInput from '@/components/TopicInput';
import LearningMap from '@/components/LearningMap';
import NodeDetails from '@/components/NodeDetails';
import { LearningMapData, Node } from '@/utils/types';

export default function Home() {
  const [learningMap, setLearningMap] = useState<LearningMapData | null>(null);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateMap = async (topic: string) => {
    setIsLoading(true);
    setError(null);
    setLearningMap(null);
    setSelectedNode(null);

    try {
      const response = await fetch('http://localhost:3001/api/generate-map', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ topic }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate learning map');
      }

      const data: LearningMapData = await response.json();
      const sanitizedData: LearningMapData = {
        ...data,
        nodes: (data.nodes ?? []).map((node) => ({
          ...node,
          resources: Array.isArray(node.resources)
            ? node.resources.filter(
                (resource): resource is string =>
                  typeof resource === 'string' && resource.trim().length > 0
              )
            : [],
        })),
      };
      setLearningMap(sanitizedData);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'An unexpected error occurred'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleNodeClick = (node: Node) => {
    setSelectedNode(node);
  };

  const handleCloseDetails = () => {
    setSelectedNode(null);
  };

  const handleDismissError = () => {
    setError(null);
  };

  const hasLearningMap = Boolean(learningMap);

  return (
    <main className="relative min-h-screen overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-grid opacity-60"
      />
      <div className="relative z-10 mx-auto flex max-w-5xl flex-col gap-10 px-4 py-12 md:py-16 lg:px-6">
        <section className="card-shadow relative overflow-hidden rounded-3xl bg-white/80 px-6 py-10 sm:px-10">
          <div className="absolute -left-36 -top-24 h-72 w-72 rounded-full bg-blue-200/35 blur-3xl" />
          <div className="absolute -right-24 top-1/2 h-72 w-72 -translate-y-1/2 rounded-full bg-indigo-200/30 blur-3xl" />
          <div className="relative z-10">
            <span className="inline-flex items-center rounded-full bg-blue-100/90 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-blue-700">
              Generate Interactive Learning Maps in Seconds
            </span>
            <h1 className="mt-4 text-3xl font-bold leading-tight text-slate-900 sm:text-4xl">
            Generate Interactive Learning Maps in Seconds 
            </h1>
            <p className="mt-3 max-w-3xl text-base leading-relaxed text-slate-600 sm:text-lg">
              We’ll pull together the core subtopics, essential concepts, and
              high-quality resources so you can focus on learning instead of
              organising. Explore the connections, review curated links, and
              build a tailored learning journey powered by AI.
            </p>
            <div className="mt-6 flex flex-col gap-4 rounded-2xl border border-slate-200/70 bg-white/80 p-5 shadow-inner sm:flex-row sm:items-center sm:justify-between">
              <div className="text-sm text-slate-500">
                Need inspiration? Try{' '}
                <span className="font-medium text-slate-700">
                  “Generative AI Ethics”
                </span>{' '}
                or{' '}
                <span className="font-medium text-slate-700">
                  “Regenerative Agriculture”
                </span>
                .
              </div>
              <div className="flex justify-center space-x-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                <span className="rounded-full bg-slate-100 px-3 py-1">
                  Curated roadmaps
                </span>
                <span className="rounded-full bg-slate-100 px-3 py-1">
                  Actionable next steps
                </span>
              </div>
            </div>
          </div>
          <div className="relative z-10 mt-6 rounded-2xl border border-slate-200/60 bg-white/80 p-4 shadow-inner sm:p-5">
            <TopicInput
              onGenerate={handleGenerateMap}
              isLoading={isLoading}
              disabled={isLoading}
            />
          </div>

          {error && (
            <div className="mt-5 flex items-start gap-4 rounded-2xl border border-rose-200 bg-rose-50/80 p-4 text-rose-700 shadow-sm">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-100 text-lg">
                ⚠️
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold uppercase tracking-wide">
                  Something went wrong
                </p>
                <p className="mt-1 text-sm leading-relaxed">{error}</p>
              </div>
              <button
                onClick={handleDismissError}
                className="rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-rose-700 transition hover:bg-rose-200"
              >
                Dismiss
              </button>
            </div>
          )}

          {!hasLearningMap && !isLoading && !error && (
            <div className="mt-8 rounded-3xl border border-slate-200/60 bg-white/60 p-6 text-center shadow-inner sm:p-8">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-2xl text-blue-600">
                ✨
              </div>
              <h3 className="mt-4 text-xl font-semibold text-slate-900">
                Start with a topic you&apos;re curious about
              </h3>
              <p className="mt-2 text-sm text-slate-600 sm:text-base">
                We’ll craft a tailored map showing what to learn first, how
                concepts connect, and where to find the best resources.
              </p>
              <div className="mt-4 flex flex-wrap justify-center gap-2 text-xs font-medium uppercase tracking-wide text-slate-500">
                <span className="rounded-full bg-slate-100 px-3 py-1">
                  Guided learning
                </span>
                <span className="rounded-full bg-slate-100 px-3 py-1">
                  Curated resources
                </span>
                <span className="rounded-full bg-slate-100 px-3 py-1">
                  Interactive map
                </span>
              </div>
            </div>
          )}
        </section>

        {hasLearningMap && learningMap && (
          <section className="relative rounded-3xl border border-slate-200/60 bg-white/80 p-5 shadow-lg sm:p-8">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wide text-blue-500">
                  Learning map
                </p>
                <h2 className="mt-1 text-3xl font-bold text-slate-900">
                  {learningMap.mainTopic}
                </h2>
              </div>
              {learningMap.subtopics.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {learningMap.subtopics.map((subtopic, index) => (
                    <span
                      key={subtopic + index}
                      className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-blue-600 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                    >
                      {subtopic}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <div className="relative mt-6 rounded-3xl border border-slate-100 bg-gradient-to-br from-slate-50 via-white to-slate-100 shadow-inner">
              <LearningMap
                nodes={learningMap.nodes}
                edges={learningMap.edges}
                onNodeClick={handleNodeClick}
              />
              {isLoading && (
                <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 rounded-3xl bg-white/80 backdrop-blur-sm">
                  <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-400 border-t-transparent" />
                  <p className="text-sm font-medium text-slate-600">
                    Crafting your learning map...
                  </p>
                </div>
              )}
            </div>
          </section>
        )}

        {selectedNode && (
          <NodeDetails node={selectedNode} onClose={handleCloseDetails} />
        )}
      </div>
    </main>
  );
}

