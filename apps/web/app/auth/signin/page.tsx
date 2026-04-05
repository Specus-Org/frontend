import { redirect } from 'next/navigation';
import { auth, signIn } from '@specus/auth';
import { Button } from '@specus/ui/components/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@specus/ui/components/card';
import { Input } from '@specus/ui/components/input';
import { Label } from '@specus/ui/components/label';
import { LogIn, AlertCircle } from 'lucide-react';

interface SignInPageProps {
  searchParams: Promise<{ callbackUrl?: string; error?: string }>;
}

const ERROR_MESSAGES: Record<string, string> = {
  CredentialsSignin: 'Invalid email or password. Please try again.',
  OAuthSignin: 'Could not start the sign-in process. Please try again.',
  OAuthCallback: 'Something went wrong during sign-in. Please try again.',
  Default: 'An unexpected error occurred. Please try again.',
};

export default async function SignInPage({ searchParams }: SignInPageProps) {
  const session = await auth();
  if (session) {
    redirect('/profile');
  }

  const { callbackUrl, error } = await searchParams;
  const errorMessage = error ? (ERROR_MESSAGES[error] ?? ERROR_MESSAGES.Default) : null;

  return (
    <div className="flex min-h-[calc(100vh-200px)] flex-col items-center justify-center px-4 py-16">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-2xl bg-primary/10">
            <LogIn className="size-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Welcome to Specus</CardTitle>
          <CardDescription>Sign in to access the platform</CardDescription>
        </CardHeader>
        <CardContent>
          {errorMessage && (
            <div className="mb-4 flex items-start gap-2 rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
              <AlertCircle className="mt-0.5 size-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}
          <form
            action={async (formData: FormData) => {
              'use server';
              await signIn('authentik-credentials', {
                email: formData.get('email') as string,
                password: formData.get('password') as string,
                redirectTo: callbackUrl ?? '/profile',
              });
            }}
            className="flex flex-col gap-4"
          >
            <div className="flex flex-col gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                required
                autoComplete="email"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Enter your password"
                required
                autoComplete="current-password"
              />
            </div>
            <Button type="submit" className="w-full" size="lg">
              Sign in
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
