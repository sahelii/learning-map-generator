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
    <div className="fixed inset-x-0 bottom-0 z-50 max-h-[85vh] overflow-hidden rounded-t-3xl border border-white/30 bg-white/80 shadow-2xl backdrop-blur-xl transition-all duration-300 md:right-10 md:top-10 md:bottom-auto md:h-[80vh] md:w-96 md:rounded-3xl">
      <div className="flex items-center justify-between border-b border-white/60 bg-white/60 px-5 py-4 backdrop-blur-xl">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-500">
            Learning node
          </p>
          <nav className="mt-1 text-[11px] font-medium uppercase tracking-wide text-slate-500">
            {node.subtopic ? `${node.subtopic} • Node` : 'Learning path node'}
          </nav>
        </div>
        <button
          onClick={onClose}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-lg text-slate-500 shadow hover:bg-slate-100 hover:text-slate-700"
          aria-label="Close node details"
        >
          ✕
        </button>
      </div>

      <div className="flex flex-col gap-6 overflow-y-auto px-5 py-6 md:px-6">
        <header className="space-y-3">
          <h3 className="text-2xl font-bold text-slate-900">{node.label}</h3>
          {node.subtopic && (
            <span className="inline-flex items-center gap-1 rounded-full bg-blue-100/70 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-blue-700">
              <span className="text-base">📚</span>
              {node.subtopic}
            </span>
          )}
        </header>

        <section>
          <h4 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Description
          </h4>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            {node.description}
          </p>
        </section>

        <section>
          <h4 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Resources
          </h4>
          {node.resources.length > 0 ? (
            <ul className="mt-3 space-y-3">
              {node.resources.map((resource, index) => (
                <li key={resource + index}>
                  <a
                    href={resource}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center justify-between gap-4 rounded-2xl border border-blue-100/70 bg-blue-50/70 px-4 py-3 text-sm font-medium text-blue-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-blue-100/70 hover:shadow-lg"
                  >
                    <div className="flex flex-1 flex-col gap-1 text-left">
                      <span className="truncate group-hover:underline">
                        {resource}
                      </span>
                      <span className="text-xs uppercase tracking-wide text-blue-500/80">
                        {getHostname(resource)}
                      </span>
                    </div>
                    <span className="text-lg transition group-hover:translate-x-1">
                      ↗
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-sm text-slate-500">
              No resources available for this node yet.
            </p>
          )}
        </section>
      </div>
    </div>
  );
}

