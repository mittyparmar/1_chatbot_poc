import React, { useState } from 'react';

export interface TreeNode {
  id: string;
  label: string;
  icon?: React.ReactNode;
  children?: TreeNode[];
  disabled?: boolean;
  expanded?: boolean;
  selected?: boolean;
  data?: any;
}

export interface TreeViewProps {
  data: TreeNode[];
  onNodeSelect?: (node: TreeNode) => void;
  onNodeExpand?: (node: TreeNode, expanded: boolean) => void;
  onNodeCheck?: (node: TreeNode, checked: boolean) => void;
  className?: string;
  variant?: 'default' | 'compact' | 'detailed';
  size?: 'sm' | 'md' | 'lg';
  selectable?: boolean;
  expandable?: boolean;
  checkable?: boolean;
  defaultExpanded?: string[];
  defaultSelected?: string[];
  defaultChecked?: string[];
  multiSelect?: boolean;
  multiCheck?: boolean;
  showIcons?: boolean;
  showLines?: boolean;
  virtualScroll?: boolean;
  height?: number;
}

export const TreeView: React.FC<TreeViewProps> = ({
  data,
  onNodeSelect,
  onNodeExpand,
  onNodeCheck,
  className = '',
  variant = 'default',
  size = 'md',
  selectable = true,
  expandable = true,
  checkable = false,
  defaultExpanded = [],
  defaultSelected = [],
  defaultChecked = [],
  multiSelect = false,
  multiCheck = false,
  showIcons = true,
  showLines = true,
  virtualScroll = false,
  height = 400,
}) => {
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set(defaultExpanded));
  const [selectedNodes, setSelectedNodes] = useState<Set<string>>(new Set(defaultSelected));
  const [checkedNodes, setCheckedNodes] = useState<Set<string>>(new Set(defaultChecked));

  const toggleNode = (node: TreeNode) => {
    if (node.disabled) return;

    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(node.id)) {
      newExpanded.delete(node.id);
    } else {
      newExpanded.add(node.id);
    }
    setExpandedNodes(newExpanded);
    onNodeExpand?.(node, newExpanded.has(node.id));
  };

  const selectNode = (node: TreeNode) => {
    if (!selectable || node.disabled) return;

    const newSelected = new Set(selectedNodes);
    if (multiSelect) {
      if (newSelected.has(node.id)) {
        newSelected.delete(node.id);
      } else {
        newSelected.add(node.id);
      }
    } else {
      newSelected.clear();
      newSelected.add(node.id);
    }
    setSelectedNodes(newSelected);
    onNodeSelect?.(node);
  };

  const checkNode = (node: TreeNode) => {
    if (!checkable || node.disabled) return;

    const newChecked = new Set(checkedNodes);
    if (multiCheck) {
      if (newChecked.has(node.id)) {
        newChecked.delete(node.id);
      } else {
        newChecked.add(node.id);
      }
    } else {
      newChecked.clear();
      newChecked.add(node.id);
    }
    setCheckedNodes(newChecked);
    onNodeCheck?.(node, newChecked.has(node.id));
  };

  const renderNode = (node: TreeNode, level: number = 0) => {
    const isExpanded = expandedNodes.has(node.id);
    const isSelected = selectedNodes.has(node.id);
    const isChecked = checkedNodes.has(node.id);
    const hasChildren = node.children && node.children.length > 0;

    const sizeClasses = {
      sm: 'text-sm',
      md: 'text-base',
      lg: 'text-lg',
    };

    const variantClasses = {
      default: 'hover:bg-gray-50',
      compact: 'hover:bg-gray-100',
      detailed: 'hover:bg-gray-50 border-l-2 border-transparent hover:border-primary-500',
    };

    return (
      <div key={node.id} className="relative">
        {showLines && level > 0 && (
          <div className="absolute left-4 top-0 bottom-0 w-px bg-gray-200" />
        )}
        
        <div
          className={`
            flex items-center px-3 py-2 cursor-pointer transition-colors
            ${variantClasses[variant]}
            ${isSelected ? 'bg-primary-50 text-primary-700' : ''}
            ${node.disabled ? 'opacity-50 cursor-not-allowed' : ''}
            ${sizeClasses[size]}
          `}
          style={{ paddingLeft: `${level * 20 + 12}px` }}
          onClick={() => selectNode(node)}
        >
          {expandable && hasChildren && (
            <button
              type="button"
              className="mr-1 flex-shrink-0"
              onClick={(e) => {
                e.stopPropagation();
                toggleNode(node);
              }}
            >
              {isExpanded ? '▼' : '▶'}
            </button>
          )}
          
          {!expandable && hasChildren && (
            <span className="mr-1 flex-shrink-0">📁</span>
          )}
          
          {!hasChildren && (
            <span className="mr-1 flex-shrink-0">📄</span>
          )}
          
          {checkable && (
            <input
              type={multiCheck ? 'checkbox' : 'radio'}
              checked={isChecked}
              onChange={(e) => {
                e.stopPropagation();
                checkNode(node);
              }}
              disabled={node.disabled}
              className="mr-2"
            />
          )}
          
          {showIcons && node.icon && (
            <span className="mr-2 flex-shrink-0">
              {node.icon}
            </span>
          )}
          
          <span className="flex-1 truncate">{node.label}</span>
        </div>
        
        {isExpanded && hasChildren && (
          <div className="ml-4">
            {node.children!.map(child => renderNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  if (virtualScroll) {
    return (
      <div className={`overflow-y-auto ${className}`} style={{ height }}>
        {data.map(node => renderNode(node))}
      </div>
    );
  }

  return (
    <div className={className}>
      {data.map(node => renderNode(node))}
    </div>
  );
};

export interface TreeNodeProps {
  node: TreeNode;
  level?: number;
  onSelect?: (node: TreeNode) => void;
  onExpand?: (node: TreeNode, expanded: boolean) => void;
  onCheck?: (node: TreeNode, checked: boolean) => void;
  className?: string;
  variant?: 'default' | 'compact' | 'detailed';
  size?: 'sm' | 'md' | 'lg';
  selectable?: boolean;
  expandable?: boolean;
  checkable?: boolean;
  showIcons?: boolean;
  showLines?: boolean;
}

export const TreeNode: React.FC<TreeNodeProps> = ({
  node,
  level = 0,
  onSelect,
  onExpand,
  onCheck,
  className = '',
  variant = 'default',
  size = 'md',
  selectable = true,
  expandable = true,
  checkable = false,
  showIcons = true,
  showLines = true,
}) => {
  const [isExpanded, setIsExpanded] = useState(node.expanded || false);
  const [isSelected, setIsSelected] = useState(node.selected || false);
  const [isChecked, setIsChecked] = useState(node.selected || false);

  const toggleNode = () => {
    if (node.disabled) return;
    const newExpanded = !isExpanded;
    setIsExpanded(newExpanded);
    onExpand?.(node, newExpanded);
  };

  const selectNode = () => {
    if (!selectable || node.disabled) return;
    setIsSelected(!isSelected);
    onSelect?.(node);
  };

  const checkNode = () => {
    if (!checkable || node.disabled) return;
    const newChecked = !isChecked;
    setIsChecked(newChecked);
    onCheck?.(node, newChecked);
  };

  const hasChildren = node.children && node.children.length > 0;

  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  };

  const variantClasses = {
    default: 'hover:bg-gray-50',
    compact: 'hover:bg-gray-100',
    detailed: 'hover:bg-gray-50 border-l-2 border-transparent hover:border-primary-500',
  };

  return (
    <div key={node.id} className={`relative ${className}`}>
      {showLines && level > 0 && (
        <div className="absolute left-4 top-0 bottom-0 w-px bg-gray-200" />
      )}
      
      <div
        className={`
          flex items-center px-3 py-2 cursor-pointer transition-colors
          ${variantClasses[variant]}
          ${isSelected ? 'bg-primary-50 text-primary-700' : ''}
          ${node.disabled ? 'opacity-50 cursor-not-allowed' : ''}
          ${sizeClasses[size]}
        `}
        style={{ paddingLeft: `${level * 20 + 12}px` }}
        onClick={selectNode}
      >
        {expandable && hasChildren && (
          <button
            type="button"
            className="mr-1 flex-shrink-0"
            onClick={(e) => {
              e.stopPropagation();
              toggleNode();
            }}
          >
            {isExpanded ? '▼' : '▶'}
          </button>
        )}
        
        {!expandable && hasChildren && (
          <span className="mr-1 flex-shrink-0">📁</span>
        )}
        
        {!hasChildren && (
          <span className="mr-1 flex-shrink-0">📄</span>
        )}
        
        {checkable && (
          <input
            type="checkbox"
            checked={isChecked}
            onChange={(e) => {
              e.stopPropagation();
              checkNode();
            }}
            disabled={node.disabled}
            className="mr-2"
          />
        )}
        
        {showIcons && node.icon && (
          <span className="mr-2 flex-shrink-0">
            {node.icon}
          </span>
        )}
        
        <span className="flex-1 truncate">{node.label}</span>
      </div>
      
      {isExpanded && hasChildren && (
        <div className="ml-4">
          {node.children!.map(child => (
            <TreeNode
              key={child.id}
              node={child}
              level={level + 1}
              onSelect={onSelect}
              onExpand={onExpand}
              onCheck={onCheck}
              variant={variant}
              size={size}
              selectable={selectable}
              expandable={expandable}
              checkable={checkable}
              showIcons={showIcons}
              showLines={showLines}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default TreeView;