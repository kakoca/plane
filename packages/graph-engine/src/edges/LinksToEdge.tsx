import React from 'react';
import { EdgeProps, getBezierPath } from 'reactflow';

const LinksToEdge: React.FC<EdgeProps> = (props) => {
  const [edgePath] = getBezierPath(props);
  return (
    <path
      id={props.id}
      style={{ stroke: '#8b5cf6', strokeWidth: 1, strokeDasharray: '3,3' }}
      className="react-flow__edge-path"
      d={edgePath}
      markerEnd={props.markerEnd}
    />
  );
};

export default LinksToEdge;