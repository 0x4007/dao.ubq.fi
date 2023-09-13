import { useEffect } from 'react';
import { grid } from '@/lib/the-grid';
import React from 'react';

export function Grid() {
  useEffect(() => {
    const gridElement = document.getElementById('Grid');
    if (gridElement) {
      grid(gridElement);
    }
  }, []);

  return (
    <div id="Grid"></div>
  );
}
