CREATE POLICY "Allow public read access"
  ON dances
  FOR SELECT
  TO anon
  USING (true);
