import React from 'react';
import { LandingHero } from '@/components/landing/landing-hero';
import { VisionMissionSection } from '@/components/landing/vision-mission-section';
import { SolutionsGrid } from '@/components/landing/solutions-grid';
import { WorkflowSection } from '@/components/landing/workflow-section';
import { PlatformsSection } from '@/components/landing/platforms-section';
import { CoverageSection } from '@/components/landing/coverage-section';
import { ContactCta } from '@/components/landing/contact-cta';
import { landingContent } from '@/lib/landing-content';

export default async function HomePage(): Promise<React.ReactElement> {
  return (
    <div className="bg-background text-foreground">
      <div className="mx-auto max-w-6xl rounded-3xl border-y border-border px-16 py-32 flex flex-col gap-28">
        <LandingHero
          title={landingContent.heroTitle}
          description={landingContent.heroDescription}
        />
        <VisionMissionSection vision={landingContent.vision} mission={landingContent.mission} />
        <SolutionsGrid solutions={landingContent.solutions} />
        <WorkflowSection steps={landingContent.workflow} />
        <PlatformsSection platforms={landingContent.platforms} />
        <CoverageSection trustedSources={landingContent.platforms} />
        <ContactCta
          announcement={landingContent.announcement}
          contactLinks={landingContent.contactLinks}
        />
      </div>
    </div>
  );
}
