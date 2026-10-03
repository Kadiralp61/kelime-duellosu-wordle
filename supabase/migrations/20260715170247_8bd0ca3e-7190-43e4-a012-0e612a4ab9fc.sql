
DROP POLICY IF EXISTS "Profiles are viewable by authenticated users" ON public.profiles;

CREATE POLICY "Users can view their own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Users can view profiles of room co-players"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.rooms r
    WHERE (r.player1_id = auth.uid()::text AND r.player2_id = profiles.id::text)
       OR (r.player2_id = auth.uid()::text AND r.player1_id = profiles.id::text)
  )
);
