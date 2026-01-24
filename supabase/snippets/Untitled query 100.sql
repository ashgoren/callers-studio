CREATE POLICY "Allow full public access on dances"
  ON dances
  FOR ALL
  TO authenticated, anon
  USING (true);

CREATE POLICY "Allow full public access on programs"
  ON programs
  FOR ALL
  TO authenticated, anon
  USING (true);

CREATE POLICY "Allow full public access on dancesPrograms"
  ON "dancesPrograms"
  FOR ALL
  TO authenticated, anon
  USING (true);
  