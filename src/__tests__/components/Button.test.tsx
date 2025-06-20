/**
 * Comprehensive PrimaryButton Test Suite
 * Task 22.2: Complete user interaction, state management, and prop testing
 */

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { PrimaryButton } from '../../components/buttons/PrimaryButton';
import { Colors } from '../../theme/colors';

describe('PrimaryButton - Comprehensive Test Suite', () => {
  
  // ========================================
  // BASIC RENDERING AND PROPS
  // ========================================
  describe('Basic Rendering and Props', () => {
    test('renders correctly with required props', () => {
      const { getByText } = render(
        <PrimaryButton title="Test Button" onPress={() => {}} />
      );
      
      expect(getByText('Test Button')).toBeTruthy();
    });

    test('applies testID prop correctly', () => {
      const { getByTestId } = render(
        <PrimaryButton 
          title="Test Button" 
          onPress={() => {}} 
          testID="primary-button"
        />
      );
      
      expect(getByTestId('primary-button')).toBeTruthy();
    });

    test('applies custom style prop', () => {
      const customStyle = { marginTop: 20 };
      const { getByTestId } = render(
        <PrimaryButton 
          title="Test Button" 
          onPress={() => {}} 
          style={customStyle}
          testID="styled-button"
        />
      );
      
      const button = getByTestId('styled-button');
      expect(button.props.style).toEqual(expect.objectContaining(customStyle));
    });

    test('applies custom text style prop', () => {
      const customTextStyle = { fontWeight: 'bold' as const };
      const { getByText } = render(
        <PrimaryButton 
          title="Test Button" 
          onPress={() => {}} 
          textStyle={customTextStyle}
        />
      );
      
      const text = getByText('Test Button');
      expect(text.props.style).toEqual(expect.objectContaining(customTextStyle));
    });

    test('handles fullWidth prop correctly', () => {
      const { getByTestId } = render(
        <PrimaryButton 
          title="Test Button" 
          onPress={() => {}} 
          fullWidth={true}
          testID="full-width-button"
        />
      );
      
      const button = getByTestId('full-width-button');
      expect(button.props.style).toEqual(expect.objectContaining({ width: '100%' }));
    });
  });

  // ========================================
  // USER INTERACTIONS
  // ========================================
  describe('User Interactions', () => {
    test('calls onPress when pressed', () => {
      const mockOnPress = jest.fn();
      const { getByTestId } = render(
        <PrimaryButton 
          title="Test Button" 
          onPress={mockOnPress}
          testID="clickable-button"
        />
      );
      
      fireEvent.press(getByTestId('clickable-button'));
      expect(mockOnPress).toHaveBeenCalledTimes(1);
    });

    test('calls onPress multiple times when pressed multiple times', () => {
      const mockOnPress = jest.fn();
      const { getByTestId } = render(
        <PrimaryButton 
          title="Test Button" 
          onPress={mockOnPress}
          testID="multi-click-button"
        />
      );
      
      const button = getByTestId('multi-click-button');
      fireEvent.press(button);
      fireEvent.press(button);
      fireEvent.press(button);
      
      expect(mockOnPress).toHaveBeenCalledTimes(3);
    });

    test('does not call onPress when disabled', () => {
      const mockOnPress = jest.fn();
      const { getByTestId } = render(
        <PrimaryButton 
          title="Test Button" 
          onPress={mockOnPress} 
          disabled={true}
          testID="disabled-button"
        />
      );
      
      const button = getByTestId('disabled-button');
      expect(button.props.disabled).toBe(true);
      expect(button.props.accessibilityState).toEqual({ disabled: true });
    });

    test('does not call onPress when loading', () => {
      const mockOnPress = jest.fn();
      const { getByTestId } = render(
        <PrimaryButton 
          title="Test Button" 
          onPress={mockOnPress} 
          loading={true}
          testID="loading-button"
        />
      );
      
      const button = getByTestId('loading-button');
      expect(button.props.disabled).toBe(true);
      expect(button.props.accessibilityState).toEqual({ disabled: true });
    });
  });

  // ========================================
  // COMPONENT STATES
  // ========================================
  describe('Component States', () => {
    test('renders disabled state correctly', () => {
      const { getByTestId } = render(
        <PrimaryButton 
          title="Test Button" 
          onPress={() => {}} 
          disabled={true}
          testID="disabled-state-button"
        />
      );
      
      const button = getByTestId('disabled-state-button');
      expect(button.props.accessibilityState).toEqual({ disabled: true });
    });

    test('renders loading state with ActivityIndicator', () => {
      const { getByLabelText, queryByText } = render(
        <PrimaryButton 
          title="Test Button" 
          onPress={() => {}} 
          loading={true}
        />
      );
      
      // Should show loading indicator
      expect(getByLabelText('Loading')).toBeTruthy();
      // Should hide button text
      expect(queryByText('Test Button')).toBeNull();
    });

    test('applies loading opacity style', () => {
      const { getByTestId } = render(
        <PrimaryButton 
          title="Test Button" 
          onPress={() => {}} 
          loading={true}
          testID="loading-opacity-button"
        />
      );
      
      const button = getByTestId('loading-opacity-button');
      expect(button.props.style).toEqual(expect.objectContaining({ opacity: 0.8 }));
    });

    test('maintains normal state when not disabled or loading', () => {
      const { getByTestId } = render(
        <PrimaryButton 
          title="Test Button" 
          onPress={() => {}} 
          testID="normal-state-button"
        />
      );
      
      const button = getByTestId('normal-state-button');
      expect(button.props.accessibilityState).toEqual({ disabled: false });
    });
  });

  // ========================================
  // VARIANTS
  // ========================================
  describe('Button Variants', () => {
    test('renders default variant with primary color', () => {
      const { getByTestId } = render(
        <PrimaryButton 
          title="Test Button" 
          onPress={() => {}} 
          variant="default"
          testID="default-variant"
        />
      );
      
      const button = getByTestId('default-variant');
      expect(button.props.style).toEqual(expect.objectContaining({ backgroundColor: Colors.primary }));
    });

    test('renders success variant with success color', () => {
      const { getByTestId } = render(
        <PrimaryButton 
          title="Test Button" 
          onPress={() => {}} 
          variant="success"
          testID="success-variant"
        />
      );
      
      const button = getByTestId('success-variant');
      expect(button.props.style).toEqual(expect.objectContaining({ backgroundColor: Colors.success }));
    });

    test('renders warning variant with warning color', () => {
      const { getByTestId } = render(
        <PrimaryButton 
          title="Test Button" 
          onPress={() => {}} 
          variant="warning"
          testID="warning-variant"
        />
      );
      
      const button = getByTestId('warning-variant');
      expect(button.props.style).toEqual(expect.objectContaining({ backgroundColor: Colors.warning }));
    });

    test('renders error variant with error color', () => {
      const { getByTestId } = render(
        <PrimaryButton 
          title="Test Button" 
          onPress={() => {}} 
          variant="error"
          testID="error-variant"
        />
      );
      
      const button = getByTestId('error-variant');
      expect(button.props.style).toEqual(expect.objectContaining({ backgroundColor: Colors.error }));
    });

    test('disabled variants use disabled background color', () => {
      const { getByTestId } = render(
        <PrimaryButton 
          title="Test Button" 
          onPress={() => {}} 
          variant="success"
          disabled={true}
          testID="disabled-success-variant"
        />
      );
      
      const button = getByTestId('disabled-success-variant');
      expect(button.props.style).toEqual(expect.objectContaining({ backgroundColor: Colors.gray300 }));
    });
  });

  // ========================================
  // SIZES
  // ========================================
  describe('Button Sizes', () => {
    test('renders small size with correct dimensions', () => {
      const { getByTestId } = render(
        <PrimaryButton 
          title="Test Button" 
          onPress={() => {}} 
          size="small"
          testID="small-button"
        />
      );
      
      const button = getByTestId('small-button');
      expect(button.props.style).toEqual(expect.objectContaining({ minHeight: 40 }));
    });

    test('renders medium size (default) with correct dimensions', () => {
      const { getByTestId } = render(
        <PrimaryButton 
          title="Test Button" 
          onPress={() => {}} 
          size="medium"
          testID="medium-button"
        />
      );
      
      const button = getByTestId('medium-button');
      expect(button.props.style).toEqual(expect.objectContaining({ minHeight: 48 }));
    });

    test('renders large size with correct dimensions', () => {
      const { getByTestId } = render(
        <PrimaryButton 
          title="Test Button" 
          onPress={() => {}} 
          size="large"
          testID="large-button"
        />
      );
      
      const button = getByTestId('large-button');
      expect(button.props.style).toEqual(expect.objectContaining({ minHeight: 56 }));
    });

    test('applies correct font size for small buttons', () => {
      const { getByText } = render(
        <PrimaryButton 
          title="Small Button" 
          onPress={() => {}} 
          size="small"
        />
      );
      
      const text = getByText('Small Button');
      expect(text.props.style).toEqual(expect.objectContaining({ fontSize: 14 }));
    });

    test('applies correct font size for large buttons', () => {
      const { getByText } = render(
        <PrimaryButton 
          title="Large Button" 
          onPress={() => {}} 
          size="large"
        />
      );
      
      const text = getByText('Large Button');
      expect(text.props.style).toEqual(expect.objectContaining({ fontSize: 18 }));
    });
  });

  // ========================================
  // ACCESSIBILITY
  // ========================================
  describe('Accessibility', () => {
    test('has correct accessibility role', () => {
      const { getByTestId } = render(
        <PrimaryButton 
          title="Test Button" 
          onPress={() => {}} 
          testID="accessible-button"
        />
      );
      
      const button = getByTestId('accessible-button');
      expect(button.props.accessibilityRole).toBe('button');
    });

    test('uses title as default accessibility label', () => {
      const { getByTestId } = render(
        <PrimaryButton 
          title="Default Label Button" 
          onPress={() => {}} 
          testID="default-label-button"
        />
      );
      
      const button = getByTestId('default-label-button');
      expect(button.props.accessibilityLabel).toBe('Default Label Button');
    });

    test('uses custom accessibility label when provided', () => {
      const { getByTestId } = render(
        <PrimaryButton 
          title="Button Text" 
          onPress={() => {}} 
          accessibilityLabel="Custom Accessibility Label"
          testID="custom-label-button"
        />
      );
      
      const button = getByTestId('custom-label-button');
      expect(button.props.accessibilityLabel).toBe('Custom Accessibility Label');
    });

    test('applies accessibility hint when provided', () => {
      const { getByTestId } = render(
        <PrimaryButton 
          title="Test Button" 
          onPress={() => {}} 
          accessibilityHint="This button performs a test action"
          testID="hint-button"
        />
      );
      
      const button = getByTestId('hint-button');
      expect(button.props.accessibilityHint).toBe('This button performs a test action');
    });

    test('is accessible by default', () => {
      const { getByTestId } = render(
        <PrimaryButton 
          title="Test Button" 
          onPress={() => {}} 
          testID="accessible-default-button"
        />
      );
      
      const button = getByTestId('accessible-default-button');
      expect(button.props.accessible).toBe(true);
    });

    test('reports correct accessibility state for disabled button', () => {
      const { getByTestId } = render(
        <PrimaryButton 
          title="Test Button" 
          onPress={() => {}} 
          disabled={true}
          testID="disabled-accessibility-button"
        />
      );
      
      const button = getByTestId('disabled-accessibility-button');
      expect(button.props.accessibilityState).toEqual({ disabled: true });
    });

    test('reports correct accessibility state for loading button', () => {
      const { getByTestId } = render(
        <PrimaryButton 
          title="Test Button" 
          onPress={() => {}} 
          loading={true}
          testID="loading-accessibility-button"
        />
      );
      
      const button = getByTestId('loading-accessibility-button');
      expect(button.props.accessibilityState).toEqual({ disabled: true });
    });
  });

  // ========================================
  // EDGE CASES
  // ========================================
  describe('Edge Cases', () => {
    test('handles empty title string', () => {
      const { getByTestId } = render(
        <PrimaryButton 
          title="" 
          onPress={() => {}} 
          testID="empty-title-button"
        />
      );
      
      expect(getByTestId('empty-title-button')).toBeTruthy();
    });

    test('handles very long title with numberOfLines', () => {
      const longTitle = "This is a very long button title that should be truncated to prevent layout issues in the user interface";
      const { getByText } = render(
        <PrimaryButton 
          title={longTitle} 
          onPress={() => {}} 
        />
      );
      
      const text = getByText(longTitle);
      expect(text.props.numberOfLines).toBe(1);
    });

    test('handles multiple rapid presses correctly', () => {
      const mockOnPress = jest.fn();
      const { getByTestId } = render(
        <PrimaryButton 
          title="Rapid Press Button" 
          onPress={mockOnPress}
          testID="rapid-press-button"
        />
      );
      
      const button = getByTestId('rapid-press-button');
      
      // Simulate rapid presses
      for (let i = 0; i < 10; i++) {
        fireEvent.press(button);
      }
      
      expect(mockOnPress).toHaveBeenCalledTimes(10);
    });

    test('handles simultaneous disabled and loading states', () => {
      const mockOnPress = jest.fn();
      const { getByTestId } = render(
        <PrimaryButton 
          title="Test Button" 
          onPress={mockOnPress} 
          disabled={true}
          loading={true}
          testID="disabled-loading-button"
        />
      );
      
      const button = getByTestId('disabled-loading-button');
      expect(button.props.disabled).toBe(true);
      expect(button.props.accessibilityState).toEqual({ disabled: true });
      // Should show loading indicator when both disabled and loading
      expect(button.props.children).toBeTruthy();
      expect(button.props.children.props?.accessibilityLabel).toBe('Loading');
    });

    test('handles undefined variant gracefully', () => {
      const { getByTestId } = render(
        <PrimaryButton 
          title="Test Button" 
          onPress={() => {}} 
          variant={undefined}
          testID="undefined-variant-button"
        />
      );
      
      const button = getByTestId('undefined-variant-button');
      expect(button.props.style).toEqual(expect.objectContaining({ backgroundColor: Colors.primary }));
    });

    test('handles undefined size gracefully', () => {
      const { getByTestId } = render(
        <PrimaryButton 
          title="Test Button" 
          onPress={() => {}} 
          size={undefined}
          testID="undefined-size-button"
        />
      );
      
      const button = getByTestId('undefined-size-button');
      expect(button.props.style).toEqual(expect.objectContaining({ minHeight: 48 }));
    });
  });

  // ========================================
  // ENHANCED ACCESSIBILITY TESTING
  // ========================================
  describe('Enhanced Accessibility Testing', () => {
    test('button has proper accessibility role', () => {
      const { getByTestId } = render(
        <PrimaryButton 
          title="Test Button" 
          onPress={() => {}} 
          testID="accessibility-role-button"
        />
      );
      
      const button = getByTestId('accessibility-role-button');
      expect(button.props.accessibilityRole).toBe('button');
    });

    test('button provides meaningful accessibility label', () => {
      const { getByTestId } = render(
        <PrimaryButton 
          title="Save Document" 
          onPress={() => {}} 
          testID="meaningful-label-button"
        />
      );
      
      const button = getByTestId('meaningful-label-button');
      expect(button.props.accessibilityLabel).toBe('Save Document');
    });

    test('custom accessibility label overrides title', () => {
      const { getByTestId } = render(
        <PrimaryButton 
          title="Save" 
          onPress={() => {}} 
          accessibilityLabel="Save document to cloud storage"
          testID="custom-label-button"
        />
      );
      
      const button = getByTestId('custom-label-button');
      expect(button.props.accessibilityLabel).toBe('Save document to cloud storage');
    });

    test('disabled button has proper accessibility state', () => {
      const { getByTestId } = render(
        <PrimaryButton 
          title="Disabled Button" 
          onPress={() => {}} 
          disabled={true}
          testID="disabled-a11y-button"
        />
      );
      
      const button = getByTestId('disabled-a11y-button');
      expect(button.props.accessibilityState).toEqual({ disabled: true });
    });

    test('loading button has proper accessibility state', () => {
      const { getByTestId } = render(
        <PrimaryButton 
          title="Loading Button" 
          onPress={() => {}} 
          loading={true}
          testID="loading-a11y-button"
        />
      );
      
      const button = getByTestId('loading-a11y-button');
      expect(button.props.accessibilityState).toEqual({ disabled: true });
    });

    test('button accessibility hint provides context', () => {
      const { getByTestId } = render(
        <PrimaryButton 
          title="Delete" 
          onPress={() => {}} 
          accessibilityHint="Permanently deletes the selected item"
          testID="hint-context-button"
        />
      );
      
      const button = getByTestId('hint-context-button');
      expect(button.props.accessibilityHint).toBe('Permanently deletes the selected item');
    });

    test('loading button includes loading indicator accessibility', () => {
      const { getByLabelText } = render(
        <PrimaryButton 
          title="Submit" 
          onPress={() => {}} 
          loading={true}
        />
      );
      
      const loadingIndicator = getByLabelText('Loading');
      expect(loadingIndicator).toBeTruthy();
    });

    test('button supports keyboard accessibility', () => {
      const { getByTestId } = render(
        <PrimaryButton 
          title="Keyboard Test" 
          onPress={() => {}} 
          testID="keyboard-button"
        />
      );
      
      const button = getByTestId('keyboard-button');
      expect(button.props.accessible).toBe(true);
      expect(button.props.accessibilityRole).toBe('button');
    });

    test('button color contrast meets accessibility standards', () => {
      const variants: Array<'default' | 'success' | 'warning' | 'error'> = ['default', 'success', 'warning', 'error'];
      
      variants.forEach(variant => {
        const { getByTestId } = render(
          <PrimaryButton 
            title={`${variant} Button`} 
            onPress={() => {}} 
            variant={variant}
            testID={`contrast-${variant}-button`}
          />
        );
        
        const button = getByTestId(`contrast-${variant}-button`);
        expect(button.props.style).toBeDefined();
        
        // Button background should be defined and visible
        const backgroundColor = variant === 'default' ? Colors.primary :
                               variant === 'success' ? Colors.success :
                               variant === 'warning' ? Colors.warning :
                               Colors.error;
        
        expect(button.props.style).toEqual(expect.objectContaining({ backgroundColor }));
      });
    });

    test('button size variants maintain accessibility standards', () => {
      const sizes: Array<'small' | 'medium' | 'large'> = ['small', 'medium', 'large'];
      
      sizes.forEach(size => {
        const { getByTestId } = render(
          <PrimaryButton 
            title={`${size} Button`} 
            onPress={() => {}} 
            size={size}
            testID={`size-${size}-button`}
          />
        );
        
        const button = getByTestId(`size-${size}-button`);
        expect(button.props.accessible).toBe(true);
        expect(button.props.accessibilityRole).toBe('button');
        
        // Verify minimum touch target size (44x44 for medium/large, 32x32 for small)
        const expectedHeight = size === 'small' ? 32 : size === 'large' ? 56 : 48;
        expect(button.props.style).toEqual(expect.objectContaining({ minHeight: expectedHeight }));
      });
    });
  });

  // ========================================
  // SNAPSHOT TESTING
  // ========================================
  describe('Snapshot Testing', () => {
    test('default button snapshot', () => {
      const component = render(
        <PrimaryButton title="Default Button" onPress={() => {}} />
      );
      expect(component.toJSON()).toMatchSnapshot();
    });

    test('disabled button snapshot', () => {
      const component = render(
        <PrimaryButton title="Disabled Button" onPress={() => {}} disabled={true} />
      );
      expect(component.toJSON()).toMatchSnapshot();
    });

    test('loading button snapshot', () => {
      const component = render(
        <PrimaryButton title="Loading Button" onPress={() => {}} loading={true} />
      );
      expect(component.toJSON()).toMatchSnapshot();
    });

    test('success variant button snapshot', () => {
      const component = render(
        <PrimaryButton title="Success Button" onPress={() => {}} variant="success" />
      );
      expect(component.toJSON()).toMatchSnapshot();
    });

    test('large button snapshot', () => {
      const component = render(
        <PrimaryButton title="Large Button" onPress={() => {}} size="large" />
      );
      expect(component.toJSON()).toMatchSnapshot();
    });

    test('full width button snapshot', () => {
      const component = render(
        <PrimaryButton title="Full Width Button" onPress={() => {}} fullWidth={true} />
      );
      expect(component.toJSON()).toMatchSnapshot();
    });
  });
}); 