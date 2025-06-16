import { router } from 'expo-router';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTrip } from '../../contexts/TripContext';

export default function HomeScreen() {
  const { tripState } = useTrip();
  const hasActiveTrip = tripState.startTime !== null;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 20, paddingBottom: 40, flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
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
              ) : null}
              <TouchableOpacity 
                style={styles.buttonOutline}
                onPress={() => router.push('/(tabs)/history')}
              >
                <Text style={styles.buttonOutlineText}>View History</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  heading: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    backgroundColor: '#0967D2',
    padding: 12,
    borderRadius: 8,
    flex: 1,
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: '600',
  },
  buttonOutline: {
    borderColor: '#0967D2',
    borderWidth: 1,
    padding: 12,
    borderRadius: 8,
    flex: 1,
  },
  buttonOutlineText: {
    color: '#0967D2',
    textAlign: 'center',
    fontWeight: '600',
  },
});
