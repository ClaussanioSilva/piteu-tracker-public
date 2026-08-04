-- =====================================================
-- NUTRITRACK DATABASE SCHEMA WITH API INTEGRATION
-- =====================================================

-- Enable Row Level Security
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret-here';

-- =====================================================
-- USERS TABLE (extends Supabase auth.users)
-- =====================================================
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  height_cm DECIMAL(5,2),
  weight_kg DECIMAL(5,2),
  age INTEGER,
  dob DATE,
  gender TEXT CHECK (gender IN ('male', 'female', 'other')),
  activity_level TEXT CHECK (activity_level IN ('sedentary', 'light', 'moderate', 'active', 'very_active')),
  goal TEXT CHECK (goal IN ('lose_weight', 'maintain', 'gain_weight', 'gain_muscle')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- NUTRITIONAL GOALS TABLE
-- =====================================================
CREATE TABLE public.nutritional_goals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  daily_calories INTEGER NOT NULL DEFAULT 2000,
  daily_protein_g DECIMAL(6,2) NOT NULL DEFAULT 120.0,
  daily_carbs_g DECIMAL(6,2) NOT NULL DEFAULT 250.0,
  daily_fat_g DECIMAL(6,2) NOT NULL DEFAULT 80.0,
  daily_fiber_g DECIMAL(6,2) DEFAULT 25.0,
  daily_sodium_mg INTEGER DEFAULT 2300,
  daily_sugar_g DECIMAL(6,2) DEFAULT 50.0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, is_active)
);

