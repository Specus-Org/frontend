'use client';

import { useFormStatus } from 'react-dom';
import { Button } from '@specus/ui/components/button';
import { Loader2 } from 'lucide-react';

interface AuthSubmitButtonProps {
  idleLabel: string;
  pendingLabel: string;
  className?: string;
}

export function AuthSubmitButton({ idleLabel, pendingLabel, className }: AuthSubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" className={className ?? 'w-full'} size="lg" disabled={pending}>
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
