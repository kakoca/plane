import React, { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';

const ModuleNode: React.FC<NodeProps> = ({ data }) => {
  return (
    <div style={{
      backgroundColor: '#fef3c7',
      border: '2px solid #fbbf24',
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

export default memo(ModuleNode);