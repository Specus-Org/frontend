import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it } from 'vitest';
import { AMLSearchLoadingState } from './loading-states';

describe('AMLSearchLoadingState', () => {
  it('fills the result grid with six skeleton cards', () => {
    const { container } = render(<AMLSearchLoadingState />);

    const grid = screen.getByRole('status', { name: 'Loading search results' });
    expect(grid.className).toContain('grid-cols-1');
    expect(grid.className).toContain('md:grid-cols-2');
    expect(grid.className).toContain('xl:grid-cols-3');
    expect(grid).toHaveAttribute('aria-busy', 'true');

    expect(container.querySelectorAll('.rounded-2xl')).toHaveLength(6);
  });
});
