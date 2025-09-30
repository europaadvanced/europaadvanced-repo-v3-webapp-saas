import { signUpWithPassword } from '../auth-actions';

export default function SignupPage() {
  return (
    <form action={signUpWithPassword} className="max-w-sm space-y-4">
      <h1 className="text-xl font-semibold">Create account</h1>
      <input
        name="email"
        type="email"
        required
        placeholder="Email"
        autoComplete="email"
        className="input"
      />
      <input
        name="password"
        type="password"
        required
        minLength={8}
        placeholder="Password"
        autoComplete="new-password"
        className="input"
      />
      <input
        name="phone"
        type="tel"
        required
        placeholder="Phone number"
        autoComplete="tel"
        className="input"
      />
      <button className="btn">Create account</button>
    </form>
  );
}
