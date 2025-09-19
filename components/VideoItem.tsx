import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Image,
  Linking,
  Alert,
  Platform,
} from 'react-native';
import { VideoData, formatDate } from '../services/youtubeApi';

interface VideoItemProps {
  video: VideoData;
}

export const VideoItem: React.FC<VideoItemProps> = ({ video }) => {
  const handlePress = async () => {
    try {
      console.log(`[VideoItem] Platform: ${Platform.OS}`);
      console.log(`[VideoItem] Attempting to open video ${video.id}`);
      console.log(`[VideoItem] Video title: ${video.title}`);

      // Platform-specific YouTube app URLs
      const youtubeAppUrl = Platform.OS === 'ios'
        ? `youtube://watch?v=${video.id}`
        : `vnd.youtube:${video.id}`;

      console.log(`[VideoItem] YouTube app URL: ${youtubeAppUrl}`);
      console.log(`[VideoItem] Web URL: ${video.videoUrl}`);

      // Try YouTube app first
      console.log('[VideoItem] Checking YouTube app availability...');
      const canOpenYouTubeApp = await Linking.canOpenURL(youtubeAppUrl);
      console.log(`[VideoItem] Can open YouTube app: ${canOpenYouTubeApp}`);

      if (canOpenYouTubeApp) {
        console.log('[VideoItem] Opening in YouTube app...');
        await Linking.openURL(youtubeAppUrl);
        console.log('[VideoItem] Successfully opened in YouTube app');
        return;
      }

      // Try alternative YouTube app URL for Android
      if (Platform.OS === 'android') {
        const altYoutubeUrl = `youtube://watch?v=${video.id}`;
        console.log(`[VideoItem] Trying alternative Android URL: ${altYoutubeUrl}`);
        const canOpenAlt = await Linking.canOpenURL(altYoutubeUrl);
        console.log(`[VideoItem] Can open alternative URL: ${canOpenAlt}`);

        if (canOpenAlt) {
          console.log('[VideoItem] Opening with alternative URL...');
          await Linking.openURL(altYoutubeUrl);
          console.log('[VideoItem] Successfully opened with alternative URL');
          return;
        }
      }

      // Fallback to web browser
      console.log('[VideoItem] YouTube app not available, trying web browser...');
      console.log('[VideoItem] Checking web URL availability...');
      const canOpenWeb = await Linking.canOpenURL(video.videoUrl);
      console.log(`[VideoItem] Can open web URL: ${canOpenWeb}`);

      if (canOpenWeb) {
        console.log('[VideoItem] Opening in web browser...');
        await Linking.openURL(video.videoUrl);
        console.log('[VideoItem] Successfully opened in web browser');
        return;
      }

      // Final fallback - direct open attempt
      console.log('[VideoItem] Direct opening attempt...');
      await Linking.openURL(video.videoUrl);
      console.log('[VideoItem] Direct open succeeded');

    } catch (error) {
      console.error('[VideoItem] Error opening video:', error);
      console.error('[VideoItem] Error details:', {
        videoId: video.id,
        videoUrl: video.videoUrl,
        platform: Platform.OS,
        errorMessage: error.message
      });

      // Show user-friendly error with helpful information
      Alert.alert(
        'Cannot Open Video',
        Platform.OS === 'ios'
          ? 'Please install the YouTube app from the App Store or try again later.'
          : 'Please install the YouTube app from Google Play Store or try again later.',
        [
          { text: 'OK', style: 'default' }
        ]
      );
    }
  };

  return (
    <Pressable style={styles.container} onPress={handlePress}>
      <Image
        source={{ uri: video.thumbnailUrl }}
        style={styles.thumbnail}
        resizeMode="cover"
      />
      <View style={styles.contentContainer}>
        <Text style={styles.title} numberOfLines={2}>
          {video.title}
        </Text>
        <Text style={styles.channelName} numberOfLines={1}>
          {video.channelName}
        </Text>
        <Text style={styles.publishDate}>
          {formatDate(video.publishedAt)}
        </Text>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#fff',
    marginVertical: 4,
    marginHorizontal: 8,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
  },
  thumbnail: {
    width: 120,
    height: 90,
    borderRadius: 8,
    marginRight: 12,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    lineHeight: 20,
    marginBottom: 4,
  },
  channelName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
    marginBottom: 4,
  },
  publishDate: {
    fontSize: 12,
    color: '#999',
  },
});