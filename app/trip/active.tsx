import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, BackHandler, Keyboard, KeyboardAvoidingView, Linking, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import { Button } from '../../components/ui/Button';
import { BodyText, Caption, Label } from '../../components/ui/Typography';
import { Intention } from '../../contexts/IntentionsContext';
import { Note, useTrip } from '../../contexts/TripContext';

const PHASE_COLORS = {
  'come-up': '#FFA726', // Orange
  'peak': '#EF5350',    // Red
  'comedown': '#66BB6A', // Green
};

const PHASES = ['come-up', 'peak', 'comedown'] as const;
type Phase = typeof PHASES[number];

const PHASE_DURATIONS: Record<Phase, number> = {
  'come-up': 60, // 60 minutes
  'peak': 240,   // 4 hours
  'comedown': 120, // 2 hours
};

export default function ActiveTripScreen() {
  const router = useRouter();
  const { tripState, updatePhase, endTrip, updateTrip } = useTrip();
  const [expandedIntention, setExpandedIntention] = useState<string | null>(null);
  const [expandedNotes, setExpandedNotes] = useState<Record<string, boolean>>({});
  const [showTripSitter, setShowTripSitter] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [timeToNextPhase, setTimeToNextPhase] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(true);
  const [newNote, setNewNote] = useState('');
  const [newNoteHeader, setNewNoteHeader] = useState('');
  const [intentionNotes, setIntentionNotes] = useState<Record<string, string>>({});
  const [intentionNoteHeaders, setIntentionNoteHeaders] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  // Note editing modal state
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [showNoteEditModal, setShowNoteEditModal] = useState(false);
  const [selectedIntention, setSelectedIntention] = useState<Intention | null>(null);
  const [editingNote, setEditingNote] = useState<{
    note: Note;
    intentionId?: string;
  } | null>(null);
  const [editingNoteHeader, setEditingNoteHeader] = useState('');
  const [editingNoteBody, setEditingNoteBody] = useState('');
  const [expandedIntentions, setExpandedIntentions] = useState<Set<string>>(new Set());
  const [animatingIntentions, setAnimatingIntentions] = useState<Record<string, boolean>>({});
  
  // Refs for text inputs
  const editTitleInputRef = useRef<TextInput>(null);
  const editNotesInputRef = useRef<TextInput>(null);
  
  const timerRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);
  const backHandlerRef = useRef<{ remove: () => void } | undefined>(undefined);

  // Lock the screen and prevent back navigation
  useEffect(() => {
    backHandlerRef.current = BackHandler.addEventListener('hardwareBackPress', () => {
      return true; // Prevent back navigation
    });

    return () => {
      if (backHandlerRef.current) {
        backHandlerRef.current.remove();
      }
    };
  }, []);

  useEffect(() => {
    if (!tripState.startTime) {
      setIsLoading(false);
      return;
    }

    const updateTimer = () => {
      const now = new Date();
      const elapsed = Math.floor((now.getTime() - tripState.startTime!.getTime()) / 1000 / 60);
      setTimeElapsed(elapsed);

      // Calculate time to next phase
      const currentPhaseIndex = PHASES.indexOf(tripState.currentPhase as Phase);
      const nextPhaseIndex = currentPhaseIndex + 1;
      
      if (nextPhaseIndex < PHASES.length) {
        const nextPhase = PHASES[nextPhaseIndex];
        const timeInCurrentPhase = elapsed - getPhaseStartTime(currentPhaseIndex);
        const timeToNext = PHASE_DURATIONS[tripState.currentPhase as Phase] - timeInCurrentPhase;
        setTimeToNextPhase(timeToNext);
      }
    };

    // Initial update
    updateTimer();
    setIsLoading(false);

    // Set up interval
    timerRef.current = setInterval(updateTimer, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [tripState.startTime, tripState.currentPhase]);

  const getPhaseStartTime = (phaseIndex: number) => {
    return PHASES
      .slice(0, phaseIndex)
      .reduce((acc, phase) => acc + PHASE_DURATIONS[phase], 0);
  };

  const getTotalDuration = () => {
    return Object.values(PHASE_DURATIONS).reduce((acc, duration) => acc + duration, 0);
  };

  const getProgressPercentage = () => {
    const totalDuration = getTotalDuration();
    return (timeElapsed / totalDuration) * 100;
  };

  const formatTimeRemaining = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    if (hours === 0) {
      return "Less than an hour";
    } else if (remainingMinutes < 30) {
      return `About ${hours} hours`;
    } else {
      return `A little under ${hours + 1} hours`;
    }
  };

  const formatPhaseTimeRemaining = (minutes: number) => {
    // Round to nearest 5 minutes
    const roundedMinutes = Math.round(minutes / 5) * 5;
    
    if (roundedMinutes < 5) {
      return "Less than 5 minutes";
    } else if (roundedMinutes < 60) {
      return `About ${roundedMinutes} minutes`;
    } else {
      const hours = Math.floor(roundedMinutes / 60);
      const remainingMinutes = roundedMinutes % 60;
      if (remainingMinutes === 0) {
        return `About ${hours} hours`;
      } else {
    return `About ${hours} hours and ${remainingMinutes} minutes`;
      }
    }
  };

  const handleCallTripSitter = () => {
    if (tripState.tripSitter) {
      Linking.openURL(`tel:${tripState.tripSitter.phoneNumber}`);
    }
  };

  const handleTextTripSitter = () => {
    if (tripState.tripSitter) {
      Linking.openURL(`sms:${tripState.tripSitter.phoneNumber}`);
    }
  };

  const handleEndTrip = async () => {
    try {
      setIsSaving(true);
      const totalDuration = getTotalDuration();
      const timeDifference = totalDuration - timeElapsed;

      if (timeDifference > 60) {
        // Trip ended more than an hour early
        Alert.alert(
          "End Trip Early?",
          `Based on the expected trip duration of ${formatTimeRemaining(totalDuration)}, you're ending more than an hour early. Would you like to save this trip?`,
          [
            {
              text: "Discard Trip",
              style: "destructive",
              onPress: async () => {
                try {
                  await endTrip(false);
                  router.replace('/(tabs)');
                } catch (error) {
                  console.error('Error discarding trip:', error);
                  Alert.alert(
                    "Error",
                    "Failed to discard trip. Please try again.",
                    [{ text: "OK" }]
                  );
                } finally {
                  setIsSaving(false);
                }
              }
            },
            {
              text: "Save Trip",
              onPress: async () => {
                try {
                  // Ensure we have the most up-to-date trip state with all notes
                  const currentTripState = {
                    ...tripState,
                    endTime: new Date()
                  };
                  
                  // Update the trip state first to ensure all notes are included
                  await updateTrip(currentTripState);
                  
                  // Wait a moment to ensure the state is updated
                  await new Promise(resolve => setTimeout(resolve, 100));
                  
                  // Now end the trip, which will save the current state to history
                  await endTrip(true);
                  router.replace('/trip/post-trip');
                } catch (error) {
                  console.error('Error saving trip:', error);
                  Alert.alert(
                    "Error",
                    "Failed to save trip. Please try again.",
                    [{ text: "OK" }]
                  );
                } finally {
                  setIsSaving(false);
                }
              }
            }
          ]
        );
      } else {
        // Normal trip end
        Alert.alert(
          "End Trip",
          "Would you like to save this trip?",
          [
            {
              text: "Discard Trip",
              style: "destructive",
              onPress: () => {
                Alert.alert(
                  "Confirm Discard",
                  "Are you sure you want to discard this trip? This action cannot be undone.",
                  [
                    {
                      text: "Cancel",
                      style: "cancel"
                    },
                    {
                      text: "Discard",
                      style: "destructive",
                      onPress: async () => {
                        try {
                          await endTrip(false);
                          router.replace('/(tabs)');
                        } catch (error) {
                          console.error('Error discarding trip:', error);
                          Alert.alert(
                            "Error",
                            "Failed to discard trip. Please try again.",
                            [{ text: "OK" }]
                          );
                        } finally {
                          setIsSaving(false);
                        }
                      }
                    }
                  ]
                );
              }
            },
            {
              text: "Save Trip",
              onPress: async () => {
                try {
                  // Ensure we have the most up-to-date trip state with all notes
                  const currentTripState = {
                    ...tripState,
                    endTime: new Date()
                  };
                  
                  // Update the trip state first to ensure all notes are included
                  await updateTrip(currentTripState);
                  
                  // Wait a moment to ensure the state is updated
                  await new Promise(resolve => setTimeout(resolve, 100));
                  
                  // Now end the trip, which will save the current state to history
                  await endTrip(true);
                  router.replace('/trip/post-trip');
                } catch (error) {
                  console.error('Error saving trip:', error);
                  Alert.alert(
                    "Error",
                    "Failed to save trip. Please try again.",
                    [{ text: "OK" }]
                  );
                } finally {
                  setIsSaving(false);
                }
              }
            }
          ]
        );
      }
    } catch (error) {
      console.error('Error in handleEndTrip:', error);
      Alert.alert(
        "Error",
        "An unexpected error occurred. Please try again.",
        [{ text: "OK" }]
      );
      setIsSaving(false);
    }
  };

  const formatStartTime = (date: Date) => {
    return date.toLocaleTimeString([], { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const handleAddNote = () => {
    if (!newNoteHeader.trim() || !newNote.trim()) return;
    const note = {
      id: Date.now().toString(),
      content: newNoteHeader.trim() + '\n' + newNote.trim(),
      timestamp: new Date(),
      type: 'during' as const
    };
    updateTrip({
      ...tripState,
      generalNotes: [...(tripState.generalNotes || []), note]
    });
    setNewNote('');
    setNewNoteHeader('');
  };

  const handleAddIntentionNote = (intentionId: string) => {
    const noteHeader = intentionNoteHeaders[intentionId]?.trim();
    const noteBody = intentionNotes[intentionId]?.trim();
    if (!noteHeader || !noteBody) return;
    
    const note = {
      id: Date.now().toString(),
      content: noteHeader + '\n' + noteBody,
      timestamp: new Date(),
      type: 'during' as const
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
    setIntentionNotes(prev => ({ ...prev, [intentionId]: '' }));
    setIntentionNoteHeaders(prev => ({ ...prev, [intentionId]: '' }));
  };

  const handleEditNote = (intentionId: string, noteId: string, newContent: string) => {
    if (!newContent.trim()) return;

    const updatedIntentions = tripState.intentions.map(intention => {
      if (intention.id === intentionId) {
        return {
          ...intention,
          notes: intention.notes?.map(note => 
            note.id === noteId 
              ? { ...note, content: newContent.trim() }
              : note
          ) || []
        };
      }
      return intention;
    });

    updateTrip({
      ...tripState,
      intentions: updatedIntentions
    });

    setEditingNote(null);
    setEditingNoteBody('');
  };

  const handleDeleteNote = (intentionId: string, noteId: string) => {
    Alert.alert(
      "Delete Note",
      "Are you sure you want to delete this note?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            const updatedIntentions = tripState.intentions.map(intention => {
              if (intention.id === intentionId) {
                return {
                  ...intention,
                  notes: intention.notes?.filter(note => note.id !== noteId) || []
                };
              }
              return intention;
            });

            updateTrip({
              ...tripState,
              intentions: updatedIntentions
            });
          }
        }
      ]
    );
  };

  const startEditingNote = (noteId: string, currentContent: string) => {
    // Find the note in the trip state
    const note = tripState.generalNotes?.find(n => n.id === noteId);
    if (note) {
      setEditingNote({ note, intentionId: undefined });
      setEditingNoteBody(currentContent);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0967D2" />
      </View>
    );
  }

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
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Active Trip</Text>
            <Text style={styles.subtitle}>
              Started at {tripState.startTime ? formatStartTime(tripState.startTime) : 'Unknown'}
            </Text>
          </View>

          {/* Progress Bar */}
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { width: `${getProgressPercentage()}%` }
                ]} 
              />
              {PHASES.map((phase, index) => (
                <View
                  key={phase}
                  style={[
                    styles.phaseMarker,
                    { left: `${(getPhaseStartTime(index) / getTotalDuration()) * 100}%` }
                  ]}
                />
              ))}
            </View>
            <View style={styles.phaseLabels}>
              <Text style={styles.phaseLabel}>Come-up</Text>
              <Text style={styles.phaseLabel}>Peak</Text>
              <Text style={styles.phaseLabel}>Comedown</Text>
            </View>
          </View>

          {/* Time Info */}
          <View style={styles.timeInfo}>
            <Text style={styles.timeText}>
              {Math.floor(timeElapsed / 60)}h {timeElapsed % 60}m elapsed
            </Text>
            {timeToNextPhase > 0 && (
              <Text style={styles.nextPhaseText}>
                {formatPhaseTimeRemaining(timeToNextPhase)} until next phase
              </Text>
            )}
          </View>

          {/* Trip Sitter Section */}
          {tripState.tripSitter && (
            <View style={styles.section}>
              <TouchableOpacity 
                style={styles.tripSitterButton}
                onPress={() => setShowTripSitter(!showTripSitter)}
              >
                <MaterialIcons name="health-and-safety" size={24} color="#0967D2" />
                <Text style={styles.tripSitterButtonText}>
                  Trip Sitter: {tripState.tripSitter.name}
                </Text>
                <MaterialIcons 
                  name={showTripSitter ? "expand-less" : "expand-more"} 
                  size={24} 
                  color="#666" 
                />
              </TouchableOpacity>
              
              {showTripSitter && (
                <View style={styles.tripSitterActions}>
                  <Text style={styles.tripSitterName}>{tripState.tripSitter.name}</Text>
                  <View style={styles.tripSitterButtons}>
                    <TouchableOpacity style={styles.actionButton} onPress={handleCallTripSitter}>
                      <MaterialIcons name="call" size={24} color="#0967D2" />
                      <Text style={styles.actionButtonText}>Call</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionButton} onPress={handleTextTripSitter}>
                      <MaterialIcons name="message" size={24} color="#0967D2" />
                      <Text style={styles.actionButtonText}>Text</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>
          )}

          {/* Quick Actions */}
          <View style={styles.quickActions}>
            <TouchableOpacity style={styles.actionButton}>
              <MaterialIcons name="music-note" size={24} color="#0967D2" />
              <Text style={styles.actionButtonText}>Music</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <MaterialIcons name="lightbulb" size={24} color="#0967D2" />
              <Text style={styles.actionButtonText}>Ideas</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <MaterialIcons name="psychology" size={24} color="#0967D2" />
              <Text style={styles.actionButtonText}>DanceSafe</Text>
            </TouchableOpacity>
          </View>

          {/* Intentions Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {tripState.intentions.length === 1 ? 'Intention' : 'Intentions'}
            </Text>
            {tripState.intentions.map((intention) => {
              return (
                <View key={intention.id} style={styles.intentionCard}>
                  <TouchableOpacity
                    style={styles.intentionHeader}
                    onPress={() => setExpandedIntention(
                      expandedIntention === intention.id ? null : intention.id
                    )}
                  >
                    <View style={styles.intentionHeaderContent}>
                      <Text style={styles.intentionText}>{intention.text}</Text>
                    </View>
                    <MaterialIcons
                      name={expandedIntention === intention.id ? "expand-less" : "expand-more"}
                      size={24}
                      color="#666"
                    />
                  </TouchableOpacity>
                  
                  {expandedIntention === intention.id && (
                    <View style={styles.intentionContent}>
                      {intention.description && (
                        <Text style={styles.intentionDescription}>
                          {intention.description}
                        </Text>
                      )}
                      <View style={styles.notesContainer}>
                        {intention.notes?.map(note => (
                          <View key={note.id} style={styles.noteCard}>
                            <View style={styles.noteHeader}>
                              <Text style={styles.noteContent}>{note.content}</Text>
                              <View style={styles.noteActions}>
                                <TouchableOpacity
                                  style={styles.noteActionButton}
                                  onPress={() => {
                                    const lines = note.content.split('\n');
                                    const header = lines[0] || '';
                                    const body = lines.length > 1 ? lines.slice(1).join('\n') : '';
                                    setEditingNote({ note, intentionId: intention.id });
                                    setEditingNoteHeader(header);
                                    setEditingNoteBody(body);
                                    setShowNoteEditModal(true);
                                  }}
                                >
                                  <MaterialIcons name="edit" size={16} color="#666" />
                                </TouchableOpacity>
                                <TouchableOpacity
                                  style={styles.noteActionButton}
                                  onPress={() => handleDeleteNote(intention.id, note.id)}
                                >
                                  <MaterialIcons name="delete" size={16} color="#EF5350" />
                                </TouchableOpacity>
                              </View>
                            </View>
                            <Text style={styles.noteTimestamp}>
                              {new Date(note.timestamp).toLocaleTimeString([], { 
                                hour: 'numeric', 
                                minute: '2-digit',
                                hour12: true 
                              })}
                            </Text>
                          </View>
                        ))}
                        <View style={styles.noteInputContainer}>
                          <View style={{ flex: 1 }}>
                            <TextInput
                              style={styles.noteHeaderInput}
                              placeholder="Note title (max 100 characters)..."
                              value={intentionNoteHeaders[intention.id] || ''}
                              onChangeText={(text) => setIntentionNoteHeaders(prev => ({ ...prev, [intention.id]: text }))}
                              maxLength={100}
                              multiline={false}
                              returnKeyType="next"
                              blurOnSubmit={false}
                            />
                            <Text style={styles.characterCount}>{(intentionNoteHeaders[intention.id] || '').length}/100</Text>
                            <TextInput
                              style={styles.noteInput}
                              placeholder="Add a note for this intention..."
                              value={intentionNotes[intention.id] || ''}
                              onChangeText={(text) => setIntentionNotes(prev => ({ ...prev, [intention.id]: text }))}
                              multiline
                              returnKeyType="done"
                              blurOnSubmit={true}
                              onSubmitEditing={() => {
                                Keyboard.dismiss();
                                // Remove auto-save - just dismiss keyboard and stay on modal
                              }}
                            />
                          </View>
                          <TouchableOpacity 
                            style={[styles.addNoteButton, (!intentionNotes[intention.id]?.trim() || !intentionNoteHeaders[intention.id]?.trim()) && styles.addNoteButtonDisabled]}
                            onPress={() => handleAddIntentionNote(intention.id)}
                            disabled={!intentionNotes[intention.id]?.trim() || !intentionNoteHeaders[intention.id]?.trim()}
                          >
                            <MaterialIcons name="add" size={24} color="#fff" />
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>
                  )}
                </View>
              );
            })}
          </View>

          {/* General Notes Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Notes</Text>
            <View style={styles.notesContainer}>
              {tripState.generalNotes?.map(note => (
                <View key={note.id} style={styles.noteCard}>
                  <Text style={styles.noteContent}>{note.content}</Text>
                  <Text style={styles.noteTimestamp}>
                    {new Date(note.timestamp).toLocaleTimeString([], { 
                      hour: 'numeric', 
                      minute: '2-digit',
                      hour12: true 
                    })}
                  </Text>
                </View>
              ))}
            </View>
            <View style={styles.noteInputContainer}>
              <View style={{ flex: 1 }}>
                <TextInput
                  style={styles.noteHeaderInput}
                  placeholder="Note title (max 100 characters)..."
                  value={newNoteHeader}
                  onChangeText={setNewNoteHeader}
                  maxLength={100}
                  multiline={false}
                  returnKeyType="next"
                  blurOnSubmit={false}
                />
                <Text style={styles.characterCount}>{newNoteHeader.length}/100</Text>
                <TextInput
                  style={styles.noteInput}
                  placeholder="Add a note..."
                  value={newNote}
                  onChangeText={setNewNote}
                  multiline
                  returnKeyType="done"
                  blurOnSubmit={true}
                />
              </View>
              <TouchableOpacity 
                style={[styles.addNoteButton, (!newNote.trim() || !newNoteHeader.trim()) && styles.addNoteButtonDisabled]}
                onPress={handleAddNote}
                disabled={!newNote.trim() || !newNoteHeader.trim()}
              >
                <MaterialIcons name="add" size={24} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>

          {/* End Trip Button */}
          <Pressable
            style={styles.endButton}
            onPress={handleEndTrip}
          >
            <Text style={styles.endButtonText}>End Trip</Text>
          </Pressable>

          {/* Note Edit Modal */}
          {showNoteEditModal && editingNote && (
            <Modal
              visible={showNoteEditModal}
              transparent={true}
              animationType="fade"
              onRequestClose={() => setShowNoteEditModal(false)}
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
                          <TouchableOpacity onPress={() => setShowNoteEditModal(false)}>
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
                            onPress={() => {
                              if (editingNote.intentionId) {
                                handleDeleteNote(editingNote.intentionId, editingNote.note.id);
                              }
                              setShowNoteEditModal(false);
                            }}
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
                                    onPress: () => setShowNoteEditModal(false)
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
                            onPress={() => {
                              if (!editingNoteHeader.trim()) return;
                              if (editingNote.intentionId) {
                                handleEditNote(editingNote.intentionId, editingNote.note.id, editingNoteHeader.trim() + '\n' + editingNoteBody.trim());
                              }
                              setShowNoteEditModal(false);
                            }}
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
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    padding: 20,
  },
  header: {
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  progressContainer: {
    marginBottom: 30,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
    position: 'relative',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 4,
  },
  phaseMarker: {
    position: 'absolute',
    top: -4,
    width: 2,
    height: 16,
    backgroundColor: '#666',
  },
  phaseLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  phaseLabel: {
    fontSize: 12,
    color: '#666',
  },
  timeInfo: {
    marginBottom: 30,
    alignItems: 'center',
  },
  timeText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  nextPhaseText: {
    fontSize: 16,
    color: '#666',
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  tripSitterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 12,
  },
  tripSitterButtonText: {
    fontSize: 16,
    color: '#1a1a1a',
    marginLeft: 12,
  },
  tripSitterActions: {
    marginTop: 12,
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
  },
  tripSitterName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  tripSitterButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  actionButton: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E4E7EB',
  },
  actionButtonText: {
    color: '#0967D2',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
    textAlign: 'center',
  },
  intentionCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
  },
  intentionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  intentionHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  intentionText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  intentionContent: {
    padding: 16,
    paddingTop: 0,
  },
  intentionDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  notesContainer: {
    marginBottom: 16,
  },
  noteCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  noteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  noteActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  noteActionButton: {
    padding: 4,
    marginLeft: 4,
  },
  noteContent: {
    flex: 1,
    fontSize: 14,
    color: '#1a1a1a',
    marginRight: 8,
  },
  noteTimestamp: {
    fontSize: 12,
    color: '#666',
  },
  noteInputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 16,
  },
  noteInput: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginRight: 8,
    minHeight: 40,
    maxHeight: 100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  addNoteButton: {
    backgroundColor: '#0967D2',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addNoteButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  endButton: {
    backgroundColor: '#F44336',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  endButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 24,
  },
  noteEditContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  noteEditInput: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginRight: 8,
    minHeight: 40,
    maxHeight: 100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  noteEditActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  noteEditButton: {
    padding: 4,
  },
  noteHeaderInput: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginRight: 8,
    minHeight: 40,
    maxHeight: 100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  characterCount: {
    fontSize: 12,
    color: '#666',
    textAlign: 'right',
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
    borderRadius: 12,
    width: '80%',
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  noteEditForm: {
    marginBottom: 16,
  },
  noteEditField: {
    marginBottom: 12,
  },
  noteEditLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  noteEditTextArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  noteEditModalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    width: '80%',
    maxHeight: '60%',
    marginTop: 100,
  },
}); 