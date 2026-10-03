
-- 1. Create private secrets table (no policies => no anon/authenticated access)
CREATE TABLE public.room_secrets (
  room_id uuid PRIMARY KEY REFERENCES public.rooms(id) ON DELETE CASCADE,
  player1_word text,
  player2_word text,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.room_secrets TO service_role;
ALTER TABLE public.room_secrets ENABLE ROW LEVEL SECURITY;

-- 2. Add boolean flags to rooms and backfill
ALTER TABLE public.rooms
  ADD COLUMN player1_word_set boolean NOT NULL DEFAULT false,
  ADD COLUMN player2_word_set boolean NOT NULL DEFAULT false;

UPDATE public.rooms
  SET player1_word_set = (player1_word IS NOT NULL),
      player2_word_set = (player2_word IS NOT NULL);

-- 3. Move existing secret words into private table
INSERT INTO public.room_secrets (room_id, player1_word, player2_word)
SELECT id, player1_word, player2_word FROM public.rooms;

-- 4. Drop leaky columns
ALTER TABLE public.rooms
  DROP COLUMN player1_word,
  DROP COLUMN player2_word;

-- 5. Lock down rooms: read-only for anon/authenticated, writes only via service_role
DROP POLICY IF EXISTS rooms_all_anon ON public.rooms;
REVOKE ALL ON public.rooms FROM anon, authenticated;
GRANT SELECT ON public.rooms TO anon, authenticated;
GRANT ALL ON public.rooms TO service_role;
CREATE POLICY rooms_public_read ON public.rooms
  FOR SELECT TO anon, authenticated USING (true);

-- 6. Lock down guesses: read-only for anon/authenticated, writes only via service_role
DROP POLICY IF EXISTS guesses_all_anon ON public.guesses;
REVOKE ALL ON public.guesses FROM anon, authenticated;
GRANT SELECT ON public.guesses TO anon, authenticated;
GRANT ALL ON public.guesses TO service_role;
CREATE POLICY guesses_public_read ON public.guesses
  FOR SELECT TO anon, authenticated USING (true);
