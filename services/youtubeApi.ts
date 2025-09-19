import { youtubeApiKey } from '../config.js';

export interface LocationData {
  city?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
}

export interface VideoData {
  id: string;
  title: string;
  channelName: string;
  publishedAt: string;
  thumbnailUrl: string;
  videoUrl: string;
  tags: string[];
  location?: LocationData;
  recordingDate?: string;
}

const CHANNEL_IDS = [
  'UCynoa1DjwnvHAowA_jiMEAQ',
  'UCK0KOjX3beyB9nzonls0cuw',
  'UCACkIrvrGAQ7kuc0hMVwvmA',
  'UCtWRAKKvOEA0CXOue9BG8ZA'
];

const YOUTUBE_API_BASE_URL = 'https://www.googleapis.com/youtube/v3';

// Helper functions to extract location information
const extractCityFromDescription = (locationDesc: string): string | undefined => {
  // Simple pattern matching for common location formats
  const patterns = [
    /^([^,]+),\s*[^,]+$/,  // "City, Country" format
    /^([^,]+),\s*[^,]+,\s*[^,]+$/,  // "City, State, Country" format
  ];

  for (const pattern of patterns) {
    const match = locationDesc.match(pattern);
    if (match) {
      return match[1].trim();
    }
  }

  return undefined;
};

const extractCountryFromDescription = (locationDesc: string): string | undefined => {
  // Simple pattern matching for common location formats
  const patterns = [
    /,\s*([^,]+)$/,  // Last part after comma is usually country
  ];

  for (const pattern of patterns) {
    const match = locationDesc.match(pattern);
    if (match) {
      return match[1].trim();
    }
  }

  return undefined;
};

// Simple delay function for rate limiting
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Reverse geocoding function to get city/country from coordinates
const reverseGeocode = async (lat: number, lng: number): Promise<{ city?: string; country?: string }> => {
  try {
    // Add small delay to respect rate limits (1 request per second max)
    await delay(1000);

    // Using OpenStreetMap's free Nominatim service for reverse geocoding
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`,
      {
        headers: {
          'User-Agent': 'YouTube-Video-App/1.0'
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Geocoding failed: ${response.status}`);
    }

    const data = await response.json();
    const address = data.address || {};

    const result = {
      city: address.city || address.town || address.village || address.hamlet || undefined,
      country: address.country || undefined,
    };

    console.log(`[Geocoding] ${lat}, ${lng} -> ${result.city}, ${result.country}`);
    return result;
  } catch (error) {
    console.error('[Geocoding] Error:', error);
    return {};
  }
};

export const fetchChannelVideos = async (channelId: string): Promise<VideoData[]> => {
  try {
    // First, get basic video information from search endpoint
    const searchResponse = await fetch(
      `${YOUTUBE_API_BASE_URL}/search?` +
      `key=${youtubeApiKey}&` +
      `channelId=${channelId}&` +
      `part=snippet&` +
      `order=date&` +
      `maxResults=50&` +
      `type=video`
    );

    if (!searchResponse.ok) {
      throw new Error(`HTTP error! status: ${searchResponse.status}`);
    }

    const searchData = await searchResponse.json();

    if (!searchData.items || searchData.items.length === 0) {
      console.log(`No videos found for channel ${channelId}`);
      return [];
    }

    // Extract video IDs for detailed information
    const videoIds = searchData.items.map((item: any) => item.id.videoId);

    // Fetch detailed video information including tags, location, and recording date
    const videosResponse = await fetch(
      `${YOUTUBE_API_BASE_URL}/videos?` +
      `key=${youtubeApiKey}&` +
      `id=${videoIds.join(',')}&` +
      `part=snippet,recordingDetails,localizations`
    );

    if (!videosResponse.ok) {
      throw new Error(`HTTP error fetching video details! status: ${videosResponse.status}`);
    }

    const videosData = await videosResponse.json();

    // Combine search results with detailed video information
    const videoDetailsMap = new Map();
    videosData.items?.forEach((item: any) => {
      videoDetailsMap.set(item.id, item);
    });

    // Process videos with async location resolution
    const videoPromises = searchData.items.map(async (searchItem: any): Promise<VideoData> => {
      const videoDetails = videoDetailsMap.get(searchItem.id.videoId);
      const snippet = videoDetails?.snippet || searchItem.snippet;
      const recordingDetails = videoDetails?.recordingDetails;

      // Extract location data - YouTube API provides location in recordingDetails
      let locationData: LocationData | undefined;

      if (recordingDetails?.location) {
        const location = recordingDetails.location;
        let city = location.city || undefined;
        let country = location.country || undefined;
        const latitude = location.latitude ? parseFloat(location.latitude) : undefined;
        const longitude = location.longitude ? parseFloat(location.longitude) : undefined;

        // If we have coordinates but no city/country, use reverse geocoding
        if (latitude && longitude && (!city || !country)) {
          console.log(`[YouTube API] Reverse geocoding for video ${searchItem.id.videoId} at ${latitude}, ${longitude}`);
          const geocoded = await reverseGeocode(latitude, longitude);
          city = city || geocoded.city;
          country = country || geocoded.country;
        }

        locationData = {
          city,
          country,
          latitude,
          longitude,
        };

        console.log(`[YouTube API] Final location for video ${searchItem.id.videoId}:`, locationData);
      }

      // Also check for location in snippet (some videos have locationDescription)
      if (!locationData && snippet?.locationDescription) {
        // Parse location description if available
        const locationDesc = snippet.locationDescription;
        locationData = {
          city: extractCityFromDescription(locationDesc),
          country: extractCountryFromDescription(locationDesc),
        };

        console.log(`[YouTube API] Parsed location from description for video ${searchItem.id.videoId}:`, locationData);
      }

      // Additional debugging for location data
      if (recordingDetails) {
        console.log(`[YouTube API] Recording details for video ${searchItem.id.videoId}:`, {
          hasLocation: !!recordingDetails.location,
          hasLocationDescription: !!snippet?.locationDescription,
          location: recordingDetails.location,
        });
      }

      return {
        id: searchItem.id.videoId,
        title: snippet.title,
        channelName: snippet.channelTitle,
        publishedAt: snippet.publishedAt,
        thumbnailUrl: snippet.thumbnails?.medium?.url || snippet.thumbnails?.default?.url || '',
        videoUrl: `https://www.youtube.com/watch?v=${searchItem.id.videoId}`,
        tags: snippet.tags || [],
        location: locationData,
        recordingDate: recordingDetails?.recordingDate,
      };
    });

    // Wait for all location processing to complete
    return await Promise.all(videoPromises);

  } catch (error) {
    console.error(`Error fetching videos for channel ${channelId}:`, error);
    return [];
  }
};

