import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Platform,
  Pressable,
  ActivityIndicator,
  Alert,
  Dimensions,
  Linking,
} from 'react-native';
import { router } from 'expo-router';
import { WebView } from 'react-native-webview';
import { Image } from 'expo-image';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { VideoData, fetchAllVideos } from '../services/youtubeApi';

const { width, height } = Dimensions.get('window');

export default function MapScreen() {
  const [videos, setVideos] = useState<VideoData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState<VideoData | null>(null);
  const webViewRef = useRef<WebView>(null);
  const bottomSheetRef = useRef<BottomSheet>(null);

  useEffect(() => {
    loadVideos();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const loadVideos = async () => {
    try {
      setLoading(true);
      const allVideos = await fetchAllVideos();
      // Filter videos that have valid location data
      const videosWithLocation = allVideos.filter(
        video => video.location?.latitude && video.location?.longitude
      );
      setVideos(videosWithLocation);
      console.log(`[MAP] Loaded ${videosWithLocation.length} videos with location data`);

      // Initialize map with markers after loading
      if (videosWithLocation.length > 0) {
        setTimeout(() => {
          initializeMap(videosWithLocation);
        }, 1000);
      }
    } catch (error) {
      console.error('[MAP] Error loading videos:', error);
      Alert.alert('Error', 'Failed to load video locations');
    } finally {
      setLoading(false);
    }
  };

  const initializeMap = (videosWithLocation: VideoData[]) => {
    const markers = videosWithLocation.map(video => ({
      id: video.id,
      lat: video.location!.latitude!,
      lng: video.location!.longitude!,
      title: video.title,
      channelName: video.channelName,
    }));

    const markersJson = JSON.stringify(markers);
    webViewRef.current?.postMessage(markersJson);
  };

  const handleMarkerPress = (videoId: string) => {
    const video = videos.find(v => v.id === videoId);
    if (video) {
      setSelectedVideo(video);
      bottomSheetRef.current?.expand();
    }
  };

  const handleOpenVideo = async () => {
    if (!selectedVideo) return;

    try {
      const videoId = selectedVideo.id;
      const webUrl = selectedVideo.videoUrl;

      // Try different YouTube URL schemes in order of preference
      const urlsToTry = [
        `vnd.youtube://${videoId}`, // YouTube app deep link
        `vnd.youtube://www.youtube.com/watch?v=${videoId}`, // Alternative YouTube app format
        `https://m.youtube.com/watch?v=${videoId}`, // Mobile YouTube web
        webUrl, // Standard web URL
      ];

      let opened = false;

      for (const url of urlsToTry) {
        try {
          const canOpen = await Linking.canOpenURL(url);
          console.log(`[MAP] Checking URL: ${url}, canOpen: ${canOpen}`);

          if (canOpen) {
            await Linking.openURL(url);
            opened = true;
            console.log(`[MAP] Successfully opened: ${url}`);
            break;
          }
        } catch (err) {
          console.log(`[MAP] Failed to open ${url}:`, err);
          continue;
        }
      }

      if (!opened) {
        // Final fallback - try to open with the system browser
        try {
          await Linking.openURL(webUrl);
          console.log(`[MAP] Opened with system browser: ${webUrl}`);
        } catch (fallbackError) {
          console.error('[MAP] All URL opening methods failed:', fallbackError);
          Alert.alert(
            'Unable to Open Video',
            `Could not open the YouTube video. You can manually search for: "${selectedVideo.title}" by ${selectedVideo.channelName}`,
            [
              { text: 'OK', style: 'default' }
            ]
          );
        }
      }
    } catch (error) {
      console.error('[MAP] Error in handleOpenVideo:', error);
      Alert.alert('Error', `Failed to open video: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const handleBackPress = () => {
    router.back();
  };

  const handleWebViewMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'markerClick') {
        handleMarkerPress(data.videoId);
      }
    } catch (error) {
      console.error('[MAP] Error parsing WebView message:', error);
    }
  };

  // Create HTML content for the WebView with Leaflet.js and OpenStreetMap
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>OpenStreetMap</title>
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
        <style>
            html, body { height: 100%; margin: 0; padding: 0; }
            #map { height: 100vh; width: 100vw; }
            .video-marker {
                background-color: #4285F4;
                border: 2px solid white;
                border-radius: 50%;
                width: 32px;
                height: 32px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 16px;
                box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            }
        </style>
    </head>
    <body>
        <div id="map"></div>
        <script>
            var map = L.map('map').setView([37.7749, -122.4194], 2);

            L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
                maxZoom: 19,
                attribution: '© OpenStreetMap contributors'
            }).addTo(map);

            var markers = [];

            window.addMarkersToMap = function(videoData) {
                // Clear existing markers
                markers.forEach(marker => map.removeLayer(marker));
                markers = [];

                // Add new markers
                videoData.forEach(function(video) {
                    var customIcon = L.divIcon({
                        className: 'video-marker',
                        html: '🎥',
                        iconSize: [32, 32],
                        iconAnchor: [16, 16]
                    });

                    var marker = L.marker([video.lat, video.lng], {icon: customIcon})
                        .addTo(map)
                        .on('click', function() {
                            window.ReactNativeWebView.postMessage(JSON.stringify({
                                type: 'markerClick',
                                videoId: video.id
                            }));
                        });

                    markers.push(marker);
                });

                // Fit map to show all markers
                if (markers.length > 0) {
                    var group = new L.featureGroup(markers);
                    map.fitBounds(group.getBounds().pad(0.1));
                }
            };

            // Listen for messages from React Native
            document.addEventListener('message', function(e) {
                var data = JSON.parse(e.data);
                if (Array.isArray(data)) {
                    window.addMarkersToMap(data);
                }
            });

            // For Android
            window.addEventListener('message', function(e) {
                var data = JSON.parse(e.data);
                if (Array.isArray(data)) {
                    window.addMarkersToMap(data);
                }
            });
        </script>
    </body>
    </html>
  `;

  const renderBottomSheetContent = () => {
    if (!selectedVideo) return null;

    return (
      <BottomSheetView style={styles.bottomSheetContent}>
        <View style={styles.videoInfo}>
          <Image
            source={{ uri: selectedVideo.thumbnailUrl }}
            style={styles.thumbnail}
            contentFit="cover"
          />

          <View style={styles.videoDetails}>
            <Text style={styles.videoTitle} numberOfLines={2}>
              {selectedVideo.title}
            </Text>

            <Text style={styles.channelName}>
              {selectedVideo.channelName}
            </Text>

            <Text style={styles.publishDate}>
              Published: {formatDate(selectedVideo.publishedAt)}
            </Text>

            {selectedVideo.recordingDate && (
              <Text style={styles.recordingDate}>
                Recorded: {formatDate(selectedVideo.recordingDate)}
              </Text>
            )}

            {selectedVideo.location && (
              <View style={styles.locationInfo}>
                <Text style={styles.locationText}>
                  📍 {selectedVideo.location.city && selectedVideo.location.country
                    ? `${selectedVideo.location.city}, ${selectedVideo.location.country}`
                    : selectedVideo.location.city || selectedVideo.location.country || 'Unknown location'}
                </Text>

                {selectedVideo.location.latitude && selectedVideo.location.longitude && (
                  <Text style={styles.coordinates}>
                    ({selectedVideo.location.latitude.toFixed(6)}, {selectedVideo.location.longitude.toFixed(6)})
                  </Text>
                )}
              </View>
            )}

            {selectedVideo.tags.length > 0 && (
              <View style={styles.tagsContainer}>
                <Text style={styles.tagsLabel}>Tags:</Text>
                <Text style={styles.tags} numberOfLines={2}>
                  {selectedVideo.tags.slice(0, 5).join(', ')}
                </Text>
              </View>
            )}
          </View>
        </View>

        <Pressable style={styles.openVideoButton} onPress={handleOpenVideo}>
          <Text style={styles.openVideoButtonText}>▶️ Watch on YouTube</Text>
        </Pressable>
      </BottomSheetView>
    );
  };

  return (
    <GestureHandlerRootView style={styles.container}>
      <SafeAreaView style={styles.container}>
        <StatusBar
          backgroundColor="#f5f5f5"
          barStyle="dark-content"
          translucent={false}
        />

        {/* Header */}
        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={handleBackPress}>
            <Text style={styles.backButtonText}>← Back</Text>
          </Pressable>
          <Text style={styles.title}>Video Locations</Text>
          <View style={styles.placeholder} />
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4285F4" />
            <Text style={styles.loadingText}>Loading video locations...</Text>
          </View>
        ) : (
          <>
            <WebView
              ref={webViewRef}
              source={{ html: htmlContent }}
              style={styles.map}
              onMessage={handleWebViewMessage}
              javaScriptEnabled={true}
              domStorageEnabled={true}
              startInLoadingState={false}
              scalesPageToFit={true}
              scrollEnabled={false}
              showsHorizontalScrollIndicator={false}
              showsVerticalScrollIndicator={false}
            />

            <BottomSheet
              ref={bottomSheetRef}
              snapPoints={['25%']}
              enablePanDownToClose={true}
              index={-1}
              backgroundStyle={styles.bottomSheetBackground}
              handleIndicatorStyle={styles.bottomSheetIndicator}
            >
              {renderBottomSheetContent()}
            </BottomSheet>
          </>
        )}

        {!loading && videos.length === 0 && (
          <View style={styles.noDataContainer}>
            <Text style={styles.noDataText}>
              No videos with location data found
            </Text>
            <Pressable style={styles.refreshButton} onPress={loadVideos}>
              <Text style={styles.refreshButtonText}>Refresh</Text>
            </Pressable>
          </View>
        )}
      </SafeAreaView>
    </GestureHandlerRootView>
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
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 16 : 16,
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: '#4285F4',
    fontWeight: '500',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  placeholder: {
    width: 60,
  },
  map: {
    flex: 1,
    width: width,
    height: height - 200,
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
  noDataContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  noDataText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  refreshButton: {
    backgroundColor: '#4285F4',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 6,
  },
  refreshButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  bottomSheetBackground: {
    backgroundColor: '#fff',
  },
  bottomSheetIndicator: {
    backgroundColor: '#ccc',
  },
  bottomSheetContent: {
    flex: 1,
    padding: 16,
  },
  videoInfo: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  thumbnail: {
    width: 80,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  videoDetails: {
    flex: 1,
  },
  videoTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  channelName: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  publishDate: {
    fontSize: 11,
    color: '#888',
    marginBottom: 2,
  },
  recordingDate: {
    fontSize: 11,
    color: '#888',
    marginBottom: 4,
  },
  locationInfo: {
    marginBottom: 4,
  },
  locationText: {
    fontSize: 12,
    color: '#4285F4',
    fontWeight: '500',
  },
  coordinates: {
    fontSize: 10,
    color: '#888',
  },
  tagsContainer: {
    marginTop: 4,
  },
  tagsLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: '#666',
    marginBottom: 2,
  },
  tags: {
    fontSize: 10,
    color: '#888',
  },
  openVideoButton: {
    backgroundColor: '#FF0000',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  openVideoButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
});