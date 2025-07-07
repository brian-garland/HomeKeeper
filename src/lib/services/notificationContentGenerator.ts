import {
  NotificationType,
  NotificationContent,
  NotificationTemplate,
  NotificationContext
} from '../../types/notifications';
import type { Task, Equipment, Home } from '../../types';

interface ContentVariables {
  [key: string]: string | number | boolean;
}

interface WeatherInfo {
  condition: string;
  temperature: number;
  isGoodForOutdoorWork: boolean;
}

class NotificationContentGenerator {
  private static instance: NotificationContentGenerator;
  private templates: Map<NotificationType, NotificationTemplate[]> = new Map();

  private constructor() {
    this.initializeTemplates();
  }

  static getInstance(): NotificationContentGenerator {
    if (!NotificationContentGenerator.instance) {
      NotificationContentGenerator.instance = new NotificationContentGenerator();
    }
    return NotificationContentGenerator.instance;
  }

  private initializeTemplates(): void {
    // Task reminder templates
    this.templates.set(NotificationType.TASK_REMINDER, [
      {
        type: NotificationType.TASK_REMINDER,
        priority: 'high' as any,
        titleTemplate: "{emoji} {timeFrame}: {taskName}",
        bodyTemplate: "{description} ({duration}, Save ${savings})",
        emoji: "🏠",
        variables: ['emoji', 'timeFrame', 'taskName', 'description', 'duration', 'savings']
      },
      {
        type: NotificationType.TASK_REMINDER,
        priority: 'normal' as any,
        titleTemplate: "{emoji} Task Ready: {taskName}",
        bodyTemplate: "{motivationalPhrase} {timeEstimate}",
        emoji: "⚡",
        variables: ['emoji', 'taskName', 'motivationalPhrase', 'timeEstimate']
      },
      {
        type: NotificationType.TASK_REMINDER,
        priority: 'normal' as any,
        titleTemplate: "{emoji} {taskName}",
        bodyTemplate: "{seasonalContext} Perfect time to {action}!",
        emoji: "🔧",
        variables: ['emoji', 'taskName', 'seasonalContext', 'action']
      }
    ]);

    // Equipment service templates
    this.templates.set(NotificationType.EQUIPMENT_SERVICE, [
      {
        type: NotificationType.EQUIPMENT_SERVICE,
        priority: 'high' as any,
        titleTemplate: "🔧 {equipmentName} Service Due",
        bodyTemplate: "Keep your {equipmentType} running efficiently. Last service: {lastServiceDate}",
        emoji: "🔧",
        variables: ['equipmentName', 'equipmentType', 'lastServiceDate']
      },
      {
        type: NotificationType.EQUIPMENT_SERVICE,
        priority: 'normal' as any,
        titleTemplate: "⚙️ {equipmentName} Maintenance",
        bodyTemplate: "Scheduled {serviceType} due {timeFrame}. {benefits}",
        emoji: "⚙️",
        variables: ['equipmentName', 'serviceType', 'timeFrame', 'benefits']
      }
    ]);

    // Achievement templates
    this.templates.set(NotificationType.ACHIEVEMENT, [
      {
        type: NotificationType.ACHIEVEMENT,
        priority: 'normal' as any,
        titleTemplate: "🎉 {achievementType}!",
        bodyTemplate: "{celebrationMessage} {statistic}",
        emoji: "🎉",
        variables: ['achievementType', 'celebrationMessage', 'statistic']
      },
      {
        type: NotificationType.MONEY_SAVED,
        priority: 'normal' as any,
        titleTemplate: "💰 Money Saved!",
        bodyTemplate: "You've saved ${amount} {timeFrame} with DIY maintenance!",
        emoji: "💰",
        variables: ['amount', 'timeFrame']
      },
      {
        type: NotificationType.STREAK,
        priority: 'normal' as any,
        titleTemplate: "🔥 {streakCount} Task Streak!",
        bodyTemplate: "{motivationalMessage} Keep up the momentum!",
        emoji: "🔥",
        variables: ['streakCount', 'motivationalMessage']
      }
    ]);

    // Seasonal suggestion templates
    this.templates.set(NotificationType.SEASONAL_SUGGESTION, [
      {
        type: NotificationType.SEASONAL_SUGGESTION,
        priority: 'low' as any,
        titleTemplate: "{seasonEmoji} {season} Maintenance",
        bodyTemplate: "Perfect time for {suggestions}. Your home will thank you!",
        emoji: "🍂",
        variables: ['seasonEmoji', 'season', 'suggestions']
      },
      {
        type: NotificationType.SEASONAL_SUGGESTION,
        priority: 'low' as any,
        titleTemplate: "{emoji} {season} Prep Checklist",
        bodyTemplate: "Get ready for {nextSeason}: {actionItems}",
        emoji: "📋",
        variables: ['emoji', 'season', 'nextSeason', 'actionItems']
      }
    ]);

    // Weather opportunity templates
    this.templates.set(NotificationType.WEATHER_OPPORTUNITY, [
      {
        type: NotificationType.WEATHER_OPPORTUNITY,
        priority: 'normal' as any,
        titleTemplate: "🌤️ Perfect Weather for {activity}",
        bodyTemplate: "{weatherDescription} Ideal for: {outdoorTasks}",
        emoji: "🌤️",
        variables: ['activity', 'weatherDescription', 'outdoorTasks']
      },
      {
        type: NotificationType.WEATHER_OPPORTUNITY,
        priority: 'low' as any,
        titleTemplate: "☀️ Great Day for Outdoor Tasks",
        bodyTemplate: "{temperature}°F and {condition}. Time to tackle {taskCount} outdoor tasks!",
        emoji: "☀️",
        variables: ['temperature', 'condition', 'taskCount']
      }
    ]);

    // Equipment attention templates
    this.templates.set(NotificationType.EQUIPMENT_ATTENTION, [
      {
        type: NotificationType.EQUIPMENT_ATTENTION,
        priority: 'high' as any,
        titleTemplate: "⚠️ {equipmentName} Needs Attention",
        bodyTemplate: "{issueDescription} Quick action can prevent bigger problems.",
        emoji: "⚠️",
        variables: ['equipmentName', 'issueDescription']
      }
    ]);
  }

