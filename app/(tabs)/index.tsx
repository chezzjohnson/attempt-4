import { router } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTrip } from '../../contexts/TripContext';

export default function HomeScreen() {
  const { tripState } = useTrip();
  const hasActiveTrip = tripState.startTime !== null && tripState.currentPhase !== null;

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Welcome to PsyCompanion</Text>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Quick Actions</Text>
        <View style={styles.row}>
          {!hasActiveTrip ? (
            <TouchableOpacity 
              style={styles.button}
              onPress={() => router.push('/new-trip/dose-selection')}
            >
              <Text style={styles.buttonText}>New Trip</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity 
              style={styles.button}
              onPress={() => router.push('/trip/active')}
            >
              <Text style={styles.buttonText}>View Active Trip</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.buttonOutline}>
            <Text style={styles.buttonOutlineText}>View History</Text>
          </TouchableOpacity>
        </View>
      </View>
      {hasActiveTrip && (
        <View style={styles.cardOutline}>
          <Text style={styles.cardTitle}>Active Trip</Text>
          <Text>You have an active trip in progress</Text>
        </View>
      )}
      <View style={styles.cardOutline}>
        <Text style={styles.cardTitle}>Recent Trips</Text>
        <Text>No recent trips</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  heading: { fontSize: 28, fontWeight: 'bold', marginBottom: 16 },
  card: { backgroundColor: 'white', borderRadius: 8, padding: 16, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 },
  cardOutline: { backgroundColor: 'white', borderRadius: 8, padding: 16, borderWidth: 1, borderColor: '#E4E7EB' },
  cardTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 8 },
  row: { flexDirection: 'row', gap: 12 },
  button: { backgroundColor: '#0967D2', padding: 12, borderRadius: 8, marginRight: 8 },
  buttonText: { color: 'white', fontWeight: '600' },
  buttonOutline: { borderColor: '#0967D2', borderWidth: 1, padding: 12, borderRadius: 8 },
  buttonOutlineText: { color: '#0967D2', fontWeight: '600' },
});
