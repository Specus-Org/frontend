interface TableData {
  withHeadings: boolean;
  content: string[][];
  stretched?: boolean;
}

export function TableBlock({ data }: { data: TableData }) {
  const rows = data.content;
  if (!rows || rows.length === 0) return null;

  const headRow = data.withHeadings ? rows[0] : null;
  const bodyRows = data.withHeadings ? rows.slice(1) : rows;

  return (
    <div
      className={`my-4 overflow-x-auto ${data.stretched ? 'w-full' : ''}`}
    >
      <table className="w-full border-collapse text-sm">
        {headRow ? (
          <thead>
            <tr className="border-b-2 border-border">
              {headRow.map((cell, i) => (
                <th
                  key={i}
                  className="px-4 py-2 text-left font-semibold text-foreground"
                  dangerouslySetInnerHTML={{ __html: cell }}
                />
              ))}
            </tr>
          </thead>
        ) : null}
        <tbody>
          {bodyRows.map((row, rowIdx) => (
            <tr
              key={rowIdx}
              className={`border-b border-border ${
                rowIdx % 2 === 1 ? 'bg-muted/50' : ''
              }`}
            >
              {row.map((cell, cellIdx) => (
                <td
                  key={cellIdx}
                  className="px-4 py-2 text-foreground"
                  dangerouslySetInnerHTML={{ __html: cell }}
                />
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
