
-- Remove overly-permissive public SELECT policies on rooms/guesses.
-- All reads now go through server functions that validate the requesting player.
DROP POLICY IF EXISTS rooms_public_read ON public.rooms;
DROP POLICY IF EXISTS guesses_public_read ON public.guesses;

-- Revoke public execute on the SECURITY DEFINER trigger helper.
-- Trigger execution is unaffected (triggers run as the table owner).
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM authenticated;
