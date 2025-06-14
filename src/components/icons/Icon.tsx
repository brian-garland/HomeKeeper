import React from 'react';
import { 
  MaterialIcons, 
  MaterialCommunityIcons, 
  Ionicons, 
  Feather,
  AntDesign 
} from '@expo/vector-icons';
import { Colors } from '../../theme/colors';

export type IconName = 
  // Navigation
  | 'home' | 'dashboard' | 'properties' | 'tasks' | 'maintenance' | 'equipment' | 'profile'
  // Actions
  | 'add' | 'edit' | 'delete' | 'save' | 'cancel' | 'search' | 'filter'
  // Status
  | 'check' | 'warning' | 'error' | 'info' | 'pending' | 'complete'
  // Property
  | 'house' | 'apartment' | 'key' | 'door' | 'room' | 'garage'
  // Maintenance
  | 'wrench' | 'hammer' | 'screwdriver' | 'paint' | 'plumbing' | 'electrical'
  // Tasks
  | 'calendar' | 'clock' | 'reminder' | 'checklist' | 'priority'
  // General
  | 'settings' | 'help' | 'logout' | 'back' | 'forward' | 'up' | 'down'
  | 'left' | 'right' | 'close' | 'menu' | 'more' | 'share' | 'favorite'
  // User
  | 'user' | 'users' | 'contact' | 'phone' | 'email' | 'location';

export type IconSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';

interface IconProps {
  name: IconName;
  size?: IconSize | number;
  color?: string;
  style?: any;
}

