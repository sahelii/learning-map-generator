'use client';

import { Node } from '@/utils/types';

interface NodeDetailsProps {
  node: Node;
  onClose: () => void;
}

export default function NodeDetails({ node, onClose }: NodeDetailsProps) {
  return (
    <div className="fixed right-0 top-0 h-full w-96 bg-white shadow-xl z-50 overflow-y-auto">
      <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-800">Node Details</h2>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
          aria-label="Close"
        >
          ×
        </button>
      </div>
      <div className="p-6">
        <div className="mb-6">
          <h3 className="text-2xl font-bold text-gray-900 mb-2">{node.label}</h3>
          {node.subtopic && (
            <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
              {node.subtopic}
            </span>
          )}
        </div>
        <div>
          <h4 className="text-lg font-semibold text-gray-800 mb-2">
            Description
          </h4>
          <p className="text-gray-600 leading-relaxed">{node.description}</p>
        </div>
        <div className="mt-8">
          <h4 className="text-lg font-semibold text-gray-800 mb-3">
            Resources
          </h4>
          {node.resources.length > 0 ? (
            <div className="space-y-3">
              {node.resources.map((resource, index) => (
                <a
                  key={resource + index}
                  href={resource}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block rounded-lg border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-700 transition-colors hover:text-blue-900 hover:underline"
                >
                  {resource}
                </a>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">
              No resources available for this node yet.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

