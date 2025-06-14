import { MaterialIcons } from '@expo/vector-icons';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function SafetyScreen() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.heading}>Emergency Contacts</Text>
        <TouchableOpacity style={styles.emergencyButton} onPress={() => {}}>
          <MaterialIcons name="phone" size={20} color="#fff" style={{ marginRight: 8 }} />
          <Text style={styles.emergencyButtonText}>Call Emergency Services</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.section}>
        <Text style={styles.heading}>Safety Guidelines</Text>
        <Text style={styles.guideline}>• Always have a sober trip sitter</Text>
        <Text style={styles.guideline}>• Test your substances</Text>
        <Text style={styles.guideline}>• Start with a low dose</Text>
        <Text style={styles.guideline}>• Be in a safe, comfortable environment</Text>
        <Text style={styles.guideline}>• Have water and snacks ready</Text>
      </View>
      <View style={styles.section}>
        <Text style={styles.heading}>Harm Reduction Resources</Text>
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
      <View style={styles.section}>
        <Text style={styles.heading}>Pre-Trip Checklist</Text>
        <Text style={styles.guideline}>• Set intentions</Text>
        <Text style={styles.guideline}>• Prepare your space</Text>
        <Text style={styles.guideline}>• Inform a trusted friend</Text>
        <Text style={styles.guideline}>• Check your mental state</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  section: { marginBottom: 24 },
  heading: { fontSize: 20, fontWeight: 'bold', marginBottom: 12 },
  emergencyButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#E12D39', padding: 12, borderRadius: 8, marginTop: 8 },
  emergencyButtonText: { color: '#fff', fontWeight: '600', marginLeft: 8 },
  guideline: { fontSize: 16, marginBottom: 4 },
  resourceButton: { backgroundColor: '#0967D2', padding: 10, borderRadius: 8, marginTop: 8 },
  resourceButtonText: { color: '#fff', fontWeight: '600' },
}); 