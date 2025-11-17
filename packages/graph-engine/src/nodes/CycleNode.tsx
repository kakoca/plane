import React, { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';

const CycleNode: React.FC<NodeProps> = ({ data }) => {
  return (
    <div style={{
      backgroundColor: '#f0f9ff',
      border: '2px solid #60a5fa',
      borderRadius: '8px',
      padding: '12px',
      minWidth: '200px',
    }}>
      <Handle type="target" position={Position.Top} />
      <div>{data.label}</div>
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
};

export default memo(CycleNode);