-- =====================================================
-- FOOD BRANDS TABLE (marcas populares)
-- =====================================================
CREATE TABLE public.food_brands (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL CHECK (category IN ('restaurant', 'supplement', 'grocery', 'fast_food')),
  country TEXT DEFAULT 'PT',
  logo_url TEXT,
  website TEXT,
  is_verified BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- FOODS TABLE (base nutritional information with API integration)
-- =====================================================
CREATE TABLE public.foods (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  brand_id UUID REFERENCES public.food_brands(id),
  
  -- Basic food information
  name TEXT NOT NULL,
  display_name TEXT, -- User-friendly name
  description TEXT,
  
  -- API integration fields
  api_id TEXT, -- External API identifier
  api_source TEXT DEFAULT 'nutritionix', -- 'nutritionix', 'manual', 'user_created'
  api_last_updated TIMESTAMP WITH TIME ZONE,
  
  -- Nutritional information (per 100g)
  serving_size_g DECIMAL(8,2) NOT NULL DEFAULT 100.0,
  calories_per_100g DECIMAL(8,2) NOT NULL,
  protein_per_100g DECIMAL(8,2) NOT NULL DEFAULT 0.0,
  carbs_per_100g DECIMAL(8,2) NOT NULL DEFAULT 0.0,
  fat_per_100g DECIMAL(8,2) NOT NULL DEFAULT 0.0,
  fiber_per_100g DECIMAL(8,2) DEFAULT 0.0,
  sugar_per_100g DECIMAL(8,2) DEFAULT 0.0,
  sodium_per_100g DECIMAL(8,2) DEFAULT 0.0,
  saturated_fat_per_100g DECIMAL(8,2) DEFAULT 0.0,
  trans_fat_per_100g DECIMAL(8,2) DEFAULT 0.0,
  cholesterol_per_100g DECIMAL(8,2) DEFAULT 0.0,
  potassium_per_100g DECIMAL(8,2) DEFAULT 0.0,
  vitamin_a_per_100g DECIMAL(8,2) DEFAULT 0.0,
  vitamin_c_per_100g DECIMAL(8,2) DEFAULT 0.0,
  vitamin_d_per_100g DECIMAL(8,2) DEFAULT 0.0,
  vitamin_e_per_100g DECIMAL(8,2) DEFAULT 0.0,
  vitamin_k_per_100g DECIMAL(8,2) DEFAULT 0.0,
  vitamin_b1_per_100g DECIMAL(8,2) DEFAULT 0.0,
  vitamin_b2_per_100g DECIMAL(8,2) DEFAULT 0.0,
  vitamin_b3_per_100g DECIMAL(8,2) DEFAULT 0.0,
  vitamin_b6_per_100g DECIMAL(8,2) DEFAULT 0.0,
  vitamin_b12_per_100g DECIMAL(8,2) DEFAULT 0.0,
  folate_per_100g DECIMAL(8,2) DEFAULT 0.0,
  calcium_per_100g DECIMAL(8,2) DEFAULT 0.0,
  iron_per_100g DECIMAL(8,2) DEFAULT 0.0,
  magnesium_per_100g DECIMAL(8,2) DEFAULT 0.0,
  phosphorus_per_100g DECIMAL(8,2) DEFAULT 0.0,
  zinc_per_100g DECIMAL(8,2) DEFAULT 0.0,
  
  -- Food categorization
  category TEXT CHECK (category IN ('breakfast', 'lunch', 'dinner', 'snack', 'dessert', 'beverage', 'supplement')),
  subcategory TEXT,
  tags TEXT[], -- Array of tags for better search
  
  -- User preferences
  is_favorite BOOLEAN DEFAULT false,
  is_verified BOOLEAN DEFAULT false,
  source TEXT DEFAULT 'api', -- 'api', 'manual', 'user_created'
  
  -- Metadata
  barcode TEXT,
  allergens TEXT[],
  ingredients TEXT,
  preparation_method TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- MEALS TABLE (composed meals)
-- =====================================================
CREATE TABLE public.meals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT CHECK (category IN ('breakfast', 'lunch', 'dinner', 'snack', 'pre_workout', 'post_workout')),
  is_template BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- MY_MEAL_PLANS TABLE (saved AI meal plans per user)
-- =====================================================
CREATE TABLE public.my_meal_plans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT,
  plan_data JSONB NOT NULL,
  source_prompt TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for MyMealPlans
CREATE INDEX idx_my_meal_plans_user_id ON public.my_meal_plans(user_id);
CREATE INDEX idx_my_meal_plans_created_at ON public.my_meal_plans(created_at);

-- Row Level Security and policies
ALTER TABLE public.my_meal_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own meal plans" ON public.my_meal_plans
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own meal plans" ON public.my_meal_plans
  FOR ALL USING (auth.uid() = user_id);

-- =====================================================
-- MEAL_FOODS TABLE (junction table for meals and foods)
-- =====================================================
CREATE TABLE public.meal_foods (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  meal_id UUID REFERENCES public.meals(id) ON DELETE CASCADE NOT NULL,
  food_id UUID REFERENCES public.foods(id) ON DELETE CASCADE NOT NULL,
  quantity_g DECIMAL(8,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- FOOD_LOGS TABLE (daily food consumption)
-- =====================================================
CREATE TABLE public.food_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  log_date DATE NOT NULL DEFAULT CURRENT_DATE,
  meal_time TEXT NOT NULL CHECK (meal_time IN ('breakfast', 'morning_snack', 'lunch', 'afternoon_snack', 'dinner', 'evening_snack')),
  log_type TEXT NOT NULL CHECK (log_type IN ('food', 'meal')),
  item_id UUID NOT NULL, -- references either foods.id or meals.id
  item_name TEXT NOT NULL,
  quantity DECIMAL(8,2) NOT NULL,
  
  -- Calculated nutritional values for the logged portion
  calories DECIMAL(8,2) NOT NULL,
  protein_g DECIMAL(8,2) NOT NULL,
  carbs_g DECIMAL(8,2) NOT NULL,
  fat_g DECIMAL(8,2) NOT NULL,
  fiber_g DECIMAL(8,2) DEFAULT 0.0,
  sugar_g DECIMAL(8,2) DEFAULT 0.0,
  sodium_mg DECIMAL(8,2) DEFAULT 0.0,
  saturated_fat_g DECIMAL(8,2) DEFAULT 0.0,
  
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- WEIGHT_LOGS TABLE (weight tracking)
-- =====================================================
CREATE TABLE public.weight_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  weight_kg DECIMAL(5,2) NOT NULL,
  body_fat_percentage DECIMAL(4,2),
  muscle_mass_kg DECIMAL(5,2),
  water_percentage DECIMAL(4,2),
  log_date DATE NOT NULL DEFAULT CURRENT_DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- WORKOUT_LOGS TABLE (exercise tracking)
-- =====================================================
CREATE TABLE public.workout_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  workout_date DATE NOT NULL DEFAULT CURRENT_DATE,
  workout_type TEXT NOT NULL,
  duration_minutes INTEGER,
  calories_burned INTEGER,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- API CACHE TABLE (cache API responses for performance)
-- =====================================================
CREATE TABLE public.api_cache (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  api_source TEXT NOT NULL,
  query_hash TEXT NOT NULL, -- Hash of search query
  response_data JSONB NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(api_source, query_hash)
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================
CREATE INDEX idx_foods_user_id ON public.foods(user_id);
CREATE INDEX idx_foods_brand_id ON public.foods(brand_id);
CREATE INDEX idx_foods_name ON public.foods(name);
CREATE INDEX idx_foods_api_id ON public.foods(api_id);
CREATE INDEX idx_foods_category ON public.foods(category);
CREATE INDEX idx_foods_tags ON public.foods USING GIN(tags);
CREATE INDEX idx_foods_search ON public.foods USING GIN(to_tsvector('english', name || ' ' || COALESCE(description, '')));
CREATE INDEX idx_meals_user_id ON public.meals(user_id);
CREATE INDEX idx_meal_foods_meal_id ON public.meal_foods(meal_id);
CREATE INDEX idx_food_logs_user_date ON public.food_logs(user_id, log_date);
CREATE INDEX idx_food_logs_meal_time ON public.food_logs(meal_time);
CREATE INDEX idx_weight_logs_user_date ON public.weight_logs(user_id, log_date);
CREATE INDEX idx_workout_logs_user_date ON public.workout_logs(user_id, workout_date);
CREATE INDEX idx_api_cache_expires ON public.api_cache(expires_at);

-- =====================================================
-- FUNCTIONS AND TRIGGERS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_nutritional_goals_updated_at BEFORE UPDATE ON public.nutritional_goals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_foods_updated_at BEFORE UPDATE ON public.foods
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_meals_updated_at BEFORE UPDATE ON public.meals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to calculate meal totals
CREATE OR REPLACE FUNCTION calculate_meal_totals(meal_uuid UUID)
RETURNS TABLE (
  total_calories DECIMAL(10,2),
  total_protein DECIMAL(10,2),
  total_carbs DECIMAL(10,2),
  total_fat DECIMAL(10,2),
  total_fiber DECIMAL(10,2),
  total_sugar DECIMAL(10,2),
  total_sodium DECIMAL(10,2)
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    SUM(f.calories_per_100g * mf.quantity_g / 100.0) as total_calories,
    SUM(f.protein_per_100g * mf.quantity_g / 100.0) as total_protein,
    SUM(f.carbs_per_100g * mf.quantity_g / 100.0) as total_carbs,
    SUM(f.fat_per_100g * mf.quantity_g / 100.0) as total_fat,
    SUM(COALESCE(f.fiber_per_100g, 0) * mf.quantity_g / 100.0) as total_fiber,
    SUM(COALESCE(f.sugar_per_100g, 0) * mf.quantity_g / 100.0) as total_sugar,
    SUM(COALESCE(f.sodium_per_100g, 0) * mf.quantity_g / 100.0) as total_sodium
  FROM public.meal_foods mf
  JOIN public.foods f ON mf.food_id = f.id
  WHERE mf.meal_id = meal_uuid;
END;
$$ LANGUAGE plpgsql;

-- Function to get daily nutrition summary
CREATE OR REPLACE FUNCTION get_daily_nutrition_summary(user_uuid UUID, target_date DATE DEFAULT CURRENT_DATE)
RETURNS TABLE (
  total_calories DECIMAL(10,2),
  total_protein DECIMAL(10,2),
  total_carbs DECIMAL(10,2),
  total_fat DECIMAL(10,2),
  total_fiber DECIMAL(10,2),
  total_sugar DECIMAL(10,2),
  total_sodium DECIMAL(10,2)
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    SUM(fl.calories) as total_calories,
    SUM(fl.protein_g) as total_protein,
    SUM(fl.carbs_g) as total_carbs,
    SUM(fl.fat_g) as total_fat,
    SUM(COALESCE(fl.fiber_g, 0)) as total_fiber,
    SUM(COALESCE(fl.sugar_g, 0)) as total_sugar,
    SUM(COALESCE(fl.sodium_mg, 0)) as total_sodium
  FROM public.food_logs fl
  WHERE fl.user_id = user_uuid AND fl.log_date = target_date;
END;
$$ LANGUAGE plpgsql;

-- Function to search foods with API integration
CREATE OR REPLACE FUNCTION search_foods_with_api(
  search_query TEXT,
  user_uuid UUID DEFAULT NULL,
  limit_count INTEGER DEFAULT 20
)
RETURNS TABLE (
  id UUID,
  name TEXT,
  display_name TEXT,
  brand_name TEXT,
  category TEXT,
  calories_per_100g DECIMAL(8,2),
  protein_per_100g DECIMAL(8,2),
  carbs_per_100g DECIMAL(8,2),
  fat_per_100g DECIMAL(8,2),
  serving_size_g DECIMAL(8,2),
  source TEXT,
  is_favorite BOOLEAN,
  similarity_score FLOAT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    f.id,
    f.name,
    COALESCE(f.display_name, f.name) as display_name,
    b.name as brand_name,
    f.category,
    f.calories_per_100g,
    f.protein_per_100g,
    f.carbs_per_100g,
    f.fat_per_100g,
    f.serving_size_g,
    f.source,
    COALESCE(f.is_favorite, false) as is_favorite,
    GREATEST(
      similarity(LOWER(f.name), LOWER(search_query)),
      similarity(LOWER(COALESCE(f.display_name, f.name)), LOWER(search_query)),
      similarity(LOWER(COALESCE(b.name, '')), LOWER(search_query))
    ) as similarity_score
  FROM public.foods f
  LEFT JOIN public.food_brands b ON f.brand_id = b.id
  WHERE 
    (f.user_id = user_uuid OR f.source = 'api' OR f.is_verified = true)
    AND (
      f.name ILIKE '%' || search_query || '%' OR
      COALESCE(f.display_name, '') ILIKE '%' || search_query || '%' OR
      COALESCE(b.name, '') ILIKE '%' || search_query || '%' OR
      search_query = ANY(f.tags)
    )
  ORDER BY 
    f.is_favorite DESC,
    similarity_score DESC,
    f.is_verified DESC,
    f.name
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nutritional_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.food_brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.foods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meal_foods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.food_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weight_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_cache ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Nutritional goals policies
CREATE POLICY "Users can view own nutritional goals" ON public.nutritional_goals
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own nutritional goals" ON public.nutritional_goals
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own nutritional goals" ON public.nutritional_goals
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own nutritional goals" ON public.nutritional_goals
  FOR DELETE USING (auth.uid() = user_id);

-- Food brands policies (read-only for all authenticated users)
CREATE POLICY "Anyone can view food brands" ON public.food_brands
  FOR SELECT USING (true);

-- Foods policies
CREATE POLICY "Users can view foods" ON public.foods
  FOR SELECT USING (
    auth.uid() = user_id OR 
    source = 'api' OR 
    is_verified = true
  );

CREATE POLICY "Users can manage own foods" ON public.foods
  FOR ALL USING (auth.uid() = user_id);

-- Meals policies
CREATE POLICY "Users can view own meals" ON public.meals
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own meals" ON public.meals
  FOR ALL USING (auth.uid() = user_id);

-- Meal foods policies
CREATE POLICY "Users can view own meal foods" ON public.meal_foods
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.meals m 
      WHERE m.id = meal_id AND m.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage own meal foods" ON public.meal_foods
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.meals m 
      WHERE m.id = meal_id AND m.user_id = auth.uid()
    )
  );

-- Food logs policies
CREATE POLICY "Users can view own food logs" ON public.food_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own food logs" ON public.food_logs
  FOR ALL USING (auth.uid() = user_id);

-- Weight logs policies
CREATE POLICY "Users can view own weight logs" ON public.weight_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own weight logs" ON public.weight_logs
  FOR ALL USING (auth.uid() = user_id);

-- Workout logs policies
CREATE POLICY "Users can view own workout logs" ON public.workout_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own workout logs" ON public.workout_logs
  FOR ALL USING (auth.uid() = user_id);

-- API cache policies (read-only for all authenticated users)
CREATE POLICY "Anyone can view API cache" ON public.api_cache
  FOR SELECT USING (true);

-- =====================================================
-- SAMPLE DATA INSERTION
-- =====================================================

-- Insert popular food brands
INSERT INTO public.food_brands (id, name, category, country) VALUES
  (gen_random_uuid(), 'McDonald''s', 'fast_food', 'PT'),
  (gen_random_uuid(), 'Burger King', 'fast_food', 'PT'),
  (gen_random_uuid(), 'KFC', 'fast_food', 'PT'),
  (gen_random_uuid(), 'Pizza Hut', 'restaurant', 'PT'),
  (gen_random_uuid(), 'Domino''s', 'restaurant', 'PT'),
  (gen_random_uuid(), 'Subway', 'fast_food', 'PT'),
  (gen_random_uuid(), 'Prozis', 'supplement', 'PT'),
  (gen_random_uuid(), 'MyProtein', 'supplement', 'PT'),
  (gen_random_uuid(), 'Holland & Barrett', 'supplement', 'PT'),
  (gen_random_uuid(), 'Continente', 'grocery', 'PT'),
  (gen_random_uuid(), 'Pingo Doce', 'grocery', 'PT'),
  (gen_random_uuid(), 'Lidl', 'grocery', 'PT'),
  (gen_random_uuid(), 'Auchan', 'grocery', 'PT'),
  (gen_random_uuid(), 'El Corte Inglés', 'grocery', 'PT'),
  (gen_random_uuid(), 'Nestlé', 'grocery', 'PT'),
  (gen_random_uuid(), 'Danone', 'grocery', 'PT'),
  (gen_random_uuid(), 'Coca-Cola', 'grocery', 'PT'),
  (gen_random_uuid(), 'PepsiCo', 'grocery', 'PT'),
  (gen_random_uuid(), 'Unilever', 'grocery', 'PT'),
  (gen_random_uuid(), 'Kraft Heinz', 'grocery', 'PT');

-- Insert sample verified foods (will be populated by API)
INSERT INTO public.foods (id, name, display_name, brand_id, category, serving_size_g, calories_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g, fiber_per_100g, sugar_per_100g, sodium_per_100g, is_verified, source, tags) VALUES
  (gen_random_uuid(), 'Peito de Frango Grelhado', 'Peito de Frango Grelhado', NULL, 'lunch', 100.0, 165.0, 31.0, 0.0, 3.6, 0.0, 0.0, 74.0, true, 'verified', ARRAY['frango', 'proteina', 'grelhado']),
  (gen_random_uuid(), 'Arroz Integral Cozido', 'Arroz Integral Cozido', NULL, 'lunch', 100.0, 111.0, 2.6, 23.0, 0.9, 1.8, 0.4, 5.0, true, 'verified', ARRAY['arroz', 'integral', 'carboidrato']),
  (gen_random_uuid(), 'Brócolis Cozido', 'Brócolis Cozido', NULL, 'lunch', 100.0, 25.0, 3.0, 5.0, 0.3, 2.6, 1.5, 33.0, true, 'verified', ARRAY['brocolis', 'vegetal', 'fibra']),
  (gen_random_uuid(), 'Batata Doce', 'Batata Doce', NULL, 'lunch', 100.0, 86.0, 1.6, 20.0, 0.1, 3.0, 4.2, 55.0, true, 'verified', ARRAY['batata', 'doce', 'carboidrato']),
  (gen_random_uuid(), 'Azeite Extra Virgem', 'Azeite Extra Virgem', NULL, 'lunch', 100.0, 884.0, 0.0, 0.0, 100.0, 0.0, 0.0, 2.0, true, 'verified', ARRAY['azeite', 'gordura', 'saudavel']),
  (gen_random_uuid(), 'Ovo Inteiro', 'Ovo Inteiro', NULL, 'breakfast', 100.0, 155.0, 12.6, 1.1, 11.3, 0.0, 1.1, 124.0, true, 'verified', ARRAY['ovo', 'proteina', 'breakfast']),
  (gen_random_uuid(), 'Atum em Água', 'Atum em Água', NULL, 'lunch', 100.0, 116.0, 26.0, 0.0, 0.8, 0.0, 0.0, 50.0, true, 'verified', ARRAY['atum', 'peixe', 'proteina']),
  (gen_random_uuid(), 'Quinoa Cozida', 'Quinoa Cozida', NULL, 'lunch', 100.0, 120.0, 4.4, 22.0, 1.9, 2.8, 0.9, 7.0, true, 'verified', ARRAY['quinoa', 'integral', 'proteina']),
  (gen_random_uuid(), 'Espinafre Cozido', 'Espinafre Cozido', NULL, 'lunch', 100.0, 23.0, 2.9, 3.8, 0.4, 2.4, 0.4, 70.0, true, 'verified', ARRAY['espinafre', 'vegetal', 'ferro']),
  (gen_random_uuid(), 'Banana', 'Banana', NULL, 'snack', 100.0, 89.0, 1.1, 23.0, 0.3, 2.6, 12.0, 1.0, true, 'verified', ARRAY['banana', 'fruta', 'potassio']),
  -- Novos alimentos básicos adicionados
  (gen_random_uuid(), 'Carne Moída de Vaca', 'Carne Moída de Vaca (10% gordura)', NULL, 'lunch', 100.0, 176.0, 20.0, 0.0, 10.0, 0.0, 0.0, 72.0, true, 'verified', ARRAY['carne', 'vaca', 'moida', 'proteina']),
  (gen_random_uuid(), 'Carne Moída de Vaca', 'Carne Moída de Vaca (15% gordura)', NULL, 'lunch', 100.0, 215.0, 19.0, 0.0, 15.0, 0.0, 0.0, 72.0, true, 'verified', ARRAY['carne', 'vaca', 'moida', 'proteina']),
  (gen_random_uuid(), 'Carne Moída de Vaca', 'Carne Moída de Vaca (20% gordura)', NULL, 'lunch', 100.0, 254.0, 18.0, 0.0, 20.0, 0.0, 0.0, 72.0, true, 'verified', ARRAY['carne', 'vaca', 'moida', 'proteina']),
  (gen_random_uuid(), 'Pão de Trigo', 'Pão de Trigo Branco', NULL, 'breakfast', 100.0, 265.0, 9.0, 49.0, 3.2, 2.7, 5.0, 491.0, true, 'verified', ARRAY['pao', 'trigo', 'branco', 'carboidrato']),
  (gen_random_uuid(), 'Pão de Trigo', 'Pão de Trigo Integral', NULL, 'breakfast', 100.0, 247.0, 13.0, 41.0, 4.2, 7.0, 4.3, 455.0, true, 'verified', ARRAY['pao', 'trigo', 'integral', 'carboidrato', 'fibra']),
  (gen_random_uuid(), 'Pão de Centeio', 'Pão de Centeio', NULL, 'breakfast', 100.0, 259.0, 8.5, 48.0, 3.3, 5.8, 3.9, 430.0, true, 'verified', ARRAY['pao', 'centeio', 'integral', 'carboidrato']),
  (gen_random_uuid(), 'Aveia', 'Aveia em Flocos (crua)', NULL, 'breakfast', 100.0, 389.0, 16.9, 66.3, 6.9, 10.6, 0.0, 2.0, true, 'verified', ARRAY['aveia', 'flocos', 'integral', 'fibra', 'proteina']),
  (gen_random_uuid(), 'Aveia', 'Aveia em Flocos (cozida)', NULL, 'breakfast', 100.0, 68.0, 2.4, 12.0, 1.4, 1.7, 0.3, 49.0, true, 'verified', ARRAY['aveia', 'flocos', 'cozida', 'fibra']),
  (gen_random_uuid(), 'Leite Integral', 'Leite de Vaca Integral', NULL, 'breakfast', 100.0, 61.0, 3.2, 4.8, 3.3, 0.0, 4.8, 43.0, true, 'verified', ARRAY['leite', 'vaca', 'integral', 'calcio']),
  (gen_random_uuid(), 'Leite Semi-desnatado', 'Leite de Vaca Semi-desnatado', NULL, 'breakfast', 100.0, 50.0, 3.4, 4.8, 1.8, 0.0, 4.8, 44.0, true, 'verified', ARRAY['leite', 'vaca', 'semi-desnatado', 'calcio']),
  (gen_random_uuid(), 'Leite Desnatado', 'Leite de Vaca Desnatado', NULL, 'breakfast', 100.0, 42.0, 3.4, 5.0, 0.1, 0.0, 5.0, 44.0, true, 'verified', ARRAY['leite', 'vaca', 'desnatado', 'calcio']),
  (gen_random_uuid(), 'Iogurte Natural', 'Iogurte Natural Integral', NULL, 'breakfast', 100.0, 59.0, 10.0, 3.6, 0.4, 0.0, 3.2, 36.0, true, 'verified', ARRAY['iogurte', 'natural', 'integral', 'proteina']),
  (gen_random_uuid(), 'Iogurte Grego', 'Iogurte Grego Natural', NULL, 'breakfast', 100.0, 59.0, 10.0, 3.6, 0.4, 0.0, 3.2, 36.0, true, 'verified', ARRAY['iogurte', 'grego', 'natural', 'proteina']),
  (gen_random_uuid(), 'Queijo Cottage', 'Queijo Cottage', NULL, 'breakfast', 100.0, 98.0, 11.1, 3.4, 4.3, 0.0, 2.7, 364.0, true, 'verified', ARRAY['queijo', 'cottage', 'proteina', 'calcio']),
  (gen_random_uuid(), 'Queijo Fresco', 'Queijo Fresco', NULL, 'breakfast', 100.0, 85.0, 11.0, 2.0, 4.0, 0.0, 2.0, 300.0, true, 'verified', ARRAY['queijo', 'fresco', 'proteina', 'calcio']),
  (gen_random_uuid(), 'Manteiga', 'Manteiga', NULL, 'breakfast', 100.0, 717.0, 0.9, 0.1, 81.0, 0.0, 0.1, 11.0, true, 'verified', ARRAY['manteiga', 'gordura', 'saturada']),
  (gen_random_uuid(), 'Margarina', 'Margarina', NULL, 'breakfast', 100.0, 717.0, 0.2, 0.7, 81.0, 0.0, 0.0, 2.0, true, 'verified', ARRAY['margarina', 'gordura', 'vegetal']),
  (gen_random_uuid(), 'Mel', 'Mel', NULL, 'breakfast', 100.0, 304.0, 0.3, 82.4, 0.0, 0.2, 82.1, 4.0, true, 'verified', ARRAY['mel', 'doce', 'natural', 'energia']),
  (gen_random_uuid(), 'Açúcar', 'Açúcar Branco', NULL, 'breakfast', 100.0, 387.0, 0.0, 100.0, 0.0, 0.0, 100.0, 1.0, true, 'verified', ARRAY['acucar', 'branco', 'doce', 'energia']),
  (gen_random_uuid(), 'Sal', 'Sal de Cozinha', NULL, 'breakfast', 100.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 38800.0, true, 'verified', ARRAY['sal', 'sodio', 'tempero']),
  (gen_random_uuid(), 'Cebola', 'Cebola Crua', NULL, 'lunch', 100.0, 40.0, 1.1, 9.3, 0.1, 1.7, 4.7, 4.0, true, 'verified', ARRAY['cebola', 'vegetal', 'crua', 'fibra']),
  (gen_random_uuid(), 'Alho', 'Alho Cru', NULL, 'lunch', 100.0, 149.0, 6.4, 33.1, 0.5, 2.1, 1.0, 17.0, true, 'verified', ARRAY['alho', 'vegetal', 'cru', 'tempero']),
  (gen_random_uuid(), 'Cenoura', 'Cenoura Crua', NULL, 'lunch', 100.0, 41.0, 0.9, 9.6, 0.2, 2.8, 4.7, 69.0, true, 'verified', ARRAY['cenoura', 'vegetal', 'crua', 'vitamina-a']),
  (gen_random_uuid(), 'Tomate', 'Tomate Cru', NULL, 'lunch', 100.0, 18.0, 0.9, 3.9, 0.2, 1.2, 2.6, 5.0, true, 'verified', ARRAY['tomate', 'vegetal', 'cru', 'vitamina-c']),
  (gen_random_uuid(), 'Alface', 'Alface', NULL, 'lunch', 100.0, 15.0, 1.4, 2.9, 0.1, 1.3, 0.8, 28.0, true, 'verified', ARRAY['alface', 'vegetal', 'folha', 'fibra']),
  (gen_random_uuid(), 'Pepino', 'Pepino Cru', NULL, 'lunch', 100.0, 16.0, 0.7, 3.6, 0.1, 0.5, 1.7, 2.0, true, 'verified', ARRAY['pepino', 'vegetal', 'cru', 'agua']),
  (gen_random_uuid(), 'Maçã', 'Maçã Crua', NULL, 'snack', 100.0, 52.0, 0.3, 14.0, 0.2, 2.4, 10.4, 1.0, true, 'verified', ARRAY['maca', 'fruta', 'crua', 'fibra']),
  (gen_random_uuid(), 'Laranja', 'Laranja Crua', NULL, 'snack', 100.0, 47.0, 0.9, 12.0, 0.1, 2.4, 9.4, 0.0, true, 'verified', ARRAY['laranja', 'fruta', 'crua', 'vitamina-c']),
  (gen_random_uuid(), 'Uva', 'Uva Crua', NULL, 'snack', 100.0, 62.0, 0.6, 16.0, 0.2, 0.9, 16.0, 2.0, true, 'verified', ARRAY['uva', 'fruta', 'crua', 'antioxidante']),
  (gen_random_uuid(), 'Morango', 'Morango Cru', NULL, 'snack', 100.0, 32.0, 0.7, 7.7, 0.3, 2.0, 4.9, 1.0, true, 'verified', ARRAY['morango', 'fruta', 'crua', 'vitamina-c']),
  (gen_random_uuid(), 'Kiwi', 'Kiwi Cru', NULL, 'snack', 100.0, 61.0, 1.1, 15.0, 0.5, 3.0, 9.0, 3.0, true, 'verified', ARRAY['kiwi', 'fruta', 'crua', 'vitamina-c']),
  (gen_random_uuid(), 'Ananás', 'Ananás Cru', NULL, 'snack', 100.0, 50.0, 0.5, 13.0, 0.1, 1.4, 9.9, 1.0, true, 'verified', ARRAY['ananas', 'fruta', 'crua', 'bromelina']),
  (gen_random_uuid(), 'Manga', 'Manga Crua', NULL, 'snack', 100.0, 60.0, 0.8, 15.0, 0.4, 1.6, 13.7, 1.0, true, 'verified', ARRAY['manga', 'fruta', 'crua', 'vitamina-a']),
  (gen_random_uuid(), 'Pêra', 'Pêra Crua', NULL, 'snack', 100.0, 57.0, 0.4, 15.0, 0.1, 3.1, 9.8, 1.0, true, 'verified', ARRAY['pera', 'fruta', 'crua', 'fibra']),
  (gen_random_uuid(), 'Pêssego', 'Pêssego Cru', NULL, 'snack', 100.0, 39.0, 0.9, 10.0, 0.3, 1.5, 8.4, 0.0, true, 'verified', ARRAY['pessego', 'fruta', 'crua', 'vitamina-c']),
  (gen_random_uuid(), 'Ameixa', 'Ameixa Crua', NULL, 'snack', 100.0, 46.0, 0.7, 11.0, 0.3, 1.4, 9.9, 0.0, true, 'verified', ARRAY['ameixa', 'fruta', 'crua', 'fibra']),
  (gen_random_uuid(), 'Cereja', 'Cereja Crua', NULL, 'snack', 100.0, 50.0, 1.0, 12.0, 0.3, 1.6, 8.5, 3.0, true, 'verified', ARRAY['cereja', 'fruta', 'crua', 'antioxidante']),
  (gen_random_uuid(), 'Framboesa', 'Framboesa Crua', NULL, 'snack', 100.0, 52.0, 1.2, 12.0, 0.7, 6.5, 4.4, 1.0, true, 'verified', ARRAY['framboesa', 'fruta', 'crua', 'fibra', 'antioxidante']),
  (gen_random_uuid(), 'Amora', 'Amora Crua', NULL, 'snack', 100.0, 43.0, 1.4, 10.0, 0.5, 5.3, 4.9, 1.0, true, 'verified', ARRAY['amora', 'fruta', 'crua', 'fibra', 'antioxidante']),
  (gen_random_uuid(), 'Mirtilo', 'Mirtilo Cru', NULL, 'snack', 100.0, 57.0, 0.7, 14.0, 0.3, 2.4, 10.0, 1.0, true, 'verified', ARRAY['mirtilo', 'fruta', 'crua', 'antioxidante', 'vitamina-c']),
  (gen_random_uuid(), 'Amendoim', 'Amendoim Torrado', NULL, 'snack', 100.0, 567.0, 25.8, 16.1, 49.2, 8.5, 4.7, 18.0, true, 'verified', ARRAY['amendoim', 'fruto-seco', 'torrado', 'proteina', 'gordura']),
  (gen_random_uuid(), 'Amêndoa', 'Amêndoa Crua', NULL, 'snack', 100.0, 579.0, 21.2, 21.7, 49.9, 12.5, 4.8, 1.0, true, 'verified', ARRAY['amendoa', 'fruto-seco', 'crua', 'proteina', 'gordura', 'fibra']),
  (gen_random_uuid(), 'Noz', 'Noz Crua', NULL, 'snack', 100.0, 654.0, 15.2, 13.7, 65.2, 6.7, 2.6, 2.0, true, 'verified', ARRAY['noz', 'fruto-seco', 'crua', 'proteina', 'gordura', 'omega-3']),
  (gen_random_uuid(), 'Caju', 'Caju Torrado', NULL, 'snack', 100.0, 553.0, 18.2, 30.2, 43.8, 3.3, 5.9, 12.0, true, 'verified', ARRAY['caju', 'fruto-seco', 'torrado', 'proteina', 'gordura']),
  (gen_random_uuid(), 'Pistácio', 'Pistácio Torrado', NULL, 'snack', 100.0, 560.0, 20.2, 27.2, 45.3, 10.6, 7.6, 1.0, true, 'verified', ARRAY['pistacio', 'fruto-seco', 'torrado', 'proteina', 'gordura', 'fibra']),
  (gen_random_uuid(), 'Semente de Chia', 'Semente de Chia', NULL, 'breakfast', 100.0, 486.0, 17.0, 42.0, 31.0, 34.0, 0.0, 16.0, true, 'verified', ARRAY['semente', 'chia', 'omega-3', 'fibra', 'proteina']),
  (gen_random_uuid(), 'Semente de Linhaça', 'Semente de Linhaça', NULL, 'breakfast', 100.0, 534.0, 18.3, 28.9, 42.2, 27.3, 1.6, 30.0, true, 'verified', ARRAY['semente', 'linhaca', 'omega-3', 'fibra', 'proteina']),
  (gen_random_uuid(), 'Semente de Abóbora', 'Semente de Abóbora', NULL, 'snack', 100.0, 559.0, 19.0, 54.0, 19.0, 18.0, 1.4, 18.0, true, 'verified', ARRAY['semente', 'abobora', 'proteina', 'fibra', 'magnesio']),
  (gen_random_uuid(), 'Semente de Girassol', 'Semente de Girassol', NULL, 'snack', 100.0, 584.0, 21.0, 20.0, 51.0, 8.6, 2.6, 9.0, true, 'verified', ARRAY['semente', 'girassol', 'proteina', 'gordura', 'vitamina-e']);

-- =====================================================
-- COMMENTS
-- =====================================================
COMMENT ON TABLE public.profiles IS 'User profiles extending Supabase auth.users';
COMMENT ON TABLE public.nutritional_goals IS 'Daily nutritional targets for users';
COMMENT ON TABLE public.food_brands IS 'Popular food brands and restaurants for API integration';
COMMENT ON TABLE public.foods IS 'Food items with comprehensive nutritional information and API integration';
COMMENT ON TABLE public.meals IS 'Composed meals made of multiple foods';
COMMENT ON TABLE public.meal_foods IS 'Junction table linking meals and foods with quantities';
COMMENT ON TABLE public.food_logs IS 'Daily food consumption logs with calculated nutritional values';
COMMENT ON TABLE public.weight_logs IS 'Weight and body composition tracking';
COMMENT ON TABLE public.workout_logs IS 'Exercise and workout tracking';
COMMENT ON TABLE public.api_cache IS 'Cache for API responses to improve performance and reduce API calls';
