// ResizableLayout.js - Add this functionality to your chat components

export const makeResizable = (element, options = {}) => {
  const {
    direction = 'horizontal', // 'horizontal', 'vertical', or 'both'
    minSize = 200,
    maxSize = 800,
    onResize = null
  } = options;

  let isResizing = false;
  let startX = 0;
  let startY = 0;
  let startWidth = 0;
  let startHeight = 0;

  // Create resize handle
  const resizeHandle = document.createElement('div');
  resizeHandle.className = `resize-handle resize-${direction}`;
  
  if (direction === 'horizontal') {
    resizeHandle.style.cssText = `
      position: absolute;
      top: 0;
      right: 0;
      width: 4px;
      height: 100%;
      background: transparent;
      cursor: col-resize;
      z-index: 1000;
    `;
  } else if (direction === 'vertical') {
    resizeHandle.style.cssText = `
      position: absolute;
      bottom: 0;
      left: 0;
      width: 100%;
      height: 4px;
      background: transparent;
      cursor: row-resize;
      z-index: 1000;
    `;
  }

  element.appendChild(resizeHandle);
  element.style.position = 'relative';

  const handleMouseDown = (e) => {
    isResizing = true;
    startX = e.clientX;
    startY = e.clientY;
    startWidth = parseInt(document.defaultView.getComputedStyle(element).width, 10);
    startHeight = parseInt(document.defaultView.getComputedStyle(element).height, 10);
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    
    e.preventDefault();
  };

  const handleMouseMove = (e) => {
    if (!isResizing) return;

    if (direction === 'horizontal' || direction === 'both') {
      const width = startWidth + e.clientX - startX;
      if (width >= minSize && width <= maxSize) {
        element.style.width = width + 'px';
        element.style.flexBasis = width + 'px';
      }
    }

    if (direction === 'vertical' || direction === 'both') {
      const height = startHeight + e.clientY - startY;
      if (height >= minSize && height <= maxSize) {
        element.style.height = height + 'px';
      }
    }

    if (onResize) {
      onResize({
        width: element.offsetWidth,
        height: element.offsetHeight
      });
    }
  };

  const handleMouseUp = () => {
    isResizing = false;
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };

  resizeHandle.addEventListener('mousedown', handleMouseDown);

  // Add hover effects
  resizeHandle.addEventListener('mouseenter', () => {
    resizeHandle.style.background = '#007bff';
    resizeHandle.style.opacity = '0.7';
  });

  resizeHandle.addEventListener('mouseleave', () => {
    if (!isResizing) {
      resizeHandle.style.background = 'transparent';
    }
  });

  return {
    destroy: () => {
      resizeHandle.removeEventListener('mousedown', handleMouseDown);
      element.removeChild(resizeHandle);
    }
  };
};