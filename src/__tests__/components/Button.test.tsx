import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { PrimaryButton } from '../../components/buttons/PrimaryButton';
import { Colors } from '../../theme/colors';

describe('PrimaryButton', () => {
  test('renders correctly with title', () => {
    const { getByText } = render(
      <PrimaryButton title="Test Button" onPress={() => {}} />
    );
    
    expect(getByText('Test Button')).toBeTruthy();
  });

  test('calls onPress when pressed', () => {
    const mockOnPress = jest.fn();
    const { getByText } = render(
      <PrimaryButton title="Test Button" onPress={mockOnPress} />
    );
    
    fireEvent.press(getByText('Test Button'));
    expect(mockOnPress).toHaveBeenCalledTimes(1);
  });

  test('applies disabled state correctly', () => {
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
    fireEvent.press(button);
    
    // Should not call onPress when disabled
    expect(mockOnPress).not.toHaveBeenCalled();
  });

  test('shows loading state', () => {
    const { getByTestId } = render(
      <PrimaryButton 
        title="Test Button" 
        onPress={() => {}} 
        loading={true}
        testID="loading-button"
      />
    );
    
    expect(getByTestId('loading-button')).toBeTruthy();
  });

  test('applies custom style', () => {
    const customStyle = { backgroundColor: Colors.error };
    const { getByTestId } = render(
      <PrimaryButton 
        title="Test Button" 
        onPress={() => {}} 
        style={customStyle}
        testID="styled-button"
      />
    );
    
    const button = getByTestId('styled-button');
    expect(button.props.style).toContainEqual(customStyle);
  });
}); 