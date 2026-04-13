import React from 'react';
import { CoverageSection } from '@/components/landing/coverage-section';
import { ContactCta } from '@/components/landing/contact-cta';
import { LandingHero } from '@/components/landing/landing-hero';
import { SolutionsGrid } from '@/components/landing/solutions-grid';
import { WorkflowSection } from '@/components/landing/workflow-section';
import { landingContent } from '@/lib/landing-content';

export default async function HomePage(): Promise<React.ReactElement> {
  return (
    <div className="bg-background text-foreground">
      <LandingHero
        announcement={landingContent.announcement}
        title={landingContent.heroTitle}
        description={landingContent.heroDescription}
        slogan={landingContent.slogan}
        metrics={landingContent.heroMetrics}
      />
      {/* <TrustStrip
        metrics={landingContent.heroMetrics}
        trustedSources={landingContent.trustedSources}
      /> */}
      {/* <PrinciplesSection
        mission={landingContent.mission}
        vision={landingContent.vision}
        principles={landingContent.principles}
      /> */}
      <SolutionsGrid solutions={landingContent.solutions} />
      <WorkflowSection steps={landingContent.workflow} />
      <CoverageSection trustedSources={landingContent.trustedSources} />
      {/* <RoadmapSection roadmap={landingContent.roadmap} /> */}
      <ContactCta slogan={landingContent.slogan} contactLinks={landingContent.contactLinks} />
    </div>
  );
}
