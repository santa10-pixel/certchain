-- CertiX Supabase Schema
-- Run this in your Supabase SQL Editor to create the necessary table

CREATE TABLE IF NOT EXISTS certix_state (
    id TEXT PRIMARY KEY,
    state JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS) but allow anonymous access for this prototype
ALTER TABLE certix_state ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read" ON certix_state;
CREATE POLICY "Allow public read" ON certix_state FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public insert" ON certix_state;
CREATE POLICY "Allow public insert" ON certix_state FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public update" ON certix_state;
CREATE POLICY "Allow public update" ON certix_state FOR UPDATE USING (true);
