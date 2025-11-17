import React, { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';

const ViewNode: React.FC<NodeProps> = ({ data }) => {
  return (
    <div style={{
      backgroundColor: '#ede9fe',
      border: '2px solid #a78bfa',
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

export default memo(ViewNode);