/**
 * Type definitions for the Learning Map Generator
 */

export interface Node {
  id: string;
  label: string;
  description: string;
  subtopic?: string;
  resources: string[];
}

export interface Edge {
  source: string;
  target: string;
}

export interface LearningMapData {
  mainTopic: string;
  subtopics: string[];
  nodes: Node[];
  edges: Edge[];
}

