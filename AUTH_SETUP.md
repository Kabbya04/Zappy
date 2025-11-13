# Zappy Authentication Setup with Supabase

This guide will help you set up the authentication system for Zappy using Supabase.

## Prerequisites

1. A Supabase account (sign up at [supabase.com](https://supabase.com))
2. Your Supabase project URL and anon key

## Setup Instructions

### 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for the project to be provisioned
3. Go to Settings → API to find your project URL and anon key

### 2. Configure Environment Variables

1. Copy the example environment file:
   ```bash
   cp .env.local.example .env.local
   ```

2. Add your Supabase credentials to `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_project_url_here
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
   ```

### 3. Set up Email Authentication (Optional but Recommended)

1. In your Supabase dashboard, go to Authentication → Email Templates
2. Customize the email templates if desired
3. Go to Authentication → Providers and make sure Email is enabled

### 4. Configure Email Settings (For Production)

For password reset emails to work in production:

1. Go to Authentication → Settings in your Supabase dashboard
2. Configure your SMTP settings or use Supabase's built-in email service
3. Add your site's URL to the Site URL field

## Authentication Features Implemented

✅ **Sign In** - Users can sign in with email and password
✅ **Sign Up** - New users can create accounts with email verification
✅ **Forgot Password** - Users can reset their password via email
✅ **Reset Password** - Users can set a new password after receiving reset email
✅ **Guest Mode** - Users can continue without signing in
✅ **Remember Me** - Session persistence option
✅ **Protected Routes** - Middleware protects authenticated routes
✅ **Error Handling** - User-friendly error messages
✅ **Loading States** - Visual feedback during authentication

## Usage

### For Users

1. **Sign Up**: Click "Sign in / Sign up" on the landing page, then "Sign up"
2. **Sign In**: Use email and password to access personalized features
3. **Forgot Password**: Click "Forgot password?" on the sign-in page
4. **Guest Mode**: Click "Continue as guest" when prompted

### For Developers

The authentication system uses:
- **Supabase Auth** for backend authentication
- **Next.js Middleware** for route protection
- **React Context** for state management
- **Custom Hooks** for authentication operations

### Authentication Hook

Use the `useAuth` hook in your components:

```typescript
import { useAuth } from '@/lib/hooks/use-auth'

function MyComponent() {
  const { signIn, signUp, signOut, resetPassword } = useAuth()
  
  // Use authentication functions
}
```

### Authentication Context

Access user state with `useAuthContext`:

```typescript
import { useAuthContext } from '@/lib/contexts/auth-context'

function MyComponent() {
  const { user, isAuthenticated, loading } = useAuthContext()
  
  // Use authentication state
}
```

## Security Features

- Passwords are hashed and never stored in plain text
- Email verification for new accounts
- Secure session management
- CSRF protection
- Rate limiting on authentication endpoints

## Next Steps

To add "Sign in with Google":
1. Go to Authentication → Providers in Supabase dashboard
2. Enable Google provider
3. Add your Google OAuth credentials
4. Update the UI to include Google sign-in button

## Troubleshooting

### Common Issues

1. **"Invalid login credentials"** - Check email and password are correct
2. **"User already registered"** - User exists, try signing in instead
3. **Password reset email not received** - Check spam folder and email configuration
4. **"Failed to sign in"** - Check Supabase configuration in environment variables

### Getting Help

- Check Supabase documentation: https://supabase.com/docs
- Review browser console for detailed error messages
- Ensure all environment variables are correctly set