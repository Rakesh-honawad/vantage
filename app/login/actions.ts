'use server'

import { redirect } from 'next/navigation'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'

export type LoginState = { error?: string }

const schema = z.object({ email: z.string().trim().email().max(200), password: z.string().min(1).max(200) })

export async function signIn(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const parsed = schema.safeParse({ email: formData.get('email'), password: formData.get('password') })
  if (!parsed.success) return { error: 'Enter your email and password.' }
  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword(parsed.data)
  if (error) return { error: 'Email or password is incorrect.' } // same message for every failure
  const next = String(formData.get('next') ?? '')
  redirect(next.startsWith('/admin') ? next : '/admin') // only ever redirect inside the admin area
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}
