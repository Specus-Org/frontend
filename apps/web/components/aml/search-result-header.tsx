interface SearchResultHeaderProps {
  name: string;
  status: string;
}

export function SearchResultHeader({ name, status }: SearchResultHeaderProps) {
  return (
    <div>
      <h1 className="text-3xl font-semibold">{name}</h1>
      <span
        className={`mb-1 w-fit rounded-full mt-2 px-2.5 py-0.5 text-xs font-medium text-white bg-destructive`}
      >
        {status}
      </span>
    </div>
  );
}
