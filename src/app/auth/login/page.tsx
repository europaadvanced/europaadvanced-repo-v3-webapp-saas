<AuthGuardRedirect />
import AuthGuardRedirect from '@/components/auth/AuthGuardRedirect';


import { redirect } from 'next/navigation';

export default function LoginPage() {
  redirect('/login');
}
