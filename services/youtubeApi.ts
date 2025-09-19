import { youtubeApiKey } from '../config.js';

export interface VideoData {
  id: string;
  title: string;
  channelName: string;
  publishedAt: string;
  thumbnailUrl: string;
  videoUrl: string;
}

const CHANNEL_IDS = [
  'UCynoa1DjwnvHAowA_jiMEAQ',
  'UCK0KOjX3beyB9nzonls0cuw',
  'UCACkIrvrGAQ7kuc0hMVwvmA',
  'UCtWRAKKvOEA0CXOue9BG8ZA'
];

const YOUTUBE_API_BASE_URL = 'https://www.googleapis.com/youtube/v3';

export const fetchChannelVideos = async (channelId: string): Promise<VideoData[]> => {
  try {
    const response = await fetch(
      `${YOUTUBE_API_BASE_URL}/search?` +
      `key=${youtubeApiKey}&` +
      `channelId=${channelId}&` +
      `part=snippet&` +
      `order=date&` +
      `maxResults=50&` +
      `type=video`
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    return data.items?.map((item: any): VideoData => ({
      id: item.id.videoId,
      title: item.snippet.title,
      channelName: item.snippet.channelTitle,
      publishedAt: item.snippet.publishedAt,
      thumbnailUrl: item.snippet.thumbnails.medium?.url || item.snippet.thumbnails.default.url,
      videoUrl: `https://www.youtube.com/watch?v=${item.id.videoId}`
    })) || [];
  } catch (error) {
    console.error(`Error fetching videos for channel ${channelId}:`, error);
    return [];
  }
};

export const fetchAllVideos = async (): Promise<VideoData[]> => {
  try {
    console.log('[YouTube API] Fetching videos from all channels...');

    const promises = CHANNEL_IDS.map(channelId => fetchChannelVideos(channelId));
    const channelResults = await Promise.all(promises);

    const allVideos = channelResults.flat();

    // Sort by publication date (newest first)
    const sortedVideos = allVideos.sort((a, b) =>
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    );

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