  generateTaskReminderContent(
    task: Task,
    reminderType: 'advance' | 'due' | 'overdue',
    context: NotificationContext,
    userPreferenceStyle: string = 'standard'
  ): NotificationContent {
    const variables = this.buildTaskVariables(task, reminderType, context);
    const template = this.selectTemplate(NotificationType.TASK_REMINDER, userPreferenceStyle, context);
    
    return this.renderTemplate(template, variables);
  }

  generateEquipmentServiceContent(
    equipment: Equipment,
    serviceType: 'routine' | 'overdue' | 'attention',
    context: NotificationContext
  ): NotificationContent {
    const variables = this.buildEquipmentVariables(equipment, serviceType, context);
    const template = this.selectTemplate(NotificationType.EQUIPMENT_SERVICE, 'standard', context);
    
    return this.renderTemplate(template, variables);
  }

  generateAchievementContent(
    achievementType: 'money_saved' | 'streak' | 'completion' | 'milestone',
    data: any,
    context: NotificationContext
  ): NotificationContent {
    const variables = this.buildAchievementVariables(achievementType, data, context);
    const template = this.selectTemplate(NotificationType.ACHIEVEMENT, 'standard', context);
    
    return this.renderTemplate(template, variables);
  }

  generateSeasonalSuggestionContent(
    suggestions: string[],
    season: string,
    context: NotificationContext,
    home?: Home
  ): NotificationContent {
    const variables = this.buildSeasonalVariables(suggestions, season, context, home);
    const template = this.selectTemplate(NotificationType.SEASONAL_SUGGESTION, 'standard', context);
    
    return this.renderTemplate(template, variables);
  }

  generateWeatherOpportunityContent(
    outdoorTasks: Task[],
    weather: WeatherInfo,
    context: NotificationContext
  ): NotificationContent {
    const variables = this.buildWeatherVariables(outdoorTasks, weather, context);
    const template = this.selectTemplate(NotificationType.WEATHER_OPPORTUNITY, 'standard', context);
    
    return this.renderTemplate(template, variables);
  }

  private buildTaskVariables(
    task: Task,
    reminderType: string,
    context: NotificationContext
  ): ContentVariables {
    const timeFrames = {
      advance: 'This Weekend',
      due: 'Due Tomorrow', 
      overdue: 'Due Today'
    };

    const motivationalPhrases = [
      "Ready to tackle this?",
      "Let's get this done!",
      "Your home is counting on you!",
      "Perfect timing for this task",
      "Small effort, big impact"
    ];

    const seasonalContexts = {
      spring: "Spring is the perfect time to",
      summer: "Take advantage of the warm weather to",
      fall: "Get ready for winter by",
      winter: "Stay cozy and productive by"
    };

    return {
      emoji: this.getTaskEmoji(task),
      timeFrame: timeFrames[reminderType as keyof typeof timeFrames] || 'Task Ready',
      taskName: task.title,
      description: this.getShortDescription(task),
      duration: this.formatDuration(task.estimated_duration_minutes),
      savings: task.money_saved_estimate || 0,
      motivationalPhrase: this.getRandomItem(motivationalPhrases),
      timeEstimate: task.estimated_duration_minutes ? `(${task.estimated_duration_minutes} min)` : '',
      seasonalContext: seasonalContexts[context.season] || '',
      action: task.title.toLowerCase().replace(/^(check|clean|replace|inspect)\s+/, '')
    };
  }

