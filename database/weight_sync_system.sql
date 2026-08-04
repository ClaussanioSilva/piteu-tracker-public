-- 1. Add body_fat_percentage to profiles if it doesn't exist
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS body_fat_percentage NUMERIC;

-- 2. Add is_initial column to weight_logs if it doesn't exist
ALTER TABLE weight_logs 
ADD COLUMN IF NOT EXISTS is_initial BOOLEAN DEFAULT FALSE;

-- 3. Create function to sync weight changes to weight_logs
-- REVISED: Uses check-then-insert/update logic to avoid 42P10 error if unique constraint is missing
CREATE OR REPLACE FUNCTION public.sync_weight_to_logs()
RETURNS TRIGGER AS $$
DECLARE
    v_is_initial BOOLEAN := FALSE;
    v_log_date DATE := CURRENT_DATE;
    v_existing_id UUID;
BEGIN
    -- Check if weight or body fat has changed, or if it's a new profile
    -- For INSERT: always log and mark as initial
    IF (TG_OP = 'INSERT') THEN
        v_is_initial := TRUE;
    END IF;

    IF (TG_OP = 'INSERT') OR 
       (TG_OP = 'UPDATE' AND (NEW.weight_kg IS DISTINCT FROM OLD.weight_kg OR NEW.body_fat_percentage IS DISTINCT FROM OLD.body_fat_percentage)) THEN
        
        -- Check if log exists for today
        SELECT id INTO v_existing_id 
        FROM public.weight_logs 
        WHERE user_id = NEW.id AND log_date = v_log_date
        LIMIT 1;

        IF v_existing_id IS NOT NULL THEN
            -- Update existing log
            UPDATE public.weight_logs 
            SET 
                weight_kg = NEW.weight_kg,
                body_fat_percentage = NEW.body_fat_percentage,
                -- Preserve is_initial if it was already true
                is_initial = weight_logs.is_initial OR v_is_initial
            WHERE id = v_existing_id;
        ELSE
            -- Insert new log
            INSERT INTO public.weight_logs (user_id, weight_kg, body_fat_percentage, log_date, is_initial)
            VALUES (NEW.id, NEW.weight_kg, NEW.body_fat_percentage, v_log_date, v_is_initial);
        END IF;
            
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Create Trigger
DROP TRIGGER IF EXISTS on_profile_weight_update ON public.profiles;

CREATE TRIGGER on_profile_weight_update
AFTER INSERT OR UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.sync_weight_to_logs();

-- 5. Ensure weight_logs has the unique constraint for good measure
-- We attempt to add it, ignoring if it fails (if it already exists or has duplicates)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'weight_logs_user_date_unique'
    ) THEN
        BEGIN
            ALTER TABLE weight_logs ADD CONSTRAINT weight_logs_user_date_unique UNIQUE (user_id, log_date);
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'Could not add unique constraint, likely due to duplicates. The sync function will still work.';
        END;
    END IF;
END $$;

-- 6. Create View for Reports
CREATE OR REPLACE VIEW public.weight_history_view AS
SELECT 
    id,
    user_id,
    weight_kg,
    body_fat_percentage,
    log_date,
    created_at,
    is_initial
FROM weight_logs;

-- Grant permissions to the view
GRANT SELECT ON public.weight_history_view TO authenticated;
GRANT SELECT ON public.weight_history_view TO service_role;
