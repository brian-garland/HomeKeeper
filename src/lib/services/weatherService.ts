// Weather service for intelligent task scheduling
// Uses OpenWeatherMap API for weather data and forecasts

export interface WeatherData {
  temperature: number
  humidity: number
  windSpeed: number
  description: string
  icon: string
  rainProbability: number
  isOutdoorFriendly: boolean
}

export interface WeatherForecast {
  date: string
  weather: WeatherData
  isGoodForOutdoorTasks: boolean
  taskRecommendations: string[]
}

export type WeatherResult<T> = {
  success: true
  data: T
} | {
  success: false
  error: string
}

// Mock weather data for development
const MOCK_WEATHER_DATA: WeatherData = {
  temperature: 72,
  humidity: 45,
  windSpeed: 8,
  description: 'Partly cloudy',
  icon: 'partly-cloudy',
  rainProbability: 15,
  isOutdoorFriendly: true
}

const MOCK_FORECAST: WeatherForecast[] = [
  {
    date: new Date().toISOString().split('T')[0],
    weather: MOCK_WEATHER_DATA,
    isGoodForOutdoorTasks: true,
    taskRecommendations: ['Gutter cleaning', 'Exterior maintenance', 'Lawn care']
  },
  {
    date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    weather: { ...MOCK_WEATHER_DATA, rainProbability: 75, isOutdoorFriendly: false },
    isGoodForOutdoorTasks: false,
    taskRecommendations: ['Indoor maintenance', 'HVAC filter change', 'Interior cleaning']
  },
  {
    date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    weather: { ...MOCK_WEATHER_DATA, temperature: 68, rainProbability: 5 },
    isGoodForOutdoorTasks: true,
    taskRecommendations: ['Roof inspection', 'Exterior painting', 'Garden maintenance']
  }
]

/**
 * Get current weather for a location
 */
export async function getCurrentWeather(
  latitude?: number,
  longitude?: number
): Promise<WeatherResult<WeatherData>> {
  try {
    // Use real weather data if coordinates are provided and API key exists
    // Otherwise fall back to mock data
    const shouldUseMockData = !latitude || !longitude || !process.env.EXPO_PUBLIC_OPENWEATHER_API_KEY;
    
    if (shouldUseMockData) {
      console.log('🌤️ Using mock weather data (no coordinates or API key)');
      return {
        success: true,
        data: MOCK_WEATHER_DATA
      }
    }
    
    console.log(`🌤️ Fetching real weather for coordinates: ${latitude}, ${longitude}`);

    // Production weather API call would go here
    const apiKey = process.env.EXPO_PUBLIC_OPENWEATHER_API_KEY
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=imperial`
    
    const response = await fetch(url)
    const data = await response.json()

    if (!response.ok) {
      return {
        success: false,
        error: data.message || 'Failed to fetch weather data'
      }
    }

    const weatherData: WeatherData = {
      temperature: Math.round(data.main.temp),
      humidity: data.main.humidity,
      windSpeed: Math.round(data.wind.speed),
      description: data.weather[0].description,
      icon: data.weather[0].icon,
      rainProbability: data.rain ? 80 : 20, // Simplified rain probability
      isOutdoorFriendly: isWeatherOutdoorFriendly(data)
    }

    return {
      success: true,
      data: weatherData
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown weather error'
    }
  }
}

/**
 * Get weather forecast for the next 5 days
 */
export async function getWeatherForecast(
  latitude?: number,
  longitude?: number
): Promise<WeatherResult<WeatherForecast[]>> {
  try {
    // Use real weather data if coordinates are provided and API key exists
    const shouldUseMockData = !latitude || !longitude || !process.env.EXPO_PUBLIC_OPENWEATHER_API_KEY;
    
    if (shouldUseMockData) {
      console.log('🌤️ Using mock forecast data (no coordinates or API key)');
      return {
        success: true,
        data: MOCK_FORECAST
      }
    }
    
    console.log(`🌤️ Fetching real weather forecast for coordinates: ${latitude}, ${longitude}`);

    // Production forecast API call would go here
    const apiKey = process.env.EXPO_PUBLIC_OPENWEATHER_API_KEY
    const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=imperial`
    
    const response = await fetch(url)
    const data = await response.json()

    if (!response.ok) {
      return {
        success: false,
        error: data.message || 'Failed to fetch weather forecast'
      }
    }

    // Process forecast data (OpenWeatherMap returns 5-day forecast with 3-hour intervals)
    const dailyForecasts: WeatherForecast[] = []
    const processedDates = new Set<string>()

    for (const item of data.list) {
      const date = new Date(item.dt * 1000).toISOString().split('T')[0]
      
      if (!processedDates.has(date) && dailyForecasts.length < 5) {
        const weather: WeatherData = {
          temperature: Math.round(item.main.temp),
          humidity: item.main.humidity,
          windSpeed: Math.round(item.wind.speed),
          description: item.weather[0].description,
          icon: item.weather[0].icon,
          rainProbability: item.pop * 100, // Probability of precipitation
          isOutdoorFriendly: isWeatherOutdoorFriendly(item)
        }

        dailyForecasts.push({
          date,
          weather,
          isGoodForOutdoorTasks: weather.isOutdoorFriendly,
          taskRecommendations: getTaskRecommendationsForWeather(weather)
        })

        processedDates.add(date)
      }
    }

    return {
      success: true,
      data: dailyForecasts
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown forecast error'
    }
  }
}

