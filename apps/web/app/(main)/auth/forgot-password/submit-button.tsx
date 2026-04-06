'use client';

import { useFormStatus } from 'react-dom';
import { Button } from '@specus/ui/components/button';
import { Loader2 } from 'lucide-react';

export function ResetButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" className="w-full" size="lg" disabled={pending}>
      {pending ? (
        <>
          <Loader2 className="size-4 animate-spin" />
          Sending…
        </>
      ) : (
        'Send reset link'
      )}
    </Button>
  );
}