  private buildEquipmentVariables(
    equipment: Equipment,
    serviceType: string,
    context: NotificationContext
  ): ContentVariables {
    const serviceTypes = {
      routine: 'routine maintenance',
      overdue: 'overdue service',
      attention: 'immediate attention'
    };

    const benefits = {
      'HVAC': 'Lower energy bills and better air quality',
      'Plumbing': 'Prevent costly leaks and water damage',
      'Electrical': 'Safety and efficiency improvements',
      'Appliance': 'Extended lifespan and performance'
    };

    return {
      equipmentName: equipment.name,
      equipmentType: equipment.type.toLowerCase(),
      lastServiceDate: equipment.last_service_date 
        ? new Date(equipment.last_service_date).toLocaleDateString()
        : 'Unknown',
      serviceType: serviceTypes[serviceType as keyof typeof serviceTypes] || 'service',
      timeFrame: this.getServiceTimeFrame(equipment),
      benefits: benefits[equipment.category as keyof typeof benefits] || 'Optimal performance',
      issueDescription: equipment.notes || 'General maintenance needed'
    };
  }

  private buildAchievementVariables(
    achievementType: string,
    data: any,
    context: NotificationContext
  ): ContentVariables {
    const celebrationMessages = {
      money_saved: "Fantastic savings",
      streak: "You're on fire",
      completion: "Task completed",
      milestone: "Milestone reached"
    };

    const statistics = {
      money_saved: `$${data.amount} saved ${data.period}`,
      streak: `${data.count} tasks in a row`,
      completion: `"${data.taskName}" finished`,
      milestone: `${data.count} total tasks completed`
    };

    return {
      achievementType: achievementType.replace('_', ' ').toUpperCase(),
      celebrationMessage: celebrationMessages[achievementType as keyof typeof celebrationMessages] || 'Great job',
      statistic: statistics[achievementType as keyof typeof statistics] || data.description || '',
      amount: data.amount || 0,
      timeFrame: data.period || 'this month',
      streakCount: data.count || 0,
      motivationalMessage: this.getMotivationalMessage(data.count || 0)
    };
  }

  private buildSeasonalVariables(
    suggestions: string[],
    season: string,
    context: NotificationContext,
    home?: Home
  ): ContentVariables {
    const seasonEmojis = {
      spring: '🌸',
      summer: '☀️',
      fall: '🍂',
      winter: '❄️'
    };

    const nextSeasons = {
      spring: 'summer',
      summer: 'fall', 
      fall: 'winter',
      winter: 'spring'
    };

    return {
      seasonEmoji: seasonEmojis[season as keyof typeof seasonEmojis] || '🏠',
      season: season.charAt(0).toUpperCase() + season.slice(1),
      suggestions: suggestions.slice(0, 2).join(' and '),
      nextSeason: nextSeasons[season as keyof typeof nextSeasons] || 'next season',
      actionItems: suggestions.slice(0, 3).join(', '),
      emoji: seasonEmojis[season as keyof typeof seasonEmojis] || '📋'
    };
  }

  private buildWeatherVariables(
    outdoorTasks: Task[],
    weather: WeatherInfo,
    context: NotificationContext
  ): ContentVariables {
    const activities = outdoorTasks.length > 0 
      ? outdoorTasks[0].title.toLowerCase()
      : 'outdoor maintenance';

    return {
      activity: activities,
      weatherDescription: `${weather.temperature}°F and ${weather.condition.toLowerCase()}.`,
      outdoorTasks: outdoorTasks.slice(0, 2).map(t => t.title).join(' and '),
      temperature: weather.temperature,
      condition: weather.condition.toLowerCase(),
      taskCount: outdoorTasks.length
    };
  }

  private selectTemplate(
    type: NotificationType,
    userStyle: string,
    context: NotificationContext
  ): NotificationTemplate {
    const templates = this.templates.get(type) || [];
    
    if (templates.length === 0) {
      return this.getDefaultTemplate(type);
    }

    // Smart template selection based on context and user style
    if (userStyle === 'gentle' && templates.length > 1) {
      return templates[Math.min(1, templates.length - 1)]; // Prefer softer templates
    }

    if (context.timeOfDay === 'morning' && templates.length > 0) {
      return templates[0]; // More energetic morning templates
    }

    // Default to first template or random selection
    return templates[Math.floor(Math.random() * templates.length)];
  }

