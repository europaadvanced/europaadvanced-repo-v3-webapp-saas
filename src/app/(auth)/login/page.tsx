import { signInWithPassword } from '../auth-actions';

export default function LoginPage() {
  return (
    <form action={signInWithPassword} className="space-y-4 max-w-sm">
      <h1 className="text-xl font-semibold">Log in</h1>
      <input name="email" type="email" required placeholder="Email" className="input"/>
      <input name="password" type="password" required placeholder="Password" className="input"/>
      <button className="btn">Log in</button>
    </form>
  );
}
