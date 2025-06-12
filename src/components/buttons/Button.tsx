import React from 'react';
import { PrimaryButton } from './PrimaryButton';
import { SecondaryButton } from './SecondaryButton';
import { IconName } from '../icons/Icon';

export interface ButtonProps {
  title: string;
  subtitle?: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
  loading?: boolean;
  icon?: IconName;
  style?: any;
}

export const Button: React.FC<ButtonProps> = ({ 
  variant = 'primary', 
  ...props 
}) => {
  if (variant === 'secondary') {
    return <SecondaryButton {...props} />;
  }
  
  return <PrimaryButton {...props} />;
}; 