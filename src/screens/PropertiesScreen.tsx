import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Platform,
} from 'react-native';
import { Icon } from '../components/icons/Icon';
import { Colors } from '../theme/colors';
import { Typography } from '../theme/typography';
import { Spacing } from '../theme/spacing';
import PrimaryButton from '../components/buttons/PrimaryButton';
import { useDataContext } from '../contexts/DataContext';

interface PropertyCardProps {
  property: any;
  onPress: () => void;
}

const PropertyCard: React.FC<PropertyCardProps> = ({ property, onPress }) => {
  return (
    <TouchableOpacity style={styles.propertyCard} onPress={onPress}>
      <View style={styles.propertyHeader}>
        <View style={styles.propertyIcon}>
          <Icon name="properties" size="lg" color={Colors.primary} />
        </View>
        <View style={styles.propertyInfo}>
          <Text style={styles.propertyName}>{property.name}</Text>
          <Text style={styles.propertyAddress}>
            {property.address}, {property.city}, {property.state}
          </Text>
          <Text style={styles.propertyType}>
            {property.home_type?.replace('_', ' ').toUpperCase()} • {property.year_built}
          </Text>
        </View>
        <Icon name="right" size="sm" color={Colors.textTertiary} />
      </View>
      
      <View style={styles.propertyStats}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{property.square_footage || 'N/A'}</Text>
          <Text style={styles.statLabel}>Sq Ft</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{property.bedrooms || 'N/A'}</Text>
          <Text style={styles.statLabel}>Bedrooms</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{property.bathrooms || 'N/A'}</Text>
          <Text style={styles.statLabel}>Bathrooms</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export const PropertiesScreen: React.FC = () => {
  const { homes } = useDataContext();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    // In development mode, we don't need to refresh from server
    // The data is already managed by the DataContext
    setTimeout(() => setRefreshing(false), 500);
  };

  const handleAddProperty = () => {
    // Navigate to add property screen (to be implemented)
  };

  const handlePropertyPress = (property: any) => {
    // Navigate to property detail screen (to be implemented)
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Properties</Text>
        <Text style={styles.headerSubtitle}>
          Manage your homes and properties
        </Text>
      </View>

      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Add Property Button */}
        <View style={styles.addSection}>
          <PrimaryButton
            title="Add Property"
            onPress={handleAddProperty}
            style={styles.addButton}
          />
        </View>

        {/* Properties List */}
        <View style={styles.propertiesSection}>
          <Text style={styles.sectionTitle}>Your Properties</Text>
          
          {homes.length === 0 && (
            <View style={styles.emptyContainer}>
              <Icon name="properties" size="xl" color={Colors.textTertiary} />
              <Text style={styles.emptyTitle}>No Properties Yet</Text>
              <Text style={styles.emptySubtitle}>
                Add your first property to get started with HomeKeeper
              </Text>
            </View>
          )}

          {homes.length > 0 && (
            <View style={styles.propertiesList}>
              {homes.map((property) => (
                <PropertyCard
                  key={property.id}
                  property={property}
                  onPress={() => handlePropertyPress(property)}
                />
              ))}
            </View>
          )}
        </View>

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    padding: Spacing.xl,
    paddingTop: Spacing.lg,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitle: {
    ...Typography.displayMedium,
    marginBottom: Spacing.xs,
  },
  headerSubtitle: {
    ...Typography.bodyLarge,
    color: Colors.textSecondary,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: Spacing.huge,
  },
  devBanner: {
    backgroundColor: Colors.warningLight,
    marginHorizontal: Spacing.xl,
    marginTop: Spacing.lg,
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
  addSection: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.lg,
  },
  addButton: {
    width: '100%',
  },
  propertiesSection: {
    paddingHorizontal: Spacing.xl,
  },
  sectionTitle: {
    ...Typography.headlineMedium,
    marginBottom: Spacing.lg,
    color: Colors.textPrimary,
  },
  loadingContainer: {
    padding: Spacing.xl,
    alignItems: 'center',
  },
  loadingText: {
    ...Typography.bodyMedium,
    color: Colors.textSecondary,
  },
  errorContainer: {
    padding: Spacing.xl,
    alignItems: 'center',
    backgroundColor: Colors.errorLight,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  errorText: {
    ...Typography.bodyMedium,
    color: Colors.error,
    marginLeft: Spacing.sm,
  },
  emptyContainer: {
    padding: Spacing.xl,
    alignItems: 'center',
  },
  emptyTitle: {
    ...Typography.headlineMedium,
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
    color: Colors.textPrimary,
  },
  emptySubtitle: {
    ...Typography.bodyMedium,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  propertiesList: {
    gap: Spacing.lg,
  },
  propertyCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: Spacing.lg,
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
  propertyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  propertyIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  propertyInfo: {
    flex: 1,
  },
  propertyName: {
    ...Typography.titleLarge,
    marginBottom: Spacing.xs,
  },
  propertyAddress: {
    ...Typography.bodyMedium,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  propertyType: {
    ...Typography.caption,
    color: Colors.textTertiary,
    fontWeight: '500',
  },
  propertyStats: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    ...Typography.titleMedium,
    color: Colors.primary,
    marginBottom: Spacing.xs,
  },
  statLabel: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: Colors.border,
    marginHorizontal: Spacing.sm,
  },
  bottomSpacing: {
    height: Spacing.xl,
  },
}); 