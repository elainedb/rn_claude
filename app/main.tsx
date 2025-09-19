import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  Alert,
  FlatList,
  SafeAreaView,
  RefreshControl,
} from 'react-native';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { router } from 'expo-router';
import { VideoData, fetchAllVideos } from '../services/youtubeApi';
import { VideoItem } from '../components/VideoItem';

export default function MainScreen() {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [videos, setVideos] = useState<VideoData[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadVideos();
  }, []);

  const loadVideos = async () => {
    try {
      console.log('[MAIN] Loading YouTube videos...');
      const fetchedVideos = await fetchAllVideos();
      setVideos(fetchedVideos);
      console.log(`[MAIN] Loaded ${fetchedVideos.length} videos`);
    } catch (error) {
      console.error('[MAIN] Error loading videos:', error);
      Alert.alert('Error', 'Failed to load videos. Please check your internet connection and YouTube API key.');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadVideos();
    setRefreshing(false);
  };

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      console.log('[MAIN] Starting logout process...');

      if (typeof GoogleSignin.signOut === 'function') {
        await GoogleSignin.signOut();
        console.log('[MAIN] Successfully signed out from Google');
      } else {
        console.warn('[MAIN] GoogleSignin.signOut not available');
      }

      console.log('[MAIN] Navigating back to login screen...');
      router.replace('/login');
    } catch (error) {
      console.error('[MAIN] Error during logout:', error);
      Alert.alert('Logout Error', 'Failed to logout. Please try again.');
    } finally {
      setIsLoggingOut(false);
    }
  };

  const confirmLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: handleLogout,
        },
      ]
    );
  };

  const renderVideoItem = ({ item }: { item: VideoData }) => (
    <VideoItem video={item} />
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.title}>YouTube Videos</Text>
      <Pressable
        style={[styles.logoutButton, isLoggingOut && styles.buttonDisabled]}
        onPress={confirmLogout}
        disabled={isLoggingOut}
      >
        {isLoggingOut ? (
          <ActivityIndicator color="#fff" size="small" />
        ) : (
          <Text style={styles.logoutButtonText}>Logout</Text>
        )}
      </Pressable>
    </View>
  );

  const renderEmptyComponent = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>
        {loading ? 'Loading videos...' : 'No videos found. Pull to refresh or check your API key.'}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {loading && videos.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4285F4" />
          <Text style={styles.loadingText}>Loading videos...</Text>
        </View>
      ) : (
        <FlatList
          data={videos}
          renderItem={renderVideoItem}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={renderEmptyComponent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={['#4285F4']}
              tintColor="#4285F4"
            />
          }
          contentContainerStyle={videos.length === 0 ? styles.emptyListContainer : undefined}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  logoutButton: {
    backgroundColor: '#d32f2f',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#cccccc',
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  emptyListContainer: {
    flexGrow: 1,
  },
});