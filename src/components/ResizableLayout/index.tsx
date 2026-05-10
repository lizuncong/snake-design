import * as React from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';

type Props = {
  defaultSizes?: number[];
  minSizes?: number[];
  maxSizes?: number[];
  onResize?: (newSizes: number[]) => void;
  splitterSize?: number;
  style?: React.CSSProperties;
  children?: React.ReactNode;
};

const ResizableLayout: React.FC<Props> = ({
  defaultSizes = [200, 200, 200],
  minSizes = [50, 50, 50],
  maxSizes = [Infinity, Infinity, Infinity],
  onResize,
  splitterSize = 6,
  style,
  children,
}) => {
  const [sizes, setSizes] = useState<number[]>(defaultSizes);
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const startPosRef = useRef<number>(0);
  const startSizesRef = useRef<number[]>([]);

  const handleSplitterPointerDown = useCallback(
    (e: React.PointerEvent, index: number) => {
      e.preventDefault();
      setDraggingIndex(index);
      startPosRef.current = e.clientX;
      startSizesRef.current = [...sizes];
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    },
    [sizes],
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (draggingIndex === null || !containerRef.current) {
        return;
      }

      const delta = e.clientX - startPosRef.current;
      const containerRect = containerRef.current.getBoundingClientRect();
      const containerWidth = containerRect.width;

      const newSizes = [...startSizesRef.current];

      const leftIndex = draggingIndex;
      const rightIndex = draggingIndex + 1;

      const leftMin = (minSizes[leftIndex] ?? 50) / containerWidth;
      const rightMin = (minSizes[rightIndex] ?? 50) / containerWidth;
      const leftMax = Math.min(1, (maxSizes[leftIndex] ?? Infinity) / containerWidth);
      const rightMax = Math.min(1, (maxSizes[rightIndex] ?? Infinity) / containerWidth);

      const leftSize = startSizesRef.current[leftIndex] ?? 0;
      const rightSize = startSizesRef.current[rightIndex] ?? 0;

      let newLeftSize = leftSize + delta;
      let newRightSize = rightSize - delta;

      const leftSizeRatio = newLeftSize / containerWidth;
      const rightSizeRatio = newRightSize / containerWidth;

      if (leftSizeRatio < leftMin) {
        newLeftSize = leftMin * containerWidth;
        newRightSize = leftSize + rightSize - newLeftSize;
      } else if (rightSizeRatio < rightMin) {
        newRightSize = rightMin * containerWidth;
        newLeftSize = leftSize + rightSize - newRightSize;
      }

      if (leftSizeRatio > leftMax) {
        newLeftSize = leftMax * containerWidth;
        newRightSize = leftSize + rightSize - newLeftSize;
      } else if (rightSizeRatio > rightMax) {
        newRightSize = rightMax * containerWidth;
        newLeftSize = leftSize + rightSize - newRightSize;
      }

      newSizes[leftIndex] = newLeftSize;
      newSizes[rightIndex] = newRightSize;

      setSizes(newSizes);
    },
    [draggingIndex, minSizes, maxSizes],
  );

  const handlePointerUp = useCallback(() => {
    if (draggingIndex !== null) {
      setDraggingIndex(null);
      onResize?.([...sizes]);
    }
  }, [draggingIndex, sizes, onResize]);

  useEffect(() => {
    if (draggingIndex !== null) {
      const handleCaptureChange = () => {
        handlePointerUp();
      };
      window.addEventListener('pointercancel', handleCaptureChange);
      return () => window.removeEventListener('pointercancel', handleCaptureChange);
    }
    return undefined;
  }, [draggingIndex, handlePointerUp]);

  const childArray = React.Children.toArray(children);
  const containerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'row',
    width: '100%',
    height: '100%',
    ...style,
  };

  const splitterStyle: React.CSSProperties = {
    width: splitterSize,
    cursor: 'col-resize',
    flexShrink: 0,
    backgroundColor: draggingIndex !== null ? '#8bb4f9' : 'transparent',
    transition: 'background-color 0.15s ease',
  };

  const getPanelFlex = (size: number, totalSize: number): React.CSSProperties => {
    const flexRatio = totalSize > 0 ? size / totalSize : 0;
    return { flex: `${flexRatio} 0 0%`, overflow: 'hidden' };
  };

  return (
    <div
      ref={containerRef}
      style={containerStyle}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      {childArray.map((child, index) => {
        const showSplitter = index < childArray.length - 1;
        const panelSize = sizes[index] ?? 0;
        const totalSize = sizes.reduce((acc, s) => acc + (s ?? 0), 0);
        return (
          <React.Fragment key={index}>
            <div style={getPanelFlex(panelSize, totalSize)}>
              {child}
            </div>
            {showSplitter && (
              <div
                style={splitterStyle}
                onPointerDown={(e) => {
                  handleSplitterPointerDown(e, index);
                }}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default ResizableLayout;