  private renderTemplate(template: NotificationTemplate, variables: ContentVariables): NotificationContent {
    let title = template.titleTemplate;
    let body = template.bodyTemplate;

    // Replace all variables in title and body
    Object.entries(variables).forEach(([key, value]) => {
      const placeholder = `{${key}}`;
      title = title.replace(new RegExp(placeholder, 'g'), String(value));
      body = body.replace(new RegExp(placeholder, 'g'), String(value));
    });

    // Clean up any unreplaced placeholders
    title = title.replace(/{[^}]+}/g, '');
    body = body.replace(/{[^}]+}/g, '');

    return {
      title: title.trim(),
      body: body.trim(),
      emoji: template.emoji,
      metadata: variables
    };
  }

  private getDefaultTemplate(type: NotificationType): NotificationTemplate {
    return {
      type,
      priority: 'normal' as any,
      titleTemplate: "🏠 HomeKeeper Reminder",
      bodyTemplate: "You have a pending task to review.",
      emoji: "🏠",
      variables: []
    };
  }

  private getTaskEmoji(task: Task): string {
    const category = task.category.toLowerCase();
    const title = task.title.toLowerCase();

    if (category.includes('hvac') || title.includes('filter') || title.includes('heating') || title.includes('cooling')) return '🌡️';
    if (category.includes('plumbing') || title.includes('water') || title.includes('pipe') || title.includes('faucet')) return '🚿';
    if (category.includes('electrical') || title.includes('electric') || title.includes('outlet') || title.includes('switch')) return '⚡';
    if (category.includes('exterior') || title.includes('roof') || title.includes('gutter') || title.includes('siding')) return '🏠';
    if (category.includes('safety') || title.includes('smoke') || title.includes('carbon') || title.includes('detector')) return '🛡️';
    if (category.includes('appliance') || title.includes('washer') || title.includes('dryer') || title.includes('dishwasher')) return '📱';
    if (title.includes('clean') || title.includes('wash')) return '🧽';
    if (title.includes('replace') || title.includes('install')) return '🔧';
    if (title.includes('inspect') || title.includes('check')) return '🔍';
    if (title.includes('outdoor') || title.includes('garden') || title.includes('lawn')) return '🌿';
    
    return '🔧';
  }

  private getShortDescription(task: Task): string {
    if (task.description && task.description.length > 50) {
      return task.description.substring(0, 47) + '...';
    }
    return task.description || 'Maintenance task';
  }

  private formatDuration(minutes?: number): string {
    if (!minutes) return 'Quick task';
    if (minutes < 30) return `${minutes} min`;
    if (minutes < 60) return `${minutes} min`;
    
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    if (remainingMinutes === 0) return `${hours}h`;
    return `${hours}h ${remainingMinutes}m`;
  }

  private getServiceTimeFrame(equipment: Equipment): string {
    if (!equipment.next_service_due) return 'soon';
    
    const dueDate = new Date(equipment.next_service_due);
    const now = new Date();
    const daysUntil = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntil <= 0) return 'now';
    if (daysUntil <= 7) return 'this week';
    if (daysUntil <= 14) return 'in 2 weeks';
    if (daysUntil <= 30) return 'this month';
    
    return 'soon';
  }

  private getMotivationalMessage(streakCount: number): string {
    if (streakCount >= 10) return "You're a maintenance superstar!";
    if (streakCount >= 5) return "Amazing consistency!";
    if (streakCount >= 3) return "Building great habits!";
    return "Keep up the great work!";
  }

  private getRandomItem<T>(items: T[]): T {
    return items[Math.floor(Math.random() * items.length)];
  }

  // Public method to add custom templates
  addCustomTemplate(type: NotificationType, template: NotificationTemplate): void {
    if (!this.templates.has(type)) {
      this.templates.set(type, []);
    }
    this.templates.get(type)!.push(template);
  }

  // Public method to generate content for any notification type
  generateContent(
    type: NotificationType,
    data: any,
    context: NotificationContext,
    userStyle: string = 'standard'
  ): NotificationContent {
    switch (type) {
      case NotificationType.TASK_REMINDER:
        return this.generateTaskReminderContent(data.task, data.reminderType, context, userStyle);
      case NotificationType.EQUIPMENT_SERVICE:
        return this.generateEquipmentServiceContent(data.equipment, data.serviceType, context);
      case NotificationType.ACHIEVEMENT:
      case NotificationType.MONEY_SAVED:
      case NotificationType.STREAK:
        return this.generateAchievementContent(data.achievementType, data, context);
      case NotificationType.SEASONAL_SUGGESTION:
        return this.generateSeasonalSuggestionContent(data.suggestions, data.season, context, data.home);
      case NotificationType.WEATHER_OPPORTUNITY:
        return this.generateWeatherOpportunityContent(data.outdoorTasks, data.weather, context);
      default:
        return {
          title: "🏠 HomeKeeper",
          body: "You have a notification from HomeKeeper",
          emoji: "🏠"
        };
    }
  }
}

export default NotificationContentGenerator;