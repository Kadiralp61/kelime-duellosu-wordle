
CREATE TABLE public.rooms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  status text NOT NULL DEFAULT 'waiting',
  player1_id text,
  player2_id text,
  player1_name text,
  player2_name text,
  player1_word text,
  player2_word text,
  turn int NOT NULL DEFAULT 1,
  winner text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.rooms TO anon, authenticated;
GRANT ALL ON public.rooms TO service_role;

ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "rooms_all_anon" ON public.rooms FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

CREATE TABLE public.guesses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id uuid NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
  player_num int NOT NULL,
  guess text NOT NULL,
  result text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.guesses TO anon, authenticated;
GRANT ALL ON public.guesses TO service_role;

ALTER TABLE public.guesses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "guesses_all_anon" ON public.guesses FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

ALTER PUBLICATION supabase_realtime ADD TABLE public.rooms;
ALTER PUBLICATION supabase_realtime ADD TABLE public.guesses;

ALTER TABLE public.rooms REPLICA IDENTITY FULL;
ALTER TABLE public.guesses REPLICA IDENTITY FULL;
