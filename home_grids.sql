-- Create the table for homepage grid assignments
CREATE TABLE IF NOT EXISTS public.home_grids (
  product_id uuid NOT NULL REFERENCES public.inventory(id) ON DELETE CASCADE,
  grid TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (product_id, grid)
);

-- Drop the constraint if it exists, then add the new one to ensure consistency
ALTER TABLE public.home_grids
DROP CONSTRAINT IF EXISTS home_grids_grid_check;

ALTER TABLE public.home_grids
ADD CONSTRAINT home_grids_grid_check CHECK (grid IN ('bestsellers', 'new', 'budget', 'premium'));

-- Enable RLS for the new table
ALTER TABLE public.home_grids ENABLE ROW LEVEL SECURITY;

-- Policies for home_grids
DROP POLICY IF EXISTS "Public read home_grids" ON public.home_grids;
CREATE POLICY "Public read home_grids" ON public.home_grids
FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated write home_grids" ON public.home_grids;
CREATE POLICY "Authenticated write home_grids" ON public.home_grids
FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');