import { createBrowserClient } from '@supabase/ssr'
import { Database } from '@/types/supabase'

type ClientOptions = {
  storage?: Storage
}

export function createClient(options?: ClientOptions) {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    options?.storage
      ? {
          auth: {
            storage: options.storage
          }
        }
      : undefined
  )
}
