import React from 'react';
import { EdgeProps, getBezierPath } from 'reactflow';

const ParentOfEdge: React.FC<EdgeProps> = (props) => {
  const [edgePath] = getBezierPath(props);
  return (
    <path
      id={props.id}
      style={{ stroke: '#10b981', strokeWidth: 2 }}
      className="react-flow__edge-path"
      d={edgePath}
      markerEnd={props.markerEnd}
    />
  );
};

export default ParentOfEdge;