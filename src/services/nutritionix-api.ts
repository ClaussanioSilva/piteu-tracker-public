import { supabase } from '@/lib/supabase'

// Nutritionix API Configuration
const NUTRITIONIX_APP_ID = import.meta.env.VITE_NUTRITIONIX_APP_ID
const NUTRITIONIX_APP_KEY = import.meta.env.VITE_NUTRITIONIX_APP_KEY
const NUTRITIONIX_BASE_URL = 'https://trackapi.nutritionix.com/v2'

export interface NutritionixFood {
  food_name: string
  brand_name?: string
  serving_qty: number
  serving_unit: string
  serving_weight_grams: number
  nix_item_id?: string
  nix_brand_id?: string
  calories: number
  protein: number
  total_carbohydrate: number
  total_fat: number
  dietary_fiber?: number
  sugars?: number
  sodium?: number
  saturated_fat?: number
  trans_fat?: number
  cholesterol?: number
  potassium?: number
  vitamin_a?: number
  vitamin_c?: number
  vitamin_d?: number
  vitamin_e?: number
  vitamin_k?: number
  thiamin?: number
  riboflavin?: number
  niacin?: number
  vitamin_b6?: number
  vitamin_b12?: number
  folate?: number
  calcium?: number
  iron?: number
  magnesium?: number
  phosphorus?: number
  zinc?: number
}

export interface NutritionixSearchResult {
  foods: NutritionixFood[]
  total_hits: number
  max_score: number
}

export interface FoodSearchResult {
  id?: string
  name: string
  display_name: string
  brand_name?: string
  category: string
  serving_size_g: number
  calories_per_100g: number
  protein_per_100g: number
  carbs_per_100g: number
  fat_per_100g: number
  fiber_per_100g?: number
  sugar_per_100g?: number
  sodium_per_100g?: number
  source: 'api' | 'manual' | 'user_created'
  api_id?: string
}

