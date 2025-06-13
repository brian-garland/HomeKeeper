import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Icon } from '../components/icons/Icon';
import { Colors } from '../theme/colors';
import { Typography } from '../theme/typography';
import { Spacing } from '../theme/spacing';
import PrimaryButton from '../components/buttons/PrimaryButton';
import SecondaryButton from '../components/buttons/SecondaryButton';
import { useDataContext } from '../contexts/DataContext';

interface QuickStat {
  id: string;
  title: string;
  value: string;
  icon: any;
  color: string;
  trend?: string;
}

interface RecentActivity {
  id: string;
  type: 'task' | 'maintenance' | 'property';
  title: string;
  subtitle: string;
  time: string;
  status: 'completed' | 'pending' | 'overdue';
}

interface WeatherData {
  temperature: number;
  condition: string;
  icon: string;
  recommendation?: string;
}

export const DashboardScreen: React.FC = () => {
  const navigation = useNavigation();
  const { homes, tasks } = useDataContext();
  const [refreshing, setRefreshing] = useState(false);
  
  // Calculate dashboard stats from tasks
  const dashboardStats = {
    homeCount: homes.length,
    activeTasks: tasks.filter(task => !task.completed_at).length,
    overdueTasks: tasks.filter(task => !task.completed_at && task.due_date && new Date(task.due_date) < new Date()).length,
    completedTasks: tasks.filter(task => task.completed_at).length,
  };
  const [weather, setWeather] = useState<WeatherData>({
    temperature: 72,
    condition: 'Partly Cloudy',
    icon: 'partly-sunny',
    recommendation: 'Great day for outdoor maintenance tasks!'
  });

  // Real data from Supabase
  const quickStats: QuickStat[] = [
    {
      id: '1',
      title: 'Homes',
      value: dashboardStats.homeCount.toString(),
      icon: 'properties',
      color: Colors.primary,
    },
    {
      id: '2',
      title: 'Active Tasks',
      value: dashboardStats.activeTasks.toString(),
      icon: 'tasks',
      color: Colors.info,
    },
    {
      id: '3',
      title: 'Overdue',
      value: dashboardStats.overdueTasks.toString(),
      icon: 'warning',
      color: Colors.warning,
    },
    {
      id: '4',
      title: 'Completed',
      value: dashboardStats.completedTasks.toString(),
      icon: 'check',
      color: Colors.success,
    },
  ];

  const recentActivity: RecentActivity[] = [
    {
      id: '1',
      type: 'task',
      title: 'Clean gutters',
      subtitle: 'Main House - Seasonal',
      time: '2 hours ago',
      status: 'completed'
    },
    {
      id: '2',
      type: 'maintenance',
      title: 'HVAC filter replacement',
      subtitle: 'Due in 3 days',
      time: 'Upcoming',
      status: 'pending'
    },
    {
      id: '3',
      type: 'task',
      title: 'Winterize sprinkler system',
      subtitle: 'Backyard - Overdue by 2 days',
      time: '2 days ago',
      status: 'overdue'
    },
  ];

  const onRefresh = async () => {
    setRefreshing(true);
    // In development mode, we don't need to refresh from server
    // The data is already managed by the DataContext
    setTimeout(() => setRefreshing(false), 500);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return Colors.success;
      case 'pending': return Colors.info;
      case 'overdue': return Colors.error;
      default: return Colors.textSecondary;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return 'check';
      case 'pending': return 'clock';
      case 'overdue': return 'warning';
      default: return 'info';
    }
  };

  const handleStatPress = (statId: string) => {
    switch (statId) {
      case '1': // Homes
        navigation.navigate('Properties' as never);
        break;
      case '2': // Active Tasks
        (navigation as any).navigate('Tasks', { 
          screen: 'TasksList', 
          params: { filter: 'pending' } 
        });
        break;
      case '3': // Overdue Tasks
        (navigation as any).navigate('Tasks', { 
          screen: 'TasksList', 
          params: { filter: 'overdue' } 
        });
        break;
      case '4': // Completed Tasks
        // For completed tasks, we'll show all tasks since we don't have a completed filter yet
        // This can be enhanced in Phase 2
        (navigation as any).navigate('Tasks', { 
          screen: 'TasksList', 
          params: { filter: 'all' } 
        });
        break;
      default:
        break;
    }
  };

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      showsVerticalScrollIndicator={false}
    >


      {/* Welcome Section */}
      <View style={styles.welcomeSection}>
        <Text style={styles.welcomeTitle}>Good morning! 🏠</Text>
        <Text style={styles.welcomeSubtitle}>
          Here's what's happening with your properties today
        </Text>
      </View>

      {/* Weather Card */}
      <View style={styles.weatherCard}>
        <View style={styles.weatherHeader}>
          <Icon name="info" size="lg" color={Colors.info} />
          <View style={styles.weatherInfo}>
            <Text style={styles.weatherTemp}>{weather.temperature}°F</Text>
            <Text style={styles.weatherCondition}>{weather.condition}</Text>
          </View>
        </View>
        {weather.recommendation && (
          <Text style={styles.weatherRecommendation}>
            💡 {weather.recommendation}
          </Text>
        )}
      </View>

      {/* Quick Stats */}
      <View style={styles.statsSection}>
        <Text style={styles.sectionTitle}>Quick Overview</Text>
        <View style={styles.statsGrid}>
          {quickStats.map((stat) => (
            <TouchableOpacity 
              key={stat.id} 
              style={styles.statCard}
              onPress={() => handleStatPress(stat.id)}
            >
              <View style={styles.statHeader}>
                <Icon name={stat.icon} size="lg" color={stat.color} />
                <Text style={[styles.statValue, { color: stat.color }]}>
                  {stat.value}
                </Text>
              </View>
              <Text style={styles.statTitle}>{stat.title}</Text>
              {stat.trend && (
                <Text style={styles.statTrend}>{stat.trend}</Text>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.actionsSection}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionButtons}>
          <PrimaryButton
            title="Add Task"
            onPress={() => (navigation as any).navigate('Tasks', { screen: 'AddTask' })}
            size="small"
            style={styles.actionButton}
          />
          <SecondaryButton
            title="Schedule Maintenance"
            onPress={() => (navigation as any).navigate('Maintenance', { screen: 'AddMaintenance' })}
            size="small"
            style={styles.actionButton}
          />
        </View>
      </View>

      {/* Recent Activity */}
      <View style={styles.activitySection}>
        <Text style={styles.sectionTitle}>Recent Activity</Text>
        {recentActivity.map((activity) => (
          <TouchableOpacity key={activity.id} style={styles.activityCard}>
            <View style={styles.activityIcon}>
              <Icon 
                name={getStatusIcon(activity.status)} 
                size="md" 
                color={getStatusColor(activity.status)} 
              />
            </View>
            <View style={styles.activityContent}>
              <Text style={styles.activityTitle}>{activity.title}</Text>
              <Text style={styles.activitySubtitle}>{activity.subtitle}</Text>
              <Text style={styles.activityTime}>{activity.time}</Text>
            </View>
            <Icon name="right" size="sm" color={Colors.textTertiary} />
          </TouchableOpacity>
        ))}
      </View>

      {/* Bottom Spacing */}
      <View style={styles.bottomSpacing} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    paddingBottom: Spacing.huge,
  },
  devBanner: {
    backgroundColor: Colors.warningLight,
    marginHorizontal: Spacing.xl,
    marginTop: Spacing.md,
    marginBottom: Spacing.lg,
    padding: Spacing.md,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.warning,
  },
  devBannerText: {
    ...Typography.bodyMedium,
    color: Colors.warning,
    marginLeft: Spacing.sm,
    fontWeight: '500',
  },
  welcomeSection: {
    padding: Spacing.xl,
    paddingTop: Spacing.lg,
  },
  welcomeTitle: {
    ...Typography.displayMedium,
    marginBottom: Spacing.xs,
  },
  welcomeSubtitle: {
    ...Typography.bodyLarge,
    color: Colors.textSecondary,
  },
  weatherCard: {
    backgroundColor: Colors.white,
    marginHorizontal: Spacing.xl,
    marginBottom: Spacing.lg,
    padding: Spacing.lg,
    borderRadius: 12,
    ...Platform.select({
      ios: {
        shadowColor: Colors.gray900,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  weatherHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  weatherInfo: {
    marginLeft: Spacing.md,
  },
  weatherTemp: {
    ...Typography.headlineMedium,
    color: Colors.textPrimary,
  },
  weatherCondition: {
    ...Typography.bodyMedium,
    color: Colors.textSecondary,
  },
  weatherRecommendation: {
    ...Typography.bodyMedium,
    color: Colors.info,
    backgroundColor: Colors.infoLight,
    padding: Spacing.md,
    borderRadius: 8,
    marginTop: Spacing.sm,
  },
  statsSection: {
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    ...Typography.headlineMedium,
    marginBottom: Spacing.lg,
    color: Colors.textPrimary,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: Spacing.md,
  },
  statCard: {
    backgroundColor: Colors.white,
    padding: Spacing.lg,
    borderRadius: 12,
    width: '48%',
    ...Platform.select({
      ios: {
        shadowColor: Colors.gray900,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  statValue: {
    ...Typography.displaySmall,
    fontWeight: 'bold',
  },
  statTitle: {
    ...Typography.bodyMedium,
    color: Colors.textSecondary,
  },
  statTrend: {
    ...Typography.caption,
    color: Colors.success,
    marginTop: Spacing.xs,
  },
  actionsSection: {
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.lg,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  actionButton: {
    flex: 1,
  },
  activitySection: {
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.lg,
  },
  activityCard: {
    backgroundColor: Colors.white,
    padding: Spacing.lg,
    borderRadius: 12,
    marginBottom: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: Colors.gray900,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    ...Typography.titleMedium,
    marginBottom: Spacing.xs,
  },
  activitySubtitle: {
    ...Typography.bodyMedium,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  activityTime: {
    ...Typography.caption,
    color: Colors.textTertiary,
  },
  bottomSpacing: {
    height: Spacing.xl,
  },
}); 