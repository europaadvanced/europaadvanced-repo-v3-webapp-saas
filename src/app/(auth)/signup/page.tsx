<AuthGuardRedirect />
import AuthGuardRedirect from '@/components/auth/AuthGuardRedirect';
import GoogleButton from '@/components/auth/GoogleButton';

// inside JSX
<GoogleButton />


import { AuthUI } from "../auth-ui";
import { signInWithPassword, signUpWithPassword } from "../auth-actions";

export default function SignupPage() {
  return (
    <AuthUI
      mode="signup"
      signInWithPassword={signInWithPassword}
      signUpWithPassword={signUpWithPassword}
    />
  );
}
