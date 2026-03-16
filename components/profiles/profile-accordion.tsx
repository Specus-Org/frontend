'use client';

import Image from 'next/image';
import { ChevronDown } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

interface ProfileAccordionItem {
  value: string;
  image: string;
  title: string;
  subtitle: string;
  content: React.ReactNode;
}

interface ProfileAccordionProps {
  items: ProfileAccordionItem[];
}

export function ProfileAccordion({ items }: ProfileAccordionProps) {
  return (
    <Accordion type="single" collapsible>
      {items.map((item) => (
        <AccordionItem key={item.value} value={item.value}>
          <AccordionTrigger className="gap-4 py-4">
            <Image
              src={item.image}
              alt={item.title}
              width={40}
              height={40}
              className="shrink-0 rounded-md"
            />
            <div className="flex flex-1 flex-col items-start gap-0.5">
              <span className="text-base font-semibold text-foreground">{item.title}</span>
              <span className="text-sm text-muted-foreground">{item.subtitle}</span>
            </div>
            <ChevronDown className="size-5 shrink-0 text-muted-foreground transition-transform duration-200 group-aria-expanded/accordion-trigger:rotate-180" />
          </AccordionTrigger>
          <AccordionContent>{item.content}</AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
