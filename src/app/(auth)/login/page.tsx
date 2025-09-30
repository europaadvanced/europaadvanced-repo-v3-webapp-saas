import { signInWithPassword } from '../auth-actions';

export default function LoginPage() {
  return (
    <form action={signInWithPassword} className='max-w-sm space-y-4'>
      <h1 className='text-xl font-semibold'>Log in</h1>
      <input
        name='email'
        type='email'
        required
        placeholder='Email'
        autoComplete='email'
        className='input'
      />
      <input
        name='password'
        type='password'
        required
        minLength={8}
        placeholder='Password'
        autoComplete='current-password'
        className='input'
      />
      <button className='btn'>Log in</button>
    </form>
  );
}
