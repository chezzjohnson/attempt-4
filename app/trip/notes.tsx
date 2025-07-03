import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from 'react-native';
import { Button } from '../../components/ui/Button';
import { BodyText, Caption, Label } from '../../components/ui/Typography';
import { Intention, useIntentions } from '../../contexts/IntentionsContext';
import { Note, TripHistory, useTrip } from '../../contexts/TripContext';

export default function NotesScreen() {
  const router = useRouter();
  const { tripState, updateTrip } = useTrip();
  const { intentions } = useIntentions();
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [showNoteEditModal, setShowNoteEditModal] = useState(false);
  const [selectedIntention, setSelectedIntention] = useState<Intention | null>(null);
  const [newNote, setNewNote] = useState('');
  const [newNoteHeader, setNewNoteHeader] = useState('');
  const [editingNote, setEditingNote] = useState<{
    note: Note;
    trip: TripHistory;
    intention?: Intention;
    isGeneralNote: boolean;
  } | null>(null);
  const [editingNoteHeader, setEditingNoteHeader] = useState('');
  const [editingNoteBody, setEditingNoteBody] = useState('');
  const [expandedIntentions, setExpandedIntentions] = useState<Set<string>>(new Set());
  const [animatingIntentions, setAnimatingIntentions] = useState<Record<string, boolean>>({});

  // Refs for text inputs
  const editTitleInputRef = useRef<TextInput>(null);
  const editNotesInputRef = useRef<TextInput>(null);

  const handleAddNote = () => {
    if (!newNote.trim()) return;

    const note: Note = {
      id: Date.now().toString(),
      content: newNote.trim(),
      timestamp: new Date(),
      type: 'post-trip'  // During trip notes are post-trip type
    };

    if (selectedIntention) {
      // Add note to specific intention
      const updatedIntentions = tripState.intentions.map(intention => {
        if (intention.id === selectedIntention.id) {
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
    if (!notes || notes.length === 0) {
      return (
        <Text style={styles.emptyText}>No notes yet</Text>
      );
    }

    return notes.map(note => (
      <View key={note.id} style={styles.noteItem}>
        <Text style={styles.noteText}>{note.content}</Text>
        <Text style={styles.noteTime}>{formatTimestamp(note.timestamp)}</Text>
      </View>
    ));
  };

  const handleAddIntentionNote = (intentionId: string) => {
    if (!newNote.trim()) return;

    const note: Note = {
      id: Date.now().toString(),
      content: newNote.trim(),
      timestamp: new Date(),
      type: 'post-trip'  // During trip notes are post-trip type
    };

    const updatedIntentions = tripState.intentions.map(intention => {
      if (intention.id === intentionId) {
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

    setNewNote('');
  };

  const handleAddGeneralNote = () => {
    if (!newNote.trim()) return;

    const note: Note = {
      id: Date.now().toString(),
      content: newNote.trim(),
      timestamp: new Date(),
      type: 'post-trip'  // During trip notes are post-trip type
    };

    updateTrip({
      ...tripState,
      generalNotes: [...(tripState.generalNotes || []), note]
    });

    setNewNote('');
  };

  const closeNoteEditModal = () => {
    setShowNoteEditModal(false);
    setEditingNote(null);
    setEditingNoteHeader('');
    setEditingNoteBody('');
  };

  const deleteNote = () => {
    if (editingNote) {
      const updatedNotes = tripState.generalNotes.filter(note => note.id !== editingNote.note.id);
      updateTrip({
        ...tripState,
        generalNotes: updatedNotes
      });
      closeNoteEditModal();
    }
  };

  const saveNoteEdit = () => {
    if (editingNote) {
      const updatedNotes = tripState.generalNotes.map(note =>
        note.id === editingNote.note.id ? { ...editingNote.note, content: editingNoteBody } : note
      );
      updateTrip({
        ...tripState,
        generalNotes: updatedNotes
      });
      closeNoteEditModal();
    }
  };

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1 }} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <ScrollView 
        style={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={styles.title}>Notes</Text>
        </View>

        <View style={styles.intentionSelector}>
          <TouchableOpacity
            style={[
              styles.intentionButton,
              !selectedIntention && styles.selectedIntention
            ]}
            onPress={() => setSelectedIntention(null)}
          >
            <Text style={[
              styles.intentionButtonText,
              !selectedIntention && styles.selectedIntentionText
            ]}>
              General Notes
            </Text>
          </TouchableOpacity>

          {tripState.intentions.map(intention => (
            <TouchableOpacity
              key={intention.id}
              style={[
                styles.intentionButton,
                selectedIntention === intention && styles.selectedIntention
              ]}
              onPress={() => {
                const fullIntention = intentions.find(i => i.id === intention.id);
                setSelectedIntention(fullIntention || null);
              }}
            >
              <Text style={[
                styles.intentionButtonText,
                selectedIntention === intention && styles.selectedIntentionText
              ]}>
                {intention.text}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.notesContainer}>
          {selectedIntention ? (
            renderNotes(
              tripState.intentions.find(i => i.id === selectedIntention.id)?.notes || []
            )
          ) : (
            renderNotes(tripState.generalNotes || [])
          )}
        </View>

        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={[styles.inputContainer, { paddingBottom: 20 }]}>
            <TextInput
              style={styles.input}
              value={newNote}
              onChangeText={setNewNote}
              placeholder="Add a note..."
              multiline
              maxLength={1000}
              returnKeyType="done"
              blurOnSubmit={true}
              onFocus={() => {
                // No need to focus the input
              }}
              onSubmitEditing={() => {
                Keyboard.dismiss();
                // Remove auto-save - just dismiss keyboard and stay on screen
              }}
            />
            <TouchableOpacity
              style={[styles.addButton, !newNote.trim() && styles.addButtonDisabled]}
              onPress={() => {
                setShowNoteInput(true);
                setSelectedIntention(null);
                setNewNote('');
                setNewNoteHeader('');
              }}
              disabled={!newNote.trim()}
            >
              <MaterialIcons name="add" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        </TouchableWithoutFeedback>

        {/* Note Input Modal */}
        {showNoteInput && (
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.modalOverlay}>
              <TouchableWithoutFeedback onPress={() => {}}>
                <View style={styles.modalContent}>
                  <View style={styles.modalHeader}>
                    <BodyText variant="base" style={{ fontWeight: '600' }}>
                      {selectedIntention ? 'Add Note to Intention' : 'Add Note'}
                    </BodyText>
                    <TouchableOpacity
                      onPress={() => {
                        setShowNoteInput(false);
                        setSelectedIntention(null);
                        setNewNote('');
                        setNewNoteHeader('');
                        Keyboard.dismiss();
                      }}
                    >
                      <MaterialIcons name="close" size={24} color="#666" />
                    </TouchableOpacity>
                  </View>
                  <View style={styles.noteEditForm}>
                    <View style={styles.noteEditField}>
                      <Label weight="semibold" style={styles.noteEditLabel}>
                        Title
                      </Label>
                      <TextInput
                        style={styles.noteEditInput}
                        value={newNoteHeader}
                        onChangeText={setNewNoteHeader}
                        placeholder="Note title (max 100 characters)..."
                        multiline={false}
                        maxLength={100}
                        returnKeyType="next"
                        blurOnSubmit={false}
                        onSubmitEditing={() => {
                          Keyboard.dismiss();
                          // Remove auto-save - just dismiss keyboard and stay on modal
                        }}
                        ref={editTitleInputRef}
                      />
                      <Caption style={styles.characterCount}>
                        {newNoteHeader.length}/100
                      </Caption>
                    </View>
                    
                    <View style={styles.noteEditField}>
                      <Label weight="semibold" style={styles.noteEditLabel}>
                        Notes
                      </Label>
                      <TextInput
                        style={[styles.noteEditInput, styles.noteEditTextArea]}
                        value={newNote}
                        onChangeText={setNewNote}
                        placeholder="Write your note here..."
                        multiline={true}
                        textAlignVertical="top"
                        returnKeyType="done"
                        blurOnSubmit={true}
                        onSubmitEditing={() => {
                          Keyboard.dismiss();
                          // Remove auto-save - just dismiss keyboard and stay on modal
                        }}
                        ref={editNotesInputRef}
                      />
                    </View>
                  </View>
                  <View style={styles.modalActions}>
                    <Button
                      title="Cancel"
                      variant="outline"
                      onPress={() => {
                        setShowNoteInput(false);
                        setSelectedIntention(null);
                        setNewNote('');
                        setNewNoteHeader('');
                        Keyboard.dismiss();
                      }}
                      style={{ flex: 1, marginRight: 12 }}
                    />
                    <Button
                      title="Save Note"
                      variant="primary"
                      onPress={() => {
                        if (selectedIntention) {
                          handleAddIntentionNote(selectedIntention.id);
                        } else {
                          handleAddGeneralNote();
                        }
                        Keyboard.dismiss();
                      }}
                      style={{ flex: 1, marginLeft: 12 }}
                    />
                  </View>
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        )}

        {/* Note Edit Modal */}
        {showNoteEditModal && editingNote && (
          <Modal
            visible={showNoteEditModal}
            transparent={true}
            animationType="fade"
            onRequestClose={closeNoteEditModal}
          >
            <KeyboardAvoidingView 
              style={styles.modalOverlay}
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              keyboardVerticalOffset={Platform.OS === 'ios' ? -200 : -100}
            >
              <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View style={styles.modalOverlay}>
                  <TouchableWithoutFeedback onPress={() => {}}>
                    <View style={styles.noteEditModalContent}>
                      <View style={styles.modalHeader}>
                        <BodyText variant="base" style={{ fontWeight: '600' }}>
                          Edit Note
                        </BodyText>
                        <TouchableOpacity onPress={closeNoteEditModal}>
                          <MaterialIcons name="close" size={24} color="#666" />
                        </TouchableOpacity>
                      </View>
                      
                      <View style={styles.noteEditForm}>
                        <View style={styles.noteEditField}>
                          <Label weight="semibold" style={styles.noteEditLabel}>
                            Title
                          </Label>
                          <TextInput
                            style={styles.noteEditInput}
                            value={editingNoteHeader}
                            onChangeText={setEditingNoteHeader}
                            placeholder="Note title (max 100 characters)..."
                            multiline={false}
                            maxLength={100}
                            returnKeyType="next"
                            blurOnSubmit={false}
                            ref={editTitleInputRef}
                            onSubmitEditing={() => {
                              editNotesInputRef.current?.focus();
                            }}
                          />
                          <Caption style={styles.characterCount}>
                            {editingNoteHeader.length}/100
                          </Caption>
                        </View>
                        
                        <View style={styles.noteEditField}>
                          <Label weight="semibold" style={styles.noteEditLabel}>
                            Notes
                          </Label>
                          <TextInput
                            style={[styles.noteEditInput, styles.noteEditTextArea]}
                            value={editingNoteBody}
                            onChangeText={setEditingNoteBody}
                            placeholder="Write your note here..."
                            multiline={true}
                            textAlignVertical="top"
                            returnKeyType="done"
                            blurOnSubmit={true}
                            onSubmitEditing={() => {
                              Keyboard.dismiss();
                            }}
                            ref={editNotesInputRef}
                          />
                        </View>
                      </View>
                      
                      <View style={styles.modalActions}>
                        <Button
                          title="Delete"
                          variant="primary"
                          onPress={deleteNote}
                          style={{ flex: 1, marginRight: 8, backgroundColor: '#EF4444' }}
                          textStyle={{ color: '#FFFFFF', fontSize: 14 }}
                        />
                        <Button
                          title="Cancel"
                          variant="outline"
                          onPress={() => {
                            Alert.alert(
                              'Cancel Edit',
                              'Are you sure you want to cancel? Any unsaved changes will be lost.',
                              [
                                { text: 'Keep Editing', style: 'cancel' },
                                { 
                                  text: 'Cancel', 
                                  style: 'destructive',
                                  onPress: closeNoteEditModal
                                }
                              ]
                            );
                          }}
                          style={{ flex: 1, marginRight: 8 }}
                          textStyle={{ fontSize: 14 }}
                        />
                        <Button
                          title="Save"
                          variant="primary"
                          onPress={saveNoteEdit}
                          style={{ flex: 1 }}
                          textStyle={{ fontSize: 14 }}
                        />
                      </View>
                    </View>
                  </TouchableWithoutFeedback>
                </View>
              </TouchableWithoutFeedback>
            </KeyboardAvoidingView>
          </Modal>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#111827',
  },
  intentionSelector: {
    flexDirection: 'row',
    padding: 16,
    gap: 8,
    flexWrap: 'wrap',
  },
  intentionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
  },
  selectedIntention: {
    backgroundColor: '#0967D2',
  },
  intentionButtonText: {
    fontSize: 14,
    color: '#4B5563',
  },
  selectedIntentionText: {
    color: '#fff',
  },
  notesContainer: {
    padding: 16,
  },
  noteItem: {
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  noteText: {
    fontSize: 16,
    color: '#111827',
    marginBottom: 4,
  },
  noteTime: {
    fontSize: 12,
    color: '#6B7280',
  },
  emptyText: {
    textAlign: 'center',
    color: '#6B7280',
    fontSize: 16,
    marginTop: 32,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  input: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 12,
    minHeight: 40,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  addButton: {
    backgroundColor: '#0967D2',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 50,
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    width: '80%',
    maxHeight: '60%',
    marginTop: 100,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  noteEditForm: {
    marginBottom: 16,
  },
  noteEditField: {
    marginBottom: 12,
  },
  noteEditLabel: {
    marginBottom: 4,
  },
  noteEditInput: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  noteEditTextArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  characterCount: {
    alignSelf: 'flex-end',
    color: '#6B7280',
    fontSize: 12,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  noteEditModalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    width: '80%',
    maxHeight: '60%',
    marginTop: 100,
  },
  noteEditModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  noteEditModalHeaderText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginRight: 16,
  },
  noteEditModalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
}); 