/**
 * Determine if weather conditions are suitable for outdoor tasks
 */
function isWeatherOutdoorFriendly(weatherData: any): boolean {
  const temp = weatherData.main.temp
  const windSpeed = weatherData.wind?.speed || 0
  const rainProbability = weatherData.pop ? weatherData.pop * 100 : 0
  const weatherMain = weatherData.weather[0].main.toLowerCase()

  // Ideal conditions for outdoor work
  const tempOk = temp >= 45 && temp <= 85 // 45-85°F
  const windOk = windSpeed < 20 // Less than 20 mph
  const rainOk = rainProbability < 30 // Less than 30% chance of rain
  const conditionsOk = !['thunderstorm', 'snow', 'extreme'].includes(weatherMain)

  return tempOk && windOk && rainOk && conditionsOk
}

/**
 * Get task recommendations based on weather conditions
 */
function getTaskRecommendationsForWeather(weather: WeatherData): string[] {
  const recommendations: string[] = []

  if (weather.isOutdoorFriendly) {
    recommendations.push('Gutter cleaning', 'Exterior maintenance', 'Roof inspection')
    
    if (weather.temperature > 60) {
      recommendations.push('Exterior painting', 'Deck maintenance', 'Garden work')
    }
    
    if (weather.windSpeed < 10) {
      recommendations.push('Window cleaning', 'Pressure washing')
    }
  } else {
    recommendations.push('Indoor maintenance', 'HVAC filter change', 'Interior cleaning')
    
    if (weather.rainProbability > 50) {
      recommendations.push('Check for leaks', 'Indoor air quality tasks', 'Basement inspection')
    }
    
    if (weather.temperature < 50) {
      recommendations.push('Heating system check', 'Insulation inspection', 'Weatherproofing')
    }
  }

  return recommendations
}

/**
 * Get the best days for outdoor tasks in the next week
 */
export async function getBestOutdoorTaskDays(
  latitude?: number,
  longitude?: number
): Promise<WeatherResult<string[]>> {
  const forecastResult = await getWeatherForecast(latitude, longitude)
  
  if (!forecastResult.success) {
    return forecastResult
  }

  const bestDays = forecastResult.data
    .filter(day => day.isGoodForOutdoorTasks)
    .map(day => day.date)
    .slice(0, 3) // Return top 3 best days

  return {
    success: true,
    data: bestDays
  } as WeatherResult<string[]>
}

/**
 * Check if a specific date is good for outdoor tasks
 */
export async function isGoodDayForOutdoorTasks(
  date: string,
  latitude?: number,
  longitude?: number
): Promise<WeatherResult<boolean>> {
  const forecastResult = await getWeatherForecast(latitude, longitude)
  
  if (!forecastResult.success) {
    return forecastResult
  }

  const dayForecast = forecastResult.data.find(day => day.date === date)
  
  return {
    success: true,
    data: dayForecast?.isGoodForOutdoorTasks || false
  } as WeatherResult<boolean>
}

/**
 * Get weather-based task scheduling recommendations
 */
export async function getWeatherTaskRecommendations(
  latitude?: number,
  longitude?: number
): Promise<WeatherResult<{
  today: string[]
  thisWeek: string[]
  avoid: string[]
}>> {
  const forecastResult = await getWeatherForecast(latitude, longitude)
  
  if (!forecastResult.success) {
    return forecastResult
  }

  const today = forecastResult.data[0]
  const thisWeek = forecastResult.data.slice(1)

  const todayRecommendations = today?.taskRecommendations || []
  const weekRecommendations = thisWeek
    .filter(day => day.isGoodForOutdoorTasks)
    .flatMap(day => day.taskRecommendations)
    .filter((task, index, array) => array.indexOf(task) === index) // Remove duplicates

  const avoidRecommendations = thisWeek
    .filter(day => !day.isGoodForOutdoorTasks)
    .flatMap(day => ['Exterior painting', 'Roof work', 'Gutter cleaning'])
    .filter((task, index, array) => array.indexOf(task) === index)

  return {
    success: true,
    data: {
      today: todayRecommendations,
      thisWeek: weekRecommendations,
      avoid: avoidRecommendations
    }
  }
} 