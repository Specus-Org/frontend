import { CheckIcon, SquareIcon } from 'lucide-react';

interface ListItemData {
  content: string;
  meta?: { checked?: boolean };
  items?: ListItemData[];
}

interface ListData {
  style: 'ordered' | 'unordered' | 'checklist';
  items: ListItemData[];
}

function ChecklistItem({ item }: { item: ListItemData }) {
  const checked = item.meta?.checked ?? false;

  return (
    <li className="flex items-start gap-2 py-0.5">
      <span className="mt-1 flex-shrink-0">
        {checked ? (
          <CheckIcon className="size-4 text-primary" />
        ) : (
          <SquareIcon className="size-4 text-muted-foreground" />
        )}
      </span>
      <span
        className={checked ? 'line-through text-muted-foreground' : 'text-foreground'}
        dangerouslySetInnerHTML={{ __html: item.content }}
      />
    </li>
  );
}

function ListItem({
  item,
  style,
}: {
  item: ListItemData;
  style: 'ordered' | 'unordered' | 'checklist';
}) {
  if (style === 'checklist') {
    return (
      <>
        <ChecklistItem item={item} />
        {item.items && item.items.length > 0 ? (
          <ul className="ml-6 mt-1 list-none space-y-1">
            {item.items.map((nested, i) => (
              <ListItem key={i} item={nested} style={style} />
            ))}
          </ul>
        ) : null}
      </>
    );
  }

  return (
    <li className="text-foreground">
      <span dangerouslySetInnerHTML={{ __html: item.content }} />
      {item.items && item.items.length > 0 ? (
        <ListItems items={item.items} style={style} />
      ) : null}
    </li>
  );
}

function ListItems({
  items,
  style,
}: {
  items: ListItemData[];
  style: 'ordered' | 'unordered' | 'checklist';
}) {
  if (style === 'checklist') {
    return (
      <ul className="list-none space-y-1">
        {items.map((item, i) => (
          <ListItem key={i} item={item} style={style} />
        ))}
      </ul>
    );
  }

  const Tag = style === 'ordered' ? 'ol' : 'ul';
  const listClass =
    style === 'ordered'
      ? 'list-decimal pl-6 space-y-1'
      : 'list-disc pl-6 space-y-1';

  return (
    <Tag className={listClass}>
      {items.map((item, i) => (
        <ListItem key={i} item={item} style={style} />
      ))}
    </Tag>
  );
}

export function ListBlock({ data }: { data: ListData }) {
  return <ListItems items={data.items} style={data.style} />;
}
