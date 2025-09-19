import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  ScrollView,
} from 'react-native';

interface FilterOptions {
  channel: string | null;
  country: string | null;
}

interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
  filters: FilterOptions;
  onApplyFilters: (filters: FilterOptions) => void;
  availableChannels: string[];
  availableCountries: string[];
}

export const FilterModal: React.FC<FilterModalProps> = ({
  visible,
  onClose,
  filters,
  onApplyFilters,
  availableChannels,
  availableCountries,
}) => {
  const [localFilters, setLocalFilters] = React.useState<FilterOptions>(filters);

  React.useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const handleChannelSelect = (channel: string | null) => {
    setLocalFilters(prev => ({ ...prev, channel }));
  };

  const handleCountrySelect = (country: string | null) => {
    setLocalFilters(prev => ({ ...prev, country }));
  };

  const handleApply = () => {
    onApplyFilters(localFilters);
    onClose();
  };

  const handleClear = () => {
    const clearedFilters = { channel: null, country: null };
    setLocalFilters(clearedFilters);
    onApplyFilters(clearedFilters);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Filter Videos</Text>
          <Pressable onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>✕</Text>
          </Pressable>
        </View>

        <ScrollView style={styles.content}>
          {/* Channel Filter */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Source Channel</Text>
            <Pressable
              style={[
                styles.filterOption,
                localFilters.channel === null && styles.selectedOption
              ]}
              onPress={() => handleChannelSelect(null)}
            >
              <Text style={[
                styles.filterOptionText,
                localFilters.channel === null && styles.selectedOptionText
              ]}>
                All Channels
              </Text>
            </Pressable>
            {availableChannels.map((channel) => (
              <Pressable
                key={channel}
                style={[
                  styles.filterOption,
                  localFilters.channel === channel && styles.selectedOption
                ]}
                onPress={() => handleChannelSelect(channel)}
              >
                <Text style={[
                  styles.filterOptionText,
                  localFilters.channel === channel && styles.selectedOptionText
                ]}>
                  {channel}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* Country Filter */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Country</Text>
            <Pressable
              style={[
                styles.filterOption,
                localFilters.country === null && styles.selectedOption
              ]}
              onPress={() => handleCountrySelect(null)}
            >
              <Text style={[
                styles.filterOptionText,
                localFilters.country === null && styles.selectedOptionText
              ]}>
                All Countries
              </Text>
            </Pressable>
            {availableCountries.map((country) => (
              <Pressable
                key={country}
                style={[
                  styles.filterOption,
                  localFilters.country === country && styles.selectedOption
                ]}
                onPress={() => handleCountrySelect(country)}
              >
                <Text style={[
                  styles.filterOptionText,
                  localFilters.country === country && styles.selectedOptionText
                ]}>
                  {country}
                </Text>
              </Pressable>
            ))}
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <Pressable style={styles.clearButton} onPress={handleClear}>
            <Text style={styles.clearButtonText}>Clear All</Text>
          </Pressable>
          <Pressable style={styles.applyButton} onPress={handleApply}>
            <Text style={styles.applyButtonText}>Apply Filters</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    color: '#666',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  filterOption: {
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  selectedOption: {
    backgroundColor: '#4285F4',
    borderColor: '#4285F4',
  },
  filterOptionText: {
    fontSize: 16,
    color: '#333',
  },
  selectedOptionText: {
    color: '#fff',
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  clearButton: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    alignItems: 'center',
    marginRight: 10,
  },
  clearButtonText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  applyButton: {
    flex: 1,
    padding: 16,
    backgroundColor: '#4285F4',
    borderRadius: 8,
    alignItems: 'center',
    marginLeft: 10,
  },
  applyButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '500',
  },
});