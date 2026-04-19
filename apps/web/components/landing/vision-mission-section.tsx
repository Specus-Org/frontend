interface VisionMissionSectionProps {
  vision: string;
  mission: string;
}

export function VisionMissionSection({ vision, mission }: VisionMissionSectionProps): React.ReactElement {
  return (
    <section className="border-b border-border/60 bg-muted/40">
      <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6 md:px-8">
        <div className="grid gap-10 md:grid-cols-2 md:gap-0">
          <div className="md:pr-10">
            <p className="text-xs font-semibold uppercase tracking-widest text-primary">
              Our Vision
            </p>
            <p className="mt-4 text-sm leading-7 text-muted-foreground">{vision}</p>
          </div>
          <div className="border-t border-border/60 pt-10 md:border-l md:border-t-0 md:pl-10 md:pt-0">
            <p className="text-xs font-semibold uppercase tracking-widest text-primary">
              Our Mission
            </p>
            <p className="mt-4 text-sm leading-7 text-muted-foreground">{mission}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
