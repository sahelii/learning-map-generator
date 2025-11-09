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

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Learning Map Generator
          </h1>
          <p className="text-gray-600">
            Generate interactive learning paths powered by AI
          </p>
        </header>

        <TopicInput
          onGenerate={handleGenerateMap}
          isLoading={isLoading}
          disabled={isLoading}
        />

        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {learningMap && (
          <div className="mt-8">
            <div className="mb-4">
              <h2 className="text-2xl font-semibold text-gray-800">
                {learningMap.mainTopic}
              </h2>
              {learningMap.subtopics.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {learningMap.subtopics.map((subtopic, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                    >
                      {subtopic}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <div className="relative">
              <LearningMap
                nodes={learningMap.nodes}
                edges={learningMap.edges}
                onNodeClick={handleNodeClick}
              />
              {selectedNode && (
                <NodeDetails
                  node={selectedNode}
                  onClose={handleCloseDetails}
                />
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

