import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useToast } from '@/hooks/use-toast'
import type { Database } from '@/lib/supabase'
import { User } from '@supabase/supabase-js'


type Profile = Database['public']['Tables']['profiles']['Row']
type Food = Database['public']['Tables']['foods']['Row']
type Meal = Database['public']['Tables']['meals']['Row']
type FoodLog = Database['public']['Tables']['food_logs']['Row']
type NutritionalGoal = Database['public']['Tables']['nutritional_goals']['Row']
type MealFood = Database['public']['Tables']['meal_foods']['Row']

// Extended types for meals with foods
type MealWithFoods = Meal & {
  meal_foods?: (MealFood & {
    foods?: {
      id: string
      name: string
      calories_per_100g: number
      protein_per_100g: number
      carbs_per_100g: number
      fat_per_100g: number
    }
  })[]
}

// Hook para gerenciar o perfil do usuário
export const useProfile = () => {
  console.log('useProfile hook initializing...')
  
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()
  
  console.log('useProfile hook - initial state:', { profile, loading })

  useEffect(() => {
    getProfile()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const getProfile = async () => {
    try {
      console.log('getProfile called - starting...')
      setLoading(true)
      
      // Check if supabase is available
      if (!supabase) {
        console.error('Supabase not available')
        setLoading(false)
        return
      }
      
      const { data: { user } } = await supabase.auth.getUser()
      console.log('getProfile - user:', user)
      
      if (!user) {
        console.log('getProfile - no user found')
        setLoading(false)
        return
      }

      console.log('getProfile - fetching profile for user:', user.id)
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      console.log('getProfile - supabase response:', { data, error })

      if (error) {
        console.log('getProfile - error:', error)
        if (error.code === 'PGRST116') {
          // Profile doesn't exist, create one
          console.log('getProfile - creating new profile')
          await createProfile(user)
        } else {
          throw error
        }
      } else {
        console.log('getProfile - profile found:', data)
        setProfile(data)
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
      toast({
        title: "Erro",
        description: "Não foi possível carregar o perfil.",
        variant: "destructive"
      })
    } finally {
      console.log('getProfile - setting loading to false')
      setLoading(false)
    }
  }

  const createProfile = async (user: User) => {
    try {
      console.log('createProfile called for user:', user.id)
      
      const { data, error } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          email: user.email!,
          full_name: user.user_metadata?.full_name || null
        })
        .select()
        .single()

      console.log('createProfile - supabase response:', { data, error })

      if (error) {
        console.error('createProfile - error:', error)
        throw error
      }
      
      console.log('createProfile - profile created successfully:', data)
      setProfile(data)
    } catch (error) {
      console.error('Error creating profile:', error)
      toast({
        title: "Erro",
        description: "Não foi possível criar o perfil.",
        variant: "destructive"
      })
    }
  }

  const updateProfile = async (updates: Partial<Profile>) => {
    try {
      console.log('updateProfile called with updates:', updates)
      
      // Check if supabase is available
      if (!supabase) {
        console.error('Supabase not available')
        throw new Error('Supabase not available')
      }
      
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        console.error('No user found in updateProfile')
        throw new Error('No user')
      }

      console.log('User found for profile update:', user.id)

      const profileEmail = updates.email ?? user.email
      if (!profileEmail) {
        console.error('No email available for profile upsert')
        throw new Error('No email available for profile')
      }

      const payload = {
        ...updates,
        id: user.id,
        email: profileEmail,
      }

      const { data, error } = await supabase
        .from('profiles')
        .upsert(payload, { onConflict: 'id' })
        .select()
        .maybeSingle()

      console.log('updateProfile - supabase response:', { data, error })

      if (error) {
        console.error('Supabase error updating profile:', error)
        throw error
      }

      if (!data) {
        console.error('Profile upsert returned no row')
        throw new Error('Profile upsert returned no row')
      }
      
      console.log('Profile updated successfully in Supabase:', data)
      setProfile(data)
      
      toast({
        title: "Sucesso",
        description: "Perfil atualizado com sucesso."
      })
    } catch (error) {
      console.error('Error updating profile:', error)
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o perfil.",
        variant: "destructive"
      })
      throw error // Re-throw to be caught by the calling function
    }
  }

  return { profile, loading, updateProfile, refreshProfile: getProfile }
}

