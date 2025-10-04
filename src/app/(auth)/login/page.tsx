import { AuthUI } from "../auth-ui";
import { signInWithPassword, signUpWithPassword } from "../auth-actions";

export default function LoginPage() {
  return (
    <AuthUI
      mode="login"
      signInWithPassword={signInWithPassword}
      signUpWithPassword={signUpWithPassword}
    />
  );
}
