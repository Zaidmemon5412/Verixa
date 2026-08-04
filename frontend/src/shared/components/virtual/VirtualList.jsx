import React from 'react';

/**
 * Reusable VirtualList Component Adapter.
 * Prepares the architectural interface for future windowing/virtualization (e.g. react-window or tanstack-virtual)
 * without adding unnecessary bundle size overhead today.
 *
 * @param {Array} items - Data items array to render
 * @param {Function} renderItem - Render function for individual item (item, index)
 * @param {number} itemHeight - Height per item row in pixels
 * @param {string} className - Optional CSS container class
 */
export const VirtualList = ({ items = [], renderItem, itemHeight = 80, className = '' }) => {
  if (!items || items.length === 0) {
    return null;
  }

  return (
    <div className={`virtual-list-container relative overflow-y-auto ${className}`}>
      <div className="virtual-list-wrapper space-y-3">
        {items.map((item, index) => (
          <div key={item.id || index} style={{ minHeight: `${itemHeight}px` }}>
            {renderItem(item, index)}
          </div>
        ))}
      </div>
    </div>
  );
};

export default VirtualList;