class NutritionixAPI {
  private async makeRequest(endpoint: string, options: RequestInit = {}) {
    if (!NUTRITIONIX_APP_ID || !NUTRITIONIX_APP_KEY) {
      throw new Error('Nutritionix API credentials not configured')
    }

    const response = await fetch(`${NUTRITIONIX_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'x-app-id': NUTRITIONIX_APP_ID,
        'x-app-key': NUTRITIONIX_APP_KEY,
        ...options.headers,
      },
    })

    if (!response.ok) {
      throw new Error(`Nutritionix API error: ${response.status}`)
    }

    return response.json()
  }

  // Search for foods
  async searchFoods(query: string, brandId?: string): Promise<FoodSearchResult[]> {
    try {
      // Check cache first
      const cachedResult = await this.getFromCache(query)
      if (cachedResult) {
        return cachedResult
      }

      const searchData = {
        query,
        brand_id: brandId,
        detailed: true,
        branded: true,
        common: true,
        limit: 50
      }

      const result: NutritionixSearchResult = await this.makeRequest('/search/instant', {
        method: 'POST',
        body: JSON.stringify(searchData)
      })

      const foods = result.foods.map(food => this.mapNutritionixToFood(food))
      
      // Cache the result
      await this.cacheResult(query, foods)
      
      return foods
    } catch (error) {
      console.error('Error searching foods:', error)
      throw error
    }
  }

  // Get detailed food information
  async getFoodDetails(nixItemId: string): Promise<FoodSearchResult | null> {
    try {
      const result = await this.makeRequest('/search/item', {
        method: 'POST',
        body: JSON.stringify({ nix_item_id: nixItemId })
      })

      if (result.foods && result.foods.length > 0) {
        return this.mapNutritionixToFood(result.foods[0])
      }

      return null
    } catch (error) {
      console.error('Error getting food details:', error)
      throw error
    }
  }

  // Map Nutritionix food to our format
  private mapNutritionixToFood(food: NutritionixFood): FoodSearchResult {
    const servingWeightG = food.serving_weight_grams || 100
    const multiplier = 100 / servingWeightG

    return {
      name: food.food_name,
      display_name: food.brand_name ? `${food.brand_name} - ${food.food_name}` : food.food_name,
      brand_name: food.brand_name,
      category: this.determineCategory(food.food_name),
      serving_size_g: servingWeightG,
      calories_per_100g: Math.round(food.calories * multiplier * 100) / 100,
      protein_per_100g: Math.round(food.protein * multiplier * 100) / 100,
      carbs_per_100g: Math.round(food.total_carbohydrate * multiplier * 100) / 100,
      fat_per_100g: Math.round(food.total_fat * multiplier * 100) / 100,
      fiber_per_100g: food.dietary_fiber ? Math.round(food.dietary_fiber * multiplier * 100) / 100 : undefined,
      sugar_per_100g: food.sugars ? Math.round(food.sugars * multiplier * 100) / 100 : undefined,
      sodium_per_100g: food.sodium ? Math.round(food.sodium * multiplier * 100) / 100 : undefined,
      source: 'api',
      api_id: food.nix_item_id
    }
  }

  // Determine food category based on name
  private determineCategory(foodName: string): string {
    const name = foodName.toLowerCase()
    
    if (name.includes('café') || name.includes('cafe') || name.includes('pão') || name.includes('pao') || name.includes('cereal') || name.includes('iogurte') || name.includes('leite')) {
      return 'breakfast'
    } else if (name.includes('hambúrguer') || name.includes('hamburger') || name.includes('pizza') || name.includes('frango') || name.includes('carne') || name.includes('arroz') || name.includes('batata')) {
      return 'lunch'
    } else if (name.includes('bolo') || name.includes('doce') || name.includes('chocolate') || name.includes('gelado') || name.includes('gelado')) {
      return 'dessert'
    } else if (name.includes('água') || name.includes('agua') || name.includes('refrigerante') || name.includes('sumo') || name.includes('suco') || name.includes('cerveja') || name.includes('vinho')) {
      return 'beverage'
    } else if (name.includes('proteína') || name.includes('proteina') || name.includes('whey') || name.includes('creatina') || name.includes('vitamina')) {
      return 'supplement'
    } else {
      return 'snack'
    }
  }

  // Cache management
  private async getFromCache(query: string): Promise<FoodSearchResult[] | null> {
    try {
      const queryHash = this.hashQuery(query)
      const { data } = await supabase
        .from('api_cache')
        .select('response_data, expires_at')
        .eq('api_source', 'nutritionix')
        .eq('query_hash', queryHash)
        .single()

      if (data && new Date(data.expires_at) > new Date()) {
        return data.response_data
      }

      return null
    } catch (error) {
      return null
    }
  }

  private async cacheResult(query: string, foods: FoodSearchResult[]): Promise<void> {
    try {
      const queryHash = this.hashQuery(query)
      const expiresAt = new Date()
      expiresAt.setHours(expiresAt.getHours() + 24) // Cache for 24 hours

      await supabase
        .from('api_cache')
        .upsert({
          api_source: 'nutritionix',
          query_hash: queryHash,
          response_data: foods,
          expires_at: expiresAt.toISOString()
        })
    } catch (error) {
      console.error('Error caching result:', error)
    }
  }

  private hashQuery(query: string): string {
    // Simple hash function for query
    let hash = 0
    for (let i = 0; i < query.length; i++) {
      const char = query.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32-bit integer
    }
    return hash.toString()
  }

  // Get popular brands
  async getPopularBrands(): Promise<string[]> {
    return [
      'McDonald\'s',
      'Burger King',
      'KFC',
      'Pizza Hut',
      'Domino\'s',
      'Subway',
      'Prozis',
      'MyProtein',
      'Continente',
      'Pingo Doce',
      'Lidl'
    ]
  }

  // Search foods by brand
  async searchFoodsByBrand(brandName: string, query?: string): Promise<FoodSearchResult[]> {
    const searchQuery = query ? `${brandName} ${query}` : brandName
    return this.searchFoods(searchQuery)
  }
}

export const nutritionixAPI = new NutritionixAPI()
