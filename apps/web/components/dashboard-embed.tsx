interface DashboardEmbedProps {
  src: string;
  title: string;
}

export function DashboardEmbed({ src, title }: DashboardEmbedProps): React.ReactNode {
  return (
    <div className="w-full overflow-x-hidden bg-background">
      <iframe
        src={src}
        title={title}
        referrerPolicy="no-referrer"
        sandbox="allow-scripts allow-forms allow-same-origin"
        className="block min-h-[2200px] w-full border-0"
      />
    </div>
  );
}
