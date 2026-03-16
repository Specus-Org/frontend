# feat: Implement Profiles accordion view on Bangladesh page

## Overview

Add an accordion component to the **Profiles** tab (`efisiensi-internal`) of the Bangladesh page. Each accordion item displays a custom header with an image on the left, title + subtitle in the middle, and a chevron icon on the right. The content area accepts dynamic `ReactNode` children.

## Problem Statement

The Profiles tab currently shows a placeholder `<p>Test</p>`. It needs to display three expandable profile sections (Procuring Entity, Contractor, District) matching the provided design screenshot.

## Proposed Solution

Use shadcn/ui Accordion (backed by Radix UI) with a customized trigger layout. Create a reusable `ProfileAccordion` component that composes the accordion primitives with the custom header design.

## Acceptance Criteria

- [ ] shadcn Accordion component is installed (`pnpm dlx shadcn@latest add accordion`)
- [ ] Accordion renders inside the Profiles tab with three items
- [ ] Each item header shows: image (left), title + subtitle (middle), chevron (right)
- [ ] Chevron rotates 180deg when item is open
- [ ] Content area accepts any `ReactNode` children
- [ ] Uses `type="single" collapsible` so only one section opens at a time
- [ ] Matches the visual design from the screenshot
- [ ] Accessible (keyboard nav, ARIA attributes handled by Radix)

## Implementation Steps

### Step 1: Install shadcn Accordion

```bash
pnpm dlx shadcn@latest add accordion
```

This creates `components/ui/accordion.tsx` with `Accordion`, `AccordionItem`, `AccordionTrigger`, `AccordionContent`.

**Files:** `components/ui/accordion.tsx`

### Step 2: Modify AccordionTrigger to remove built-in chevron

The default shadcn `AccordionTrigger` hardcodes a `ChevronDownIcon`. Remove it so the trigger only renders `children`, allowing full layout control at the usage site.

Update the trigger's CSS selector from `[&[data-state=open]>svg]:rotate-180` to target a specific class like `[&[data-state=open]>svg.accordion-chevron]:rotate-180` or remove it entirely since we'll handle rotation in the usage site.

Also remove `hover:underline` since the custom header design doesn't need underline on hover.

**Files:** `components/ui/accordion.tsx`

### Step 3: Create ProfileAccordion component

Create a reusable component that wraps the accordion with the custom header layout.

```
components/profiles/
  profile-accordion.tsx    -- The accordion wrapper component
  index.ts                 -- Barrel export
```

**`profile-accordion.tsx`** should:
- Accept an array of items, each with: `image` (string src), `title`, `subtitle`, `content` (ReactNode), and a unique `value`
- Render `<Accordion type="single" collapsible>`
- Each `AccordionItem` trigger contains:
  - `<Image>` (next/image) on the left, ~40x40px, rounded
  - `<div>` with title (font-semibold) + subtitle (text-muted-foreground) stacked vertically
  - `<ChevronDown>` (lucide-react) on the right with rotation transition
- `AccordionContent` renders the passed `content` ReactNode

**Interface:**

```tsx
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
```

**Files:** `components/profiles/profile-accordion.tsx`, `components/profiles/index.ts`

### Step 4: Add profile images to public directory

Add the three profile icons referenced in the design:
- Procuring Entity icon
- Contractor icon
- District icon

Place them in `public/images/profiles/` or use emoji/illustration placeholders initially.

**Files:** `public/images/profiles/` (or use inline emoji as placeholder)

### Step 5: Update Bangladesh page Profiles tab

Replace `<p>Test</p>` in the `efisiensi-internal` TabsContent with the `ProfileAccordion` component.

Define the three items:
1. **Procuring Entity Profiles** -- "A complete overview of all registered procuring entities."
2. **Contractor Profiles** -- "A complete overview of all registered contractors."
3. **District Profiles** -- "A complete overview of all registered districts."

Each item's `content` can be a placeholder for now (e.g., a simple text or empty div) since the content should be dynamic.

**Files:** `app/bangladesh/page.tsx`

### Step 6: Style refinements

- Ensure `AccordionItem` has `border-b last:border-b-0` (default) for clean separation
- Trigger padding: `py-4` with `gap-4` between image, text, and chevron
- Text alignment: title and subtitle left-aligned
- Chevron: `text-muted-foreground`, `size-5`, with `transition-transform duration-200`
- Image: `shrink-0` to prevent squishing on small screens

**Files:** `components/profiles/profile-accordion.tsx`

## Technical Considerations

- **Import convention:** Use `from "radix-ui"` (unified package) to match existing `tabs.tsx` pattern -- verify the generated accordion.tsx uses this import
- **Client component:** The accordion uses state, so `'use client'` is needed (shadcn handles this in accordion.tsx; the Bangladesh page is already a client component)
- **Animation:** `tw-animate-css` is already installed, which should include `accordion-down`/`accordion-up` keyframes. Verify they work, otherwise add them to `globals.css`

## References

- [shadcn/ui Accordion docs](https://ui.shadcn.com/docs/components/radix/accordion)
- [Radix UI Accordion primitive](https://www.radix-ui.com/primitives/docs/components/accordion)
- Existing pattern: `components/ui/tabs.tsx` (shadcn v4 style with `data-slot`)
- Existing pattern: `components/insight/stat-card.tsx` (component structure)
- Target file: `app/bangladesh/page.tsx:189-191` (Profiles tab placeholder)
