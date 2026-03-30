import { Router, type Request, type Response } from 'express'
import { supabase } from '../db.js'

const router = Router()

/**
 * User Register
 * POST /api/auth/register
 */
router.post('/register', async (req: Request, res: Response): Promise<void> => {
  const { email, password, name, role } = req.body

  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          role: role || 'content_operator',
        },
      },
    })

    if (error) throw error

    // Create user record in public.users table if not exists (Supabase trigger usually handles this, but we can do it manually or rely on trigger)
    // For now, let's assume the public.users table is populated via a trigger or we insert it here.
    // Since we didn't create a trigger in the migration, let's insert it manually.
    if (data.user) {
      const { error: insertError } = await supabase
        .from('users')
        .insert({
          id: data.user.id,
          email: data.user.email!,
          password_hash: 'managed_by_supabase_auth', // Placeholder
          name: name,
          role: role || 'content_operator',
        })
      
      if (insertError) {
         console.error('Error creating user record:', insertError)
         // Don't fail the request if auth succeeded, but log it.
      }
    }

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: { user: data.user },
    })
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message,
    })
  }
})

/**
 * User Login
 * POST /api/auth/login
 */
router.post('/login', async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) throw error

    // Fetch user details from public.users table
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', data.user.id)
      .single()

    if (userError) {
      console.error('Error fetching user details:', userError)
    }

    res.status(200).json({
      success: true,
      token: data.session.access_token,
      user: {
        ...data.user,
        ...userData,
      },
    })
  } catch (error: any) {
    res.status(401).json({
      success: false,
      error: error.message,
    })
  }
})

/**
 * User Logout
 * POST /api/auth/logout
 */
router.post('/logout', async (req: Request, res: Response): Promise<void> => {
  const token = req.headers.authorization?.split(' ')[1]

  if (token) {
    await supabase.auth.signOut({ scope: 'global' })
  }

  res.status(200).json({
    success: true,
    message: 'Logged out successfully',
  })
})

export default router
