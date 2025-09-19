import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
} from 'react-native';

export type SortField = 'publishedAt' | 'recordingDate';
export type SortOrder = 'newest' | 'oldest';

export interface SortOptions {
  field: SortField;
  order: SortOrder;
}

interface SortModalProps {
  visible: boolean;
  onClose: () => void;
  sortOptions: SortOptions;
  onApplySort: (sortOptions: SortOptions) => void;
}

export const SortModal: React.FC<SortModalProps> = ({
  visible,
  onClose,
  sortOptions,
  onApplySort,
}) => {
  const [localSortOptions, setLocalSortOptions] = React.useState<SortOptions>(sortOptions);

  React.useEffect(() => {
    setLocalSortOptions(sortOptions);
  }, [sortOptions]);

  const handleFieldSelect = (field: SortField) => {
    setLocalSortOptions(prev => ({ ...prev, field }));
  };

  const handleOrderSelect = (order: SortOrder) => {
    setLocalSortOptions(prev => ({ ...prev, order }));
  };

  const handleApply = () => {
    onApplySort(localSortOptions);
    onClose();
  };

  const getSortOptionLabel = (field: SortField, order: SortOrder) => {
    const fieldLabel = field === 'publishedAt' ? 'Publication Date' : 'Recording Date';
    const orderLabel = order === 'newest' ? 'Newest First' : 'Oldest First';
    return `${fieldLabel} (${orderLabel})`;
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
          <Text style={styles.title}>Sort Videos</Text>
          <Pressable onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>✕</Text>
          </Pressable>
        </View>

        <View style={styles.content}>
          {/* Sort Field */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Sort By</Text>

            <Pressable
              style={[
                styles.sortOption,
                localSortOptions.field === 'publishedAt' && styles.selectedOption
              ]}
              onPress={() => handleFieldSelect('publishedAt')}
            >
              <Text style={[
                styles.sortOptionText,
                localSortOptions.field === 'publishedAt' && styles.selectedOptionText
              ]}>
                Publication Date
              </Text>
              <Text style={[
                styles.sortOptionDescription,
                localSortOptions.field === 'publishedAt' && styles.selectedOptionDescription
              ]}>
                When the video was published to YouTube
              </Text>
            </Pressable>

            <Pressable
              style={[
                styles.sortOption,
                localSortOptions.field === 'recordingDate' && styles.selectedOption
              ]}
              onPress={() => handleFieldSelect('recordingDate')}
            >
              <Text style={[
                styles.sortOptionText,
                localSortOptions.field === 'recordingDate' && styles.selectedOptionText
              ]}>
                Recording Date
              </Text>
              <Text style={[
                styles.sortOptionDescription,
                localSortOptions.field === 'recordingDate' && styles.selectedOptionDescription
              ]}>
                When the video was originally recorded (if available)
              </Text>
            </Pressable>
          </View>

          {/* Sort Order */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Order</Text>

            <Pressable
              style={[
                styles.sortOption,
                localSortOptions.order === 'newest' && styles.selectedOption
              ]}
              onPress={() => handleOrderSelect('newest')}
            >
              <Text style={[
                styles.sortOptionText,
                localSortOptions.order === 'newest' && styles.selectedOptionText
              ]}>
                Newest First
              </Text>
              <Text style={[
                styles.sortOptionDescription,
                localSortOptions.order === 'newest' && styles.selectedOptionDescription
              ]}>
                Most recent videos appear at the top
              </Text>
            </Pressable>

            <Pressable
              style={[
                styles.sortOption,
                localSortOptions.order === 'oldest' && styles.selectedOption
              ]}
              onPress={() => handleOrderSelect('oldest')}
            >
              <Text style={[
                styles.sortOptionText,
                localSortOptions.order === 'oldest' && styles.selectedOptionText
              ]}>
                Oldest First
              </Text>
              <Text style={[
                styles.sortOptionDescription,
                localSortOptions.order === 'oldest' && styles.selectedOptionDescription
              ]}>
                Oldest videos appear at the top
              </Text>
            </Pressable>
          </View>

          {/* Current Selection Preview */}
          <View style={styles.previewSection}>
            <Text style={styles.previewTitle}>Current Selection:</Text>
            <Text style={styles.previewText}>
              {getSortOptionLabel(localSortOptions.field, localSortOptions.order)}
            </Text>
          </View>
        </View>

        <View style={styles.footer}>
          <Pressable style={styles.applyButton} onPress={handleApply}>
            <Text style={styles.applyButtonText}>Apply Sort</Text>
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
  sortOption: {
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  selectedOption: {
    backgroundColor: '#4285F4',
    borderColor: '#4285F4',
  },
  sortOptionText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  selectedOptionText: {
    color: '#fff',
  },
  sortOptionDescription: {
    fontSize: 14,
    color: '#666',
  },
  selectedOptionDescription: {
    color: '#E3F2FD',
  },
  previewSection: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  previewTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  previewText: {
    fontSize: 16,
    color: '#4285F4',
    fontWeight: '500',
  },
  footer: {
    padding: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  applyButton: {
    width: '100%',
    padding: 16,
    backgroundColor: '#4285F4',
    borderRadius: 8,
    alignItems: 'center',
  },
  applyButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '500',
  },
});