'use client'

import { useActionState } from 'react'
import { Btn } from '@/components/site/btn'
import { signIn, type LoginState } from './actions'

export function LoginForm({ next }: { next: string }) {
  const [state, action, pending] = useActionState<LoginState, FormData>(signIn, {})
  return (
    <form action={action} className="login-form">
      <input type="hidden" name="next" value={next} />
      <div className="field">
        <label htmlFor="email">Email</label>
        <input id="email" name="email" type="email" autoComplete="username" required />
      </div>
      <div className="field">
        <label htmlFor="password">Password</label>
        <input id="password" name="password" type="password" autoComplete="current-password" required />
      </div>
      {state.error && <p className="form-error" role="alert">{state.error}</p>}
      <Btn type="submit" disabled={pending}>{pending ? 'Signing in' : 'Sign in'}</Btn>
    </form>
  )
}
