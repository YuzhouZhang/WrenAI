import { Edge, Node, Viewport, ReactFlowJsonObject } from 'reactflow';
import { Diagram } from '@/utils/data/type';
import { Transformer, Config } from './transformer';

export class DiagramCreator {
  private nodes: Node[];
  private edges: Edge[];
  private viewport: Viewport = { x: 0, y: 0, zoom: 1 };

  constructor(data: Diagram, customConfig?: Partial<typeof Config>) {
    const transformedData = new Transformer(data, customConfig);
    this.nodes = transformedData.nodes;
    this.edges = transformedData.edges;
  }

  public toJsonObject(): ReactFlowJsonObject {
    return {
      nodes: this.nodes,
      edges: this.edges,
      viewport: this.viewport,
    };
  }
}
