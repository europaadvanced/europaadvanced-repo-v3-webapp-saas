'use client';

import { FormEvent, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/use-toast';
import type { ActionResponse } from '@/types/action-response';

const titleMap = {
  login: 'Login to UPDATE_THIS_WITH_YOUR_APP_DISPLAY_NAME',
  signup: 'Join UPDATE_THIS_WITH_YOUR_APP_DISPLAY_NAME and start generating banners for free',
} as const;

type AuthUIProps = {
  mode: 'login' | 'signup';
  signInWithPassword: (formData: FormData) => Promise<ActionResponse>;
  signUpWithPassword: (formData: FormData) => Promise<ActionResponse>;
};

export function AuthUI({ mode, signInWithPassword, signUpWithPassword }: AuthUIProps) {
  const [pending, setPending] = useState(false);
  const isSignup = mode === 'signup';

  async function handleCredentialsSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);

    const form = event.currentTarget;
    const formData = new FormData(form);
    const email = String(formData.get('email') ?? '').trim();
    const password = String(formData.get('password') ?? '');

    try {
      if (isSignup) {
        const confirmPassword = String(formData.get('confirmPassword') ?? '');
        const phone = String(formData.get('phone') ?? '').trim();
        const acceptedTerms = formData.get('acceptTerms') === 'on';

        if (!email || !password || !phone) {
          toast({
            variant: 'destructive',
            description: 'Please provide your email, password, and phone number.',
          });
          setPending(false);
          return;
        }

        if (password !== confirmPassword) {
          toast({
            variant: 'destructive',
            description: 'Passwords do not match.',
          });
          setPending(false);
          return;
        }

        if (!acceptedTerms) {
          toast({
            variant: 'destructive',
            description: 'You must accept the Terms of Service and Privacy Policy.',
          });
          setPending(false);
          return;
        }

        const response = await signUpWithPassword(formData);

        if (response?.error) {
          toast({
            variant: 'destructive',
            description: response.error.message ?? 'Unable to create your account.',
          });
        } else {
          toast({
            description: `Account created! Please confirm the email sent to ${email} before logging in.`,
          });
          form.reset();
        }
      } else {
        if (!email || !password) {
          toast({
            variant: 'destructive',
            description: 'Please provide both email and password.',
          });
          setPending(false);
          return;
        }

        const response = await signInWithPassword(formData);

        if (response?.error) {
          toast({
            variant: 'destructive',
            description: response.error.message ?? 'Invalid login credentials.',
          });
        }
      }
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        description: 'An unexpected error occurred. Please try again.',
      });
    } finally {
      setPending(false);
    }
  }

  return (
    <section className='mt-16 flex w-full flex-col gap-16 rounded-lg bg-black p-10 px-4 text-center'>
      <div className='flex flex-col gap-4'>
        <Image src='/logo.png' width={80} height={80} alt='' className='m-auto' />
        <h1 className='text-lg'>{titleMap[mode]}</h1>
      </div>
      <div className='flex flex-col gap-4'>
        <form className='flex flex-col gap-4 rounded-md bg-zinc-900 p-8' onSubmit={handleCredentialsSubmit}>
          <Input
            type='email'
            name='email'
            placeholder='Enter your email'
            aria-label='Enter your email'
            autoComplete='email'
            autoFocus
            required
            disabled={pending}
          />
          {isSignup ? (
            <Input
              type='tel'
              name='phone'
              placeholder='Enter your phone number'
              aria-label='Enter your phone number'
              autoComplete='tel'
              required
              disabled={pending}
            />
          ) : null}
          <Input
            type='password'
            name='password'
            placeholder={isSignup ? 'Create a password' : 'Enter your password'}
            aria-label={isSignup ? 'Create a password' : 'Enter your password'}
            autoComplete={isSignup ? 'new-password' : 'current-password'}
            minLength={8}
            required
            disabled={pending}
          />
          {isSignup ? (
            <Input
              type='password'
              name='confirmPassword'
              placeholder='Confirm your password'
              aria-label='Confirm your password'
              autoComplete='new-password'
              minLength={8}
              required
              disabled={pending}
            />
          ) : null}
          {isSignup ? (
            <label className='flex items-start gap-2 text-left text-sm text-neutral-500'>
              <input
                type='checkbox'
                name='acceptTerms'
                className='mt-1 h-4 w-4 shrink-0 rounded border border-zinc-700 bg-black accent-cyan-500'
                required
                disabled={pending}
              />
              <span>
                I agree to the{' '}
                <Link href='/terms' className='underline'>
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link href='/privacy' className='underline'>
                  Privacy Policy
                </Link>
                .
              </span>
            </label>
          ) : null}
          <div className='flex justify-end'>
            <Button variant='secondary' type='submit' disabled={pending}>
              {isSignup ? 'Create account' : 'Log in'}
            </Button>
          </div>
        </form>
      </div>
      {mode === 'login' ? (
        <span className='m-auto max-w-sm text-sm text-neutral-500'>
          By continuing you agree to our{' '}
          <Link href='/terms' className='underline'>
            Terms of Service
          </Link>{' '}
          and{' '}
          <Link href='/privacy' className='underline'>
            Privacy Policy
          </Link>
          .
        </span>
      ) : null}
    </section>
  );
}
