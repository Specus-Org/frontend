interface VisionMissionSectionProps {
  vision: string;
  mission: string;
}

export function VisionMissionSection({
  vision,
  mission,
}: VisionMissionSectionProps): React.ReactElement {
  return (
    <section className="border-b border-border/60 bg-muted/40">
      <div className="mx-auto max-w-4xl px-4 py-14 sm:px-6 md:px-8">
        <div className="grid gap-10 md:grid-cols-2 md:gap-0 md:divide-x md:divide-border/60">
          <div className="md:pr-12">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-primary">
              Our Vision
            </p>
            <p className="mt-3 text-sm leading-7 text-muted-foreground">{vision}</p>
          </div>
          <div className="border-t border-border/60 pt-10 md:border-t-0 md:pl-12 md:pt-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-primary">
              Our Mission
            </p>
            <p className="mt-3 text-sm leading-7 text-muted-foreground">{mission}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
