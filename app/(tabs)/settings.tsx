import { MaterialIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { ActivityIndicator, SafeAreaView, ScrollView, StyleSheet, View } from 'react-native';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { IconButton } from '../../components/ui/IconButton';
import { Input } from '../../components/ui/Input';
import { ListItem } from '../../components/ui/ListItem';
import { BodyText, Caption, Heading } from '../../components/ui/Typography';
import { Colors, Spacing } from '../../constants/DesignSystem';
import { useTripSitter } from '../../contexts/TripSitterContext';

export default function SettingsScreen() {
  const { tripSitters, addTripSitter, removeTripSitter, isLoading } = useTripSitter();
  const [isAddingSitter, setIsAddingSitter] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [newSitter, setNewSitter] = useState({
    name: '',
    phone: '',
    relationship: '',
    isUrgent: false,
  });

  const handleAddSitter = async () => {
    if (newSitter.name && newSitter.phone) {
      setIsSaving(true);
      try {
        await addTripSitter(newSitter);
        setNewSitter({ name: '', phone: '', relationship: '', isUrgent: false });
        setIsAddingSitter(false);
      } catch (error) {
        console.error('Error adding trip sitter:', error);
      } finally {
        setIsSaving(false);
      }
    }
  };

  const handleDeleteSitter = async (id: string) => {
    try {
      await removeTripSitter(id);
    } catch (error) {
      console.error('Error removing trip sitter:', error);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary[500]} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          <Heading variant="h1" style={styles.title}>Settings</Heading>

          {/* Trip Sitter Management Section */}
          <Card variant="elevated" style={styles.section}>
            <View style={styles.sectionHeader}>
              <Heading variant="h3">Trip Sitters</Heading>
              <IconButton
                icon={<MaterialIcons name="add" size={24} color={Colors.primary[500]} />}
                onPress={() => setIsAddingSitter(true)}
                variant="ghost"
                size="medium"
              />
            </View>

            {/* Add New Sitter Form */}
            {isAddingSitter && (
              <Card variant="outlined" style={styles.addSitterForm}>
                <Input
                  label="Name"
                  placeholder="Enter name"
                  value={newSitter.name}
                  onChangeText={(text) => setNewSitter({ ...newSitter, name: text })}
                  editable={!isSaving}
                  leftIcon={<MaterialIcons name="person" size={20} color={Colors.text.secondary} />}
                />
                <Input
                  label="Phone Number"
                  placeholder="Enter phone number"
                  value={newSitter.phone}
                  onChangeText={(text) => setNewSitter({ ...newSitter, phone: text })}
                  keyboardType="phone-pad"
                  editable={!isSaving}
                  leftIcon={<MaterialIcons name="phone" size={20} color={Colors.text.secondary} />}
                />
                <Input
                  label="Relationship"
                  placeholder="Enter relationship"
                  value={newSitter.relationship}
                  onChangeText={(text) => setNewSitter({ ...newSitter, relationship: text })}
                  editable={!isSaving}
                  leftIcon={<MaterialIcons name="people" size={20} color={Colors.text.secondary} />}
                />
                <View style={styles.formButtons}>
                  <Button
                    title="Cancel"
                    variant="secondary"
                    onPress={() => setIsAddingSitter(false)}
                    disabled={isSaving}
                    style={styles.formButton}
                  />
                  <Button
                    title="Save"
                    variant="primary"
                    onPress={handleAddSitter}
                    loading={isSaving}
                    disabled={isSaving}
                    style={styles.formButton}
                  />
                </View>
              </Card>
            )}

            {/* Trip Sitter List */}
            <View style={styles.sitterList}>
              {tripSitters.length === 0 ? (
                <View style={styles.emptyState}>
                  <MaterialIcons name="people-outline" size={48} color={Colors.text.tertiary} />
                  <BodyText style={styles.emptyStateText}>No trip sitters added yet</BodyText>
                  <Caption color={Colors.text.tertiary}>
                    Add a trip sitter to ensure you have support during your journey
                  </Caption>
                </View>
              ) : (
                tripSitters.map((sitter) => (
                  <ListItem
                    key={sitter.id}
                    title={sitter.name}
                    subtitle={sitter.phone}
                    description={sitter.relationship}
                    leftIcon={<MaterialIcons name="person" size={24} color={Colors.primary[500]} />}
                    rightIcon={
                      <IconButton
                        icon={<MaterialIcons name="delete" size={20} color={Colors.error[500]} />}
                        onPress={() => handleDeleteSitter(sitter.id)}
                        variant="ghost"
                        size="small"
                      />
                    }
                    variant="default"
                  />
                ))
              )}
            </View>
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background.primary,
  },
  content: {
    padding: Spacing.md,
  },
  title: {
    marginBottom: Spacing.xl,
  },
  section: {
    marginBottom: Spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  addSitterForm: {
    marginBottom: Spacing.lg,
  },
  formButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  formButton: {
    minWidth: 80,
  },
  sitterList: {
    gap: Spacing.sm,
  },
  emptyState: {
    alignItems: 'center',
    padding: Spacing.xl,
  },
  emptyStateText: {
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xl,
    flexGrow: 1,
  },
}); 