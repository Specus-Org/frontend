import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { SolutionsGrid } from './solutions-grid';
import { landingContent } from '@/lib/landing-content';

describe('SolutionsGrid', () => {
  it('renders all solution categories with their bullet details', () => {
    render(<SolutionsGrid solutions={landingContent.solutions} />);

    for (const solution of landingContent.solutions) {
      expect(screen.getByText(solution.title)).toBeInTheDocument();

      for (const bullet of solution.bullets) {
        expect(screen.getByText(bullet)).toBeInTheDocument();
      }
    }
  });
});
