'use client';

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
} from 'react';
import LearningLevelFilter from '@/components/LearningLevelFilter';
import TopicInput from '@/components/TopicInput';
import LearningMap from '@/components/LearningMap';
import NodeDetails from '@/components/NodeDetails';
import { LearningMapData, Node } from '@/utils/types';
import { postJSON } from '@/utils/api';

const AUTO_SAVE_KEY = 'learning-map-generator:last-map';

type LevelFilter = 'All' | 'Beginner' | 'Intermediate' | 'Advanced';

type SavedSnapshot = {
  map: LearningMapData;
  topic?: string;
};

type GenerationPhase = 'idle' | 'requesting' | 'parsing' | 'rendering';

export default function Home() {
  const [learningMap, setLearningMap] = useState<LearningMapData | null>(null);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [generationPhase, setGenerationPhase] =
    useState<GenerationPhase>('idle');
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [lastTopic, setLastTopic] = useState<string | null>(null);
  const [levelFilter, setLevelFilter] = useState<LevelFilter>('All');
  const [relatedTopics, setRelatedTopics] = useState<string[]>([]);
  const [pendingTopic, setPendingTopic] = useState<string | null>(null);
  const relatedTopicsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [savedSnapshot, setSavedSnapshot] = useState<SavedSnapshot | null>(null);
  const [resumeDismissed, setResumeDismissed] = useState(false);
  const [showResumeBanner, setShowResumeBanner] = useState(false);
  const toastTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const currentRequestRef = useRef<AbortController | null>(null);

  const handleGenerateMap = async (topic: string) => {
    if (currentRequestRef.current) {
      currentRequestRef.current.abort();
    }

    const controller = new AbortController();
    currentRequestRef.current = controller;

    setIsLoading(true);
    setGenerationPhase('requesting');
    setError(null);
    setSelectedNode(null);
    setRelatedTopics([]);
    setResumeDismissed(true);
    setShowResumeBanner(false);

    try {
      const data = await postJSON<LearningMapData>(
        '/api/generate-map',
        { topic },
        {
          signal: controller.signal,
          onBeforeParse: () => {
            setGenerationPhase('parsing');
          },
        }
      );
      setGenerationPhase('rendering');
      setLastTopic(topic);
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
      const message =
        err instanceof Error ? err.message : 'An unexpected error occurred';
      const isAbortError =
        err instanceof DOMException
          ? err.name === 'AbortError'
          : typeof message === 'string' &&
            (message.includes('The user aborted') ||
              message.includes('aborted'));
      const isLatestRequest = currentRequestRef.current === controller;
      const noActiveRequest = currentRequestRef.current === null;

      if (isAbortError) {
        if (isLatestRequest || noActiveRequest) {
          showToast('Generation cancelled');
        }
      } else if (isLatestRequest || noActiveRequest) {
        if (
          typeof message === 'string' &&
          (message.toLowerCase().includes('timeout') ||
            message.toLowerCase().includes('timed out'))
        ) {
          setError('The request took too long. Please try again in a moment.');
        } else {
          setError(message);
        }
      }
    } finally {
      if (currentRequestRef.current === controller) {
        currentRequestRef.current = null;
        setIsLoading(false);
        setPendingTopic(null);
        setGenerationPhase('idle');
      } else if (!currentRequestRef.current) {
        setIsLoading(false);
        setPendingTopic(null);
        setGenerationPhase('idle');
      }
    }
  };

  const handleCancelGeneration = () => {
    if (currentRequestRef.current) {
      currentRequestRef.current.abort();
      currentRequestRef.current = null;
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

  const showToast = useCallback((message: string) => {
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }
    setToast(message);
    toastTimeoutRef.current = setTimeout(() => {
      setToast(null);
      toastTimeoutRef.current = null;
    }, 2500);
  }, []);

  const handleExpandUpdate = useCallback(
    (parentId: string, children: Node[]) => {
      setLearningMap((prev) => {
        if (!prev) {
          return prev;
        }

        const existingIds = new Set(prev.nodes.map((node) => node.id));
        const newNodes = children.filter((child) => !existingIds.has(child.id));
        if (!newNodes.length) {
          return prev;
        }

        const additionalEdges = newNodes.map((child) => ({
          source: parentId,
          target: child.id,
        }));

        return {
          ...prev,
          nodes: [...prev.nodes, ...newNodes],
          edges: [...prev.edges, ...additionalEdges],
        };
      });
    },
    []
  );

  const handleExport = () => {
    if (!learningMap) {
      return;
    }

    try {
      const fileName = `${(lastTopic || learningMap.mainTopic || 'learning-map')
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-_]/g, '')}-learning-map.json`;

      const blob = new Blob([JSON.stringify(learningMap, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      showToast('Map exported successfully');
    } catch (exportError) {
      showToast('Failed to export map');
      console.error('Error exporting learning map:', exportError);
    }
  };

  const handleRelatedTopic = (topic: string) => {
    setPendingTopic(topic);
    handleGenerateMap(topic);
    showToast(`Generating a map for ${topic}...`);
  };

  useEffect(() => {
    if (!lastTopic) {
      setRelatedTopics([]);
      return;
    }

    if (relatedTopicsTimeoutRef.current) {
      clearTimeout(relatedTopicsTimeoutRef.current);
    }

    relatedTopicsTimeoutRef.current = setTimeout(async () => {
      try {
        const response = await postJSON<{ topics: string[] }>('/api/related-topics', {
          topic: lastTopic,
        });
        setRelatedTopics(Array.isArray(response.topics) ? response.topics : []);
      } catch (error) {
        console.error('Failed to load related topics', error);
      }
    }, 700);

    return () => {
      if (relatedTopicsTimeoutRef.current) {
        clearTimeout(relatedTopicsTimeoutRef.current);
        relatedTopicsTimeoutRef.current = null;
      }
    };
  }, [lastTopic]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(AUTO_SAVE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as SavedSnapshot;
        if (parsed && parsed.map && typeof parsed.map === 'object') {
          setSavedSnapshot(parsed);
          setResumeDismissed(false);
        }
      }
    } catch (error) {
      console.warn('Failed to read saved map from storage', error);
    }
  }, []);

  useEffect(() => {
    if (!learningMap) {
      setShowResumeBanner(!resumeDismissed && Boolean(savedSnapshot));
      return;
    }
    if (resumeDismissed) {
      setShowResumeBanner(false);
    }
  }, [learningMap, resumeDismissed, savedSnapshot]);

  useEffect(() => {
    if (!learningMap) {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
        autoSaveTimeoutRef.current = null;
      }
      return;
    }

    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }

    autoSaveTimeoutRef.current = setTimeout(() => {
      try {
        const snapshot: SavedSnapshot = {
          map: learningMap,
          topic: lastTopic || learningMap.mainTopic,
        };
        localStorage.setItem(AUTO_SAVE_KEY, JSON.stringify(snapshot));
        setSavedSnapshot(snapshot);
        setResumeDismissed(false);
      } catch (error) {
        console.warn('Failed to auto-save learning map', error);
      }
    }, 500);

    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
        autoSaveTimeoutRef.current = null;
      }
    };
  }, [learningMap, lastTopic]);

  useEffect(() => {
    return () => {
      if (currentRequestRef.current) {
        currentRequestRef.current.abort();
      }
    };
  }, []);

  const hasLearningMap = Boolean(learningMap);
  const activePhase: GenerationPhase =
    generationPhase === 'idle' && isLoading ? 'requesting' : generationPhase;

  const phaseCopy: Record<
    GenerationPhase,
    { headline: string; description: string }
  > = {
    idle: {
      headline: 'Preparing your learning map…',
      description: 'Hang tight while we get everything ready.',
    },
    requesting: {
      headline: 'Contacting Gemini…',
      description: 'We’re talking to the model to craft your learning journey.',
    },
    parsing: {
      headline: 'Shaping the results…',
      description: 'We’re structuring the response into a polished map.',
    },
    rendering: {
      headline: 'Drawing your map…',
      description: 'Plotting nodes, resources, and connections on the canvas.',
    },
  };

  const loadingHeadline = phaseCopy[activePhase].headline;
  const loadingDescription = phaseCopy[activePhase].description;

  function handleImportButtonClick() {
    fileInputRef.current?.click();
  }

  const validateImportedMap = (candidate: unknown): candidate is LearningMapData => {
    if (typeof candidate !== 'object' || candidate === null) {
      return false;
    }
    const map = candidate as LearningMapData;
    return (
      typeof map.mainTopic === 'string' &&
      Array.isArray(map.nodes) &&
      map.nodes.every((node) => {
        return (
          typeof node.id === 'string' &&
          typeof node.label === 'string' &&
          Array.isArray(node.resources) &&
          node.resources.every((resource) => typeof resource === 'string')
        );
      })
    );
  };

  function handleImportFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const text = String(reader.result || '');
        const parsed = JSON.parse(text);
        if (!validateImportedMap(parsed)) {
          throw new Error('Invalid learning map JSON');
        }
        setLearningMap(parsed);
        setLastTopic(parsed.mainTopic);
        setLevelFilter('All');
        setSelectedNode(null);
        setRelatedTopics([]);
        setPendingTopic(null);
        setResumeDismissed(false);
        showToast('Imported learning map applied');
      } catch (error) {
        console.error('Import failed', error);
        showToast('Invalid learning map JSON');
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  }

  function handleRestoreSnapshot() {
    if (!savedSnapshot) {
      return;
    }
    setLearningMap(savedSnapshot.map);
    setLastTopic(savedSnapshot.topic || savedSnapshot.map.mainTopic);
    setLevelFilter('All');
    setSelectedNode(null);
    setRelatedTopics([]);
    setPendingTopic(null);
    setResumeDismissed(true);
    setShowResumeBanner(false);
    showToast('Restored your previous map');
  }

  function handleDismissResume() {
    setResumeDismissed(true);
    setShowResumeBanner(false);
  }

  return (
    <main className="relative min-h-screen overflow-hidden">
      <input
        ref={fileInputRef}
        type="file"
        accept="application/json"
        onChange={handleImportFile}
        className="hidden"
      />
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
            Build Your Personalized Learning Map in Seconds
            </span>
            <h1 className="mt-4 text-3xl font-bold leading-tight text-slate-900 sm:text-4xl">
            Generate Interactive Learning Maps 
            </h1>
            <p className="mt-3 max-w-3xl text-base leading-relaxed text-slate-600 sm:text-lg">
              We’ll pull together the core subtopics, essential concepts, and
              high-quality resources so you can focus on learning instead of
              organising. Explore the connections, review curated links, and
              build a tailored learning journey powered by AI.
            </p>
            <div className="mt-6 flex flex-col gap-4 rounded-2xl border border-slate-200/70 bg-white/80 p-4 shadow-inner sm:p-5">
              <LearningLevelFilter selected={levelFilter} onChange={setLevelFilter} />
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
          </div>
        </section>

        {isLoading && !learningMap && (
          <section className="card-shadow relative overflow-hidden rounded-3xl border border-slate-200/60 bg-white/85 p-6 text-center shadow-lg">
            <div className="absolute -top-12 left-1/2 h-40 w-40 -translate-x-1/2 rounded-full bg-blue-200/40 blur-3xl" />
            <div className="relative z-10 flex flex-col items-center gap-4">
              <div className="relative flex h-14 w-14 items-center justify-center">
                <div className="absolute inset-0 animate-spin rounded-full border-4 border-blue-200 border-t-blue-500" />
                <span className="sr-only">Loading</span>
              </div>
              <div>
                <h3 className="text-base font-semibold text-slate-900 sm:text-lg">
                  {loadingHeadline}
                </h3>
                <p className="mt-1 text-sm text-slate-600">
                  {loadingDescription}
                </p>
              </div>
              <button
                type="button"
                onClick={handleCancelGeneration}
                className="inline-flex items-center rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900/40"
              >
                Cancel
              </button>
            </div>
          </section>
        )}

        {showResumeBanner && savedSnapshot && (
          <div className="rounded-3xl border border-blue-200 bg-blue-50/80 p-5 shadow-inner">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold text-blue-800">
                  Resume your previous map?
                </h3>
                <p className="text-sm text-blue-600">
                  {savedSnapshot.topic || savedSnapshot.map.mainTopic}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleRestoreSnapshot}
                  className="rounded-full bg-blue-600 px-4 py-1.5 text-sm font-semibold text-white shadow hover:bg-blue-700"
                >
                  Restore
                </button>
                <button
                  type="button"
                  onClick={handleDismissResume}
                  className="rounded-full border border-blue-200 px-4 py-1.5 text-sm font-medium text-blue-600 hover:border-blue-300"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        )}

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
                onExpand={handleExpandUpdate}
                onToast={showToast}
                levelFilter={levelFilter}
              />
              {isLoading && (
                <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-4 rounded-3xl bg-white/80 backdrop-blur-sm">
                  <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-400 border-t-transparent" />
                  <div className="text-center">
                    <p className="text-sm font-semibold text-slate-700">
                      {loadingHeadline}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {loadingDescription}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleCancelGeneration}
                    className="rounded-full border border-slate-300 bg-white/90 px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-slate-600 shadow-sm transition hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
            <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-100 bg-white/80 p-4 shadow-inner">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Want to share or revisit later?
              </p>
              <div className="flex gap-2">
                <button
                  onClick={handleImportButtonClick}
                  className="group inline-flex items-center gap-2 rounded-2xl border border-transparent bg-slate-100 px-5 py-2.5 text-sm font-semibold uppercase tracking-wide text-slate-600 shadow-lg transition hover:-translate-y-0.5 hover:bg-slate-200 focus:outline-none focus:ring-4 focus:ring-slate-200"
                >
                  Import JSON
                </button>
                <button
                  onClick={handleExport}
                  className="group inline-flex items-center gap-2 rounded-2xl border border-transparent bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 px-5 py-2.5 text-sm font-semibold uppercase tracking-wide text-white shadow-lg transition hover:-translate-y-0.5 hover:shadow-2xl focus:outline-none focus:ring-4 focus:ring-blue-200"
                >
                  Download Learning Map (JSON)
                  <span className="text-lg transition-transform group-hover:translate-x-1">
                    ⬇
                  </span>
                </button>
              </div>
            </div>
          </section>
        )}

        {relatedTopics.length > 0 && (
          <section className="rounded-3xl border border-slate-200/60 bg-white/70 p-5 shadow-inner">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold uppercase tracking-[0.28em] text-slate-500">
                Related Topics
              </h3>
              <span className="text-[11px] font-medium uppercase tracking-[0.16em] text-slate-400">
                Click to explore
              </span>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {relatedTopics.map((topic) => {
                const isPending = pendingTopic === topic && isLoading;
                return (
                  <button
                    key={topic}
                    type="button"
                    onClick={() => handleRelatedTopic(topic)}
                    disabled={isPending || isLoading}
                    className={`rounded-full border px-4 py-1.5 text-sm font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${
                      isPending
                        ? 'cursor-wait border-blue-200 bg-blue-50 text-blue-500'
                        : 'border-slate-200 bg-white text-slate-600 hover:border-blue-200 hover:text-blue-600'
                    }`}
                  >
                    {isPending ? 'Generating…' : topic}
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {selectedNode && (
          <NodeDetails node={selectedNode} onClose={handleCloseDetails} />
        )}
      </div>
      {toast && (
        <div className="pointer-events-none fixed inset-x-0 bottom-6 z-50 flex justify-center px-4">
          <div className="pointer-events-auto rounded-full bg-slate-900/90 px-5 py-2 text-sm font-medium text-white shadow-xl">
            {toast}
          </div>
        </div>
      )}
    </main>
  );
}

