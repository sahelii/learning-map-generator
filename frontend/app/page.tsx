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
      <div className="relative z-10 mx-auto flex max-w-6xl flex-col gap-10 px-4 py-12 md:py-16 lg:px-6">
        <header className="card-shadow relative overflow-hidden rounded-3xl bg-white/70 px-6 py-10 text-center sm:px-10 md:text-left">
          <div className="absolute -left-20 -top-32 h-72 w-72 rounded-full bg-blue-200/40 blur-3xl" />
          <div className="absolute -right-10 bottom-0 h-72 w-72 rounded-full bg-purple-200/40 blur-3xl" />
          <div className="relative z-10 grid gap-6 md:grid-cols-[minmax(0,1fr),minmax(0,280px)] md:items-center">
            <div>
              <p className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-blue-700 shadow-sm">
                AI Learning Coach
              </p>
              <h1 className="mt-4 text-4xl font-bold leading-tight text-slate-900 sm:text-5xl">
                Generate Interactive Learning Maps in Seconds
              </h1>
              <p className="mt-4 max-w-2xl text-lg text-slate-600 md:pr-6">
                Visualise the skills, prerequisites, and best resources for any
                topic. Click through nodes, explore curated links, and build a
                tailored learning journey powered by AI.
              </p>
            </div>
            <div className="glass-panel card-shadow rounded-3xl p-5 text-left">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                Quick Tips
              </h2>
              <ul className="mt-4 space-y-3 text-sm text-slate-600">
                <li className="flex items-start gap-3">
                  <span className="mt-1 inline-flex h-2.5 w-2.5 shrink-0 rounded-full bg-blue-500" />
                  Ask for any subject&mdash;from “Web Development” to “Soil
                  Biology”.
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1 inline-flex h-2.5 w-2.5 shrink-0 rounded-full bg-purple-500" />
                  Click a node to see descriptions and curated resources.
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1 inline-flex h-2.5 w-2.5 shrink-0 rounded-full bg-emerald-500" />
                  Use the map to prioritise what to learn next.
                </li>
              </ul>
            </div>
          </div>
        </header>

        <section className="glass-panel card-shadow rounded-3xl p-6 sm:p-8">
          <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-slate-900 sm:text-2xl">
                Choose your next topic
              </h2>
              <p className="mt-2 max-w-2xl text-sm text-slate-600 sm:text-base">
                We’ll pull together the core subtopics, essential concepts, and
                high-quality resources so you can focus on learning instead of
                organising.
              </p>
            </div>
            <div className="shrink-0 text-sm text-slate-500">
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
          </div>

          <div className="mt-6 rounded-2xl border border-slate-200/60 bg-white/70 p-4 shadow-inner sm:p-5">
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

