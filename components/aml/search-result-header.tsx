interface SearchResultHeaderProps {
  name: string;
  status: string;
}

export function SearchResultHeader({ name, status }: SearchResultHeaderProps) {
  return (
    <div>
      <h1 className="text-2xl font-semibold sm:text-3xl">{name}</h1>
      <span
        className={`mb-1 w-fit rounded-full mt-2 px-2.5 py-0.5 text-xs font-medium text-white bg-destructive`}
      >
        {status}
      </span>
      <p
        className="mt-4 text-lg text-foreground"
        dangerouslySetInnerHTML={{
          __html:
            '<b>Illicit Financial Transactions</b> Flagged for conducting unauthorized financial transactions channeling funds to entities controlled by the Islamic Revolutionary Guard Corps (IRGC), bypassing U.S. and international banking restrictions.',
        }}
      />
      <p className="mt-4 text-muted-foreground">
        Related Listing:{' '}
        <span>
          <a href="" className="text-blue-800 underline">
            OFAC SDN List
          </a>
        </span>
      </p>
    </div>
  );
}
