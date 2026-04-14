/**
 * @waddle/graph — Knowledge Graph Client using Apache AGE (PostgreSQL extension)
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

export interface GraphExploreResult {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

interface SqlExecutor {
  // Drizzle-compatible sql executor
  execute(query: string): Promise<unknown[]>;
}

/**
 * GraphClient — wraps Apache AGE (PostgreSQL extension) for knowledge graph queries.
 * Falls back to a no-op implementation if AGE is not installed.
 */
export class GraphClient {
  private graphName: string;

  constructor(
    private sql: SqlExecutor,
    graphName = 'waddle_graph',
  ) {
    this.graphName = graphName;
  }

  /** Upsert a node into the graph */
  async upsertNode(node: GraphNode): Promise<void> {
    try {
      const props = JSON.stringify({ ...node.properties, _type: node.type, _label: node.label });
      await this.sql.execute(
        `SELECT * FROM ag_catalog.cypher('${this.graphName}', $$ MERGE (n:${node.type} {id: '${node.id}'}) SET n += ${props} $$) AS (v ag_catalog.agtype)`,
      );
    } catch (err) {
      // AGE may not be installed — log and continue
      console.warn('[graph] upsertNode failed (AGE may not be installed):', (err as Error).message);
    }
  }

  /** Upsert a directed edge between two nodes */
  async upsertEdge(edge: GraphEdge): Promise<void> {
    try {
      const props = JSON.stringify({ ...edge.properties, id: edge.id });
      await this.sql.execute(
        `SELECT * FROM ag_catalog.cypher('${this.graphName}', $$
          MATCH (a {id: '${edge.sourceId}'}), (b {id: '${edge.targetId}'})
          MERGE (a)-[r:${edge.type} {id: '${edge.id}'}]->(b)
          SET r += ${props}
        $$) AS (v ag_catalog.agtype)`,
      );
    } catch (err) {
      console.warn('[graph] upsertEdge failed:', (err as Error).message);
    }
  }

  /**
   * Explore the graph starting from a root node up to a given depth.
   * Returns connected nodes and edges.
   */
  async explore(rootId: string, depth = 2): Promise<GraphExploreResult> {
    try {
      const rows = await this.sql.execute(
        `SELECT * FROM ag_catalog.cypher('${this.graphName}', $$
          MATCH path = (root {id: '${rootId}'})-[*1..${depth}]-(connected)
          RETURN root, relationships(path), nodes(path)
        $$) AS (root ag_catalog.agtype, rels ag_catalog.agtype, nodes ag_catalog.agtype)`,
      ) as Array<{ root: unknown; rels: unknown; nodes: unknown }>;

      const nodeMap = new Map<string, GraphNode>();
      const edgeMap = new Map<string, GraphEdge>();

      for (const row of rows) {
        // Parse AGE agtype responses — they come back as JSON strings
        try {
          const parseAGType = (v: unknown): unknown => {
            if (typeof v === 'string') return JSON.parse(v);
            return v;
          };

          const rootNode = parseAGType(row.root) as { id: string; label: string; properties: Record<string, unknown> };
          if (rootNode?.id) {
            nodeMap.set(rootNode.id, {
              id: rootNode.id,
              type: (rootNode.properties?.['_type'] as GraphNodeType) ?? 'work_item',
              label: (rootNode.properties?.['_label'] as string) ?? rootNode.label,
              properties: rootNode.properties ?? {},
            });
          }
        } catch {
          // Skip malformed rows
        }
      }

      return { nodes: Array.from(nodeMap.values()), edges: Array.from(edgeMap.values()) };
    } catch (err) {
      console.warn('[graph] explore failed (AGE may not be installed):', (err as Error).message);
      return { nodes: [], edges: [] };
    }
  }
}
