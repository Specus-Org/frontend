interface VisionMissionSectionProps {
  vision: string;
  mission: string;
}

const items = [
  { key: 'vision', label: 'OUR VISION' },
  { key: 'mission', label: 'OUR MISSION' },
] as const;

export function VisionMissionSection({
  vision,
  mission,
}: VisionMissionSectionProps): React.ReactElement {
  const texts = { vision, mission };

  return (
    <div className="flex w-full flex-col gap-4 sm:flex-row">
      {items.map(({ key, label }) => (
        <div
          key={key}
          className="flex flex-1 flex-col gap-2 rounded-xl border border-secondary p-6"
        >
          <p className="text-base font-semibold leading-6 text-[#00adb2]">{label}</p>
          <p className="text-lg leading-7 text-foreground">{texts[key]}</p>
        </div>
      ))}
    </div>
  );
}
