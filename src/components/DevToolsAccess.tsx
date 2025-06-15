import React, { useState } from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { DevTools } from './DevTools';

interface DevToolsAccessProps {
  children: React.ReactNode;
}

export const DevToolsAccess: React.FC<DevToolsAccessProps> = ({ children }) => {
  const [devToolsVisible, setDevToolsVisible] = useState(false);
  const [tapCount, setTapCount] = useState(0);

  // Only show in development mode
  if (!__DEV__) {
    return <>{children}</>;
  }

  const handleSecretTap = () => {
    const newTapCount = tapCount + 1;
    setTapCount(newTapCount);

    // Reset after 3 seconds of inactivity
    setTimeout(() => setTapCount(0), 3000);

    // Open DevTools after 7 taps
    if (newTapCount >= 7) {
      setDevToolsVisible(true);
      setTapCount(0);
    }
  };

  return (
    <View style={styles.container}>
      {children}
      
      {/* Hidden debug trigger - only visible in dev mode */}
      <TouchableOpacity
        style={styles.debugTrigger}
        onPress={handleSecretTap}
        activeOpacity={0.1}
      >
        <Text style={styles.debugText}>
          {tapCount > 0 ? `🛠️ ${tapCount}/7` : '🛠️'}
        </Text>
      </TouchableOpacity>

      <DevTools
        visible={devToolsVisible}
        onClose={() => setDevToolsVisible(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  debugTrigger: {
    position: 'absolute',
    top: 50,
    right: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 20,
    zIndex: 9999,
  },
  debugText: {
    fontSize: 12,
    opacity: 0.3,
  },
}); 