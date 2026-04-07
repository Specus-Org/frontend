interface HeaderData {
  text: string;
  level: number;
}

const levelClasses: Record<number, string> = {
  1: 'text-4xl font-bold tracking-tight',
  2: 'text-3xl font-semibold tracking-tight',
  3: 'text-2xl font-semibold',
  4: 'text-xl font-semibold',
  5: 'text-lg font-medium',
  6: 'text-base font-medium',
};

export function HeaderBlock({ data }: { data: HeaderData }) {
  const Tag = `h${Math.min(Math.max(data.level, 1), 6)}` as
    | 'h1'
    | 'h2'
    | 'h3'
    | 'h4'
    | 'h5'
    | 'h6';

  return (
    <Tag
      className={`${levelClasses[data.level] ?? levelClasses[3]} text-foreground`}
      dangerouslySetInnerHTML={{ __html: data.text }}
    />
  );
}
