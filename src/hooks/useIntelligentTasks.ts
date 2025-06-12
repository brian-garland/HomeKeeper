import { useState, useEffect, useCallback } from 'react'
import { Tables } from '../types/database.types'
import { generateIntelligentTasks, generateTasksForCategory, TaskGenerationOptions, TaskGenerationResult } from '../lib/services/taskGenerationService'
import { getCurrentWeather, getWeatherTaskRecommendations, WeatherData } from '../lib/services/weatherService'
import { getHomeTasks } from '../lib/models/tasks'

type Task = Tables<'tasks'>
type Home = Tables<'homes'>

export interface IntelligentTasksState {
  tasks: Task[]
  generatedTasks: Task[]
  weather: WeatherData | null
  weatherRecommendations: {
    today: string[]
    thisWeek: string[]
    avoid: string[]
  } | null
  isGenerating: boolean
  isLoading: boolean
  error: string | null
  lastGenerated: Date | null
}

export interface UseIntelligentTasksReturn {
  state: IntelligentTasksState
  actions: {
    generateTasks: (homeId: string, options?: TaskGenerationOptions) => Promise<TaskGenerationResult>
    generateCategoryTasks: (homeId: string, category: string, maxTasks?: number) => Promise<TaskGenerationResult>
    refreshTasks: (homeId: string) => Promise<void>
    refreshWeather: (latitude?: number, longitude?: number) => Promise<void>
    clearError: () => void
  }
}

/**
 * Hook for intelligent task generation and management
 */
export function useIntelligentTasks(): UseIntelligentTasksReturn {
  const [state, setState] = useState<IntelligentTasksState>({
    tasks: [],
    generatedTasks: [],
    weather: null,
    weatherRecommendations: null,
    isGenerating: false,
    isLoading: false,
    error: null,
    lastGenerated: null
  })

  /**
   * Generate intelligent tasks for a home
   */
  const generateTasks = useCallback(async (
    homeId: string, 
    options?: TaskGenerationOptions
  ): Promise<TaskGenerationResult> => {
    setState(prev => ({ ...prev, isGenerating: true, error: null }))

    try {
      const result = await generateIntelligentTasks(homeId, options)
      
      if (result.success) {
        setState(prev => ({
          ...prev,
          generatedTasks: result.tasks,
          lastGenerated: new Date(),
          isGenerating: false
        }))
      } else {
        setState(prev => ({
          ...prev,
          error: result.error || 'Failed to generate tasks',
          isGenerating: false
        }))
      }

      return result
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      setState(prev => ({
        ...prev,
        error: errorMessage,
        isGenerating: false
      }))

      return {
        success: false,
        tasksGenerated: 0,
        tasks: [],
        error: errorMessage
      }
    }
  }, [])

  /**
   * Generate tasks for a specific category
   */
  const generateCategoryTasks = useCallback(async (
    homeId: string,
    category: string,
    maxTasks: number = 3
  ): Promise<TaskGenerationResult> => {
    setState(prev => ({ ...prev, isGenerating: true, error: null }))

    try {
      const result = await generateTasksForCategory(homeId, category, maxTasks)
      
      if (result.success) {
        setState(prev => ({
          ...prev,
          generatedTasks: [...prev.generatedTasks, ...result.tasks],
          lastGenerated: new Date(),
          isGenerating: false
        }))
      } else {
        setState(prev => ({
          ...prev,
          error: result.error || 'Failed to generate category tasks',
          isGenerating: false
        }))
      }

      return result
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      setState(prev => ({
        ...prev,
        error: errorMessage,
        isGenerating: false
      }))

      return {
        success: false,
        tasksGenerated: 0,
        tasks: [],
        error: errorMessage
      }
    }
  }, [])

  /**
   * Refresh all tasks for a home
   */
  const refreshTasks = useCallback(async (homeId: string): Promise<void> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }))

    try {
      const result = await getHomeTasks(homeId)
      
      if (result.success) {
        setState(prev => ({
          ...prev,
          tasks: result.data,
          isLoading: false
        }))
      } else {
        setState(prev => ({
          ...prev,
          error: result.error,
          isLoading: false
        }))
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to refresh tasks',
        isLoading: false
      }))
    }
  }, [])

  /**
   * Refresh weather data and recommendations
   */
  const refreshWeather = useCallback(async (
    latitude?: number,
    longitude?: number
  ): Promise<void> => {
    try {
      // Get current weather
      const weatherResult = await getCurrentWeather(latitude, longitude)
      
      if (weatherResult.success) {
        setState(prev => ({ ...prev, weather: weatherResult.data }))
      }

      // Get weather-based task recommendations
      const recommendationsResult = await getWeatherTaskRecommendations(latitude, longitude)
      
      if (recommendationsResult.success) {
        setState(prev => ({ 
          ...prev, 
          weatherRecommendations: recommendationsResult.data 
        }))
      }
    } catch (error) {
      console.warn('Failed to refresh weather data:', error)
      // Don't set error state for weather failures as it's not critical
    }
  }, [])

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }))
  }, [])

  return {
    state,
    actions: {
      generateTasks,
      generateCategoryTasks,
      refreshTasks,
      refreshWeather,
      clearError
    }
  }
}

/**
 * Hook for automatic task generation based on home data
 */
export function useAutoTaskGeneration(
  home: Home | null,
  options: TaskGenerationOptions & { autoGenerate?: boolean } = {}
) {
  const { state, actions } = useIntelligentTasks()
  const { autoGenerate = false, ...generationOptions } = options

  useEffect(() => {
    if (!home || !autoGenerate) return

    // Auto-generate tasks when home data is available
    const generateInitialTasks = async () => {
      await actions.generateTasks(home.id, generationOptions)
      await actions.refreshTasks(home.id)
      
      // Refresh weather if location is available
      if (home.latitude && home.longitude) {
        await actions.refreshWeather(home.latitude, home.longitude)
      }
    }

    generateInitialTasks()
  }, [home?.id, autoGenerate])

  return {
    ...state,
    actions
  }
}

/**
 * Hook for weather-optimized task scheduling
 */
export function useWeatherOptimizedTasks(
  latitude?: number,
  longitude?: number
) {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null)
  const [recommendations, setRecommendations] = useState<{
    today: string[]
    thisWeek: string[]
    avoid: string[]
  } | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const refreshWeatherData = useCallback(async () => {
    if (!latitude || !longitude) return

    setIsLoading(true)
    try {
      const [weatherResult, recommendationsResult] = await Promise.all([
        getCurrentWeather(latitude, longitude),
        getWeatherTaskRecommendations(latitude, longitude)
      ])

      if (weatherResult.success) {
        setWeatherData(weatherResult.data)
      }

      if (recommendationsResult.success) {
        setRecommendations(recommendationsResult.data)
      }
    } catch (error) {
      console.warn('Failed to fetch weather data:', error)
    } finally {
      setIsLoading(false)
    }
  }, [latitude, longitude])

  useEffect(() => {
    refreshWeatherData()
  }, [refreshWeatherData])

  return {
    weather: weatherData,
    recommendations,
    isLoading,
    refresh: refreshWeatherData
  }
} 