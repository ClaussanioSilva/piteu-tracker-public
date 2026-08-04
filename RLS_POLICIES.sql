-- =====================================================
-- MISSING RLS POLICIES FOR NUTRITIONAL_GOALS
-- =====================================================

-- Enable RLS on nutritional_goals if not already enabled
ALTER TABLE public.nutritional_goals ENABLE ROW LEVEL SECURITY;

-- Policy for users to view their own nutritional goals
CREATE POLICY "Users can view own nutritional goals" ON public.nutritional_goals
  FOR SELECT USING (auth.uid() = user_id);

-- Policy for users to insert their own nutritional goals
CREATE POLICY "Users can insert own nutritional goals" ON public.nutritional_goals
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy for users to update their own nutritional goals
CREATE POLICY "Users can update own nutritional goals" ON public.nutritional_goals
  FOR UPDATE USING (auth.uid() = user_id);

-- Policy for users to delete their own nutritional goals
CREATE POLICY "Users can delete own nutritional goals" ON public.nutritional_goals
  FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- MISSING RLS POLICIES FOR FOODS
-- =====================================================

-- Enable RLS on foods if not already enabled
ALTER TABLE public.foods ENABLE ROW LEVEL SECURITY;

-- Policy for users to view verified foods and their own foods
CREATE POLICY "Users can view verified and own foods" ON public.foods
  FOR SELECT USING (
    is_verified = true OR auth.uid() = user_id
  );

-- Policy for users to insert their own foods
CREATE POLICY "Users can insert own foods" ON public.foods
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy for users to update their own foods
CREATE POLICY "Users can update own foods" ON public.foods
  FOR UPDATE USING (auth.uid() = user_id);

-- Policy for users to delete their own foods
CREATE POLICY "Users can delete own foods" ON public.foods
  FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- MISSING RLS POLICIES FOR MEALS
-- =====================================================

-- Enable RLS on meals if not already enabled
ALTER TABLE public.meals ENABLE ROW LEVEL SECURITY;

-- Policy for users to view their own meals
CREATE POLICY "Users can view own meals" ON public.meals
  FOR SELECT USING (auth.uid() = user_id);

-- Policy for users to insert their own meals
CREATE POLICY "Users can insert own meals" ON public.meals
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy for users to update their own meals
CREATE POLICY "Users can update own meals" ON public.meals
  FOR UPDATE USING (auth.uid() = user_id);

-- Policy for users to delete their own meals
CREATE POLICY "Users can delete own meals" ON public.meals
  FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- VERIFY POLICIES ARE ACTIVE
-- =====================================================
-- Run this to check if policies are working:
-- SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check 
-- FROM pg_policies 
-- WHERE tablename IN ('nutritional_goals', 'foods', 'meals');
