import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useTrip } from '../../contexts/TripContext';

interface Note {
  id: string;
  content: string;
  timestamp: Date;
  type: 'during' | 'post' | 'followup';
  followupDay?: number;
}

export default function NotesScreen() {
  const router = useRouter();
  const { tripState, updateTrip } = useTrip();
  const [newNote, setNewNote] = useState('');
  const [selectedIntention, setSelectedIntention] = useState<string | null>(null);

  const handleAddNote = () => {
    if (!newNote.trim()) return;

    const note: Note = {
      id: Date.now().toString(),
      content: newNote.trim(),
      timestamp: new Date(),
      type: 'during'
    };

    if (selectedIntention) {
      // Add note to specific intention
      const updatedIntentions = tripState.intentions.map(intention => {
        if (intention.id === selectedIntention) {
          return {
            ...intention,
            notes: [...(intention.notes || []), note]
          };
        }
        return intention;
      });

      updateTrip({
        ...tripState,
        intentions: updatedIntentions
      });
    } else {
      // Add to general trip notes
      updateTrip({
        ...tripState,
        generalNotes: [...(tripState.generalNotes || []), note]
      });
    }

    setNewNote('');
  };

  const formatTimestamp = (date: Date) => {
    return new Date(date).toLocaleString();
  };

  const renderNotes = (notes: Note[]) => {
    const duringNotes = notes.filter(note => note.type === 'during');
    const postNotes = notes.filter(note => note.type === 'post');
    const followupNotes = notes.filter(note => note.type === 'followup');

    return (
      <View>
        {duringNotes.length > 0 && (
          <View style={styles.notesSection}>
            <Text style={styles.sectionTitle}>During Trip</Text>
            {duringNotes.map(note => (
              <View key={note.id} style={styles.noteCard}>
                <Text style={styles.noteContent}>{note.content}</Text>
                <Text style={styles.noteTimestamp}>{formatTimestamp(note.timestamp)}</Text>
              </View>
            ))}
          </View>
        )}

        {postNotes.length > 0 && (
          <View style={styles.notesSection}>
            <Text style={styles.sectionTitle}>Post-Trip Report</Text>
            {postNotes.map(note => (
              <View key={note.id} style={styles.noteCard}>
                <Text style={styles.noteContent}>{note.content}</Text>
                <Text style={styles.noteTimestamp}>{formatTimestamp(note.timestamp)}</Text>
              </View>
            ))}
          </View>
        )}

        {followupNotes.length > 0 && (
          <View style={styles.notesSection}>
            <Text style={styles.sectionTitle}>Follow-up Notes</Text>
            {followupNotes.map(note => (
              <View key={note.id} style={styles.noteCard}>
                <Text style={styles.noteContent}>{note.content}</Text>
                <Text style={styles.noteTimestamp}>
                  Day {note.followupDay}: {formatTimestamp(note.timestamp)}
                </Text>
              </View>
            ))}
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Intention Selector */}
        <View style={styles.intentionSelector}>
          <Pressable
            style={[
              styles.intentionButton,
              !selectedIntention && styles.intentionButtonSelected
            ]}
            onPress={() => setSelectedIntention(null)}
          >
            <Text style={styles.intentionButtonText}>General Notes</Text>
          </Pressable>
          {tripState.intentions.map(intention => (
            <Pressable
              key={intention.id}
              style={[
                styles.intentionButton,
                selectedIntention === intention.id && styles.intentionButtonSelected
              ]}
              onPress={() => setSelectedIntention(intention.id)}
            >
              <Text style={styles.intentionButtonText}>
                {intention.emoji} {intention.text}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Notes Display */}
        {selectedIntention ? (
          renderNotes(
            tripState.intentions.find(i => i.id === selectedIntention)?.notes || []
          )
        ) : (
          renderNotes(tripState.generalNotes || [])
        )}
      </ScrollView>

      {/* Note Input */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={newNote}
          onChangeText={setNewNote}
          placeholder="Add a note..."
          multiline
        />
        <Pressable
          style={[styles.addButton, !newNote.trim() && styles.addButtonDisabled]}
          onPress={handleAddNote}
          disabled={!newNote.trim()}
        >
          <MaterialIcons name="add" size={24} color="#fff" />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  scrollView: {
    padding: 20,
  },
  intentionSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  intentionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#E5E7EB',
  },
  intentionButtonSelected: {
    backgroundColor: '#0967D2',
  },
  intentionButtonText: {
    fontSize: 14,
    color: '#1F2937',
  },
  notesSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  noteCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  noteContent: {
    fontSize: 16,
    color: '#1F2937',
    marginBottom: 8,
  },
  noteTimestamp: {
    fontSize: 12,
    color: '#6B7280',
  },
  inputContainer: {
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  input: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 12,
    marginRight: 12,
    minHeight: 40,
    maxHeight: 100,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#0967D2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
}); 