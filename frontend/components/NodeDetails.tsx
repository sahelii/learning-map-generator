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

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 max-h-[92vh] overflow-hidden rounded-t-[28px] border border-white/35 bg-gradient-to-b from-white/95 via-white/92 to-white/88 shadow-[0_38px_80px_-42px_rgba(15,23,42,0.55)] backdrop-blur-2xl transition-all duration-300 md:right-10 md:top-10 md:bottom-auto md:h-[76vh] md:w-[420px] md:rounded-[30px]">
      <div className="flex items-center justify-between border-b border-white/65 bg-white/85 px-5 py-4">
        <div className="space-y-1">
          <p className="text-[10px] font-semibold uppercase tracking-[0.26em] text-blue-500">
            Learning node
          </p>
          <nav className="text-[10px] font-medium uppercase tracking-[0.16em] text-slate-500">
            {node.subtopic ? `${node.subtopic} • node` : 'Learning path node'}
          </nav>
        </div>
        <button
          onClick={onClose}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-base text-slate-500 shadow transition hover:bg-slate-100 hover:text-slate-700"
          aria-label="Close node details"
        >
          ✕
        </button>
      </div>

      <div className="flex h-full flex-col overflow-hidden">
        <div className="space-y-5 px-5 pb-4 pt-5">
          <div className="rounded-3xl border border-slate-100 bg-gradient-to-br from-slate-50/90 to-white/80 p-4 shadow-inner">
            <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.28em] text-slate-500">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900/95 text-sm text-white shadow-md">
                📘
              </span>
              Node spotlight
            </div>
            <h1 className="mt-3 text-2xl font-bold leading-tight text-slate-900">
              {node.label}
            </h1>
            {node.subtopic && (
              <span className="mt-3 inline-flex items-center gap-1 rounded-full bg-blue-100/75 px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-blue-700">
                <span>📚</span>
                {node.subtopic}
              </span>
            )}
          </div>

          <section className="space-y-2">
            <h2 className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
              Overview
            </h2>
            <p className="rounded-3xl border border-transparent bg-white/80 px-4 py-3 text-sm leading-relaxed text-slate-600 shadow-inner">
              {node.description}
            </p>
          </section>
        </div>

        <section className="flex-1 overflow-y-auto px-5 pb-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
              Resources
            </h2>
            {node.resources.length > 0 && (
              <span className="text-[10px] font-medium uppercase tracking-[0.16em] text-slate-400">
                Curated • {node.resources.length}
              </span>
            )}
          </div>

          {node.resources.length > 0 ? (
            <ul className="mt-4 flex flex-col gap-3">
              {node.resources.map((resource, index) => (
                <li key={resource + index}>
                  <a
                    href={resource}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group block rounded-3xl border border-blue-100/75 bg-white px-4 py-3 shadow-sm transition hover:-translate-y-0.5 hover:shadow-xl"
                  >
                    <div className="flex items-center justify-between gap-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-blue-500/80">
                      <span>{getHostname(resource)}</span>
                      <span className="rounded-full bg-blue-500/12 px-2 py-1 text-[9px] text-blue-600 transition group-hover:bg-blue-500 group-hover:text-white">
                        Visit
                      </span>
                    </div>
                    <p className="mt-2 break-words text-[13px] font-medium leading-relaxed text-blue-700 transition group-hover:underline">
                      {resource}
                    </p>
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <div className="mt-4 rounded-3xl border border-dashed border-slate-200 bg-white/70 px-4 py-6 text-center text-sm text-slate-500">
              No resources available for this node yet.
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