const sizeMap: Record<IconSize, number> = {
  xs: 12,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const Icon: React.FC<IconProps> = ({ 
  name, 
  size = 'md', 
  color = Colors.gray600, 
  style 
}) => {
  const iconSize = typeof size === 'number' ? size : sizeMap[size];
  
  // Simple icon mapping - using MaterialIcons for most icons
  const renderIcon = () => {
    switch (name) {
      // Navigation
      case 'home': return <MaterialIcons name="home" size={iconSize} color={color} style={style} />;
      case 'dashboard': return <MaterialIcons name="dashboard" size={iconSize} color={color} style={style} />;
      case 'properties': return <MaterialIcons name="business" size={iconSize} color={color} style={style} />;
      case 'tasks': return <MaterialIcons name="assignment" size={iconSize} color={color} style={style} />;
      case 'maintenance': return <MaterialIcons name="build" size={iconSize} color={color} style={style} />;
      case 'equipment': return <MaterialIcons name="settings" size={iconSize} color={color} style={style} />;
      case 'profile': return <MaterialIcons name="person" size={iconSize} color={color} style={style} />;
      
      // Actions
      case 'add': return <MaterialIcons name="add" size={iconSize} color={color} style={style} />;
      case 'edit': return <MaterialIcons name="edit" size={iconSize} color={color} style={style} />;
      case 'delete': return <MaterialIcons name="delete" size={iconSize} color={color} style={style} />;
      case 'save': return <MaterialIcons name="save" size={iconSize} color={color} style={style} />;
      case 'cancel': return <MaterialIcons name="cancel" size={iconSize} color={color} style={style} />;
      case 'search': return <MaterialIcons name="search" size={iconSize} color={color} style={style} />;
      case 'filter': return <MaterialIcons name="filter-list" size={iconSize} color={color} style={style} />;
      
      // Status
      case 'check': return <MaterialIcons name="check-circle" size={iconSize} color={color} style={style} />;
      case 'warning': return <MaterialIcons name="warning" size={iconSize} color={color} style={style} />;
      case 'error': return <MaterialIcons name="error" size={iconSize} color={color} style={style} />;
      case 'info': return <MaterialIcons name="info" size={iconSize} color={color} style={style} />;
      case 'pending': return <MaterialIcons name="schedule" size={iconSize} color={color} style={style} />;
      case 'complete': return <MaterialIcons name="check-circle" size={iconSize} color={color} style={style} />;
      
      // Property
      case 'house': return <MaterialIcons name="home" size={iconSize} color={color} style={style} />;
      case 'apartment': return <MaterialIcons name="apartment" size={iconSize} color={color} style={style} />;
      case 'key': return <MaterialIcons name="vpn-key" size={iconSize} color={color} style={style} />;
      case 'door': return <MaterialCommunityIcons name="door" size={iconSize} color={color} style={style} />;
      case 'room': return <MaterialIcons name="room" size={iconSize} color={color} style={style} />;
      case 'garage': return <MaterialCommunityIcons name="garage" size={iconSize} color={color} style={style} />;
      
      // Maintenance
      case 'wrench': return <MaterialCommunityIcons name="wrench" size={iconSize} color={color} style={style} />;
      case 'hammer': return <MaterialCommunityIcons name="hammer" size={iconSize} color={color} style={style} />;
      case 'screwdriver': return <MaterialCommunityIcons name="screwdriver" size={iconSize} color={color} style={style} />;
      case 'paint': return <MaterialCommunityIcons name="format-paint" size={iconSize} color={color} style={style} />;
      case 'plumbing': return <MaterialCommunityIcons name="pipe" size={iconSize} color={color} style={style} />;
      case 'electrical': return <MaterialCommunityIcons name="flash" size={iconSize} color={color} style={style} />;
      
      // Tasks
      case 'calendar': return <MaterialIcons name="event" size={iconSize} color={color} style={style} />;
      case 'clock': return <MaterialIcons name="access-time" size={iconSize} color={color} style={style} />;
      case 'reminder': return <MaterialIcons name="notification-important" size={iconSize} color={color} style={style} />;
      case 'checklist': return <MaterialIcons name="checklist" size={iconSize} color={color} style={style} />;
      case 'priority': return <MaterialIcons name="priority-high" size={iconSize} color={color} style={style} />;
      
      // General
      case 'settings': return <MaterialIcons name="settings" size={iconSize} color={color} style={style} />;
      case 'help': return <MaterialIcons name="help" size={iconSize} color={color} style={style} />;
      case 'logout': return <MaterialIcons name="logout" size={iconSize} color={color} style={style} />;
      case 'back': return <MaterialIcons name="arrow-back" size={iconSize} color={color} style={style} />;
      case 'forward': return <MaterialIcons name="arrow-forward" size={iconSize} color={color} style={style} />;
      case 'up': return <MaterialIcons name="keyboard-arrow-up" size={iconSize} color={color} style={style} />;
      case 'down': return <MaterialIcons name="keyboard-arrow-down" size={iconSize} color={color} style={style} />;
      case 'left': return <MaterialIcons name="keyboard-arrow-left" size={iconSize} color={color} style={style} />;
      case 'right': return <MaterialIcons name="keyboard-arrow-right" size={iconSize} color={color} style={style} />;
      case 'close': return <MaterialIcons name="close" size={iconSize} color={color} style={style} />;
      case 'menu': return <MaterialIcons name="menu" size={iconSize} color={color} style={style} />;
      case 'more': return <MaterialIcons name="more-vert" size={iconSize} color={color} style={style} />;
      case 'share': return <MaterialIcons name="share" size={iconSize} color={color} style={style} />;
      case 'favorite': return <MaterialIcons name="favorite" size={iconSize} color={color} style={style} />;
      
      // User
      case 'user': return <MaterialIcons name="person" size={iconSize} color={color} style={style} />;
      case 'users': return <MaterialIcons name="people" size={iconSize} color={color} style={style} />;
      case 'contact': return <MaterialIcons name="contact-phone" size={iconSize} color={color} style={style} />;
      case 'phone': return <MaterialIcons name="phone" size={iconSize} color={color} style={style} />;
      case 'email': return <MaterialIcons name="email" size={iconSize} color={color} style={style} />;
      case 'location': return <MaterialIcons name="location-on" size={iconSize} color={color} style={style} />;
      
      default:
        console.warn(`Icon "${name}" not found`);
        return <MaterialIcons name="help" size={iconSize} color={color} style={style} />;
    }
  };
  
  return renderIcon();
}; 