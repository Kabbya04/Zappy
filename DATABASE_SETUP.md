# Zappy Database Setup Guide

## Overview

This guide will help you set up the required database tables for Zappy to function properly, including the missing `recommendations` table.

## Required Tables

### 1. Sessions Table (Should already exist)
```sql
CREATE TABLE sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  category VARCHAR(50) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS (Row Level Security)
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own sessions" ON sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own sessions" ON sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);
```

### 2. Messages Table (Should already exist)
```sql
CREATE TABLE messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS (Row Level Security)
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view messages from their sessions" ON messages
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert messages to their sessions" ON messages
  FOR INSERT WITH CHECK (auth.uid() = user_id);
```

### 3. Recommendations Table (MISSING - This is causing your error)
```sql
CREATE TABLE recommendations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  category VARCHAR(50) NOT NULL,
  explanation TEXT NOT NULL,
  imageUrl TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS (Row Level Security)
ALTER TABLE recommendations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view recommendations" ON recommendations
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage recommendations" ON recommendations
  FOR ALL USING (auth.jwt() ->> 'role' = 'admin');
```

## Sample Data for Recommendations

Add some sample recommendations for each category:

```sql
-- Game Recommendations
INSERT INTO recommendations (title, category, explanation, imageUrl) VALUES
('The Witcher 3: Wild Hunt', 'Game', 'An open-world RPG masterpiece with rich storytelling and immersive gameplay.', 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1wz4.jpg'),
('Red Dead Redemption 2', 'Game', 'A stunning western adventure with incredible attention to detail and narrative depth.', 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1q1f.jpg'),
('Hades', 'Game', 'A rogue-like dungeon crawler with excellent combat mechanics and storytelling.', 'https://images.igdb.com/igdb/image/upload/t_cover_big/co2lbd.jpg');

-- Anime Recommendations
INSERT INTO recommendations (title, category, explanation, imageUrl) VALUES
('Attack on Titan', 'Anime', 'A dark fantasy anime with intense action and complex themes about freedom and survival.', 'https://cdn.myanimelist.net/images/anime/10/47347.jpg'),
('Your Name', 'Anime', 'A beautiful romantic fantasy film with stunning animation and emotional storytelling.', 'https://cdn.myanimelist.net/images/anime/5/87048.jpg'),
('Demon Slayer', 'Anime', 'A visually stunning shonen anime with compelling characters and breathtaking action scenes.', 'https://cdn.myanimelist.net/images/anime/1286/99889.jpg');

-- Movie Recommendations
INSERT INTO recommendations (title, category, explanation, imageUrl) VALUES
('Inception', 'Movie', 'A mind-bending sci-fi thriller that explores dreams within dreams with stunning visuals.', 'https://image.tmdb.org/t/p/w500/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg'),
('The Shawshank Redemption', 'Movie', 'A powerful drama about hope, friendship, and the human spirit in the face of adversity.', 'https://image.tmdb.org/t/p/w500/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg'),
('Interstellar', 'Movie', 'An epic space exploration film that combines emotional storytelling with scientific concepts.', 'https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg');

-- TV Series Recommendations
INSERT INTO recommendations (title, category, explanation, imageUrl) VALUES
('Breaking Bad', 'TV Series', 'A gripping crime drama about a high school chemistry teacher turned methamphetamine manufacturer.', 'https://image.tmdb.org/t/p/w500/ggFHVNu6YYI5L9pCfOacdbizgjH.jpg'),
('Game of Thrones', 'TV Series', 'An epic fantasy series with complex political intrigue and memorable characters.', 'https://image.tmdb.org/t/p/w500/u3bZgnGQ9T01sWNkigYCdQtSCwN.jpg'),
('The Crown', 'TV Series', 'A historical drama that chronicles the reign of Queen Elizabeth II with exceptional production values.', 'https://image.tmdb.org/t/p/w500/3Oo2EpH0d2b2z1z2XqVvqXGpCq.jpg');
```

## How to Apply These Changes

1. **Go to your Supabase Dashboard**
2. **Navigate to SQL Editor**
3. **Run the SQL commands above one section at a time**
4. **Start with the recommendations table creation**
5. **Then add the sample data**

## Verification

After setting up the database, you can verify the setup:

1. Check if tables exist:
```sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('sessions', 'messages', 'recommendations');
```

2. Check if recommendations data exists:
```sql
SELECT * FROM recommendations LIMIT 5;
```

## Troubleshooting

If you still get errors after setup:

1. **Check RLS policies**: Ensure the policies allow your user to access the data
2. **Check column names**: Make sure column names match exactly (case-sensitive)
3. **Check data types**: Ensure data types are compatible
4. **Check Supabase URL and keys**: Verify your environment variables

## Alternative: Disable Recommendations Temporarily

If you want to test without recommendations, you can modify the component to skip recommendations entirely:

```typescript
// In app/chat/[id]/chat-component.tsx, comment out the fetchRecommendations useEffect
// Or add a flag to disable recommendations
const ENABLE_RECOMMENDATIONS = false;
```