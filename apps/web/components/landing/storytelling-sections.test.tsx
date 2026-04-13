import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { CoverageSection } from './coverage-section';
import { PrinciplesSection } from './principles-section';
import { RoadmapSection } from './roadmap-section';
import { WorkflowSection } from './workflow-section';
import { landingContent } from '@/lib/landing-content';

describe('Landing storytelling sections', () => {
  it('renders mission, vision, and principles', () => {
    render(
      <PrinciplesSection
        mission={landingContent.mission}
        vision={landingContent.vision}
        principles={landingContent.principles}
      />,
    );

    expect(screen.getByText(landingContent.mission)).toBeInTheDocument();
    expect(screen.getByText(landingContent.vision)).toBeInTheDocument();

    for (const principle of landingContent.principles) {
      expect(screen.getByRole('heading', { name: principle.name })).toBeInTheDocument();
    }
  });

  it('renders the workflow steps in order', () => {
    render(<WorkflowSection steps={landingContent.workflow} />);

    expect(screen.getByRole('heading', { name: /how specus works/i })).toBeInTheDocument();

    const stepLabels = screen.getAllByText(/step 0[1-3]/i);
    expect(stepLabels.map((label) => label.textContent)).toEqual(['Step 01', 'Step 02', 'Step 03']);
  });

  it('renders trusted data sources and roadmap milestones', () => {
    render(
      <>
        <CoverageSection trustedSources={landingContent.trustedSources} />
        <RoadmapSection roadmap={landingContent.roadmap} />
      </>,
    );

    for (const source of landingContent.trustedSources) {
      expect(screen.getByText(source)).toBeInTheDocument();
    }

    for (const quarter of landingContent.roadmap) {
      expect(screen.getByText(quarter.quarter)).toBeInTheDocument();

      for (const milestone of quarter.milestones) {
        expect(screen.getByText(milestone)).toBeInTheDocument();
      }
    }
  });
});
