import Geocoding from 'react-native-geocoding';

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export type GeocodingResult<T> = {
  success: true;
  data: T;
} | {
  success: false;
  error: string;
};

// Initialize geocoding - we'll use Google's service
// For production, you'd want to set up a Google API key
// For MVP, we can use the built-in service or a free alternative

/**
 * Convert an address to latitude/longitude coordinates
 */
export async function geocodeAddress(address: string): Promise<GeocodingResult<Coordinates>> {
  try {
    // For MVP, let's use a simple approach with fetch to a free geocoding service
    // Using Nominatim (OpenStreetMap) which is free and doesn't require API key
    
    // Improve search query for US zip codes
    let searchQuery = address.trim();
    
    // If it looks like a US zip code (5 digits or 5+4 format), be more specific
    const zipCodePattern = /^\d{5}(-?\d{4})?$/;
    if (zipCodePattern.test(searchQuery)) {
      searchQuery = `${searchQuery}, United States`;
      console.log(`🇺🇸 Searching for US zip code: ${searchQuery}`);
    }
    
    const encodedAddress = encodeURIComponent(searchQuery);
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodedAddress}&limit=1&countrycodes=us`;
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'HomeKeeper-App' // Required by Nominatim
      }
    });
    
    if (!response.ok) {
      return {
        success: false,
        error: 'Failed to connect to geocoding service'
      };
    }
    
    const results = await response.json();
    
    if (!results || results.length === 0) {
      return {
        success: false,
        error: 'Address not found'
      };
    }
    
    const location = results[0];
    const coordinates: Coordinates = {
      latitude: parseFloat(location.lat),
      longitude: parseFloat(location.lon)
    };
    
    // Validate coordinates are reasonable for US (roughly between Alaska and Florida, Hawaii and Maine)
    if (isNaN(coordinates.latitude) || isNaN(coordinates.longitude) ||
        coordinates.latitude < 18 || coordinates.latitude > 72 ||
        coordinates.longitude < -180 || coordinates.longitude > -60) {
      console.warn(`⚠️ Coordinates seem outside US bounds: ${coordinates.latitude}, ${coordinates.longitude}`);
      return {
        success: false,
        error: 'Coordinates appear to be outside the United States'
      };
    }
    
    console.log(`📍 Geocoded "${address}" → ${coordinates.latitude}, ${coordinates.longitude}`);
    
    return {
      success: true,
      data: coordinates
    };
    
  } catch (error) {
    console.error('Geocoding error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown geocoding error'
    };
  }
}

/**
 * Reverse geocode coordinates to an address
 */
export async function reverseGeocode(latitude: number, longitude: number): Promise<GeocodingResult<string>> {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`;
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'HomeKeeper-App'
      }
    });
    
    if (!response.ok) {
      return {
        success: false,
        error: 'Failed to connect to geocoding service'
      };
    }
    
    const result = await response.json();
    
    if (!result || !result.display_name) {
      return {
        success: false,
        error: 'Location not found'
      };
    }
    
    return {
      success: true,
      data: result.display_name
    };
    
  } catch (error) {
    console.error('Reverse geocoding error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown reverse geocoding error'
    };
  }
}

/**
 * Get city and state from coordinates
 */
export async function getCityState(latitude: number, longitude: number): Promise<GeocodingResult<{city: string, state: string}>> {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`;
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'HomeKeeper-App'
      }
    });
    
    if (!response.ok) {
      return {
        success: false,
        error: 'Failed to connect to geocoding service'
      };
    }
    
    const result = await response.json();
    
    if (!result || !result.address) {
      return {
        success: false,
        error: 'Location details not found'
      };
    }
    
    const address = result.address;
    const city = address.city || address.town || address.village || address.hamlet || 'Unknown';
    const state = address.state || address.province || address.region || 'Unknown';
    
    return {
      success: true,
      data: { city, state }
    };
    
  } catch (error) {
    console.error('City/state lookup error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown lookup error'
    };
  }
} 