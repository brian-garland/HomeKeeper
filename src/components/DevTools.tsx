import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Alert,
} from 'react-native';
import { Colors } from '../theme/colors';
import { Typography } from '../theme/typography';
import { Spacing } from '../theme/spacing';
import { performanceMonitor } from '../lib/services/performance';
import { feedbackService } from '../lib/services/feedback';
import { runLoadTest } from '../lib/utils/loadTesting';

interface DevToolsProps {
  visible: boolean;
  onClose: () => void;
}

export const DevTools: React.FC<DevToolsProps> = ({ visible, onClose }) => {
  // Only show in development mode
  if (!__DEV__) {
    return null;
  }
  const [activeTab, setActiveTab] = useState<'performance' | 'analytics' | 'feedback' | 'loadtest'>('performance');
  const [performanceData, setPerformanceData] = useState<any>(null);
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [feedbackData, setFeedbackData] = useState<any>(null);
  const [loadTestRunning, setLoadTestRunning] = useState(false);
  const [loadTestResults, setLoadTestResults] = useState<any>(null);

  useEffect(() => {
    if (visible) {
      loadData();
    }
  }, [visible, activeTab]);

  const loadData = async () => {
    try {
      // Load performance data
      const perfMetrics = performanceMonitor.getMetric('app_launch');
      setPerformanceData(perfMetrics ? { app_launch: perfMetrics } : {});

      // Load analytics data
      const analytics = await feedbackService.getAnalyticsSummary();
      setAnalyticsData(analytics);

      // Load feedback data
      const feedback = await feedbackService.getFeedbackSummary();
      setFeedbackData(feedback);
    } catch (error) {
      console.error('Failed to load dev tools data:', error);
    }
  };

  const runLoadTestHandler = async (type: 'light' | 'medium' | 'heavy') => {
    setLoadTestRunning(true);
    try {
      let results;
      switch (type) {
        case 'light':
          results = await runLoadTest.light();
          break;
        case 'medium':
          results = await runLoadTest.medium();
          break;
        case 'heavy':
          results = await runLoadTest.heavy();
          break;
      }
      setLoadTestResults(results);
      Alert.alert(
        'Load Test Complete',
        `${type.toUpperCase()} test completed. ${results.success ? 'Success!' : 'Failed with errors.'}`
      );
    } catch (error) {
      Alert.alert('Load Test Failed', 'An error occurred during load testing.');
    } finally {
      setLoadTestRunning(false);
    }
  };

  const renderPerformanceTab = () => (
    <ScrollView style={styles.tabContent}>
      <Text style={styles.sectionTitle}>🚀 Performance Metrics</Text>
      
      <View style={styles.metricCard}>
        <Text style={styles.metricTitle}>App Launch Time</Text>
        <Text style={styles.metricValue}>
          {performanceData?.app_launch?.duration ? 
            `${performanceData.app_launch.duration}ms` : 
            'Not measured yet'
          }
        </Text>
        <Text style={styles.metricTarget}>Target: &lt; 2000ms</Text>
      </View>

      <View style={styles.metricCard}>
        <Text style={styles.metricTitle}>Active Operations</Text>
        <Text style={styles.metricValue}>
          {performanceData ? Object.keys(performanceData).length : 0}
        </Text>
      </View>

      {performanceData && Object.entries(performanceData).map(([key, value]: [string, any]) => (
        <View key={key} style={styles.metricCard}>
          <Text style={styles.metricTitle}>{key.replace(/_/g, ' ').toUpperCase()}</Text>
          <Text style={styles.metricValue}>
            {value.duration ? `${value.duration}ms` : 'In progress...'}
          </Text>
          {value.metadata && (
            <Text style={styles.metricMeta}>
              {JSON.stringify(value.metadata, null, 2)}
            </Text>
          )}
        </View>
      ))}

      <TouchableOpacity 
        style={styles.actionButton} 
        onPress={() => {
          performanceMonitor.trackAsyncOperation('manual_test', async () => {
            // Simulate some work
            return new Promise(resolve => setTimeout(resolve, 1000));
          });
          setTimeout(loadData, 1100);
        }}
      >
        <Text style={styles.actionButtonText}>Run Performance Test</Text>
      </TouchableOpacity>
    </ScrollView>
  );

  const renderAnalyticsTab = () => (
    <ScrollView style={styles.tabContent}>
      <Text style={styles.sectionTitle}>📊 User Analytics</Text>
      
      <View style={styles.metricCard}>
        <Text style={styles.metricTitle}>Total Sessions</Text>
        <Text style={styles.metricValue}>{analyticsData?.totalSessions || 0}</Text>
      </View>

      <View style={styles.metricCard}>
        <Text style={styles.metricTitle}>Average Session Duration</Text>
        <Text style={styles.metricValue}>
          {analyticsData?.averageSessionDuration ? 
            `${Math.round(analyticsData.averageSessionDuration / 1000)}s` : 
            '0s'
          }
        </Text>
      </View>

      <View style={styles.metricCard}>
        <Text style={styles.metricTitle}>Total Task Actions</Text>
        <Text style={styles.metricValue}>{analyticsData?.totalTaskActions || 0}</Text>
      </View>

      <View style={styles.metricCard}>
        <Text style={styles.metricTitle}>Onboarding Completion Rate</Text>
        <Text style={styles.metricValue}>
          {analyticsData?.onboardingCompletionRate ? 
            `${Math.round(analyticsData.onboardingCompletionRate * 100)}%` : 
            '0%'
          }
        </Text>
      </View>

      <Text style={styles.sectionTitle}>Most Viewed Screens</Text>
      {analyticsData?.mostViewedScreens?.map((screen: any, index: number) => (
        <View key={index} style={styles.metricCard}>
          <Text style={styles.metricTitle}>{screen.screen}</Text>
          <Text style={styles.metricValue}>{screen.views} views</Text>
        </View>
      ))}

      <TouchableOpacity 
        style={styles.actionButton} 
        onPress={() => {
          // Simulate some analytics events
          feedbackService.trackScreenView('DevTools');
          feedbackService.trackTaskAction('created');
          setTimeout(loadData, 100);
        }}
      >
        <Text style={styles.actionButtonText}>Simulate User Actions</Text>
      </TouchableOpacity>
    </ScrollView>
  );

  const renderFeedbackTab = () => (
    <ScrollView style={styles.tabContent}>
      <Text style={styles.sectionTitle}>💬 User Feedback</Text>
      
      <View style={styles.metricCard}>
        <Text style={styles.metricTitle}>Total Feedback</Text>
        <Text style={styles.metricValue}>{feedbackData?.totalFeedback || 0}</Text>
      </View>

      <View style={styles.metricCard}>
        <Text style={styles.metricTitle}>Pending Submission</Text>
        <Text style={styles.metricValue}>{feedbackData?.pendingSubmission || 0}</Text>
      </View>

      {feedbackData?.averageRating && (
        <View style={styles.metricCard}>
          <Text style={styles.metricTitle}>Average Rating</Text>
          <Text style={styles.metricValue}>
            {feedbackData.averageRating.toFixed(1)} ⭐
          </Text>
        </View>
      )}

      <Text style={styles.sectionTitle}>Feedback by Type</Text>
      {feedbackData?.byType && Object.entries(feedbackData.byType).map(([type, count]: [string, any]) => (
        <View key={type} style={styles.metricCard}>
          <Text style={styles.metricTitle}>{type.toUpperCase()}</Text>
          <Text style={styles.metricValue}>{count}</Text>
        </View>
      ))}

      <TouchableOpacity 
        style={styles.actionButton} 
        onPress={async () => {
          // Add sample feedback
          await feedbackService.submitFeedback({
            type: 'general',
            title: 'Test Feedback from DevTools',
            description: 'This is a test feedback entry created from the developer tools.',
          });
          loadData();
        }}
      >
        <Text style={styles.actionButtonText}>Add Sample Feedback</Text>
      </TouchableOpacity>
    </ScrollView>
  );

  const renderLoadTestTab = () => (
    <ScrollView style={styles.tabContent}>
      <Text style={styles.sectionTitle}>🧪 Load Testing</Text>
      
      <View style={styles.loadTestButtons}>
        <TouchableOpacity 
          style={[styles.loadTestButton, { opacity: loadTestRunning ? 0.5 : 1 }]}
          onPress={() => runLoadTestHandler('light')}
          disabled={loadTestRunning}
        >
          <Text style={styles.loadTestButtonText}>Light Test</Text>
          <Text style={styles.loadTestButtonDesc}>2 homes, 5 equipment each</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.loadTestButton, { opacity: loadTestRunning ? 0.5 : 1 }]}
          onPress={() => runLoadTestHandler('medium')}
          disabled={loadTestRunning}
        >
          <Text style={styles.loadTestButtonText}>Medium Test</Text>
          <Text style={styles.loadTestButtonDesc}>5 homes, 10 equipment each</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.loadTestButton, { opacity: loadTestRunning ? 0.5 : 1 }]}
          onPress={() => runLoadTestHandler('heavy')}
          disabled={loadTestRunning}
        >
          <Text style={styles.loadTestButtonText}>Heavy Test</Text>
          <Text style={styles.loadTestButtonDesc}>10 homes, 15 equipment each</Text>
        </TouchableOpacity>
      </View>

      {loadTestRunning && (
        <View style={styles.metricCard}>
          <Text style={styles.metricTitle}>Running Load Test...</Text>
          <Text style={styles.metricValue}>Please wait</Text>
        </View>
      )}

      {loadTestResults && (
        <View style={styles.loadTestResults}>
          <Text style={styles.sectionTitle}>Latest Results</Text>
          
          <View style={styles.metricCard}>
            <Text style={styles.metricTitle}>Success</Text>
            <Text style={[styles.metricValue, { color: loadTestResults.success ? Colors.success : Colors.error }]}>
              {loadTestResults.success ? 'PASS' : 'FAIL'}
            </Text>
          </View>

          <View style={styles.metricCard}>
            <Text style={styles.metricTitle}>Data Generation</Text>
            <Text style={styles.metricValue}>{loadTestResults.dataGenerationTime}ms</Text>
          </View>

          <View style={styles.metricCard}>
            <Text style={styles.metricTitle}>Storage Write</Text>
            <Text style={styles.metricValue}>{loadTestResults.storageWriteTime}ms</Text>
          </View>

          <View style={styles.metricCard}>
            <Text style={styles.metricTitle}>Storage Read</Text>
            <Text style={styles.metricValue}>{loadTestResults.storageReadTime}ms</Text>
          </View>

          <View style={styles.metricCard}>
            <Text style={styles.metricTitle}>Data Size</Text>
            <Text style={styles.metricValue}>{Math.round(loadTestResults.totalDataSize / 1024)}KB</Text>
          </View>

          {loadTestResults.errors?.length > 0 && (
            <View style={styles.metricCard}>
              <Text style={styles.metricTitle}>Errors</Text>
              {loadTestResults.errors.map((error: string, index: number) => (
                <Text key={index} style={styles.errorText}>{error}</Text>
              ))}
            </View>
          )}
        </View>
      )}
    </ScrollView>
  );

  const tabs = [
    { key: 'performance', label: '🚀 Performance', render: renderPerformanceTab },
    { key: 'analytics', label: '📊 Analytics', render: renderAnalyticsTab },
    { key: 'feedback', label: '💬 Feedback', render: renderFeedbackTab },
    { key: 'loadtest', label: '🧪 Load Test', render: renderLoadTestTab },
  ];

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>🛠️ Developer Tools</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.tabBar}>
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.key}
              style={[
                styles.tab,
                { backgroundColor: activeTab === tab.key ? Colors.primary : Colors.surface }
              ]}
              onPress={() => setActiveTab(tab.key as any)}
            >
              <Text style={[
                styles.tabText,
                { color: activeTab === tab.key ? Colors.white : Colors.textPrimary }
              ]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {tabs.find(tab => tab.key === activeTab)?.render()}
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
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  tab: {
    flex: 1,
    padding: Spacing.md,
    alignItems: 'center',
  },
  tabText: {
    ...Typography.labelMedium,
    fontSize: 12,
  },
  tabContent: {
    flex: 1,
    padding: Spacing.lg,
  },
  sectionTitle: {
    ...Typography.titleLarge,
    marginBottom: Spacing.lg,
    marginTop: Spacing.lg,
  },
  metricCard: {
    backgroundColor: Colors.surface,
    padding: Spacing.md,
    borderRadius: 8,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  metricTitle: {
    ...Typography.labelMedium,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  metricValue: {
    ...Typography.headlineSmall,
    color: Colors.textPrimary,
  },
  metricTarget: {
    ...Typography.bodySmall,
    color: Colors.textTertiary,
    marginTop: Spacing.xs,
  },
  metricMeta: {
    ...Typography.bodySmall,
    color: Colors.textTertiary,
    marginTop: Spacing.xs,
    fontFamily: 'monospace',
  },
  actionButton: {
    backgroundColor: Colors.primary,
    padding: Spacing.md,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: Spacing.lg,
  },
  actionButtonText: {
    ...Typography.labelLarge,
    color: Colors.white,
  },
  loadTestButtons: {
    gap: Spacing.md,
  },
  loadTestButton: {
    backgroundColor: Colors.info,
    padding: Spacing.md,
    borderRadius: 8,
    alignItems: 'center',
  },
  loadTestButtonText: {
    ...Typography.labelLarge,
    color: Colors.white,
  },
  loadTestButtonDesc: {
    ...Typography.bodySmall,
    color: Colors.white,
    opacity: 0.8,
    marginTop: Spacing.xs,
  },
  loadTestResults: {
    marginTop: Spacing.lg,
  },
  errorText: {
    ...Typography.bodySmall,
    color: Colors.error,
    marginTop: Spacing.xs,
  },
}); 