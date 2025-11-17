/**
 * IssueNode Component
 * Componente customizado para representar issues no grafo
 */

import React, { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import type { IssueNodeProps } from '../types';

interface IssueNodeData {
  label: string;
  metadata: {
    issueNumber?: string;
    status?: string;
    stateColor?: string;
    priority?: 'urgent' | 'high' | 'medium' | 'low' | 'none';
    assignee?: {
      id: string;
      name: string;
      avatar?: string;
    };
    labels?: Array<{
      id: string;
      name: string;
      color: string;
    }>;
  };
  isHighlighted?: boolean;
  isSelected?: boolean;
}

const priorityColors = {
  urgent: '#ef4444',
  high: '#f59e0b',
  medium: '#3b82f6',
  low: '#10b981',
  none: '#6b7280',
};

const priorityIcons = {
  urgent: '🔴',
  high: '🟠',
  medium: '🔵',
  low: '🟢',
  none: '⚪',
};

const IssueNode: React.FC<NodeProps<IssueNodeData>> = ({ 
  data, 
  selected,
  dragging,
}) => {
  const { label, metadata, isHighlighted } = data;
  const { 
    issueNumber, 
    status, 
    stateColor, 
    priority = 'none',
    assignee,
    labels = []
  } = metadata;

  // Determine node styling based on state
  const nodeStyle: React.CSSProperties = {
    backgroundColor: isHighlighted ? '#fef3c7' : '#ffffff',
    border: `2px solid ${selected ? '#3f76ff' : stateColor || '#e5e5e5'}`,
    borderRadius: '8px',
    padding: '12px',
    minWidth: '250px',
    maxWidth: '300px',
    boxShadow: dragging ? '0 10px 30px rgba(0,0,0,0.15)' : '0 2px 4px rgba(0,0,0,0.1)',
    transition: 'all 0.2s ease',
    cursor: 'pointer',
  };

  const headerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '8px',
    paddingBottom: '8px',
    borderBottom: '1px solid #e5e5e5',
  };

  const titleStyle: React.CSSProperties = {
    fontSize: '14px',
    fontWeight: 600,
    color: '#1f2937',
    marginBottom: '4px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  };

  const metadataStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    fontSize: '12px',
    color: '#6b7280',
  };

  const labelContainerStyle: React.CSSProperties = {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '4px',
    marginTop: '4px',
  };

  const labelStyle = (color: string): React.CSSProperties => ({
    backgroundColor: `${color}20`,
    color: color,
    padding: '2px 6px',
    borderRadius: '4px',
    fontSize: '10px',
    fontWeight: 500,
    border: `1px solid ${color}40`,
  });

  const assigneeStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  };

  const avatarStyle: React.CSSProperties = {
    width: '20px',
    height: '20px',
    borderRadius: '50%',
    backgroundColor: '#e5e5e5',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '10px',
    fontWeight: 600,
    color: '#6b7280',
  };

  const statusBadgeStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    padding: '2px 8px',
    borderRadius: '12px',
    backgroundColor: `${stateColor}20` || '#f3f4f6',
    color: stateColor || '#6b7280',
    fontSize: '11px',
    fontWeight: 500,
  };

  return (
    <div style={nodeStyle}>
      {/* Handles for connections */}
      <Handle
        type="target"
        position={Position.Top}
        style={{
          background: '#3f76ff',
          width: '8px',
          height: '8px',
        }}
      />
      
      {/* Header with issue number and priority */}
      <div style={headerStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {issueNumber && (
            <span style={{ 
              fontSize: '12px', 
              color: '#6b7280',
              fontFamily: 'monospace',
            }}>
              #{issueNumber}
            </span>
          )}
          {priority && priority !== 'none' && (
            <span 
              title={`Priority: ${priority}`}
              style={{ fontSize: '14px' }}
            >
              {priorityIcons[priority]}
            </span>
          )}
        </div>
        {status && (
          <span style={statusBadgeStyle}>
            {status}
          </span>
        )}
      </div>

      {/* Issue title */}
      <div style={titleStyle} title={label}>
        {label}
      </div>

      {/* Metadata section */}
      <div style={metadataStyle}>
        {/* Assignee */}
        {assignee && (
          <div style={assigneeStyle}>
            <div style={avatarStyle}>
              {assignee.avatar ? (
                <img 
                  src={assignee.avatar} 
                  alt={assignee.name}
                  style={{ 
                    width: '100%', 
                    height: '100%', 
                    borderRadius: '50%',
                    objectFit: 'cover',
                  }}
                />
              ) : (
                assignee.name.charAt(0).toUpperCase()
              )}
            </div>
            <span style={{ fontSize: '11px' }}>{assignee.name}</span>
          </div>
        )}

        {/* Labels */}
        {labels.length > 0 && (
          <div style={labelContainerStyle}>
            {labels.slice(0, 3).map((label) => (
              <span 
                key={label.id}
                style={labelStyle(label.color)}
                title={label.name}
              >
                {label.name}
              </span>
            ))}
            {labels.length > 3 && (
              <span style={labelStyle('#6b7280')}>
                +{labels.length - 3} more
              </span>
            )}
          </div>
        )}
      </div>

      {/* Source handle */}
      <Handle
        type="source"
        position={Position.Bottom}
        style={{
          background: '#3f76ff',
          width: '8px',
          height: '8px',
        }}
      />
    </div>
  );
};

export default memo(IssueNode);