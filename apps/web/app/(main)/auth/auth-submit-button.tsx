'use client';

import { useFormStatus } from 'react-dom';
import { Button } from '@specus/ui/components/button';
import { Loader2 } from 'lucide-react';
import { analyticsEvent } from '@/lib/analytics';

interface AuthSubmitButtonProps {
  idleLabel: string;
  pendingLabel: string;
  className?: string;
  analyticsEventName?: string;
  analyticsEventData?: Record<string, string | number | boolean | null | undefined>;
}

export function AuthSubmitButton({
  idleLabel,
  pendingLabel,
  className,
  analyticsEventName,
  analyticsEventData,
}: AuthSubmitButtonProps) {
  const { pending } = useFormStatus();
  const eventAttributes = analyticsEventName
    ? analyticsEvent(analyticsEventName, analyticsEventData)
    : {};

  return (
    <Button
      type="submit"
      className={className ?? 'w-full'}
      size="lg"
      disabled={pending}
      {...eventAttributes}
    >
      {pending ? (
        <>
          <Loader2 className="size-4 animate-spin" />
          {pendingLabel}
        </>
      ) : (
        idleLabel
      )}
    </Button>
  );
}