// Function to enhance videos with missing location data
const enhanceLocationData = async (videos: VideoData[]): Promise<VideoData[]> => {
  console.log('[YouTube API] Checking for videos needing location enhancement...');

  const videosNeedingEnhancement = videos.filter(video =>
    video.location &&
    video.location.latitude &&
    video.location.longitude &&
    (!video.location.city || !video.location.country)
  );

  if (videosNeedingEnhancement.length === 0) {
    console.log('[YouTube API] No videos need location enhancement');
    return videos;
  }

  console.log(`[YouTube API] Enhancing location data for ${videosNeedingEnhancement.length} videos...`);

  const enhancedVideos = await Promise.all(
    videos.map(async (video) => {
      if (
        video.location &&
        video.location.latitude &&
        video.location.longitude &&
        (!video.location.city || !video.location.country)
      ) {
        console.log(`[YouTube API] Enhancing location for video ${video.id}...`);
        const geocoded = await reverseGeocode(video.location.latitude, video.location.longitude);

        return {
          ...video,
          location: {
            ...video.location,
            city: video.location.city || geocoded.city,
            country: video.location.country || geocoded.country,
          },
        };
      }
      return video;
    })
  );

  // Update cache with enhanced data
  const { cacheService } = await import('./cacheService');
  await cacheService.saveToCache(enhancedVideos);

  console.log(`[YouTube API] Location enhancement complete`);
  return enhancedVideos;
};

export const fetchAllVideos = async (forceRefresh = false): Promise<VideoData[]> => {
  try {
    const { cacheService } = await import('./cacheService');

    // Check cache first if not forcing refresh
    if (!forceRefresh) {
      const cachedVideos = await cacheService.getFromCache();
      if (cachedVideos) {
        console.log(`[YouTube API] Using cached data (${cachedVideos.length} videos)`);
        // Enhance cached videos with missing location data
        return await enhanceLocationData(cachedVideos);
      }
    }

    console.log('[YouTube API] Fetching fresh data from all channels...');

    const promises = CHANNEL_IDS.map(channelId => fetchChannelVideos(channelId));
    const channelResults = await Promise.all(promises);

    const allVideos = channelResults.flat();

    // Sort by publication date (newest first)
    const sortedVideos = allVideos.sort((a, b) =>
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    );

    // Save to cache
    await cacheService.saveToCache(sortedVideos);

    console.log(`[YouTube API] Successfully fetched ${sortedVideos.length} videos`);
    return sortedVideos;
  } catch (error) {
    console.error('[YouTube API] Error fetching all videos:', error);
    return [];
  }
};

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toISOString().split('T')[0]; // Format as YYYY-MM-DD
};