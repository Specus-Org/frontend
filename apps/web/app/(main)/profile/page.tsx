import { redirect } from 'next/navigation';
import Image from 'next/image';
import { auth } from '@specus/auth';
import { isAuthenticatedSession } from '@specus/auth/session';
import { Button } from '@specus/ui/components/button';
import { Card, CardContent, CardHeader, CardTitle } from '@specus/ui/components/card';
import { LogOut, Mail, User } from 'lucide-react';

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0]![0]! + parts[1]![0]!).toUpperCase();
  }
  return name[0]?.toUpperCase() ?? '?';
}

export default async function ProfilePage() {
  const session = await auth();

  if (!isAuthenticatedSession(session)) {
    redirect('/auth/signin?callbackUrl=/profile');
  }

  const { name, email, image } = session.user;

  return (
    <div className="flex min-h-[calc(100vh-200px)] flex-col items-center justify-center px-4 py-16">
      <Card className="w-full max-w-md">
        <CardHeader className="items-center text-center">
          {image ? (
            <Image
              src={image}
              alt={name ?? 'Profile'}
              width={80}
              height={80}
              className="mb-2 rounded-full"
            />
          ) : (
            <div className="mb-2 flex size-20 items-center justify-center rounded-full bg-primary/10 text-2xl font-semibold text-primary">
              {name ? getInitials(name) : <User className="size-10" />}
            </div>
          )}
          <CardTitle className="text-2xl">{name ?? 'User'}</CardTitle>
          {email && (
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Mail className="size-3.5" />
              {email}
            </div>
          )}
        </CardHeader>
        <CardContent>
          <form method="POST" action="/api/auth/federated-signout">
            <Button type="submit" variant="outline" className="w-full gap-2">
              <LogOut className="size-4" />
              Sign out
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
