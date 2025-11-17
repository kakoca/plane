import React from 'react';
import { EdgeProps, getBezierPath } from 'reactflow';

const DependsOnEdge: React.FC<EdgeProps> = (props) => {
  const [edgePath] = getBezierPath(props);
  return (
    <path
      id={props.id}
      style={{ stroke: '#3b82f6', strokeWidth: 2, strokeDasharray: '5,5' }}
      className="react-flow__edge-path"
      d={edgePath}
      markerEnd={props.markerEnd}
    />
  );
};

export default DependsOnEdge;