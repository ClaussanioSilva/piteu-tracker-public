import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import { useFoodLogs, useNutritionalGoals } from '@/hooks/use-supabase'
import { supabase } from '@/lib/supabase'
import type { Database } from '@/lib/supabase'
import { useToast } from '@/hooks/use-toast'

// Types from Supabase
type FoodLog = Database['public']['Tables']['food_logs']['Row']
type NutritionalGoal = Database['public']['Tables']['nutritional_goals']['Row']

interface NutritionContextType {
  dailyGoals: {
    calories: { current: number; target: number }
    protein: { current: number; target: number }
    carbs: { current: number; target: number }
    fat: { current: number; target: number }
  }
  foodLogs: FoodLog[]
  loading: boolean
  addFoodLog: (log: Omit<FoodLog, 'id' | 'created_at' | 'log_date' | 'user_id'>) => Promise<FoodLog | null>
  removeFoodLog: (id: string) => Promise<void>
  getTodayEntries: () => FoodLog[]
  getEntriesByDate: (date: string) => FoodLog[]
  getNutritionByDate: (date: string) => {
    calories: { current: number; target: number }
    protein: { current: number; target: number }
    carbs: { current: number; target: number }
    fat: { current: number; target: number }
  }
  refreshData: () => Promise<void>
  forceDailyReset: () => void
  clearDateCache: () => void
  debugFoodLogs: () => void
  fixDateFormats: () => Promise<void>
  forceRecreateLogs: () => Promise<void>
}

const NutritionContext = createContext<NutritionContextType | undefined>(undefined)

export const useNutrition = () => {
  const context = useContext(NutritionContext)
  if (!context) {
    throw new Error('useNutrition must be used within a NutritionProvider')
  }
  return context
}

interface NutritionProviderProps {
  children: ReactNode
}

