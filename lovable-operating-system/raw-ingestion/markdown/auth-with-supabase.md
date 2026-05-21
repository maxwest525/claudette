# Auth with Supabase

Use when you need to add user authentication to a Lovable project using Supabase.

## Overview

Supabase Auth provides email/password, magic link, and OAuth login out of the box. This skill covers wiring it up in a Lovable project with proper session handling and protected routes.

## Steps

1. Install the Supabase client
2. Initialize the client with your project URL and anon key
3. Set up sign-up and login forms
4. Handle session state globally
5. Protect routes by checking session

## Code Examples

### Initialize Supabase

```typescript
import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);
```

### Sign Up

```typescript
const { data, error } = await supabase.auth.signUp({
  email,
  password,
});
```

### Sign In

```typescript
const { data, error } = await supabase.auth.signInWithPassword({
  email,
  password,
});
```

### Sign Out

```typescript
await supabase.auth.signOut();
```

### Listen for Session Changes

```typescript
supabase.auth.onAuthStateChange((event, session) => {
  if (session) {
    // user is logged in
  } else {
    // user is logged out
  }
});
```

## Notes

- Store `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in `.env`
- Never expose your service role key on the client
- Use Row Level Security (RLS) in Supabase to protect data per user