// Hook para gerenciar alimentos
export const useFoods = () => {
  const [foods, setFoods] = useState<Food[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    fetchFoods()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const fetchFoods = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        console.log('No user found, skipping foods fetch')
        setLoading(false)
        return
      }

      console.log('Fetching foods for user:', user.id)

      const { data, error } = await supabase
        .from('foods')
        .select('*')
        .or('is_verified.eq.true,user_id.eq.' + user.id)
        .order('name')

      if (error) {
        console.error('Supabase error fetching foods:', error)
        throw error
      }

      console.log('Foods fetched successfully:', data)
      setFoods(data || [])
    } catch (error) {
      console.error('Error fetching foods:', error)
      toast({
        title: "Erro",
        description: "Não foi possível carregar os alimentos.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }


  type FoodInsert = Database['public']['Tables']['foods']['Insert']

  const addFood = async (food: Omit<FoodInsert, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    try {
      console.log('addFood called with:', food)
      
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('No user')

      console.log('User found:', user.id)

      const foodWithUserId = { ...food, user_id: user.id }
      console.log('Food data with user_id:', foodWithUserId)

      const { data, error } = await supabase
        .from('foods')
        .insert(foodWithUserId)
        .select()
        .single()

      if (error) {
        console.error('Supabase error adding food:', error)
        throw error
      }

      console.log('Food added successfully:', data)
      setFoods(prev => [...prev, data])
      
      toast({
        title: "Sucesso",
        description: "Alimento adicionado com sucesso."
      })
      
      return data
    } catch (error) {
      console.error('Error adding food:', error)
      toast({
        title: "Erro",
        description: "Não foi possível adicionar o alimento.",
        variant: "destructive"
      })
      return null
    }
  }



  // NOVO: obter dados por código de barras sem inserir, para pré-preencher
  const getFoodFromBarcode = async (barcode: string) => {
    try {
      if (!barcode) throw new Error('Código de barras vazio')

      const resp = await fetch(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json`)
      const json = await resp.json()

      if (!json || json.status !== 1 || !json.product) {
        throw new Error('Produto não encontrado')
      }

      const p = json.product
      const nutr = p.nutriments || {}

      const kcal =
        typeof nutr['energy-kcal_100g'] === 'number'
          ? nutr['energy-kcal_100g']
          : typeof nutr.energy_100g === 'number'
            ? Math.round(nutr.energy_100g / 4.184)
            : 0

      const sodiumMg =
        typeof nutr.sodium_100g === 'number'
          ? Math.round(nutr.sodium_100g * 1000)
          : typeof nutr.sodium_value === 'number' && nutr.sodium_unit === 'mg'
            ? nutr.sodium_value
            : null

      const allergens =
        Array.isArray(p.allergens_tags) && p.allergens_tags.length > 0
          ? p.allergens_tags.map((t: string) => t.replace(/^..:/, ''))
          : null

      const servingGuess =
        (typeof p.serving_quantity === 'number' && p.serving_quantity > 0
          ? p.serving_quantity
          : (() => {
              const m = typeof p.serving_size === 'string' ? p.serving_size.match(/(\d+(\.\d+)?)/) : null
              return m ? Number(m[1]) : 100
            })())

      const baseFood = {
        name: p.product_name || 'Produto sem nome',
        display_name: p.brands ? `${p.product_name || 'Produto'} (${p.brands})` : p.product_name || null,
        description: p.generic_name || null,
        serving_size_g: Number(servingGuess || 100),
        calories_per_100g: Number(kcal || 0),
        protein_per_100g: Number(nutr.proteins_100g ?? 0),
        carbs_per_100g: Number(nutr.carbohydrates_100g ?? 0),
        fat_per_100g: Number(nutr.fat_100g ?? 0),
        fiber_per_100g: nutr.fiber_100g ?? null,
        sugar_per_100g: nutr.sugars_100g ?? null,
        sodium_per_100g: sodiumMg,
        saturated_fat_per_100g: nutr['saturated-fat_100g'] ?? null,
        trans_fat_per_100g: nutr['trans-fat_100g'] ?? null,
        cholesterol_per_100g: nutr.cholesterol_100g ?? null,
        ingredients: p.ingredients_text ?? null,
        allergens,
        source: 'open_food_facts',
        barcode,
        is_verified: false,
      } as Omit<Food, 'id' | 'user_id' | 'created_at' | 'updated_at'>

      const brand = typeof p.brands === 'string' ? p.brands : undefined
      return { baseFood, brand }
    } catch (error) {
      console.error('Erro ao obter dados via código de barras:', error)
      toast({
        title: 'Erro',
        description: 'Falha ao buscar dados pelo código de barras.',
        variant: 'destructive'
      })
      return null
    }
  }

  const updateFood = async (id: string, updates: Partial<Food>) => {
    try {
      console.log('updateFood called with id:', id, 'updates:', updates)
      
      // Validate required fields
      if (!id) {
        throw new Error('Food ID is required')
      }
      
      // Clean updates - remove undefined values and ensure proper types
      const cleanUpdates: Partial<Food> = {}
      Object.entries(updates).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          // Convert numeric fields to proper numbers
          if (key.includes('_per_100g') || key === 'serving_size_g') {
            cleanUpdates[key] = parseFloat(value as string) || 0
          } else {
            cleanUpdates[key] = value
          }
        }
      })
      
      console.log('Cleaned updates:', cleanUpdates)
      
      const { data, error } = await supabase
        .from('foods')
        .update(cleanUpdates)
        .eq('id', id)
        .select()
        .single()

      if (error) {
        console.error('Supabase error updating food:', error)
        throw error
      }
      
      console.log('Food updated successfully:', data)
      setFoods(prev => prev.map(food => food.id === id ? data : food))
      
      toast({
        title: "Sucesso",
        description: "Alimento atualizado com sucesso."
      })
      
      return data
    } catch (error) {
      console.error('Error updating food:', error)
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o alimento.",
        variant: "destructive"
      })
      return null
    }
  }

  const deleteFood = async (id: string) => {
    try {
      const { error } = await supabase
        .from('foods')
        .delete()
        .eq('id', id)

      if (error) throw error
      setFoods(prev => prev.filter(food => food.id !== id))
      
      toast({
        title: "Sucesso",
        description: "Alimento removido com sucesso."
      })
    } catch (error) {
      console.error('Error deleting food:', error)
      toast({
        title: "Erro",
        description: "Não foi possível remover o alimento.",
        variant: "destructive"
      })
    }
  }

  return { foods, loading, addFood, updateFood, deleteFood, refreshFoods: fetchFoods, getFoodFromBarcode }
}

// Hook para gerenciar refeições
export const useMeals = () => {
  const [meals, setMeals] = useState<MealWithFoods[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    fetchMeals()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const fetchMeals = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        console.log('No user found, skipping meals fetch')
        setLoading(false)
        return
      }

      console.log('Fetching meals for user:', user.id)

      const { data, error } = await supabase
        .from('meals')
        .select(`
          *,
          meal_foods (
            id,
            food_id,
            quantity_g,
            foods (
              id,
              name,
              calories_per_100g,
              protein_per_100g,
              carbs_per_100g,
              fat_per_100g
            )
          )
        `)
        .eq('user_id', user.id)
        .order('name')

      if (error) {
        console.error('Supabase error fetching meals:', error)
        throw error
      }

      console.log('Meals fetched successfully:', data)
      console.log('First meal meal_foods:', data?.[0]?.meal_foods)
      console.log('First meal_food foods data:', data?.[0]?.meal_foods?.[0]?.foods)
      setMeals(data || [])
    } catch (error) {
      console.error('Error fetching meals:', error)
      toast({
        title: "Erro",
        description: "Não foi possível carregar as refeições.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const addMeal = async (meal: Omit<Meal, 'id' | 'created_at' | 'updated_at' | 'user_id'>, foods?: Array<{foodId: string, quantity: number}>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('No user')

      console.log('Creating meal:', meal, 'with foods:', foods)

      // Create the meal first
      const { data: mealData, error: mealError } = await supabase
        .from('meals')
        .insert({ ...meal, user_id: user.id })
        .select()
        .single()

      if (mealError) throw mealError

      // If foods are provided, add them to meal_foods table
      if (foods && foods.length > 0) {
        const mealFoods = foods.map(food => ({
          meal_id: mealData.id,
          food_id: food.foodId,
          quantity_g: food.quantity
        }))

        const { error: foodsError } = await supabase
          .from('meal_foods')
          .insert(mealFoods)

        if (foodsError) {
          console.error('Error adding meal foods:', foodsError)
          // Don't throw here, meal was created successfully
        }
      }

      // Refresh meals to get the complete data with foods
      await fetchMeals()
      
      toast({
        title: "Sucesso",
        description: "Refeição criada com sucesso."
      })
      
      return mealData
    } catch (error) {
      console.error('Error adding meal:', error)
      toast({
        title: "Erro",
        description: "Não foi possível criar a refeição.",
        variant: "destructive"
      })
      return null
    }
  }

  const updateMeal = async (id: string, updates: Partial<Meal>) => {
    try {
      const { data, error } = await supabase
        .from('meals')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      setMeals(prev => prev.map(meal => meal.id === id ? data : meal))
      
      toast({
        title: "Sucesso",
        description: "Refeição atualizada com sucesso."
      })
      
      return data
    } catch (error) {
      console.error('Error updating meal:', error)
      toast({
        title: "Erro",
        description: "Não foi possível atualizar a refeição.",
        variant: "destructive"
      })
      return null
    }
  }

  const deleteMeal = async (id: string) => {
    try {
      const { error } = await supabase
        .from('meals')
        .delete()
        .eq('id', id)

      if (error) throw error
      setMeals(prev => prev.filter(meal => meal.id !== id))
      
      toast({
        title: "Sucesso",
        description: "Refeição removida com sucesso."
      })
    } catch (error) {
      console.error('Error deleting meal:', error)
      toast({
        title: "Erro",
        description: "Não foi possível remover a refeição.",
        variant: "destructive"
      })
    }
  }

  return { meals, loading, addMeal, updateMeal, deleteMeal, refreshMeals: fetchMeals }
}

// Hook para gerenciar logs de alimentos
export const useFoodLogs = () => {
  const [foodLogs, setFoodLogs] = useState<FoodLog[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()
  
  console.log('useFoodLogs hook initialized, current foodLogs:', foodLogs, 'loading:', loading)

  useEffect(() => {
    fetchFoodLogs()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const fetchFoodLogs = async (date?: string) => {
    try {
      console.log('fetchFoodLogs called with date:', date)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        console.log('No user found, skipping food logs fetch')
        setLoading(false)
        return
      }

      console.log('Fetching food logs for user:', user.id)
      
      // If date is specified, fetch only that date's logs
      // Otherwise, fetch all logs for the user
      let query = supabase
        .from('food_logs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (date) {
        query = query.eq('log_date', date)
        console.log('Fetching logs for specific date:', date)
      } else {
        console.log('Fetching all logs for user')
      }

      const { data, error } = await query

      if (error) {
        console.error('Supabase error fetching food logs:', error)
        throw error
      }
      
      console.log('Food logs fetched successfully:', data)
      setFoodLogs(data || [])
    } catch (error) {
      console.error('Error fetching food logs:', error)
      toast({
        title: "Erro",
        description: "Não foi possível carregar os logs.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  type FoodLogInsert = Database['public']['Tables']['food_logs']['Insert']

  const addFoodLog = async (log: Omit<FoodLogInsert, 'id' | 'user_id' | 'created_at'>) => {
    try {
      console.log('addFoodLog called with:', log)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('No user')

      console.log('User found:', user.id)
      const logWithUserId = { ...log, user_id: user.id }
      console.log('Log data with user_id:', logWithUserId)

      const { data, error } = await supabase
        .from('food_logs')
        .insert(logWithUserId)
        .select()
        .single()

      if (error) {
        console.error('Supabase error adding food log:', error)
        throw error
      }
      
      console.log('Food log added successfully:', data)
      // Update the local state immediately
      setFoodLogs(prev => {
        const newLogs = [data, ...prev]
        console.log('Food logs state updated locally, new count:', newLogs.length)
        console.log('New food logs array:', newLogs)
        return newLogs
      })
      
      toast({
        title: "Sucesso",
        description: "Item adicionado ao log com sucesso."
      })
      
      return data
    } catch (error) {
      console.error('Error adding food log:', error)
      toast({
        title: "Erro",
        description: "Não foi possível adicionar ao log.",
        variant: "destructive"
      })
      return null
    }
  }

  const deleteFoodLog = async (id: string) => {
    try {
      const { error } = await supabase
        .from('food_logs')
        .delete()
        .eq('id', id)

      if (error) throw error
      setFoodLogs(prev => prev.filter(log => log.id !== id))
      
      toast({
        title: "Sucesso",
        description: "Item removido do log com sucesso."
      })
    } catch (error) {
      console.error('Error deleting food log:', error)
      toast({
        title: "Erro",
        description: "Não foi possível remover do log.",
        variant: "destructive"
      })
    }
  }

  const getDailyNutrition = async (date?: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return null

      // Use local timezone to get correct date
      const targetDate = date || new Date().toLocaleDateString('en-CA') // Returns YYYY-MM-DD in local timezone
      
      const { data, error } = await supabase
        .rpc('get_daily_nutrition_summary', {
          user_uuid: user.id,
          target_date: targetDate
        })

      if (error) throw error
      return data?.[0] || null
    } catch (error) {
      console.error('Error getting daily nutrition:', error)
      return null
    }
  }

  return { 
    foodLogs, 
    loading, 
    addFoodLog, 
    deleteFoodLog, 
    fetchFoodLogs, 
    getDailyNutrition 
  }
}

// Hook para gerenciar metas nutricionais
export const useNutritionalGoals = () => {
  const [goals, setGoals] = useState<NutritionalGoal | null>(null)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()
  
  console.log('useNutritionalGoals hook initialized, current goals:', goals, 'loading:', loading)

  useEffect(() => {
    fetchGoals()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const fetchGoals = async () => {
    try {
      console.log('fetchGoals called - starting...')
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        console.log('No user found, skipping goals fetch')
        setLoading(false)
        return
      }

      console.log('Fetching goals for user:', user.id)
      console.log('Current goals state before fetch:', goals)

      const { data, error } = await supabase
        .from('nutritional_goals')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .maybeSingle()

      if (error) {
        console.error('Supabase error fetching goals:', error)
        console.error('Error details:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        })
        
        if (error.code === 'PGRST116') {
          console.log('No goals found for user, this is normal for new users')
          setGoals(null)
        } else {
          // Don't throw error, just set goals to null and show error
          console.error('Non-PGRST116 error, setting goals to null')
          setGoals(null)
        }
      } else {
        console.log('Goals fetched successfully from Supabase:', data)
        setGoals(data)
        console.log('Goals state updated in hook')
      }
      
      console.log('fetchGoals completed successfully')
    } catch (error) {
      console.error('Error fetching goals:', error)
      // Only show error toast for actual errors, not for missing goals
      if (error && typeof error === 'object' && 'code' in error && error.code !== 'PGRST116') {
        toast({
          title: "Erro",
          description: "Não foi possível carregar as metas.",
          variant: "destructive"
        })
      }
      setGoals(null)
    } finally {
      setLoading(false)
      console.log('fetchGoals loading set to false')
    }
  }

  const createGoals = async (goalsData: Omit<NutritionalGoal, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'is_active'>) => {
    try {
      console.log('createGoals called with:', goalsData)
      
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('No user')

      console.log('Creating goals for user:', user.id)

      const { data, error } = await supabase
        .from('nutritional_goals')
        .insert({ ...goalsData, user_id: user.id, is_active: true })
        .select()
        .maybeSingle()

      if (error) {
        console.error('Supabase error creating goals:', error)
        throw error
      }

      console.log('Goals created successfully:', data)
      setGoals(data)
      console.log('Goals state updated after creation')
      
      return data
    } catch (error) {
      console.error('Error creating goals:', error)
      return null
    }
  }

  const updateGoals = async (updates: Partial<NutritionalGoal>) => {
    try {
      console.log('updateGoals called with:', updates)
      
      // Get the current user to find their goals
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('No user')

      console.log('Updating goals for user:', user.id)

      // Find the user's active goals
      const { data: existingGoals, error: fetchError } = await supabase
        .from('nutritional_goals')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .maybeSingle()

      if (fetchError) {
        console.error('Error fetching goals for update:', fetchError)
        throw fetchError
      }
      if (!existingGoals) {
        console.error('No goals found to update')
        throw new Error('No goals found to update')
      }

      console.log('Found existing goals to update:', existingGoals.id)

      const { data, error } = await supabase
        .from('nutritional_goals')
        .update(updates)
        .eq('id', existingGoals.id)
        .select()
        .maybeSingle()

      if (error) {
        console.error('Supabase error updating goals:', error)
        throw error
      }

      console.log('Goals updated successfully:', data)
      setGoals(data)
      console.log('Goals state updated after update')
      
      return data
    } catch (error) {
      console.error('Error updating goals:', error)
      return null
    }
  }

  // Simple save function that tries update first, then create if needed
  const saveGoals = async (goalsData: Omit<NutritionalGoal, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'is_active'>) => {
    try {
      console.log('Starting saveGoals...')
      
      // First, check if there are any existing goals for this user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('No user')

      console.log('User found:', user.id)

      // Check for existing goals
      const { data: existingGoals, error: fetchError } = await supabase
        .from('nutritional_goals')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .maybeSingle()

      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error('Error fetching existing goals:', fetchError)
        throw fetchError
      }

      console.log('Existing goals:', existingGoals)

      if (existingGoals) {
        // Update existing goals
        console.log('Updating existing goals...')
        const result = await updateGoals(goalsData)
        console.log('Update result:', result)
        console.log('Goals state after update:', goals)
        return result
      } else {
        // Create new goals
        console.log('Creating new goals...')
        const result = await createGoals(goalsData)
        console.log('Create result:', result)
        console.log('Goals state after create:', goals)
        return result
      }
    } catch (error) {
      console.error('Error saving goals:', error)
      return null
    }
  }

  return { goals, loading, createGoals, updateGoals, saveGoals, refreshGoals: fetchGoals }
}
