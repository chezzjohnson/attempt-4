import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SafetyScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Safety Guide</Text>
      </View>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Safety Guidelines</Text>
          <View style={styles.guidelinesContainer}>
            <Text style={styles.guideline}>• Always have a sober trip sitter</Text>
            <Text style={styles.guideline}>• Test your substances</Text>
            <Text style={styles.guideline}>• Start with a low dose</Text>
            <Text style={styles.guideline}>• Be in a safe, comfortable environment</Text>
            <Text style={styles.guideline}>• Have water and snacks ready</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Harm Reduction Resources</Text>
          <View style={styles.resourcesContainer}>
            <TouchableOpacity style={styles.resourceButton} onPress={() => {}}>
              <Text style={styles.resourceButtonText}>Fireside Project</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.resourceButton} onPress={() => {}}>
              <Text style={styles.resourceButtonText}>DanceSafe</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.resourceButton} onPress={() => {}}>
              <Text style={styles.resourceButtonText}>TripSit</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pre-Trip Checklist</Text>
          <View style={styles.checklistContainer}>
            <Text style={styles.checklistItem}>• Set intentions</Text>
            <Text style={styles.checklistItem}>• Prepare your space</Text>
            <Text style={styles.checklistItem}>• Inform a trusted friend</Text>
            <Text style={styles.checklistItem}>• Check your mental state</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  header: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  guidelinesContainer: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  guideline: {
    fontSize: 16,
    color: '#374151',
    marginBottom: 12,
    lineHeight: 24,
  },
  resourcesContainer: {
    gap: 12,
  },
  resourceButton: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
  },
  resourceButtonText: {
    fontSize: 16,
    color: '#0967D2',
    fontWeight: '500',
  },
  checklistContainer: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  checklistItem: {
    fontSize: 16,
    color: '#374151',
    marginBottom: 12,
    lineHeight: 24,
  },
}); 