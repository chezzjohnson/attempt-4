import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Alert, Animated, Dimensions, Easing, Keyboard, KeyboardAvoidingView, Modal, Platform, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import { Button } from '../../components/ui/Button';
import { CardContainer } from '../../components/ui/Layout';
import { BodyText, Caption, Heading, Label } from '../../components/ui/Typography';
import { Colors, Spacing } from '../../constants/DesignSystem';
import { useIntentions } from '../../contexts/IntentionsContext';
import { Intention, Note, TripHistory, useTrip } from '../../contexts/TripContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function HistoryScreen() {
  const router = useRouter();
  const { tripHistory, updateTripHistory, tripState, updateTrip } = useTrip();
  const { intentions, getIntentionUsageCount } = useIntentions();
  const [expandedTrip, setExpandedTrip] = useState<string | null>(null);
  const [expandedIntentions, setExpandedIntentions] = useState<Set<string>>(new Set());
  const [animatingTrips, setAnimatingTrips] = useState<Record<string, boolean>>({});
  const [animatingIntentions, setAnimatingIntentions] = useState<Record<string, boolean>>({});
  const [selectedIntention, setSelectedIntention] = useState<Intention | null>(null);
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [newNoteHeader, setNewNoteHeader] = useState('');
  const [selectedNoteType, setSelectedNoteType] = useState<Note['type']>('x-days');
  const [expandedNoteGroups, setExpandedNoteGroups] = useState<Record<Note['type'], boolean>>({
    'during': true,
    'post-trip': true,
    'x-days': true,
    '7d': true,
    '14d': true,
    '30d': true
  });
  const [expandedIntentionNoteGroups, setExpandedIntentionNoteGroups] = useState<Record<string, Record<Note['type'], boolean>>>({});
  
  // Toast state
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [lastAddedNoteId, setLastAddedNoteId] = useState<string | null>(null);
  
  // Note editing modal state
  const [showNoteEditModal, setShowNoteEditModal] = useState(false);
  const [editingNote, setEditingNote] = useState<{
    note: Note;
    trip: TripHistory;
    intention?: Intention;
    isGeneralNote: boolean;
  } | null>(null);
  const [editingNoteHeader, setEditingNoteHeader] = useState('');
  const [editingNoteBody, setEditingNoteBody] = useState('');

  // Animation values
  const tripAnimations = useRef<Record<string, Animated.Value>>({});
  const intentionAnimations = useRef<Record<string, Animated.Value>>({});
  const tripArrowAnimations = useRef<Record<string, Animated.Value>>({});
  const intentionArrowAnimations = useRef<Record<string, Animated.Value>>({});
  const [tripHeights, setTripHeights] = useState<Record<string, number>>({});
  const [intentionHeights, setIntentionHeights] = useState<Record<string, number>>({});

  // Refs for text inputs
  const titleInputRef = useRef<TextInput>(null);
  const notesInputRef = useRef<TextInput>(null);
  const editTitleInputRef = useRef<TextInput>(null);
  const editNotesInputRef = useRef<TextInput>(null);

  // 1. Add Animated values for opacity and translateY
  const toastOpacity = useRef(new Animated.Value(0)).current;
  const toastTranslateY = useRef(new Animated.Value(20)).current;

  // 2. Update showToastMessage to animate in/out
  const showToastMessage = (message: string) => {
    setToastMessage(message);
    setShowToast(true);
    Animated.parallel([
      Animated.timing(toastOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(toastTranslateY, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
    setTimeout(() => {
      Animated.parallel([
        Animated.timing(toastOpacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(toastTranslateY, {
          toValue: 20,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => setShowToast(false));
    }, 2000);
  };

  // Note editing functions
  const openNoteEditModal = (note: Note, trip: TripHistory, intention?: Intention, isGeneralNote: boolean = false) => {
    // Extract header from first line of note content for existing notes
    const lines = note.content.split('\n');
    const header = lines[0] || '';
    const body = lines.length > 1 ? lines.slice(1).join('\n') : '';
    
    setEditingNote({ note, trip, intention, isGeneralNote });
    setEditingNoteHeader(header);
    setEditingNoteBody(body);
    setShowNoteEditModal(true);
  };

  const saveNoteEdit = () => {
    if (!editingNote || !editingNoteHeader.trim()) {
      showToastMessage('Note header is required');
      return;
    }

    const updatedContent = editingNoteHeader.trim() + (editingNoteBody.trim() ? '\n' + editingNoteBody.trim() : '');
    
    const updatedNote: Note = {
      ...editingNote.note,
      content: updatedContent
    };

    if (editingNote.isGeneralNote) {
      // Update general note
      const updatedTrip = {
        ...editingNote.trip,
        generalNotes: editingNote.trip.generalNotes.map(n => 
          n.id === editingNote.note.id ? updatedNote : n
        )
      };
      
      const updatedHistory = tripHistory.map(t => 
        t.id === editingNote.trip.id ? updatedTrip : t
      );
      
      updateTripHistory(updatedHistory);
    } else {
      // Update intention note
      if (!editingNote.intention) return;
      
      const updatedIntention = {
        ...editingNote.intention,
        notes: (editingNote.intention.notes || []).map(n => 
          n.id === editingNote.note.id ? updatedNote : n
        )
      };

      const updatedTrip = {
        ...editingNote.trip,
        intentions: editingNote.trip.intentions.map(i => 
          i.id === editingNote.intention!.id ? updatedIntention : i
        )
      };

      const updatedHistory = tripHistory.map(t => 
        t.id === editingNote.trip.id ? updatedTrip : t
      );
      
      updateTripHistory(updatedHistory);
    }

    showToastMessage('Note updated successfully!');
    closeNoteEditModal();
  };

  const deleteNote = () => {
    if (!editingNote) return;

    // Show confirmation dialog
    Alert.alert(
      'Delete Note',
      'Are you sure you want to delete this note? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => {
            if (editingNote.isGeneralNote) {
              // Delete general note
              const updatedTrip = {
                ...editingNote.trip,
                generalNotes: editingNote.trip.generalNotes.filter(n => n.id !== editingNote.note.id)
              };
              
              const updatedHistory = tripHistory.map(t => 
                t.id === editingNote.trip.id ? updatedTrip : t
              );
              
              updateTripHistory(updatedHistory);
            } else {
              // Delete intention note
              if (!editingNote.intention) return;
              
              const updatedIntention = {
                ...editingNote.intention,
                notes: (editingNote.intention.notes || []).filter(n => n.id !== editingNote.note.id)
              };

              const updatedTrip = {
                ...editingNote.trip,
                intentions: editingNote.trip.intentions.map(i => 
                  i.id === editingNote.intention!.id ? updatedIntention : i
                )
              };

              const updatedHistory = tripHistory.map(t => 
                t.id === editingNote.trip.id ? updatedTrip : t
              );
              
              updateTripHistory(updatedHistory);
            }

            showToastMessage('Note deleted successfully!');
            closeNoteEditModal();
          }
        }
      ]
    );
  };

  const closeNoteEditModal = () => {
    setShowNoteEditModal(false);
    setEditingNote(null);
    setEditingNoteHeader('');
    setEditingNoteBody('');
  };

  // Helper function to get note display text
  const getNoteDisplayText = (content: string) => {
    const lines = content.split('\n');
    const firstLine = lines[0] || '';
    const hasMoreContent = lines.length > 1;
    const isTitleTruncated = firstLine.length > 50;
    
    return {
      displayText: isTitleTruncated ? firstLine.substring(0, 50) + '...' : firstLine,
      hasMoreContent: hasMoreContent || isTitleTruncated,
      fullText: content
    };
  };

  // Initialize animation values for trips
  useEffect(() => {
    tripHistory.forEach(trip => {
      if (!tripAnimations.current[trip.id]) {
        tripAnimations.current[trip.id] = new Animated.Value(0);
      }
      if (!tripArrowAnimations.current[trip.id]) {
        tripArrowAnimations.current[trip.id] = new Animated.Value(0);
      }
    });
  }, [tripHistory]);

  // Initialize animation values for intentions
  useEffect(() => {
    tripHistory.forEach(trip => {
      trip.intentions?.forEach(intention => {
        if (!intentionAnimations.current[intention.id]) {
          intentionAnimations.current[intention.id] = new Animated.Value(0);
        }
        if (!intentionArrowAnimations.current[intention.id]) {
          intentionArrowAnimations.current[intention.id] = new Animated.Value(0);
        }
      });
    });
  }, [tripHistory]);

  // Animation functions
  const animateTripCard = (tripId: string, isExpanding: boolean) => {
    const animation = tripAnimations.current[tripId];
    if (!animation) return;

    Animated.timing(animation, {
      toValue: isExpanding ? 1 : 0,
      duration: 800,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  };

  const animateIntention = (intentionId: string, isExpanding: boolean) => {
    const animation = intentionAnimations.current[intentionId];
    if (!animation) return;

    Animated.timing(animation, {
      toValue: isExpanding ? 1 : 0,
      duration: 600,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  };

  const handleTripToggle = (tripId: string) => {
    const isCurrentlyExpanded = expandedTrip === tripId;
    const animation = tripAnimations.current[tripId];
    const arrowAnimation = tripArrowAnimations.current[tripId];
    
    if (!animation || !arrowAnimation) return;
    
    if (isCurrentlyExpanded) {
      // When closing, mark as animating and animate everything together
      setAnimatingTrips(prev => ({ ...prev, [tripId]: true }));
      Animated.parallel([
        Animated.timing(animation, {
          toValue: 0,
          duration: 300,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: false,
        }),
        Animated.timing(arrowAnimation, {
          toValue: 0,
          duration: 300,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: false,
        })
      ]).start(() => {
        // Only update state after animation completes
        setExpandedTrip(null);
        setAnimatingTrips(prev => ({ ...prev, [tripId]: false }));
      });
    } else {
      // When opening, update state first, then animate
      setExpandedTrip(tripId);
      setAnimatingTrips(prev => ({ ...prev, [tripId]: true }));
      // Small delay to ensure state is updated before animation starts
      setTimeout(() => {
        Animated.parallel([
          Animated.timing(animation, {
            toValue: 1,
            duration: 300,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: false,
          }),
          Animated.timing(arrowAnimation, {
            toValue: 1,
            duration: 300,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: false,
          })
        ]).start(() => {
          setAnimatingTrips(prev => ({ ...prev, [tripId]: false }));
        });
      }, 50);
    }
  };

  const handleIntentionToggle = (intentionId: string) => {
    const isCurrentlyExpanded = expandedIntentions.has(intentionId);
    const animation = intentionAnimations.current[intentionId];
    const arrowAnimation = intentionArrowAnimations.current[intentionId];
    
    if (!animation || !arrowAnimation) return;
    
    if (isCurrentlyExpanded) {
      // When closing, mark as animating and animate everything together
      setAnimatingIntentions(prev => ({ ...prev, [intentionId]: true }));
      Animated.parallel([
        Animated.timing(animation, {
          toValue: 0,
          duration: 250,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: false,
        }),
        Animated.timing(arrowAnimation, {
          toValue: 0,
          duration: 250,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: false,
        })
      ]).start(() => {
        // Only update state after animation completes
        setExpandedIntentions(prev => {
          const newSet = new Set(prev);
          newSet.delete(intentionId);
          return newSet;
        });
        setAnimatingIntentions(prev => ({ ...prev, [intentionId]: false }));
      });
    } else {
      // When opening, update state first, then animate
      setExpandedIntentions(prev => {
        const newSet = new Set(prev);
        newSet.add(intentionId);
        return newSet;
      });
      setAnimatingIntentions(prev => ({ ...prev, [intentionId]: true }));
      // Small delay to ensure state is updated before animation starts
      setTimeout(() => {
        Animated.parallel([
          Animated.timing(animation, {
            toValue: 1,
            duration: 250,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: false,
          }),
          Animated.timing(arrowAnimation, {
            toValue: 1,
            duration: 250,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: false,
          })
        ]).start(() => {
          setAnimatingIntentions(prev => ({ ...prev, [intentionId]: false }));
        });
      }, 50);
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString(undefined, {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const getRatingAverage = (ratings: { value: number | null }[]) => {
    const validRatings = ratings.filter(r => r.value !== null) as { value: number }[];
    if (validRatings.length === 0) return null;
    return validRatings.reduce((acc, curr) => acc + curr.value, 0) / validRatings.length;
  };

  const getRatingData = (trip: TripHistory) => {
    // Only show graph if there are intentions with ratings
    const hasRatings = trip.intentions.some(intention => 
      intention.ratings && intention.ratings.some(rating => rating.value !== null)
    );

    if (!hasRatings) return null;

    // Define the rating categories and their order
    const categories = [
      { type: 'post-trip', label: 'Post' },
      { type: '7-day', label: '7d' },
      { type: '14-day', label: '14d' },
      { type: '30-day', label: '30d' }
    ];

    // Initialize data structure with all categories
    const data = {
      labels: categories.map(cat => cat.label),
      datasets: [{
        data: categories.map(cat => {
          // Find all ratings for this category
          const categoryRatings: number[] = [];
          trip.intentions.forEach(intention => {
            intention.ratings?.forEach(rating => {
              if (rating.type === cat.type && rating.value !== null) {
                categoryRatings.push(rating.value);
              }
            });
          });

          // Calculate average if there are ratings, otherwise return 0
          if (categoryRatings.length > 0) {
            const sum = categoryRatings.reduce((acc, val) => acc + val, 0);
            return Math.round(sum / categoryRatings.length);
          }
          return 0;
        })
      }]
    };

    return data;
  };

  const handleRateTrip = (trip: TripHistory) => {
    console.log('Navigating to post-trip with trip:', JSON.stringify(trip, null, 2));
    // Update the current trip state with the selected trip's data
    updateTrip({
      ...tripState,
      id: trip.id,
      startTime: trip.startTime,
      intentions: trip.intentions,
      generalNotes: trip.generalNotes,
      postTripRated: trip.postTripRated,
      dose: trip.dose,
      set: trip.set,
      setting: trip.setting,
      safety: trip.safety,
      tripSitter: trip.tripSitter,
      currentPhase: null
    });
    router.push('/trip/post-trip');
  };

  const getFollowUpButton = (type: '7-day' | '14-day' | '30-day', intention: Intention, trip: TripHistory) => {
    const hasFollowUpRating = intention.ratings?.some((rating: { type: string; value: number | null }) => 
      rating.type === type && rating.value !== null
    );

    // Calculate days since trip
    const tripEndTime = new Date(trip.endTime);
    const now = new Date();
    const daysSinceTrip = Math.floor((now.getTime() - tripEndTime.getTime()) / (1000 * 60 * 60 * 24));

    // Check if enough time has passed
    const isAvailable = (() => {
      switch (type) {
        case '7-day':
          return daysSinceTrip >= 7;
        case '14-day':
          return daysSinceTrip >= 14;
        case '30-day':
          return daysSinceTrip >= 30;
        default:
          return false;
      }
    })();

    if (hasFollowUpRating) {
      return (
        <View style={styles.followUpButton}>
          <MaterialIcons name="check-circle" size={20} color="#10B981" />
          <Text style={[styles.followUpButtonText, { color: '#10B981' }]}>
            {type === '7-day' ? '7d' : type === '14-day' ? '14d' : '30d'} Rated
          </Text>
        </View>
      );
    }

    if (!isAvailable) {
      const daysRemaining = (() => {
        switch (type) {
          case '7-day':
            return 7 - daysSinceTrip;
          case '14-day':
            return 14 - daysSinceTrip;
          case '30-day':
            return 30 - daysSinceTrip;
          default:
            return 0;
        }
      })();

      return (
        <View style={[styles.followUpButton, styles.followUpButtonDisabled]}>
          <MaterialIcons name="schedule" size={20} color="#9CA3AF" />
          <Text style={[styles.followUpButtonText, { color: '#9CA3AF' }]}>
            {daysRemaining}d left
          </Text>
        </View>
      );
    }

    return (
      <TouchableOpacity
        style={styles.followUpButton}
        onPress={() => router.push({
          pathname: '/trip/follow-up',
          params: { tripId: trip.id, followUpType: type }
        })}
      >
        <MaterialIcons name="schedule" size={20} color="#5196F4" />
        <Text style={styles.followUpButtonText}>
          {type === '7-day' ? '7d' : type === '14-day' ? '14d' : '30d'} Follow-up
        </Text>
      </TouchableOpacity>
    );
  };

  const getIntentionRatingData = (intention: Intention) => {
    if (!intention.ratings?.length) return null;

    const categories = [
      { type: 'post-trip', label: 'Post' },
      { type: '7-day', label: '7d' },
      { type: '14-day', label: '14d' },
      { type: '30-day', label: '30d' }
    ];

    return {
      labels: categories.map(cat => cat.label),
      datasets: [{
        data: categories.map(cat => {
          const rating = intention.ratings?.find(r => r.type === cat.type);
          return rating?.value || 0;
        })
      }]
    };
  };

  const renderRatingTimeline = (intention: Intention, trip: TripHistory) => {
    const categories = [
      { type: 'post-trip', label: 'Post' },
      { type: '7-day', label: '7d' },
      { type: '14-day', label: '14d' },
      { type: '30-day', label: '30d' }
    ];

    // Get intention data from IntentionsContext
    const intentionData = intentions.find(i => i.id === intention.id);
    const tripData = intentionData?.trips.find(t => t.tripId === trip.id);

    return (
      <View style={styles.timelineContainer}>
        {categories.map((cat, index) => {
          const rating = tripData?.ratings.find(r => r.type === cat.type);
          const value = rating?.value || 0;
          const isRated = value > 0;

          return (
            <View key={cat.type} style={styles.timelineItem}>
              <View style={[
                styles.timelineDot,
                isRated ? styles.timelineDotActive : styles.timelineDotInactive
              ]}>
                <Text style={[
                  styles.timelineDotText,
                  isRated ? styles.timelineDotTextActive : styles.timelineDotTextInactive
                ]}>
                  {isRated ? value : '-'}
                </Text>
              </View>
              {index < categories.length - 1 && (
                <View style={[
                  styles.timelineLine,
                  isRated ? styles.timelineLineActive : styles.timelineLineInactive
                ]} />
              )}
            </View>
          );
        })}
      </View>
    );
  };

  const calculateDaysSinceTrip = (tripStartTime: Date | string, noteTime: Date | string) => {
    const start = new Date(tripStartTime);
    const note = new Date(noteTime);
    
    // Set both dates to midnight to compare calendar days
    start.setHours(0, 0, 0, 0);
    note.setHours(0, 0, 0, 0);
    
    // Calculate difference in days
    const diffTime = note.getTime() - start.getTime();
    const days = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    console.log('Days calculation:', {
      tripStart: start.toISOString(),
      noteTime: note.toISOString(),
      diffTime,
      days
    });
    return days;
  };

  const getNoteTypeLabel = (note: Note) => {
    console.log('Getting note type label:', {
      note,
      type: note.type,
      daysAfterTrip: note.daysAfterTrip
    });

    switch (note.type) {
      case 'during':
        return 'During trip';
      case 'post-trip':
        return 'Post-trip report';
      case 'x-days':
        return note.daysAfterTrip ? `${note.daysAfterTrip} days` : 'Follow-up';
      case '7d':
        return '7 days';
      case '14d':
        return '14 days';
      case '30d':
        return '30 days';
      default:
        return note.type;
    }
  };

  const getNoteTypeColor = (type: Note['type']) => {
    switch (type) {
      case 'during':
        return '#10B981'; // Bright green
      case 'post-trip':
        return '#059669'; // Darker green
      case 'x-days':
        return '#047857'; // Even darker green
      case '7d':
        return '#065F46'; // Very dark green
      case '14d':
        return '#064E3B'; // Darkest green
      case '30d':
        return '#022C22'; // Almost black green
      default:
        return '#6B7280';
    }
  };

  const getNoteTypeIcon = (type: Note['type']) => {
    switch (type) {
      case 'post-trip':
        return 'event-note';
      case 'x-days':
        return 'schedule';
      case '7d':
      case '14d':
      case '30d':
        return 'update';
      default:
        return 'note';
    }
  };

  const handleAddNote = (trip: TripHistory, intention: Intention) => {
    if (!newNote.trim()) return;

    const note: Note = {
      id: Date.now().toString(),
      content: newNote.trim(),
      timestamp: new Date(),
      type: selectedNoteType,
      daysAfterTrip: selectedNoteType === 'x-days' 
        ? Math.floor((new Date().getTime() - new Date(trip.startTime).getTime()) / (1000 * 60 * 60 * 24))
        : undefined
    };

    const updatedIntentions = intention.notes 
      ? intention.notes.concat(note)
      : [note];

    const updatedTrip = {
      ...trip,
      intentions: trip.intentions.map(i => 
        i.id === intention.id 
          ? { ...i, notes: updatedIntentions }
          : i
      )
    };

    const updatedHistory = tripHistory.map(t => 
      t.id === trip.id ? updatedTrip : t
    );

    updateTripHistory(updatedHistory);
    setNewNote('');
  };

  const handleAddGeneralNote = (trip: TripHistory) => {
    if (!newNoteHeader.trim() || !newNote.trim()) {
      showToastMessage('Note header and content are required');
      return;
    }

    const noteTime = new Date();
    const daysSinceTrip = calculateDaysSinceTrip(trip.startTime, noteTime);
    console.log('Note creation:', {
      tripStartTime: trip.startTime,
      noteTime,
      daysSinceTrip,
      tripEndTime: trip.endTime
    });
    
    // Determine note type based on when the note was taken
    let noteType: Note['type'];
    let daysAfterTrip: number;

    // If the trip is still active (hasn't ended)
    if (!trip.endTime) {
      noteType = 'during';
      daysAfterTrip = 0;
    } 
    // If the note is from the post-trip report (taken right after trip ended)
    else if (daysSinceTrip === 0 && new Date(noteTime).getTime() > new Date(trip.endTime).getTime()) {
      noteType = 'post-trip';
      daysAfterTrip = 0;
    }
    // Otherwise, it's a follow-up note
    else if (daysSinceTrip >= 30) {
      noteType = '30d';
      daysAfterTrip = 30;
    } else if (daysSinceTrip >= 14) {
      noteType = '14d';
      daysAfterTrip = 14;
    } else if (daysSinceTrip >= 7) {
      noteType = '7d';
      daysAfterTrip = 7;
    } else if (daysSinceTrip > 0) {
      noteType = 'x-days';
      daysAfterTrip = daysSinceTrip;
    } else {
      noteType = 'during';
      daysAfterTrip = 0;
    }

    console.log('Note type determination:', {
      noteType,
      daysAfterTrip,
      daysSinceTrip
    });

    const note: Note = {
      id: Date.now().toString(),
      content: newNoteHeader.trim() + '\n' + newNote.trim(),
      timestamp: noteTime,
      type: noteType,
      daysAfterTrip
    };

    console.log('Created note:', note);

    const updatedTrip = {
      ...trip,
      generalNotes: [...trip.generalNotes, note]
    };

    const updatedHistory = tripHistory.map(t => 
      t.id === trip.id ? updatedTrip : t
    );

    updateTripHistory(updatedHistory);
    setNewNote('');
    setNewNoteHeader('');
    
    // Show toast message
    showToastMessage('Note saved successfully!');
    
    // Set the last added note ID for highlighting
    setLastAddedNoteId(note.id);
    
    // Clear the highlight after 3 seconds
    setTimeout(() => {
      setLastAddedNoteId(null);
    }, 3000);
    
    // Close the note input modal (moved to end)
    setShowNoteInput(false);
    setSelectedIntention(null);
  };

  const renderNotes = (notes: Note[], tripStartTime: Date, trip: TripHistory, intention?: Intention) => {
    // Determine which state to use based on whether this is for an intention or general notes
    const isIntentionNotes = !!intention;
    const intentionId = intention?.id;
    
    // Get the appropriate expanded state
    const getExpandedState = (noteType: Note['type']) => {
      if (isIntentionNotes && intentionId) {
        return expandedIntentionNoteGroups[intentionId]?.[noteType] ?? true;
      } else {
        return expandedNoteGroups[noteType];
      }
    };
    
    // Set the appropriate expanded state
    const setExpandedState = (noteType: Note['type'], expanded: boolean) => {
      if (isIntentionNotes && intentionId) {
        setExpandedIntentionNoteGroups(prev => ({
          ...prev,
          [intentionId]: {
            ...prev[intentionId],
            [noteType]: expanded
          }
        }));
      } else {
        setExpandedNoteGroups(prev => ({
          ...prev,
          [noteType]: expanded
        }));
      }
    };

    // Group notes by type
    const groupedNotes = notes.reduce((acc, note) => {
      const type = note.type;
      if (!acc[type]) {
        acc[type] = [];
      }
      acc[type].push(note);
      return acc;
    }, {} as Record<Note['type'], Note[]>);

    // Sort notes within each group by timestamp
    Object.keys(groupedNotes).forEach(type => {
      groupedNotes[type as Note['type']].sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
    });

    // Render each group
    return Object.entries(groupedNotes).map(([type, typeNotes]) => {
      const noteType = type as Note['type'];
      const isExpanded = getExpandedState(noteType);
      const groupKey = isIntentionNotes ? `${intentionId}-${noteType}` : `general-${trip.id}-${noteType}`;
      
      return (
        <View key={groupKey} style={styles.noteGroup}>
          <TouchableOpacity
            style={styles.noteGroupHeader}
            onPress={() => {
              setExpandedState(noteType, !isExpanded);
            }}
          >
            <View style={[styles.noteTypeIndicator, { borderColor: getNoteTypeColor(noteType) }]}>
              <Text style={[styles.noteTypeText, { color: getNoteTypeColor(noteType) }]}>
                {getNoteTypeLabel({ 
                  id: '', 
                  content: '', 
                  timestamp: new Date(), 
                  type: noteType,
                  daysAfterTrip: typeNotes[0]?.daysAfterTrip
                })}
              </Text>
            </View>
            <MaterialIcons
              name={isExpanded ? 'expand-less' : 'expand-more'}
              size={20}
              color={Colors.text.secondary}
            />
          </TouchableOpacity>
          {isExpanded && typeNotes.map(note => {
            const noteDisplay = getNoteDisplayText(note.content);
            const isGeneralNote = !isIntentionNotes;
            
            return (
              <TouchableOpacity
                key={note.id} 
                style={styles.noteItem}
              >
                <View style={styles.noteContent}>
                  <View style={styles.noteHeaderRow}>
                    <Text style={styles.noteText}>{noteDisplay.displayText}</Text>
                    <View style={styles.noteActions}>
                      {noteDisplay.hasMoreContent && (
                        <MaterialIcons 
                          name="expand-more" 
                          size={16} 
                          color={Colors.text.secondary} 
                          style={styles.expandIcon}
                        />
                      )}
                      <TouchableOpacity
                        style={styles.noteActionButton}
                        onPress={() => openNoteEditModal(note, trip, intention, isGeneralNote)}
                      >
                        <MaterialIcons name="edit" size={16} color={Colors.text.secondary} />
                      </TouchableOpacity>
                    </View>
                  </View>
                  <Text style={styles.noteTime}>
                    {formatTime(note.timestamp)}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      );
    });
  };

  const renderTripCard = (trip: TripHistory) => {
    const isExpanded = expandedTrip === trip.id;
    const hasIntentions = trip.intentions && trip.intentions.length > 0;

    return (
      <CardContainer style={styles.tripCard}>
        <TouchableOpacity
          style={styles.tripHeader}
          onPress={() => handleTripToggle(trip.id)}
        >
          <View style={styles.tripHeaderContent}>
            <Heading variant="h3" style={styles.tripTitle}>
              {trip.dose?.name || `Trip on ${new Date(trip.startTime).toLocaleDateString()}`}
            </Heading>
            <View>
              <Caption style={styles.tripDate}>
                {new Date(trip.startTime).toLocaleDateString()}
              </Caption>
              <Caption style={styles.tripTime}>
                {new Date(trip.startTime).toLocaleTimeString([], { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </Caption>
            </View>
          </View>
          <Animated.View
            style={{
              transform: [{
                rotate: tripArrowAnimations.current[trip.id]?.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0deg', '180deg'],
                }) || '0deg'
              }]
            }}
          >
            <MaterialIcons
              name={isExpanded ? 'expand-less' : 'expand-more'}
              size={20}
              color={Colors.text.secondary}
            />
          </Animated.View>
        </TouchableOpacity>

        {(isExpanded || animatingTrips[trip.id]) && (
          <Animated.View 
            style={[
              styles.tripContent,
              {
                opacity: tripAnimations.current[trip.id] || 0,
                transform: [{
                  translateY: tripAnimations.current[trip.id]?.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-20, 0],
                  }) || -20
                }],
              }
            ]}
          >
            {/* Rate Now Button for unrated trips with intentions */}
            {!trip.postTripRated && trip.intentions && trip.intentions.length > 0 && (
              <View style={styles.rateNowContainer}>
                <Button
                  title="Rate Now"
                  variant="primary"
                  onPress={() => handleRateTrip(trip)}
                  style={styles.rateNowButton}
                  icon={<MaterialIcons name="star" size={20} color={Colors.text.inverse} />}
                />
              </View>
            )}

            {/* Intentions Section */}
            {hasIntentions && (
              <View style={styles.intentionsSection}>
                <Heading variant="h4" style={styles.sectionTitle}>Intentions</Heading>
                {trip.intentions.map(intention => renderIntention(intention, trip))}
              </View>
            )}

            {/* General Notes Section */}
            <View style={styles.generalNotesSection}>
              <View style={styles.notesHeader}>
                <Heading variant="h4" style={styles.notesTitle}>General Notes</Heading>
                <Button
                  title="Add Note"
                  variant="primary"
                  size="small"
                  onPress={() => {
                    setNewNote('');
                    setSelectedIntention(null);
                    setShowNoteInput(true);
                  }}
                  style={styles.addNoteButton}
                  icon={<MaterialIcons name="add" size={20} color={Colors.text.inverse} />}
                />
              </View>
              {/* Existing Notes */}
              {renderNotes(trip.generalNotes || [], trip.startTime, trip)}
            </View>

            <View style={{ alignItems: 'center', marginTop: 16 }}>
              <TouchableOpacity
                onPress={() => handleDeleteTrip(trip.id)}
                style={{
                  backgroundColor: '#EF4444',
                  paddingVertical: 6,
                  paddingHorizontal: 18,
                  borderRadius: 16,
                  marginTop: 8,
                }}
              >
                <Text style={{ color: '#fff', fontSize: 13, fontWeight: '600' }}>Delete Trip</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        )}
      </CardContainer>
    );
  };

  const renderIntention = (intention: Intention, trip: TripHistory) => {
    const isExpanded = expandedIntentions.has(intention.id);
    const ratingTypes = ['post-trip', '7-day', '14-day', '30-day'];

    // Get intention data from IntentionsContext for ratings
    const intentionData = intentions.find(i => i.id === intention.id);
    const tripData = intentionData?.trips.find(t => t.tripId === trip.id);

    // Get notes from the trip history (intention.notes) instead of IntentionsContext
    const intentionNotes = intention.notes || [];

    const ratingData = {
      labels: ['Post-trip', '7-day', '14-day', '30-day'],
      datasets: [{
        data: [
          tripData?.ratings.find(r => r.type === 'post-trip')?.value || 0,
          tripData?.ratings.find(r => r.type === '7-day')?.value || 0,
          tripData?.ratings.find(r => r.type === '14-day')?.value || 0,
          tripData?.ratings.find(r => r.type === '30-day')?.value || 0,
        ],
        color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
        strokeWidth: 2,
      }],
    };

    return (
      <CardContainer key={intention.id} style={styles.intentionCard}>
        <TouchableOpacity
          style={styles.intentionHeader}
          onPress={() => handleIntentionToggle(intention.id)}
        >
          <View style={styles.intentionTitleContainer}>
            <Text style={styles.intentionText}>
              {intention.text}
            </Text>
          </View>
          <View style={styles.ratingCircles}>
            {ratingTypes.map((type) => {
              const rating = tripData?.ratings.find(r => r.type === type);
              const isRated = rating?.value !== null && rating?.value !== undefined;
              return (
                <View key={type} style={[
                  styles.ratingCircle,
                  isRated ? styles.ratedCircle : styles.unratedCircle
                ]}>
                  <Text style={[
                    styles.ratingCircleText,
                    isRated ? styles.ratedText : styles.unratedText
                  ]}>
                    {isRated ? rating.value : '-'}
                  </Text>
                </View>
              );
            })}
          </View>
          <Animated.View
            style={{
              transform: [{
                rotate: intentionArrowAnimations.current[intention.id]?.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0deg', '180deg'],
                }) || '0deg'
              }]
            }}
          >
            <MaterialIcons
              name={isExpanded ? 'expand-less' : 'expand-more'}
              size={20}
              color={Colors.text.secondary}
            />
          </Animated.View>
        </TouchableOpacity>

        <Animated.View 
          style={[
            styles.intentionContent,
            {
              opacity: intentionAnimations.current[intention.id] || 0,
              transform: [{
                translateY: intentionAnimations.current[intention.id]?.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-20, 0],
                }) || -20
              }],
            }
          ]}
        >
          {(isExpanded || animatingIntentions[intention.id]) && (
            <>
              {/* Notes */}
              {intentionNotes.length > 0 && (
                <View style={styles.notesContainer}>
                  <Label weight="semibold" style={styles.notesTitle}>
                    Notes
                  </Label>
                  {intentionNotes.map((note: any) => {
                    const noteDisplay = getNoteDisplayText(note.content);
                    
                    return (
                      <TouchableOpacity
                        key={note.id} 
                        style={styles.noteItem}
                      >
                        <View style={styles.noteContent}>
                          <Caption style={styles.noteType}>
                            {note.type === 'during' ? 'During Trip' : 
                             note.type === 'post-trip' ? 'Post Trip' : 'Follow-up'}
                          </Caption>
                          <View style={styles.noteHeaderRow}>
                            <BodyText variant="small">{noteDisplay.displayText}</BodyText>
                            <View style={styles.noteActions}>
                              {noteDisplay.hasMoreContent && (
                                <MaterialIcons 
                                  name="expand-more" 
                                  size={16} 
                                  color={Colors.text.secondary} 
                                  style={styles.expandIcon}
                                />
                              )}
                              <TouchableOpacity
                                style={styles.noteActionButton}
                                onPress={() => openNoteEditModal(note, trip, intention, false)}
                              >
                                <MaterialIcons name="edit" size={16} color={Colors.text.secondary} />
                              </TouchableOpacity>
                            </View>
                          </View>
                          <Caption style={styles.noteTimestamp}>
                            {formatDate(note.timestamp)}
                          </Caption>
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}

              {/* No content message */}
              {intentionNotes.length === 0 && 
               (!tripData?.ratings || tripData.ratings.length === 0) && (
                <View style={styles.noContentContainer}>
                  <Caption style={styles.noContentText}>
                    No notes or ratings for this intention in this trip
                  </Caption>
                </View>
              )}
            </>
          )}
        </Animated.View>
      </CardContainer>
    );
  };

  const handleAddIntentionNote = (intention: Intention, trip: TripHistory) => {
    if (!newNoteHeader.trim() || !newNote.trim()) {
      showToastMessage('Note header and content are required');
      return;
    }

    const noteTime = new Date();
    const daysSinceTrip = calculateDaysSinceTrip(trip.startTime, noteTime);
    
    // Determine note type based on when the note was taken
    let noteType: Note['type'];
    let daysAfterTrip: number;

    // If the trip is still active (hasn't ended)
    if (!trip.endTime) {
      noteType = 'during';
      daysAfterTrip = 0;
    } 
    // If the note is from the post-trip report (taken right after trip ended)
    else if (daysSinceTrip === 0 && new Date(noteTime).getTime() > new Date(trip.endTime).getTime()) {
      noteType = 'post-trip';
      daysAfterTrip = 0;
    }
    // Otherwise, it's a follow-up note
    else if (daysSinceTrip >= 30) {
      noteType = '30d';
      daysAfterTrip = 30;
    } else if (daysSinceTrip >= 14) {
      noteType = '14d';
      daysAfterTrip = 14;
    } else if (daysSinceTrip >= 7) {
      noteType = '7d';
      daysAfterTrip = 7;
    } else if (daysSinceTrip > 0) {
      noteType = 'x-days';
      daysAfterTrip = daysSinceTrip;
    } else {
      noteType = 'during';
      daysAfterTrip = 0;
    }

    const note: Note = {
      id: Date.now().toString(),
      content: newNoteHeader.trim() + '\n' + newNote.trim(),
      timestamp: noteTime,
      type: noteType,
      daysAfterTrip
    };

    const updatedIntention = {
      ...intention,
      notes: [...(intention.notes || []), note]
    };

    const updatedTrip = {
      ...trip,
      intentions: trip.intentions.map(i => 
        i.id === intention.id ? updatedIntention : i
      )
    };

    const updatedHistory = tripHistory.map(t => 
      t.id === trip.id ? updatedTrip : t
    );

    updateTripHistory(updatedHistory);
    setNewNote('');
    setNewNoteHeader('');
    
    // Show toast message
    showToastMessage('Note saved successfully!');
    
    // Set the last added note ID for highlighting
    setLastAddedNoteId(note.id);
    
    // Clear the highlight after 3 seconds
    setTimeout(() => {
      setLastAddedNoteId(null);
    }, 3000);
    
    // Close the note input modal (moved to end)
    setShowNoteInput(false);
    setSelectedIntention(null);
  };

  const handleDeleteTrip = (tripId: string) => {
    Alert.alert(
      'Delete Trip',
      'Are you sure you want to delete this trip? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Confirm Deletion',
              'This is your last chance. Do you really want to permanently delete this trip?',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Delete Forever',
                  style: 'destructive',
                  onPress: () => {
                    const updatedHistory = tripHistory.filter(t => t.id !== tripId);
                    updateTripHistory(updatedHistory);
                    setExpandedTrip(null);
                  },
                },
              ]
            );
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Trip History</Text>
        </View>
        
        <ScrollView 
          style={{ 
            padding: Spacing.lg, 
            paddingBottom: 40, 
            flexGrow: 1 
          }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {tripHistory.map((trip) => renderTripCard(trip))}
        </ScrollView>

        {/* Toast Message */}
        {showToast && (
          <Animated.View
            style={[
              styles.toast,
              {
                opacity: toastOpacity,
                transform: [{ translateY: toastTranslateY }],
                top: '40%',
                left: '10%',
                right: '10%',
                alignSelf: 'center',
              },
            ]}
          >
            <Text style={styles.toastText}>{toastMessage}</Text>
          </Animated.View>
        )}

        {/* Note Input Modal */}
        {showNoteInput && (
          <Modal
            visible={showNoteInput}
            transparent={true}
            animationType="fade"
            onRequestClose={() => {
              setShowNoteInput(false);
              setSelectedIntention(null);
              setNewNote('');
              setNewNoteHeader('');
              Keyboard.dismiss();
            }}
          >
            <KeyboardAvoidingView 
              style={styles.modalOverlay}
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              keyboardVerticalOffset={Platform.OS === 'ios' ? -200 : -100}
            >
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
                          <MaterialIcons name="close" size={24} color={Colors.text.secondary} />
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
                            ref={titleInputRef}
                            onSubmitEditing={() => {
                              notesInputRef.current?.focus();
                            }}
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
                            }}
                            ref={notesInputRef}
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
                          onPress={() => {
                            if (selectedIntention) {
                              handleAddIntentionNote(selectedIntention, tripHistory.find(t => 
                                t.intentions.some(i => i.id === selectedIntention.id)
                              )!);
                            } else {
                              handleAddGeneralNote(tripHistory.find(t => 
                                t.id === expandedTrip
                              )!);
                            }
                            Keyboard.dismiss();
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
                          <MaterialIcons name="close" size={24} color={Colors.text.secondary} />
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
      </KeyboardAvoidingView>
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
  tripCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  tripHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  tripHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  tripTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
    marginRight: 8,
  },
  tripDate: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  tripTime: {
    fontSize: 14,
    color: '#6B7280',
  },
  tripContent: {
    padding: 16,
    backgroundColor: '#F9FAFB',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4B5563',
    marginBottom: 12,
  },
  doseInfo: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  doseText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
  },
  intentionCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  intentionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  intentionHeaderContent: {
    flexDirection: 'row',
    flex: 1,
    alignItems: 'center',
  },
  intentionTitleContainer: {
    flex: 1,
    marginRight: 8,
  },
  intentionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  intentionDescription: {
    marginBottom: 16,
  },
  intentionDescriptionText: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
  },
  intentionContent: {
    padding: 16,
    backgroundColor: '#F9FAFB',
  },
  emoji: {
    fontSize: 20,
    marginRight: 8,
  },
  chartWrapper: {
    alignItems: 'center',
    marginTop: 8,
  },
  ratingChartContainer: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 16,
  },
  ratingChartTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  followUpSection: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 16,
  },
  followUpTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  followUpButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  followUpButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  followUpButtonDisabled: {
    opacity: 0.7,
  },
  followUpButtonText: {
    marginLeft: 4,
    fontSize: 14,
    color: '#5196F4',
  },
  notesContainer: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  notesTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  noteGroup: {
    marginBottom: 12,
  },
  noteGroupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  noteTypeIndicator: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  noteTypeText: {
    fontSize: 12,
    fontWeight: '500',
  },
  noteItem: {
    marginBottom: 8,
  },
  noteContent: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 12,
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
  collapsibleNote: {
    color: '#4B5563',
    backgroundColor: '#F3F4F6',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  dotLabel: {
    position: 'absolute',
    backgroundColor: '#5196F4',
    borderRadius: 10,
    padding: 4,
    minWidth: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotLabelText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  generalNotesContainer: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  rateNowContainer: {
    marginBottom: 16,
  },
  rateNowButton: {
    backgroundColor: '#5196F4',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  rateNowButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  intentionRightContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minWidth: 140,
  },
  timelineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timelineDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timelineDotActive: {
    backgroundColor: '#5196F4',
  },
  timelineDotInactive: {
    backgroundColor: '#E5E7EB',
  },
  timelineDotText: {
    fontSize: 10,
    fontWeight: '600',
  },
  timelineDotTextActive: {
    color: '#FFFFFF',
  },
  timelineDotTextInactive: {
    color: '#9CA3AF',
  },
  timelineLine: {
    width: 12,
    height: 2,
  },
  timelineLineActive: {
    backgroundColor: '#5196F4',
  },
  timelineLineInactive: {
    backgroundColor: '#E5E7EB',
  },
  noteTypeSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  noteTypeButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    backgroundColor: '#fff',
  },
  noteTypeButtonSelected: {
    backgroundColor: '#F3F4F6',
  },
  noteTypeButtonText: {
    fontSize: 12,
    fontWeight: '500',
  },
  noteTypeButtonTextSelected: {
    fontWeight: '600',
  },
  noteInputContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  noteInput: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 12,
    minHeight: 40,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  addNoteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#3B82F6',
  },
  addNoteButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  addNoteText: {
    marginLeft: 4,
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  notesSection: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  intentionsSection: {
    backgroundColor: '#F8FAFC',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
  },
  ratingGraph: {
    marginVertical: 8,
    borderRadius: 16,
  },
  intentionNotes: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  notesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  intentionCheckbox: {
    marginRight: 8,
  },
  completedIntentionTitle: {
    textDecorationLine: 'line-through',
  },
  intentionDetails: {
    padding: 16,
    backgroundColor: '#F9FAFB',
  },
  intentionTimeline: {
    marginBottom: 16,
  },
  timelineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  timelineTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  daysLeft: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: '600',
  },
  pastDaysLeft: {
    color: '#EF4444',
  },
  timelineContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timelineBar: {
    flex: 1,
    height: 12,
    backgroundColor: '#E5E7EB',
    borderRadius: 6,
    marginHorizontal: 8,
  },
  timelineProgress: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 6,
  },
  timelineDates: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  timelineDate: {
    fontSize: 12,
    color: '#6B7280',
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
    maxHeight: '60%',
    marginTop: 100,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
  },
  modalButton: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  cancelButton: {
    backgroundColor: '#EF4444',
  },
  cancelButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#3B82F6',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  ratingCircles: {
    flexDirection: 'row',
    marginRight: 8,
  },
  ratingCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 4,
  },
  ratingCircleText: {
    fontSize: 12,
    fontWeight: '600',
  },
  ratedCircle: {
    backgroundColor: '#3B82F6',
  },
  unratedCircle: {
    backgroundColor: '#E5E7EB',
  },
  ratedText: {
    color: '#FFFFFF',
  },
  unratedText: {
    color: '#6B7280',
  },
  reusedBadge: {
    backgroundColor: '#F3F4F6',
    borderRadius: 4,
    paddingHorizontal: 4,
    paddingVertical: 2,
    marginLeft: 8,
  },
  tagContainer: {
    flexDirection: 'row',
    gap: 4,
    marginTop: 4,
  },
  tag: {
    backgroundColor: '#F3F4F6',
    borderRadius: 4,
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  noContentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  noContentText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
  noteType: {
    color: Colors.primary[500],
    fontWeight: '500',
  },
  noteTimestamp: {
    color: Colors.text.tertiary,
  },
  toast: {
    position: 'absolute',
    backgroundColor: '#10B981',
    borderRadius: 12,
    paddingVertical: 18,
    paddingHorizontal: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 1000,
  },
  toastText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  highlightedNote: {
    backgroundColor: '#E5E7EB',
  },
  generalNotesSection: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  noteHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  expandIcon: {
    marginLeft: 4,
  },
  noteActions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 'auto',
  },
  noteActionButton: {
    padding: 4,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    marginLeft: 8,
  },
  noteEditModalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    width: '80%',
    maxHeight: '60%',
    marginTop: 100,
  },
  noteEditForm: {
    marginBottom: 16,
  },
  noteEditField: {
    marginBottom: 8,
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
    fontSize: 12,
    color: '#6B7280',
  },
}); 