export const NutritionProvider: React.FC<NutritionProviderProps> = ({ children }) => {
  console.log('NutritionProvider initialized')
  
  // Supabase hooks
  const { foodLogs, loading: foodLogsLoading, addFoodLog: addFoodLogHook, deleteFoodLog, fetchFoodLogs } = useFoodLogs()
  const { goals: nutritionalGoals, loading: goalsLoading, refreshGoals } = useNutritionalGoals()
  const { toast } = useToast()
  
  console.log('NutritionProvider hooks loaded:', { nutritionalGoals, goalsLoading, foodLogs, foodLogsLoading })

  // State for daily goals
  const [dailyGoals, setDailyGoals] = useState<NutritionalGoal | null>(null)

  // Calculate daily goals from nutritional goals
  useEffect(() => {
    console.log('Nutrition context: nutritionalGoals changed:', nutritionalGoals)
    console.log('Nutrition context: current dailyGoals state:', dailyGoals)
    if (nutritionalGoals) {
      setDailyGoals(nutritionalGoals)
      console.log('Nutrition context: dailyGoals updated to:', nutritionalGoals)
    } else {
      setDailyGoals(null)
      console.log('Nutrition context: dailyGoals set to null')
    }
  }, [nutritionalGoals]) // eslint-disable-line react-hooks/exhaustive-deps

  // Calculate current nutrition based on food logs
  const calculateCurrentNutrition = useCallback((logs: FoodLog[]) => {
    console.log('calculateCurrentNutrition called with logs:', logs)
    console.log('calculateCurrentNutrition dailyGoals:', dailyGoals)
    
    if (!dailyGoals) {
      console.log('No dailyGoals, returning zero values')
      return { calories: { current: 0, target: 0 }, protein: { current: 0, target: 0 }, carbs: { current: 0, target: 0 }, fat: { current: 0, target: 0 } }
    }

    const today = new Date()
    // Use local timezone to get correct date - ensure consistent format
    const todayString = today.toLocaleDateString('en-CA') // Returns YYYY-MM-DD in local timezone
    console.log('Today string (local):', todayString)
    console.log('Current time:', today.toISOString())
    
    const todayLogs = logs.filter(log => {
      const logDateString = log.log_date
      console.log('Comparing log date:', logDateString, 'with today:', todayString)
      console.log('Log created_at:', log.created_at)
      return logDateString === todayString
    })

    console.log('Today logs:', todayLogs)

    const totals = todayLogs.reduce((acc, log) => {
      console.log('Processing log for totals:', log)
      console.log('Log calories:', log.calories, 'protein:', log.protein_g, 'carbs:', log.carbs_g, 'fat:', log.fat_g)
      acc.calories += log.calories || 0
      acc.protein += log.protein_g || 0
      acc.carbs += log.carbs_g || 0
      acc.fat += log.fat_g || 0
      console.log('Running totals:', acc)
      return acc
    }, { calories: 0, protein: 0, carbs: 0, fat: 0 })

    console.log('Final calculated totals:', totals)

    const result = {
      calories: { current: Math.round(totals.calories), target: dailyGoals.daily_calories },
      protein: { current: Math.round(totals.protein * 100) / 100, target: dailyGoals.daily_protein_g },
      carbs: { current: Math.round(totals.carbs * 100) / 100, target: dailyGoals.daily_carbs_g },
      fat: { current: Math.round(totals.fat * 100) / 100, target: dailyGoals.daily_fat_g }
    }

    console.log('Final calculated nutrition:', result)
    return result
  }, [dailyGoals])

  const [currentNutrition, setCurrentNutrition] = useState(calculateCurrentNutrition(foodLogs || []))

  // Update current nutrition whenever food logs or goals change
  useEffect(() => {
    setCurrentNutrition(calculateCurrentNutrition(foodLogs || []))
  }, [foodLogs, calculateCurrentNutrition])

  // Refresh data (e.g., when user logs out/in)
  const refreshData = useCallback(async () => {
    try {
      console.log('refreshData called - starting...')
      await fetchFoodLogs()
      console.log('fetchFoodLogs completed')
      // Always refresh goals to ensure we have the latest data
      await refreshGoals()
      console.log('refreshGoals completed')
      console.log('refreshData completed successfully')
    } catch (error) {
      console.error('Error refreshing nutrition data:', error)
    }
  }, [fetchFoodLogs, refreshGoals])

  // Force refresh when date changes (at midnight) - Daily reset functionality
  useEffect(() => {
    const checkDateChange = () => {
      const now = new Date()
      // Use local timezone to get correct date
      const currentDate = now.toLocaleDateString('en-CA') // Returns YYYY-MM-DD in local timezone
      const lastCheck = localStorage.getItem('lastNutritionCheck')
      
      console.log('🕐 Checking date change...', 'last:', lastCheck, 'current:', currentDate)
      console.log('Current time:', now.toISOString())
      
      if (lastCheck !== currentDate) {
        console.log('🔄 New day detected! Resetting nutrition data...', 'last:', lastCheck, 'current:', currentDate)
        localStorage.setItem('lastNutritionCheck', currentDate)
        
        // Clear any cached data
        localStorage.removeItem('nutritionCache')
        
        // Force refresh of all data to get the new day's logs
        refreshData()
        
        // Show notification to user about new day
        console.log('✅ Daily reset completed - macros have been reset for the new day')
        
        // Show toast notification to user
        toast({
          title: "Bom dia! 🌅",
          description: "Seus macros foram resetados para o novo dia!",
          duration: 5000
        })
      }
    }

    // Check immediately on component mount
    checkDateChange()

    // Set up interval to check every 30 seconds for date changes (more frequent)
    const interval = setInterval(checkDateChange, 30000)

    return () => clearInterval(interval)
  }, [refreshData, toast])

  // Handle adding food log - Always saves to current date
  const handleAddFoodLog = async (log: Omit<FoodLog, 'id' | 'created_at' | 'log_date' | 'user_id'>) => {
    try {
      console.log('🍽️ Adding food log:', log)
      
      // Always use today's date for new logs - ensures daily reset functionality
      const today = new Date()
      const todayString = today.toLocaleDateString('en-CA') // Returns YYYY-MM-DD in local timezone
      const logWithDate = {
        ...log,
        log_date: todayString
      }
      console.log('📅 Log with today\'s date (local):', logWithDate)
      console.log('Current time:', today.toISOString())
      
      const result = await addFoodLogHook(logWithDate)
      console.log('✅ addFoodLogHook result:', result)
      
      if (result) {
        console.log('💾 Food log saved to Supabase successfully, refreshing data...')
        // Force refresh of all food logs to ensure we have the latest data
        await fetchFoodLogs()
        console.log('🔄 Food logs refreshed after adding, current foodLogs count:', foodLogs?.length || 0)
        return result
      }
      return null
    } catch (err) {
      console.error('❌ Error adding food log:', err)
      return null
    }
  }

  // Handle removing food log
  const handleRemoveFoodLog = async (id: string) => {
    try {
      await deleteFoodLog(id)
      await fetchFoodLogs()
    } catch (err) {
      console.error('Error removing food log:', err)
    }
  }

  // Get today's entries
  const getTodayEntries = () => {
    const today = new Date()
    const todayString = today.toLocaleDateString('en-CA') // Returns YYYY-MM-DD in local timezone
    console.log('getTodayEntries called, today (local):', todayString)
    console.log('getTodayEntries foodLogs:', foodLogs)
    console.log('Current time:', today.toISOString())
    
    const filteredLogs = foodLogs?.filter(log => {
      const logDateString = log.log_date
      console.log('Comparing log date:', logDateString, 'with today:', todayString)
      console.log('Log created_at:', log.created_at)
      return logDateString === todayString
    }) || []
    
    console.log('getTodayEntries filtered logs:', filteredLogs)
    return filteredLogs
  }

  // Get entries for a specific date (for historical data)
  const getEntriesByDate = (date: string) => {
    console.log('getEntriesByDate called with date:', date)
    console.log('getEntriesByDate foodLogs:', foodLogs)
    
    const filteredLogs = foodLogs?.filter(log => {
      const logDateString = log.log_date
      console.log('Comparing log date:', logDateString, 'with target date:', date)
      console.log('Log created_at:', log.created_at)
      return logDateString === date
    }) || []
    
    console.log('getEntriesByDate filtered logs:', filteredLogs)
    return filteredLogs
  }

  // Calculate nutrition for a specific date (for historical data)
  const getNutritionByDate = (date: string) => {
    console.log('getNutritionByDate called with date:', date)
    console.log('getNutritionByDate dailyGoals:', dailyGoals)
    
    if (!dailyGoals) {
      console.log('No dailyGoals, returning zero values for date:', date)
      return { calories: { current: 0, target: 0 }, protein: { current: 0, target: 0 }, carbs: { current: 0, target: 0 }, fat: { current: 0, target: 0 } }
    }

    const logsForDate = getEntriesByDate(date)
    console.log('Logs for date', date, ':', logsForDate)
    console.log('Current time for comparison:', new Date().toISOString())

    const totals = logsForDate.reduce((acc, log) => {
      console.log('Processing log for totals:', log)
      console.log('Log calories:', log.calories, 'protein:', log.protein_g, 'carbs:', log.carbs_g, 'fat:', log.fat_g)
      acc.calories += log.calories || 0
      acc.protein += log.protein_g || 0
      acc.carbs += log.carbs_g || 0
      acc.fat += log.fat_g || 0
      console.log('Running totals:', acc)
      return acc
    }, { calories: 0, protein: 0, carbs: 0, fat: 0 })

    console.log('Final calculated totals for date', date, ':', totals)

    const result = {
      calories: { current: Math.round(totals.calories), target: dailyGoals.daily_calories },
      protein: { current: Math.round(totals.protein * 100) / 100, target: dailyGoals.daily_protein_g },
      carbs: { current: Math.round(totals.carbs * 100) / 100, target: dailyGoals.daily_carbs_g },
      fat: { current: Math.round(totals.fat * 100) / 100, target: dailyGoals.daily_fat_g }
    }

    console.log('Final calculated nutrition for date', date, ':', result)
    return result
  }

  // Force daily reset manually (useful for testing)
  const forceDailyReset = () => {
    console.log('🔄 Force daily reset triggered')
    const now = new Date()
    const currentDate = now.toLocaleDateString('en-CA') // Returns YYYY-MM-DD in local timezone
    console.log('Force reset - current date:', currentDate)
    console.log('Force reset - current time:', now.toISOString())
    localStorage.setItem('lastNutritionCheck', currentDate)
    localStorage.removeItem('nutritionCache')
    refreshData()
    toast({
      title: "Reset Manual 🔄",
      description: "Macros resetados manualmente!",
      duration: 3000
    })
  }

  // Clear all date-related localStorage and force refresh
  const clearDateCache = () => {
    console.log('🧹 Clearing all date cache')
    localStorage.removeItem('lastNutritionCheck')
    localStorage.removeItem('nutritionCache')
    refreshData()
    toast({
      title: "Cache Limpo 🧹",
      description: "Cache de datas limpo! Recarregando dados...",
      duration: 3000
    })
  }

  // Debug function to check all food logs and their dates
  const debugFoodLogs = () => {
    console.log('🔍 DEBUG: All food logs with dates:')
    if (foodLogs && foodLogs.length > 0) {
      foodLogs.forEach((log, index) => {
        console.log(`Log ${index + 1}:`, {
          id: log.id,
          log_date: log.log_date,
          item_name: log.item_name,
          created_at: log.created_at,
          calories: log.calories,
          protein_g: log.protein_g,
          carbs_g: log.carbs_g,
          fat_g: log.fat_g
        })
      })
    } else {
      console.log('No food logs found')
    }
    
    const today = new Date()
    const todayString = today.toLocaleDateString('en-CA')
    console.log('Today string (local):', todayString)
    console.log('Current time:', today.toISOString())
    
    const todayLogs = foodLogs?.filter(log => log.log_date === todayString) || []
    console.log('Today logs count:', todayLogs.length)
    console.log('Today logs details:', todayLogs)
    
    // Show nutrition totals for today
    const todayTotals = todayLogs.reduce((acc, log) => {
      acc.calories += log.calories || 0
      acc.protein += log.protein_g || 0
      acc.carbs += log.carbs_g || 0
      acc.fat += log.fat_g || 0
      return acc
    }, { calories: 0, protein: 0, carbs: 0, fat: 0 })
    
    console.log('Today nutrition totals:', todayTotals)
    
    toast({
      title: "Debug Concluído 🔍",
      description: `Encontrados ${foodLogs?.length || 0} logs total, ${todayLogs.length} de hoje`,
      duration: 3000
    })
  }

  // Fix date format for existing logs (migration function)
  const fixDateFormats = async () => {
    try {
      console.log('🔧 Starting date format migration...')
      
      if (!foodLogs || foodLogs.length === 0) {
        toast({
          title: "Nada para corrigir",
          description: "Não há logs para migrar",
          duration: 3000
        })
        return
      }

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast({
          title: "Erro",
          description: "Usuário não autenticado",
          variant: "destructive"
        })
        return
      }

      let fixedCount = 0
      const promises = foodLogs.map(async (log) => {
        // Check if date needs fixing (if it's in wrong format)
        const logDate = new Date(log.created_at)
        const correctDate = logDate.toLocaleDateString('en-CA')
        
        console.log(`Checking log ${log.id}:`)
        console.log(`  created_at: ${log.created_at}`)
        console.log(`  log_date: ${log.log_date}`)
        console.log(`  correct_date: ${correctDate}`)
        console.log(`  needs_fix: ${log.log_date !== correctDate}`)
        console.log(`  logDate.toISOString(): ${logDate.toISOString()}`)
        
        if (log.log_date !== correctDate) {
          console.log(`🔧 Fixing log ${log.id}: ${log.log_date} -> ${correctDate}`)
          
          const { error } = await supabase
            .from('food_logs')
            .update({ log_date: correctDate })
            .eq('id', log.id)
          
          if (!error) {
            fixedCount++
            console.log(`✅ Fixed log ${log.id}`)
          } else {
            console.error('❌ Error updating log:', error)
          }
        } else {
          console.log(`✅ Log ${log.id} already correct`)
        }
      })

      await Promise.all(promises)
      
      console.log(`✅ Migration complete: ${fixedCount} logs fixed`)
      
      // Refresh data to show updated logs
      await refreshData()
      
      toast({
        title: "Migração Concluída ✅",
        description: `${fixedCount} logs foram corrigidos!`,
        duration: 5000
      })
      
    } catch (error) {
      console.error('Error during migration:', error)
      toast({
        title: "Erro na Migração",
        description: "Erro ao corrigir datas dos logs",
        variant: "destructive"
      })
    }
  }

  // Force recreate all logs with correct dates
  const forceRecreateLogs = async () => {
    try {
      console.log('🔄 Starting force recreate logs...')
      
      if (!foodLogs || foodLogs.length === 0) {
        toast({
          title: "Nada para recriar",
          description: "Não há logs para recriar",
          duration: 3000
        })
        return
      }

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast({
          title: "Erro",
          description: "Usuário não autenticado",
          variant: "destructive"
        })
        return
      }

      let recreatedCount = 0
      const promises = foodLogs.map(async (log) => {
        // Calculate correct date from created_at
        const logDate = new Date(log.created_at)
        const correctDate = logDate.toLocaleDateString('en-CA')
        
        console.log(`Recreating log ${log.id}:`)
        console.log(`  created_at: ${log.created_at}`)
        console.log(`  old log_date: ${log.log_date}`)
        console.log(`  new log_date: ${correctDate}`)
        console.log(`  logDate.toISOString(): ${logDate.toISOString()}`)
        
        // Update the log with correct date
        const { error } = await supabase
          .from('food_logs')
          .update({ log_date: correctDate })
          .eq('id', log.id)
        
        if (!error) {
          recreatedCount++
          console.log(`✅ Recreated log ${log.id}`)
        } else {
          console.error('❌ Error recreating log:', error)
        }
      })

      await Promise.all(promises)
      
      console.log(`✅ Force recreate complete: ${recreatedCount} logs recreated`)
      
      // Refresh data to show updated logs
      await refreshData()
      
      toast({
        title: "Recriação Concluída ✅",
        description: `${recreatedCount} logs foram recriados!`,
        duration: 5000
      })
      
    } catch (error) {
      console.error('Error during force recreate:', error)
      toast({
        title: "Erro na Recriação",
        description: "Erro ao recriar logs",
        variant: "destructive"
      })
    }
  }

  const value: NutritionContextType = {
    dailyGoals: currentNutrition,
    foodLogs: foodLogs || [],
    loading: foodLogsLoading || goalsLoading,
    addFoodLog: handleAddFoodLog,
    removeFoodLog: handleRemoveFoodLog,
    getTodayEntries,
    getEntriesByDate,
    getNutritionByDate,
    refreshData,
    forceDailyReset,
    clearDateCache,
    debugFoodLogs,
    fixDateFormats,
    forceRecreateLogs
  }

  return (
    <NutritionContext.Provider value={value}>
      {children}
    </NutritionContext.Provider>
  )
}
