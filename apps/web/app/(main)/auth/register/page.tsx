import { redirect } from 'next/navigation';
import { auth } from '@specus/auth';
import { AuthBreadcrumb } from '../breadcrumb';
import { RegisterForm } from './register-form';

export const metadata = { title: 'Create account' };

export default async function RegisterPage() {
  const session = await auth();
  if (session) {
    redirect('/profile');
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <AuthBreadcrumb items={[{ label: 'Create account' }]} />
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Create account</h1>
        <p className="text-sm text-muted-foreground">Enter your details to get started.</p>
      </div>

      <RegisterForm />
    </div>
  );
}
