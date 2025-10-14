<AuthGuardRedirect />
import AuthGuardRedirect from '@/components/auth/AuthGuardRedirect';

import GoogleButton from '@/components/auth/GoogleButton';

// inside JSX
<GoogleButton />


import { redirect } from 'next/navigation';

export default function LoginPage() {
  redirect('/login');
}
