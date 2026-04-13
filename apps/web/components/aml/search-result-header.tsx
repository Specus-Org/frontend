import { ScreeningEntity } from '@specus/api-client';

interface SearchResultHeaderProps {
  entity: ScreeningEntity;
}

export function SearchResultHeader({ entity }: SearchResultHeaderProps) {
  return (
    <div>
      <h1 className="text-3xl font-semibold">{entity.caption}</h1>
      <div className="flex flex-rwo">
        {entity.topics?.map((topic) => (
          <span
            key={topic}
            className={`mb-1 w-fit rounded-full mt-2 px-2.5 py-0.5 text-xs font-medium text-white bg-destructive`}
          >
            {topic}
          </span>
        ))}
      </div>
      <p
        className="mt-4 text-lg text-foreground"
        dangerouslySetInnerHTML={{
          __html: entity.summary ?? '',
        }}
      />
      {/* <p className="mt-4 text-muted-foreground">
        Related Listing:{' '}
        <span>
          <a href="" className="text-blue-800 underline">
            OFAC SDN List
          </a>
        </span>
      </p> */}
    </div>
  );
}
