-- Drop and recreate game_sessions table with correct structure
DROP TABLE IF EXISTS game_sessions;

CREATE TABLE game_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES users(id),
  target_country TEXT NOT NULL,
  target_lat NUMERIC NOT NULL,
  target_lng NUMERIC NOT NULL,
  guess_lat NUMERIC,
  guess_lng NUMERIC,
  distance_km INTEGER,
  points_earned INTEGER DEFAULT 0,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on user_id for user game history
CREATE INDEX idx_game_sessions_user_id ON game_sessions(user_id);
