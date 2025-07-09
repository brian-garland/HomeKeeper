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
// Weather service import removed - can be re-added when location is collected
// import { getCurrentWeather } from '../lib/services/weatherService';
import NotificationTestPanel from '../components/NotificationTestPanel';

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

// Weather data interface - kept for future use when location is collected
// interface WeatherData {
//   temperature: number;
//   condition: string;
//   icon: string;
//   recommendation?: string;
// }

export const DashboardScreen: React.FC = () => {
  const navigation = useNavigation();
  const { homes, tasks, equipment, totalMoneySaved } = useDataContext();
  const [refreshing, setRefreshing] = useState(false);
  
  // Helper function to check if a date is today
  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  // Helper function to check if a task is overdue
  const isOverdue = (task: any) => {
    if (!task.due_date || task.completed_at) return false;
    return new Date(task.due_date) < new Date();
  };

  // Helper function to get time-appropriate greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    
    if (hour < 12) {
      return 'Good morning!';
    } else if (hour < 17) {
      return 'Good afternoon!';
    } else {
      return 'Good evening!';
    }
  };

  // Calculate intelligent dashboard stats
  const dashboardStats = {
    // Equipment Status Intelligence (now considers task status)
    healthyEquipmentCount: equipment.filter(item => {
      // We need to check both equipment status and task status
      // For now, keep the existing logic but this should be enhanced
      return !item.needs_attention && item.active !== false
    }).length,
    totalEquipmentCount: equipment.length,
    
    // Today's Tasks Intelligence
    todayTaskCount: tasks.filter(task => 
      !task.completed_at && 
      task.due_date && 
      isToday(new Date(task.due_date))
    ).length,
    
    // Urgent Items Intelligence (combines overdue tasks + equipment needing attention)
    urgentCount: [
      ...tasks.filter(task => isOverdue(task)),
      ...equipment.filter(item => item.needs_attention === true)
    ].length,
    
    // Monthly Progress Intelligence
    monthlyCompletionRate: (() => {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const completedThisMonth = tasks.filter(task => 
        task.completed_at && 
        new Date(task.completed_at) >= startOfMonth
      ).length;
      const totalTasksThisMonth = tasks.filter(task => 
        task.created_at && 
        new Date(task.created_at) >= startOfMonth
      ).length;
      
      if (totalTasksThisMonth === 0) return 0;
      return Math.round((completedThisMonth / totalTasksThisMonth) * 100);
    })(),
  };
  // Weather state removed - will be re-added when location is collected
  // const [weather, setWeather] = useState<WeatherData>({
  //   temperature: 72,
  //   condition: 'Partly Cloudy',
  //   icon: 'partly-sunny',
  //   recommendation: 'Great day for outdoor maintenance tasks!'
  // });

  // Weather loading removed - will be re-added when location is collected
  // useEffect(() => {
  //   loadWeatherData();
  // }, [homes]);

  // Weather function kept for future use when location is collected
  /*
  const loadWeatherData = async () => {
    console.log('🌤️ Dashboard loadWeatherData called, homes:', homes.length);
    if (homes.length > 0) {
      const home = homes[0];
      console.log('🏠 First home:', { id: home.id, latitude: home.latitude, longitude: home.longitude });
      // Check if home has coordinates (from onboarding)
      if (home.latitude && home.longitude) {
        console.log('🌤️ Loading real weather for dashboard:', home.latitude, home.longitude);
        const weatherResult = await getCurrentWeather(home.latitude, home.longitude);
        
        if (weatherResult.success) {
          const weatherData = weatherResult.data;
          setWeather({
            temperature: weatherData.temperature,
            condition: weatherData.description,
            icon: weatherData.icon,
            recommendation: weatherData.isOutdoorFriendly 
              ? 'Great day for outdoor maintenance tasks!'
              : 'Better to focus on indoor tasks today.'
          });
          console.log('✅ Dashboard weather updated:', weatherData.temperature + '°F', weatherData.description);
        } else {
          console.warn('⚠️ Failed to load weather for dashboard:', weatherResult.error);
        }
      } else {
        console.log('📍 No coordinates available for weather data');
      }
    } else {
      console.log('📍 No homes available yet');
    }
  };
  */

  // Intelligence Dashboard Cards
  const quickStats: QuickStat[] = [
    {
      id: '1',
      title: 'Money Saved',
      value: `$${totalMoneySaved.toFixed(0)}`,
      icon: 'up',
      color: Colors.success,
      trend: 'by doing tasks yourself'
    },
    {
      id: '2',
      title: 'Equipment Status',
      value: `${dashboardStats.healthyEquipmentCount}/${dashboardStats.totalEquipmentCount}`,
      icon: 'equipment',
      color: Colors.primary,
    },
    {
      id: '3',
      title: 'Today\'s Tasks',
      value: dashboardStats.todayTaskCount.toString(),
      icon: 'calendar',
      color: Colors.info,
    },
    {
      id: '4',
      title: 'Urgent Items',
      value: dashboardStats.urgentCount.toString(),
      icon: 'warning',
      color: Colors.warning,
    },
  ];

  // Generate recent activity from actual tasks
  const generateRecentActivity = (): RecentActivity[] => {
    const activities: RecentActivity[] = [];
    
    // Get completed tasks (most recent first)
    const completedTasks = tasks
      .filter(task => task.status === 'completed' && task.completed_at)
      .sort((a, b) => new Date(b.completed_at!).getTime() - new Date(a.completed_at!).getTime())
      .slice(0, 3); // Get last 3 completed tasks
    
    // Add completed tasks to activities
    completedTasks.forEach(task => {
      const completedDate = new Date(task.completed_at!);
      const timeAgo = getTimeAgo(completedDate);
      const taskEquipment = task.equipment_id ? 
        equipment.find((eq: any) => eq.id === task.equipment_id) : null;
      
              activities.push({
          id: task.id,
          type: 'task',
          title: task.title,
          subtitle: taskEquipment ? 
            `${taskEquipment.name} - ${task.category}` : 
            `${task.category} task`,
          time: timeAgo,
          status: 'completed'
        });
    });
    
    // If we have fewer than 3 activities, add some upcoming/overdue tasks
    if (activities.length < 3) {
      const upcomingTasks = tasks
        .filter(task => task.status === 'pending')
        .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime())
        .slice(0, 3 - activities.length);
      
      upcomingTasks.forEach(task => {
        const dueDate = new Date(task.due_date);
        const isTaskOverdue = isOverdue(task);
                 const taskEquipmentUpcoming = task.equipment_id ? 
           equipment.find((eq: any) => eq.id === task.equipment_id) : null;
        
        activities.push({
          id: task.id,
          type: 'task',
          title: task.title,
                     subtitle: taskEquipmentUpcoming ? 
             `${taskEquipmentUpcoming.name} - Due ${dueDate.toLocaleDateString()}` : 
             `Due ${dueDate.toLocaleDateString()}`,
          time: isTaskOverdue ? 
            `Overdue by ${Math.ceil((Date.now() - dueDate.getTime()) / (1000 * 60 * 60 * 24))} days` :
            `Due in ${Math.ceil((dueDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))} days`,
          status: isTaskOverdue ? 'overdue' : 'pending'
        });
      });
    }
    
    return activities;
  };

  // Helper function to get time ago string
  const getTimeAgo = (date: Date): string => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    return date.toLocaleDateString();
  };

  const recentActivity = generateRecentActivity();

  const onRefresh = async () => {
    setRefreshing(true);
    // Weather refresh removed - will be re-added when location is collected
    // await loadWeatherData();
    // In development mode, we don't need to refresh from server
    // The data is already managed by the DataContext
    setRefreshing(false);
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
      case '1': // Money Saved
        (navigation as any).navigate('Tasks', { 
          screen: 'TasksList', 
          params: { filter: 'done' } 
        });
        break;
      case '2': // Equipment Status
        navigation.navigate('Equipment' as never);
        break;
      case '3': // Today's Tasks
        (navigation as any).navigate('Tasks', { 
          screen: 'TasksList', 
          params: { filter: 'open' } 
        });
        break;
      case '4': // Urgent Items (overdue tasks + equipment needing attention)
        (navigation as any).navigate('Tasks', { 
          screen: 'TasksList', 
          params: { filter: 'urgent' } 
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
        <Text style={styles.welcomeTitle}>{getGreeting()} 🏠</Text>
        <Text style={styles.welcomeSubtitle}>
          Here's what's happening with your property today
        </Text>
      </View>

      {/* Weather Card removed - will be re-added when location is collected */}
      {/* To re-enable: uncomment weather state, loadWeatherData function, and this card */}

      {/* Intelligence Dashboard */}
      <View style={styles.statsSection}>
        <Text style={styles.sectionTitle}>Your Home Today</Text>
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

      {/* Notification Test Panel - Remove this after testing */}
      {__DEV__ && <NotificationTestPanel />}

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
  // Weather styles - kept for future use when location is collected
  // weatherCard: {
  //   backgroundColor: Colors.white,
  //   marginHorizontal: Spacing.xl,
  //   marginBottom: Spacing.lg,
  //   padding: Spacing.lg,
  //   borderRadius: 12,
  //   ...Platform.select({
  //     ios: {
  //       shadowColor: Colors.gray900,
  //       shadowOffset: { width: 0, height: 2 },
  //       shadowOpacity: 0.1,
  //       shadowRadius: 4,
  //     },
  //     android: {
  //       elevation: 2,
  //     },
  //   }),
  // },
  // weatherHeader: {
  //   flexDirection: 'row',
  //   alignItems: 'center',
  //   marginBottom: Spacing.sm,
  // },
  // weatherInfo: {
  //   marginLeft: Spacing.md,
  // },
  // weatherTemp: {
  //   ...Typography.headlineMedium,
  //   color: Colors.textPrimary,
  // },
  // weatherCondition: {
  //   ...Typography.bodyMedium,
  //   color: Colors.textSecondary,
  // },
  // weatherRecommendation: {
  //   ...Typography.bodyMedium,
  //   color: Colors.info,
  //   backgroundColor: Colors.infoLight,
  //   padding: Spacing.md,
  //   borderRadius: 8,
  //   marginTop: Spacing.sm,
  // },
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