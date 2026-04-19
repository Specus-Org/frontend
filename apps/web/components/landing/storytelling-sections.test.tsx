import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { CoverageSection } from './coverage-section';
import { VisionMissionSection } from './vision-mission-section';
import { WorkflowSection } from './workflow-section';
import { landingContent } from '@/lib/landing-content';

describe('Landing storytelling sections', () => {
  it('renders vision and mission text', () => {
    render(
      <VisionMissionSection
        mission={landingContent.mission}
        vision={landingContent.vision}
      />,
    );

    expect(screen.getByText(landingContent.vision)).toBeInTheDocument();
    expect(screen.getByText(landingContent.mission)).toBeInTheDocument();
  });

  it('renders the workflow steps in order', () => {
    render(<WorkflowSection steps={landingContent.workflow} />);

    const stepLabels = screen.getAllByText(/step [123]/i);
    expect(stepLabels).toHaveLength(3);
  });

  it('renders trusted data sources', () => {
    render(<CoverageSection trustedSources={landingContent.trustedSources} />);

    for (const source of landingContent.trustedSources) {
      expect(screen.getByText(`· ${source}`)).toBeInTheDocument();
    }
  });
});
