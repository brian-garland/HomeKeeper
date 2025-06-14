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
import { supabase } from '../lib/supabase';

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
    // Simple email/password flow
    Alert.prompt(
      'Save Your Progress',
      'Enter your email to sync across devices:',
      async (email) => {
        if (email) {
          try {
            const { data, error } = await supabase.auth.signUp({
              email,
              password: `temp-${Date.now()}`, // Temporary password
            });
            
            if (error) throw error;
            
            // Migrate local data to authenticated user
            if (localHomeData && data.user) {
              await migrateLocalDataToUser(data.user.id, localHomeData);
            }
            
            onSuccess(data.user);
            onClose();
          } catch (error) {
            console.error('Email signup error:', error);
            Alert.alert('Error', 'Could not create account. Please try again.');
          }
        }
      }
    );
  };

  const handleAnonymousSignIn = async () => {
    try {
      const { data, error } = await supabase.auth.signInAnonymously();
      
      if (error) throw error;
      
      // Migrate local data to anonymous user
      if (localHomeData && data.user) {
        await migrateLocalDataToUser(data.user.id, localHomeData);
      }
      
      onSuccess(data.user);
      onClose();
    } catch (error) {
      console.error('Anonymous signin error:', error);
      // Fallback: continue with local storage
      Alert.alert(
        'Continue Locally',
        'We\'ll keep your data on this device for now. You can sync later in Settings.',
        [{ text: 'OK', onPress: onClose }]
      );
    }
  };

  const migrateLocalDataToUser = async (userId: string, localHome: any) => {
    try {
      // Create home in database with authenticated user
      const { createHome } = await import('../lib/models/homes');
      const homeResult = await createHome({
        ...localHome,
        owner_id: userId,
        id: undefined, // Let database generate new ID
        is_local: false,
      });

      if (homeResult.success) {
        // Clear local storage
        await AsyncStorage.removeItem('homekeeper_local_home');
        console.log('✅ Local data migrated to authenticated user');
      }
    } catch (error) {
      console.error('Migration error:', error);
      // Continue anyway - user can still use the app
    }
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