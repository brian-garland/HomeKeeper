import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Alert,
  ScrollView,
} from 'react-native';
import { Colors } from '../theme/colors';
import { Typography } from '../theme/typography';
import { Spacing } from '../theme/spacing';
import { collectFeedback } from '../lib/services/feedback';

interface FeedbackModalProps {
  visible: boolean;
  onClose: () => void;
  initialType?: 'bug' | 'feature' | 'general' | 'rating';
  context?: {
    screen?: string;
    action?: string;
  };
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({
  visible,
  onClose,
  initialType = 'general',
  context,
}) => {
  const [feedbackType, setFeedbackType] = useState<'bug' | 'feature' | 'general' | 'rating'>(initialType);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [rating, setRating] = useState<number>(5);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setRating(5);
    setFeedbackType(initialType);
  };

  const handleSubmit = async () => {
    if (!title.trim() || !description.trim()) {
      Alert.alert('Missing Information', 'Please fill in both title and description.');
      return;
    }

    setIsSubmitting(true);

    try {
      let success = false;

      switch (feedbackType) {
        case 'bug':
          success = await collectFeedback.bug(title, description, context);
          break;
        case 'feature':
          success = await collectFeedback.feature(title, description);
          break;
        case 'rating':
          success = await collectFeedback.rating(rating, description);
          break;
        case 'general':
          success = await collectFeedback.general(title, description);
          break;
      }

      if (success) {
        Alert.alert(
          'Thank You!',
          'Your feedback has been collected. We really appreciate your input!',
          [{ text: 'OK', onPress: () => { resetForm(); onClose(); } }]
        );
      } else {
        Alert.alert(
          'Oops!',
          'There was an issue collecting your feedback. Please try again.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      Alert.alert(
        'Error',
        'Something went wrong. Your feedback will be saved and submitted later.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const renderStarRating = () => {
    return (
      <View style={styles.starContainer}>
        <Text style={styles.ratingLabel}>How would you rate HomeKeeper?</Text>
        <View style={styles.starsRow}>
          {[1, 2, 3, 4, 5].map((star) => (
            <TouchableOpacity
              key={star}
              onPress={() => setRating(star)}
              style={styles.starButton}
            >
              <Text style={[
                styles.star,
                { color: star <= rating ? Colors.warning : Colors.gray300 }
              ]}>
                ★
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Share Your Feedback</Text>
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Feedback Type Selection */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>What type of feedback?</Text>
            <View style={styles.typeButtons}>
              {[
                { key: 'bug', label: '🐛 Bug Report', color: Colors.error },
                { key: 'feature', label: '💡 Feature Request', color: Colors.info },
                { key: 'rating', label: '⭐ Rate the App', color: Colors.warning },
                { key: 'general', label: '💬 General Feedback', color: Colors.primary },
              ].map((type) => (
                <TouchableOpacity
                  key={type.key}
                  style={[
                    styles.typeButton,
                    {
                      backgroundColor: feedbackType === type.key ? type.color : Colors.surface,
                      borderColor: type.color,
                    }
                  ]}
                  onPress={() => setFeedbackType(type.key as any)}
                >
                  <Text style={[
                    styles.typeButtonText,
                    { color: feedbackType === type.key ? Colors.white : type.color }
                  ]}>
                    {type.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Star Rating for Rating Type */}
          {feedbackType === 'rating' && (
            <View style={styles.section}>
              {renderStarRating()}
            </View>
          )}

          {/* Title Input */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {feedbackType === 'rating' ? 'What did you like or dislike?' : 'Title'}
            </Text>
            <TextInput
              style={styles.titleInput}
              value={title}
              onChangeText={setTitle}
              placeholder={
                feedbackType === 'bug' ? 'Brief description of the issue...' :
                feedbackType === 'feature' ? 'What feature would you like to see?' :
                feedbackType === 'rating' ? 'Tell us about your experience...' :
                'What\'s on your mind?'
              }
              placeholderTextColor={Colors.textTertiary}
              maxLength={100}
            />
          </View>

          {/* Description Input */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Details</Text>
            <TextInput
              style={styles.descriptionInput}
              value={description}
              onChangeText={setDescription}
              placeholder={
                feedbackType === 'bug' ? 'Steps to reproduce, what you expected vs what happened...' :
                feedbackType === 'feature' ? 'How would this feature help you? Any specific requirements?' :
                'Tell us more about your feedback...'
              }
              placeholderTextColor={Colors.textTertiary}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              maxLength={500}
            />
          </View>

          {/* Context Info */}
          {context && (
            <View style={styles.contextInfo}>
              <Text style={styles.contextText}>
                📍 Screen: {context.screen || 'Unknown'}
                {context.action && ` • Action: ${context.action}`}
              </Text>
            </View>
          )}
        </ScrollView>

        {/* Submit Button */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[
              styles.submitButton,
              { opacity: isSubmitting || !title.trim() || !description.trim() ? 0.5 : 1 }
            ]}
            onPress={handleSubmit}
            disabled={isSubmitting || !title.trim() || !description.trim()}
          >
            <Text style={styles.submitButtonText}>
              {isSubmitting ? 'Submitting...' : 'Send Feedback'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: {
    ...Typography.headlineMedium,
  },
  closeButton: {
    padding: Spacing.sm,
  },
  closeButtonText: {
    ...Typography.headlineMedium,
    color: Colors.textSecondary,
  },
  content: {
    flex: 1,
    padding: Spacing.lg,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    ...Typography.titleMedium,
    marginBottom: Spacing.md,
  },
  typeButtons: {
    gap: Spacing.sm,
  },
  typeButton: {
    padding: Spacing.md,
    borderRadius: 8,
    borderWidth: 1,
  },
  typeButtonText: {
    ...Typography.labelMedium,
    textAlign: 'center',
  },
  starContainer: {
    alignItems: 'center',
  },
  ratingLabel: {
    ...Typography.titleMedium,
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  starsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  starButton: {
    padding: Spacing.sm,
  },
  star: {
    fontSize: 32,
  },
  titleInput: {
    ...Typography.bodyLarge,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    padding: Spacing.md,
    backgroundColor: Colors.surface,
  },
  descriptionInput: {
    ...Typography.bodyLarge,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    padding: Spacing.md,
    backgroundColor: Colors.surface,
    minHeight: 100,
  },
  contextInfo: {
    backgroundColor: Colors.surface,
    padding: Spacing.md,
    borderRadius: 8,
    marginTop: Spacing.lg,
  },
  contextText: {
    ...Typography.bodySmall,
    color: Colors.textTertiary,
  },
  footer: {
    padding: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  submitButton: {
    backgroundColor: Colors.primary,
    padding: Spacing.md,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonText: {
    ...Typography.labelLarge,
    color: Colors.white,
  },
}); 