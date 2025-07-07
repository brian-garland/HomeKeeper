import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthenticationPromptProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: (user: any) => void;
  localHomeData?: any;
}

export const AuthenticationPrompt: React.FC<AuthenticationPromptProps> = ({
  visible,
  onClose,
  onSuccess,
  localHomeData,
}) => {
  const handleEmailSignUp = async () => {
    // Authentication disabled - continue with local only
    Alert.alert(
      'Feature Coming Soon',
      'Cloud sync will be available in a future update. Your data is safely stored locally.',
      [{ text: 'OK', onPress: onClose }]
    );
  };

  const handleAnonymousSignIn = async () => {
    // Authentication disabled - continue with local only
    Alert.alert(
      'Continue Locally',
      'Your data will be kept safe on this device. Cloud sync coming soon!',
      [{ text: 'OK', onPress: onClose }]
    );
  };

  // Migration disabled - local-first architecture
  const migrateLocalDataToUser = async (userId: string, localHome: any) => {
    console.log('Migration disabled in local-first mode');
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.title}>Save Your Progress?</Text>
          <Text style={styles.subtitle}>
            Sync your home maintenance schedule across all your devices
          </Text>

          <TouchableOpacity style={styles.primaryButton} onPress={handleEmailSignUp}>
            <Text style={styles.primaryButtonText}>Continue with Email</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.secondaryButton} onPress={handleAnonymousSignIn}>
            <Text style={styles.secondaryButtonText}>Quick Save (Anonymous)</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.textButton} onPress={onClose}>
            <Text style={styles.textButtonText}>Keep Local Only</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    color: '#666',
    lineHeight: 22,
  },
  primaryButton: {
    backgroundColor: '#B8860B',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  secondaryButton: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  secondaryButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
  textButton: {
    padding: 12,
  },
  textButtonText: {
    color: '#666',
    fontSize: 14,
    textAlign: 'center',
  },
}); 