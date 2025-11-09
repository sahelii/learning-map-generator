'use client';

import { Node } from '@/utils/types';

interface NodeDetailsProps {
  node: Node;
  onClose: () => void;
}

export default function NodeDetails({ node, onClose }: NodeDetailsProps) {
  const getHostname = (url: string) => {
    try {
      const hostname = new URL(url).hostname.replace(/^www\./, '');
      return hostname;
    } catch {
      return url;
    }
  };

  const resources = Array.isArray(node.resources) ? node.resources : [];

  const handleExpandRelated = () => {
    window.dispatchEvent(
      new CustomEvent('learning-map:expand-node', {
        detail: { nodeId: node.id, label: node.label },
      }),
    );
  };

  return (
    <div className="fixed inset-x-4 bottom-4 z-50 max-h-[calc(100vh-80px)] rounded-3xl border border-slate-200/70 bg-white/90 shadow-[0_30px_80px_-36px_rgba(15,23,42,0.55)] backdrop-blur-md transition-all duration-300 ease-out md:inset-auto md:right-12 md:top-12 md:h-[calc(100vh-120px)] md:w-[420px]">
      <div className="flex h-full flex-col">
        <header className="flex items-start justify-between gap-3 border-b border-slate-200/70 bg-white/80 px-5 py-4 backdrop-blur">
          <div className="space-y-1">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-blue-500">
              Node Details
            </p>
            <h1 className="text-xl font-semibold text-slate-900">{node.label}</h1>
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
              {node.subtopic ? `${node.subtopic} • Learning Path` : 'Learning Path Node'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-sm text-slate-500 shadow-sm transition hover:border-slate-300 hover:bg-slate-100 hover:text-slate-700"
            aria-label="Close node details"
          >
            ✕
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-5 pb-6 pt-4 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-slate-300/80">
          <div className="space-y-5">
            <section className="rounded-2xl border border-slate-200 bg-gradient-to-br from-blue-50 to-white p-5 shadow-md">
              <div className="text-xs font-medium uppercase tracking-wide text-blue-600">
                Node Spotlight
              </div>
              <div className="mt-2 text-lg font-semibold text-slate-800">{node.label}</div>
              <div className="mt-3 inline-flex flex-wrap items-center gap-2 text-sm text-slate-600">
                <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-medium">
                  {node.subtopic || 'General Concept'}
                </span>
                {node.level && (
                  <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-medium">
                    {node.level}
                  </span>
                )}
              </div>
            </section>

            <section className="space-y-3">
              <h2 className="text-sm font-semibold text-slate-700">Overview</h2>
              <div className="rounded-xl bg-slate-50 p-4 text-sm leading-relaxed text-slate-600 shadow-inner">
                {node.description || 'No description available.'}
              </div>
            </section>

            <section className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-semibold text-slate-700">Resources</h2>
                  {node.unverified && (
                    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-700">
                      ⚠︎ Links unverified
                    </span>
                  )}
                </div>
                {resources.length > 0 && (
                  <span className="text-xs font-medium uppercase tracking-[0.16em] text-slate-400">
                    Curated • {resources.length}
                  </span>
                )}
              </div>

              {resources.length > 0 ? (
                <ul className="space-y-3">
                  {resources.map((resource, index) => {
                    const href = resource;
                    const domain = getHostname(resource);
                    return (
                      <li key={`${resource}-${index}`}>
                        <div className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-3 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                          <div className="min-w-0">
                            <div className="text-xs uppercase tracking-wide text-slate-500">
                              {domain}
                            </div>
                            <a
                              href={href}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="mt-1 line-clamp-2 break-words text-sm font-medium text-blue-600 transition hover:text-blue-700 hover:underline"
                            >
                              {href}
                            </a>
                          </div>
                          <a
                            href={href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="whitespace-nowrap rounded-md bg-blue-500 px-3 py-1 text-xs font-medium text-white shadow-sm transition hover:bg-blue-600"
                          >
                            Visit
                          </a>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <div className="rounded-xl border border-dashed border-slate-200 bg-white/70 p-6 text-center text-sm text-slate-500">
                  No resources available for this node yet.
                </div>
              )}
            </section>

            <hr className="my-5 border-slate-200/70" />

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-600 shadow-sm transition hover:border-slate-400 hover:text-slate-700"
              >
                Back to Map
              </button>
              <button
                type="button"
                onClick={handleExpandRelated}
                className="flex-1 rounded-lg bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 px-4 py-2 text-sm font-medium text-white shadow-md transition hover:shadow-lg"
              >
                Expand Related
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

