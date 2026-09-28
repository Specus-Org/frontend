'use client';

import {
  listScreeningCountries,
  listScreeningTopics,
  type ScreeningCountry,
  type ScreeningTopic,
} from '@specus/api-client';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@specus/ui/components/command';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@specus/ui/components/dropdown-menu';
import { Popover, PopoverContent, PopoverTrigger } from '@specus/ui/components/popover';
import { Check, ChevronDown } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { CountryFlag } from '@/components/aml/country-flag';
import {
  type AmlSearchFilters,
  normalizeTopics,
  type ScreeningTopicCode,
  TOPIC_CODES,
  TOPIC_FALLBACK_LABELS,
} from '@/lib/aml-search-params';

type LoadStatus = 'loading' | 'ready' | 'error';

type FilterVariant = 'bar' | 'chips';

const FALLBACK_TOPICS: ScreeningTopic[] = TOPIC_CODES.map((code) => ({
  code,
  name: TOPIC_FALLBACK_LABELS[code],
}));

function useFilterOptions() {
  const [topics, setTopics] = useState<ScreeningTopic[]>(FALLBACK_TOPICS);
  const [countries, setCountries] = useState<ScreeningCountry[]>([]);
  const [countriesStatus, setCountriesStatus] = useState<LoadStatus>('loading');

  useEffect(() => {
    let cancelled = false;

    listScreeningTopics()
      .then((response) => {
        const loaded = response.data?.topics;
        if (!cancelled && loaded && loaded.length > 0) setTopics(loaded);
      })
      .catch(() => {
        // Keep the fallback topics; the codes are a closed set in the API contract.
      });

    listScreeningCountries()
      .then((response) => {
        if (cancelled) return;
        if (!response.data) {
          setCountriesStatus('error');
          return;
        }
        setCountries(response.data.countries);
        setCountriesStatus('ready');
      })
      .catch(() => {
        if (!cancelled) setCountriesStatus('error');
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { topics, countries, countriesStatus };
}

interface FilterTriggerProps extends Omit<React.ComponentProps<'button'>, 'value'> {
  label: string;
  /** Display text of the selection, or null when the filter is not set. */
  selection: string | null;
  variant: FilterVariant;
}

function FilterTrigger({
  label,
  selection,
  variant,
  ...props
}: FilterTriggerProps): React.ReactElement {
  if (variant === 'chips') {
    const text = selection ? `${label}: ${selection}` : label;
    const stateClassName = selection
      ? 'border-brand bg-brand/5 text-brand font-medium hover:bg-brand/10'
      : 'text-foreground bg-white hover:bg-slate-50 data-[state=open]:bg-slate-50';

    return (
      <button
        type="button"
        title={text}
        className={`inline-flex h-7 max-w-64 cursor-pointer items-center gap-1 rounded-full border px-2.5 text-xs transition-colors sm:h-8 sm:px-3 sm:text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring ${stateClassName}`}
        {...props}
      >
        <span className="truncate">{text}</span>
        <ChevronDown className="size-3.5 shrink-0 opacity-60 sm:size-4" />
      </button>
    );
  }

  const text = selection ?? 'All';
  return (
    <button
      type="button"
      className="flex w-full min-w-0 cursor-pointer flex-col items-start rounded-md px-2.5 py-0.5 text-left transition-colors outline-none hover:bg-slate-200/60 focus-visible:ring-2 focus-visible:ring-ring data-[state=open]:bg-slate-200/60"
      {...props}
    >
      <span className="text-muted-foreground text-[11px] leading-4 font-medium sm:text-xs">
        {label}
      </span>
      <span className="text-foreground w-full truncate text-xs sm:text-sm" title={text}>
        {text}
      </span>
    </button>
  );
}

interface TopicFilterProps {
  options: ScreeningTopic[];
  selected: ScreeningTopicCode[];
  onChange: (topics: ScreeningTopicCode[]) => void;
  variant: FilterVariant;
}

function TopicFilter({
  options,
  selected,
  onChange,
  variant,
}: TopicFilterProps): React.ReactElement {
  const selectedSet = new Set(selected);
  const labels = new Map(options.map((topic) => [topic.code, topic.name]));
  const display =
    selected.length === 0
      ? null
      : selected.map((code) => labels.get(code) ?? TOPIC_FALLBACK_LABELS[code]).join(', ');

  const toggle = (code: ScreeningTopicCode, checked: boolean) => {
    const next = new Set(selected);
    if (checked) next.add(code);
    else next.delete(code);
    onChange(normalizeTopics(next));
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <FilterTrigger label="Topics" selection={display} variant={variant} />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        {options.map((topic) => (
          <DropdownMenuCheckboxItem
            key={topic.code}
            checked={selectedSet.has(topic.code)}
            onCheckedChange={(checked) => toggle(topic.code, checked === true)}
            // Keep the menu open so several topics can be picked in one go.
            onSelect={(event) => event.preventDefault()}
            className="cursor-pointer"
          >
            {topic.name}
          </DropdownMenuCheckboxItem>
        ))}
        {selected.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={() => onChange([])} className="cursor-pointer">
              Clear topics
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

interface CountryFilterProps {
  options: ScreeningCountry[];
  status: LoadStatus;
  selected: string | null;
  onChange: (country: string | null) => void;
  variant: FilterVariant;
}

function CountryFilter({
  options,
  status,
  selected,
  onChange,
  variant,
}: CountryFilterProps): React.ReactElement {
  const [open, setOpen] = useState(false);
  const isSelected = (code: string) => selected?.toLowerCase() === code.toLowerCase();
  const selectedCountry = selected ? options.find((country) => isSelected(country.code)) : null;
  const display = selected ? (selectedCountry?.name ?? selected.toUpperCase()) : null;

  const select = (country: string | null) => {
    onChange(country);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <FilterTrigger label="Country" selection={display} variant={variant} />
      </PopoverTrigger>
      <PopoverContent align="start" className="w-72 p-0">
        <Command>
          <CommandInput placeholder="Search country…" />
          <CommandList>
            {status === 'ready' && <CommandEmpty>No country found.</CommandEmpty>}
            <CommandGroup>
              <CommandItem value="All countries" onSelect={() => select(null)}>
                <span className="flex-1">All countries</span>
                {!selected && <Check />}
              </CommandItem>
              {options.map((country) => (
                <CommandItem
                  key={country.code}
                  value={`${country.name} ${country.code}`}
                  onSelect={() => select(country.code)}
                >
                  <CountryFlag countryCode={country.code} alt="" size="sm" />
                  <span className="flex-1 truncate">{country.name}</span>
                  {isSelected(country.code) && <Check />}
                </CommandItem>
              ))}
            </CommandGroup>
            {status === 'loading' && (
              <p className="text-muted-foreground px-2 py-4 text-center text-sm">
                Loading countries…
              </p>
            )}
            {status === 'error' && (
              <p className="px-2 py-4 text-center text-sm text-red-600">
                Failed to load countries.
              </p>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

interface AmlSearchFilterBarProps {
  value: AmlSearchFilters;
  onChange: (value: AmlSearchFilters) => void;
  /** `bar`: labelled columns inside the search card. `chips`: compact pills under the input. */
  variant?: FilterVariant;
  className?: string;
}

export function AmlSearchFilterBar({
  value,
  onChange,
  variant = 'bar',
  className = '',
}: AmlSearchFilterBarProps): React.ReactElement {
  const { topics, countries, countriesStatus } = useFilterOptions();

  const topicFilter = (
    <TopicFilter
      variant={variant}
      options={topics}
      selected={value.topics}
      onChange={(nextTopics) => onChange({ ...value, topics: nextTopics })}
    />
  );
  const countryFilter = (
    <CountryFilter
      variant={variant}
      options={countries}
      status={countriesStatus}
      selected={value.country}
      onChange={(country) => onChange({ ...value, country })}
    />
  );

  if (variant === 'chips') {
    return (
      <div className={`flex flex-wrap items-center gap-2 ${className}`}>
        {topicFilter}
        {countryFilter}
      </div>
    );
  }

  return (
    <div className={`grid grid-cols-2 p-1 ${className}`}>
      <div className="min-w-0 pr-1">{topicFilter}</div>
      <div className="min-w-0 border-l border-slate-200 pl-1">{countryFilter}</div>
    </div>
  );
}
