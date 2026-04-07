import { CheckSquareIcon, SquareIcon } from 'lucide-react';

interface ChecklistItemData {
  text: string;
  checked: boolean;
}

interface ChecklistData {
  items: ChecklistItemData[];
}

export function ChecklistBlock({ data }: { data: ChecklistData }) {
  return (
    <ul className="list-none space-y-2">
      {data.items.map((item, i) => (
        <li key={i} className="flex items-start gap-2">
          <span className="mt-0.5 flex-shrink-0">
            {item.checked ? (
              <CheckSquareIcon className="size-4 text-primary" />
            ) : (
              <SquareIcon className="size-4 text-muted-foreground" />
            )}
          </span>
          <span
            className={
              item.checked
                ? 'line-through text-muted-foreground'
                : 'text-foreground'
            }
            dangerouslySetInnerHTML={{ __html: item.text }}
          />
        </li>
      ))}
    </ul>
  );
}
