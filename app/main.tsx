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
  StatusBar,
  Platform,
} from 'react-native';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { router } from 'expo-router';
import { VideoData, fetchAllVideos } from '../services/youtubeApi';
import { VideoItem } from '../components/VideoItem';
import { FilterModal } from '../components/FilterModal';
import { SortModal, SortOptions } from '../components/SortModal';

interface FilterOptions {
  channel: string | null;
  country: string | null;
}

export default function MainScreen() {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [allVideos, setAllVideos] = useState<VideoData[]>([]);
  const [filteredVideos, setFilteredVideos] = useState<VideoData[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filter and Sort state
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showSortModal, setShowSortModal] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({
    channel: null,
    country: null,
  });
  const [sortOptions, setSortOptions] = useState<SortOptions>({
    field: 'publishedAt',
    order: 'newest',
  });

  useEffect(() => {
    loadVideos();
  }, []);

  const loadVideos = async (forceRefresh = false) => {
    try {
      console.log(`[MAIN] Loading YouTube videos... (forceRefresh: ${forceRefresh})`);
      const fetchedVideos = await fetchAllVideos(forceRefresh);
      setAllVideos(fetchedVideos);
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
    await loadVideos(true); // Force refresh
    setRefreshing(false);
  };

  // Filter and sort videos whenever allVideos, filters, or sortOptions change
  useEffect(() => {
    let processedVideos = [...allVideos];

    // Apply filters
    if (filters.channel) {
      processedVideos = processedVideos.filter(video => video.channelName === filters.channel);
    }

    if (filters.country) {
      processedVideos = processedVideos.filter(video =>
        video.location?.country === filters.country
      );
    }

    // Apply sorting
    processedVideos.sort((a, b) => {
      const dateA = sortOptions.field === 'publishedAt' ? a.publishedAt : (a.recordingDate || a.publishedAt);
      const dateB = sortOptions.field === 'publishedAt' ? b.publishedAt : (b.recordingDate || b.publishedAt);

      const timeA = new Date(dateA).getTime();
      const timeB = new Date(dateB).getTime();

      return sortOptions.order === 'newest' ? timeB - timeA : timeA - timeB;
    });

    setFilteredVideos(processedVideos);
  }, [allVideos, filters, sortOptions]);

  // Get unique channels and countries for filter options
  const availableChannels = Array.from(new Set(allVideos.map(video => video.channelName))).sort();
  const availableCountries = Array.from(new Set(
    allVideos
      .filter(video => video.location?.country)
      .map(video => video.location!.country!)
  )).sort();

  // Debug logging for countries
  console.log(`[Main] Total videos: ${allVideos.length}`);
  console.log(`[Main] Videos with location: ${allVideos.filter(video => video.location).length}`);
  console.log(`[Main] Videos with country: ${allVideos.filter(video => video.location?.country).length}`);
  console.log(`[Main] Available countries:`, availableCountries);

  // Detailed location debugging
  const videosWithLocation = allVideos.filter(video => video.location);
  console.log(`[Main] Detailed location data for ${videosWithLocation.length} videos:`);
  videosWithLocation.slice(0, 5).forEach((video, index) => {
    console.log(`[Main] Video ${index + 1} (${video.title.substring(0, 30)}...):`, {
      location: video.location,
      hasCity: !!video.location?.city,
      hasCountry: !!video.location?.country,
      hasCoordinates: !!(video.location?.latitude && video.location?.longitude),
    });
  });

  const handleApplyFilters = (newFilters: FilterOptions) => {
    setFilters(newFilters);
  };

  const handleApplySort = (newSortOptions: SortOptions) => {
    setSortOptions(newSortOptions);
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
    <>
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

      <View style={styles.controlsContainer}>
        <Pressable
          style={styles.controlButton}
          onPress={() => setShowFilterModal(true)}
        >
          <Text style={styles.controlButtonText}>
            🔍 Filter {filters.channel || filters.country ? '(Active)' : ''}
          </Text>
        </Pressable>

        <Pressable
          style={styles.controlButton}
          onPress={() => setShowSortModal(true)}
        >
          <Text style={styles.controlButtonText}>
            ↕️ Sort ({sortOptions.field === 'publishedAt' ? 'Published' : 'Recorded'})
          </Text>
        </Pressable>

        <Pressable
          style={[styles.controlButton, styles.refreshButton]}
          onPress={handleRefresh}
          disabled={refreshing}
        >
          {refreshing ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.refreshButtonText}>🔄 Refresh</Text>
          )}
        </Pressable>
      </View>

      <View style={styles.statsContainer}>
        <Text style={styles.statsText}>
          Showing {filteredVideos.length} of {allVideos.length} videos
        </Text>
      </View>
    </>
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
      <StatusBar
        backgroundColor="#f5f5f5"
        barStyle="dark-content"
        translucent={false}
      />
      {loading && allVideos.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4285F4" />
          <Text style={styles.loadingText}>Loading videos...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredVideos}
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
          contentContainerStyle={filteredVideos.length === 0 ? styles.emptyListContainer : undefined}
        />
      )}

      {/* Filter Modal */}
      <FilterModal
        visible={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        filters={filters}
        onApplyFilters={handleApplyFilters}
        availableChannels={availableChannels}
        availableCountries={availableCountries}
      />

      {/* Sort Modal */}
      <SortModal
        visible={showSortModal}
        onClose={() => setShowSortModal(false)}
        sortOptions={sortOptions}
        onApplySort={handleApplySort}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 10 : 0,
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
  controlsContainer: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    gap: 8,
  },
  controlButton: {
    flex: 1,
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 6,
    alignItems: 'center',
  },
  controlButtonText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  refreshButton: {
    backgroundColor: '#4285F4',
  },
  refreshButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  statsContainer: {
    padding: 8,
    backgroundColor: '#f8f8f8',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  statsText: {
    fontSize: 12,
    color: '#888',
    textAlign: 'center',
  },
});