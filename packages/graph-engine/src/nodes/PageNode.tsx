import React, { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';

const PageNode: React.FC<NodeProps> = ({ data }) => {
  return (
    <div style={{
      backgroundColor: '#f3f4f6',
      border: '2px solid #9ca3af',
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

export default memo(PageNode);