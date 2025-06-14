import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { EquipmentScreen } from '../screens/EquipmentScreen';
import { EquipmentDetailScreen } from '../screens/EquipmentDetailScreen';
import { AddEquipmentScreen } from '../screens/AddEquipmentScreen';
import { EditEquipmentScreen } from '../screens/EditEquipmentScreen';
import { Colors } from '../theme/colors';
import { Typography } from '../theme/typography';

export type EquipmentStackParamList = {
  EquipmentList: undefined;
  EquipmentDetail: { equipment: any };
  AddEquipment: undefined;
  EditEquipment: { equipment: any };
};

const EquipmentStack = createStackNavigator<EquipmentStackParamList>();

export const EquipmentStackNavigator: React.FC = () => {
  return (
    <EquipmentStack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: Colors.white,
          borderBottomColor: Colors.border,
          borderBottomWidth: 1,
        },
        headerTitleStyle: {
          fontFamily: Typography.titleLarge.fontFamily,
          fontSize: Typography.titleLarge.fontSize,
          color: Colors.textPrimary,
        },
        headerTintColor: Colors.primary,
        headerBackTitle: '',
      }}
    >
      <EquipmentStack.Screen
        name="EquipmentList"
        component={EquipmentScreen}
        options={{
          title: 'Equipment',
          headerShown: false, // Tab navigator will show the header
        }}
      />
      <EquipmentStack.Screen
        name="EquipmentDetail"
        component={EquipmentDetailScreen}
        options={{
          title: 'Equipment Details',
          headerShown: false, // Custom header in the screen
        }}
      />
      <EquipmentStack.Screen
        name="AddEquipment"
        component={AddEquipmentScreen}
        options={{
          title: 'Add Equipment',
          headerShown: false, // Custom header in the screen
          presentation: 'modal',
        }}
      />
      <EquipmentStack.Screen
        name="EditEquipment"
        component={EditEquipmentScreen}
        options={{
          title: 'Edit Equipment',
          headerShown: false, // Custom header in the screen
          presentation: 'modal',
        }}
      />
    </EquipmentStack.Navigator>
  );
}; 