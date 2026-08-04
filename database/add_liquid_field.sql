-- Add liquid field to foods table
-- This script adds support for liquid foods (ml vs g)

ALTER TABLE public.foods 
ADD COLUMN is_liquid BOOLEAN DEFAULT false;

-- Add comment to explain the field
COMMENT ON COLUMN public.foods.is_liquid IS 'Indicates if the food is a liquid (true) or solid (false). Affects serving size units (ml vs g)';

-- Update existing foods to be solid by default
UPDATE public.foods SET is_liquid = false WHERE is_liquid IS NULL;
