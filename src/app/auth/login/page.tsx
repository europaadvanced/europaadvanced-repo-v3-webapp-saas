'use client';
import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function Login() {
  const [email,setEmail]=useState(''); const [password,setPassword]=useState('');
  const [err,setErr]=useState<string|undefined>();

  async function onLogin(e:React.FormEvent){ e.preventDefault(); setErr(undefined);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return setErr(error.message);
    window.location.href = '/app'; // post-login landing
  }

  return (
    <form onSubmit={onLogin} className="max-w-sm mx-auto p-6 space-y-3">
      <input className="w-full border p-2" type="email" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} required />
      <input className="w-full border p-2" type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} required />
      {err && <p className="text-red-500 text-sm">{err}</p>}
      <button className="w-full border p-2" type="submit">Sign in</button>
      <a href="/auth/register" className="text-sm underline block text-center">Create account</a>
    </form>
  );
}
