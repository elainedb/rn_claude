import AsyncStorage from '@react-native-async-storage/async-storage';
import { VideoData } from './youtubeApi';

interface CachedData {
  videos: VideoData[];
  timestamp: number;
}

const CACHE_KEY = 'youtube_videos_cache';
const CACHE_EXPIRATION_TIME = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

export const cacheService = {
  // Save videos to cache with timestamp
  saveToCache: async (videos: VideoData[]): Promise<void> => {
    try {
      const cacheData: CachedData = {
        videos,
        timestamp: Date.now(),
      };

      await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
      console.log(`[Cache] Saved ${videos.length} videos to cache`);
    } catch (error) {
      console.error('[Cache] Error saving to cache:', error);
    }
  },

  // Get videos from cache if not expired
  getFromCache: async (): Promise<VideoData[] | null> => {
    try {
      const cachedDataString = await AsyncStorage.getItem(CACHE_KEY);

      if (!cachedDataString) {
        console.log('[Cache] No cached data found');
        return null;
      }

      const cachedData: CachedData = JSON.parse(cachedDataString);
      const currentTime = Date.now();
      const cacheAge = currentTime - cachedData.timestamp;

      if (cacheAge > CACHE_EXPIRATION_TIME) {
        console.log(`[Cache] Cache expired (age: ${Math.round(cacheAge / (60 * 60 * 1000))} hours)`);
        await this.clearCache();
        return null;
      }

      console.log(`[Cache] Retrieved ${cachedData.videos.length} videos from cache (age: ${Math.round(cacheAge / (60 * 1000))} minutes)`);
      return cachedData.videos;
    } catch (error) {
      console.error('[Cache] Error reading from cache:', error);
      return null;
    }
  },

  // Clear the cache
  clearCache: async (): Promise<void> => {
    try {
      await AsyncStorage.removeItem(CACHE_KEY);
      console.log('[Cache] Cache cleared');
    } catch (error) {
      console.error('[Cache] Error clearing cache:', error);
    }
  },

  // Check if cache exists and is not expired
  isCacheValid: async (): Promise<boolean> => {
    try {
      const cachedDataString = await AsyncStorage.getItem(CACHE_KEY);

      if (!cachedDataString) {
        return false;
      }

      const cachedData: CachedData = JSON.parse(cachedDataString);
      const currentTime = Date.now();
      const cacheAge = currentTime - cachedData.timestamp;

      return cacheAge <= CACHE_EXPIRATION_TIME;
    } catch (error) {
      console.error('[Cache] Error checking cache validity:', error);
      return false;
    }
  },

  // Get cache age in minutes
  getCacheAge: async (): Promise<number | null> => {
    try {
      const cachedDataString = await AsyncStorage.getItem(CACHE_KEY);

      if (!cachedDataString) {
        return null;
      }

      const cachedData: CachedData = JSON.parse(cachedDataString);
      const currentTime = Date.now();
      const cacheAge = currentTime - cachedData.timestamp;

      return Math.round(cacheAge / (60 * 1000)); // Return age in minutes
    } catch (error) {
      console.error('[Cache] Error getting cache age:', error);
      return null;
    }
  },
};