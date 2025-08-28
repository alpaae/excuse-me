import { createServerClient } from '@supabase/ssr';
import { cookies, type UnsafeUnwrappedCookies } from 'next/headers';

export async function createClient() {
  const cookieStore = (await cookies() as unknown as UnsafeUnwrappedCookies);

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  );
}

export function createServiceClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE!,
    {
      cookies: {
        getAll() {
          return [];
        },
        setAll() {
          // This is a service client, so we don't need to set cookies
        },
      },
    }
  );
}
