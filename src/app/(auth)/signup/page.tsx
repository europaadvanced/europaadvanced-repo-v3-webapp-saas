import { signUpWithPassword } from '../auth-actions';

export default function SignupPage() {
  return (
    <form action={signUpWithPassword} className="space-y-4 max-w-sm">
      <h1 className="text-xl font-semibold">Create account</h1>
      <input name="email" type="email" required placeholder="Email" className="input"/>
      <input name="password" type="password" required placeholder="Password" className="input"/>
      <input name="phone" type="tel" placeholder="Phone (optional)" className="input"/>
      <button className="btn">Create account</button>
    </form>
  );
}
