-- Restrict profile visibility to authenticated users only
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;

CREATE POLICY "Profiles are viewable by authenticated users"
ON public.profiles
FOR SELECT
TO authenticated
USING (true);

-- Revoke anon SELECT on profiles (Data API grant)
REVOKE SELECT ON public.profiles FROM anon;

-- Ensure RLS remains enabled (fail-closed) on tables accessed only via server functions
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rooms FORCE ROW LEVEL SECURITY;

ALTER TABLE public.guesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guesses FORCE ROW LEVEL SECURITY;

ALTER TABLE public.room_secrets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.room_secrets FORCE ROW LEVEL SECURITY;

-- Revoke any lingering client-role privileges on server-only tables
REVOKE ALL ON public.rooms FROM anon, authenticated;
REVOKE ALL ON public.guesses FROM anon, authenticated;
REVOKE ALL ON public.room_secrets FROM anon, authenticated;

-- Ensure server role retains full access (used by server functions)
GRANT ALL ON public.rooms TO service_role;
GRANT ALL ON public.guesses TO service_role;
GRANT ALL ON public.room_secrets TO service_role;