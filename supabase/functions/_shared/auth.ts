import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

export interface AuthResult {
  user: { id: string; email?: string } | null;
  error: string | null;
}

/**
 * Validates the authorization header and returns the authenticated user.
 * Returns an error response if authentication fails.
 */
export async function validateAuth(req: Request): Promise<AuthResult> {
  const authHeader = req.headers.get('authorization');
  
  if (!authHeader) {
    return { user: null, error: 'Authentication required' };
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY');
  
  if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase configuration');
    return { user: null, error: 'Server configuration error' };
  }

  const supabase = createClient(supabaseUrl, supabaseKey, {
    global: { headers: { Authorization: authHeader } }
  });

  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    return { user: null, error: 'Invalid authentication' };
  }

  return { user: { id: user.id, email: user.email }, error: null };
}

/**
 * Creates an unauthorized response with CORS headers.
 */
export function unauthorizedResponse(message: string, corsHeaders: Record<string, string>): Response {
  return new Response(
    JSON.stringify({ error: message }),
    { 
      status: 401, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    }
  );
}
