/**
 * @waddle/graph — Knowledge Graph Client & Queries
 *
 * This package will contain:
 * - Neo4j / Apache AGE client abstraction
 * - Graph query builders for relationship traversal
 * - Knowledge graph entity types (nodes & edges)
 * - Decision record management
 */

export const GRAPH_PACKAGE_VERSION = '0.1.0';

/** Node types in the knowledge graph */
export type GraphNodeType =
  | 'work_item'
  | 'project'
  | 'person'
  | 'decision'
  | 'document'
  | 'pull_request'
  | 'commit'
  | 'design_file';

/** Edge types in the knowledge graph */
export type GraphEdgeType =
  | 'created_by'
  | 'assigned_to'
  | 'blocks'
  | 'relates_to'
  | 'implements'
  | 'decided_in'
  | 'documented_in'
  | 'linked_to';

/** Graph node representation */
export interface GraphNode {
  id: string;
  type: GraphNodeType;
  label: string;
  properties: Record<string, unknown>;
}

/** Graph edge representation */
export interface GraphEdge {
  id: string;
  type: GraphEdgeType;
  sourceId: string;
  targetId: string;
  properties: Record<string, unknown>;
}
