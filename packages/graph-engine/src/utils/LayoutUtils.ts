import { GraphNode } from '../types';

class LayoutUtils {
  static gridLayout(nodes: GraphNode[], columns: number = 5): GraphNode[] {
    const spacing = 300;
    return nodes.map((node, index) => ({
      ...node,
      position: {
        x: (index % columns) * spacing,
        y: Math.floor(index / columns) * spacing,
      },
    }));
  }

  static circularLayout(nodes: GraphNode[], radius: number = 400): GraphNode[] {
    const angleStep = (2 * Math.PI) / nodes.length;
    return nodes.map((node, index) => ({
      ...node,
      position: {
        x: radius * Math.cos(index * angleStep) + 500,
        y: radius * Math.sin(index * angleStep) + 400,
      },
    }));
  }

  static randomLayout(nodes: GraphNode[], width: number = 1000, height: number = 800): GraphNode[] {
    return nodes.map(node => ({
      ...node,
      position: {
        x: Math.random() * width,
        y: Math.random() * height,
      },
    }));
  }
}

export default LayoutUtils;