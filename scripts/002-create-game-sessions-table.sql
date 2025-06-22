-- Create game sessions table to track individual games
CREATE TABLE IF NOT EXISTS game_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT REFERENCES users(id),
  target_country TEXT NOT NULL,
  target_lat DECIMAL NOT NULL,
  target_lng DECIMAL NOT NULL,
  guess_lat DECIMAL,
  guess_lng DECIMAL,
  distance_km INTEGER,
  points_earned INTEGER DEFAULT 0,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on user_id for user game history
CREATE INDEX IF NOT EXISTS idx_game_sessions_user_id ON game_sessions(user_id);
