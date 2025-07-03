import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { SafeAreaView, ScrollView, View } from 'react-native';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { IconButton } from '../../components/ui/IconButton';
import { Container, Divider, Section } from '../../components/ui/Layout';
import { BodyText, Caption, Heading, Label } from '../../components/ui/Typography';
import { Colors, Spacing } from '../../constants/DesignSystem';
import { useTrip } from '../../contexts/TripContext';

export default function HomeScreen() {
  const { tripState } = useTrip();
  const hasActiveTrip = tripState.startTime !== null;

  // Mock data - in a real app, this would come from your data store
  const totalTrips = 12;
  const averageRating = 4.2;
  const daysSinceLastTrip = 7;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.background.primary }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: Spacing.lg, paddingBottom: Spacing.xl, flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        <Container padding="none">
          {/* Header Section */}
          <Section spacing="xl">
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View style={{ flex: 1 }}>
                <Heading variant="h1" color={Colors.text.primary}>
                  PsyCompanion
                </Heading>
                <BodyText variant="large" color={Colors.text.secondary}>
                  Your mindful companion for psychedelic experiences
                </BodyText>
              </View>
              <IconButton
                icon={<MaterialIcons name="notifications" size={24} color={Colors.text.secondary} />}
                onPress={() => {/* TODO: Open notifications */}}
                variant="ghost"
                size="medium"
              />
            </View>
          </Section>

          {/* Stats Section */}
          <Card variant="elevated" style={{ marginBottom: Spacing.lg }}>
            <Heading variant="h5" style={{ marginBottom: Spacing.md }}>
              Your Journey
            </Heading>
            <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
              <View style={{ alignItems: 'center' }}>
                <Heading variant="h3" color={Colors.primary[500]}>{totalTrips}</Heading>
                <Caption>Total Trips</Caption>
              </View>
              <Divider style={{ height: 40, width: 1 }} />
              <View style={{ alignItems: 'center' }}>
                <Heading variant="h3" color={Colors.primary[500]}>{averageRating}</Heading>
                <Caption>Avg Rating</Caption>
              </View>
              <Divider style={{ height: 40, width: 1 }} />
              <View style={{ alignItems: 'center' }}>
                <Heading variant="h3" color={Colors.primary[500]}>{daysSinceLastTrip}</Heading>
                <Caption>Days Ago</Caption>
              </View>
            </View>
          </Card>

          {/* Quick Actions */}
          <Card variant="elevated" style={{ marginBottom: Spacing.lg }}>
            <Heading variant="h5" style={{ marginBottom: Spacing.md }}>
              Quick Actions
            </Heading>
            <View style={{ gap: Spacing.sm }}>
              {!hasActiveTrip ? (
                <Button
                  title="Start New Trip"
                  onPress={() => router.push('/new-trip/dose-selection')}
                  variant="primary"
                  size="large"
                  icon={<MaterialIcons name="add" size={20} color={Colors.text.inverse} />}
                />
              ) : null}
              <Button
                title="View Trip History"
                onPress={() => router.push('/(tabs)/history')}
                variant="outline"
                size="large"
                icon={<MaterialIcons name="history" size={20} color={Colors.primary[500]} />}
              />
              <Button
                title="Safety Guidelines"
                onPress={() => router.push('/(tabs)/safety')}
                variant="outline"
                size="large"
                icon={<MaterialIcons name="security" size={20} color={Colors.primary[500]} />}
              />
            </View>
          </Card>

          {/* Active Trip Alert */}
          {hasActiveTrip && (
            <Card variant="outlined" style={{ 
              backgroundColor: 'rgba(14, 165, 233, 0.05)',
              borderColor: Colors.primary[500],
              marginBottom: Spacing.lg,
            }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.sm }}>
                <MaterialIcons name="play-circle" size={24} color={Colors.primary[500]} />
                <Heading variant="h6" color={Colors.primary[500]} style={{ marginLeft: Spacing.sm }}>
                  Active Trip
                </Heading>
              </View>
              <BodyText variant="small" color={Colors.text.secondary}>
                You currently have an active trip. Navigate to the trip screen to continue your journey.
              </BodyText>
            </Card>
          )}

          {/* Quick Tips */}
          <Card variant="outlined" style={{ marginBottom: Spacing.lg }}>
            <Heading variant="h5" style={{ marginBottom: Spacing.md }}>
              Quick Tips
            </Heading>
            <View style={{ gap: Spacing.md }}>
              <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                <MaterialIcons name="lightbulb" size={20} color={Colors.warning[500]} style={{ marginTop: 2, marginRight: Spacing.sm }} />
                <View style={{ flex: 1 }}>
                  <Label weight="semibold" style={{ marginBottom: Spacing.xs }}>
                    Set Clear Intentions
                  </Label>
                  <Caption>
                    Take time to reflect on what you hope to gain from your experience
                  </Caption>
                </View>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                <MaterialIcons name="people" size={20} color={Colors.success[500]} style={{ marginTop: 2, marginRight: Spacing.sm }} />
                <View style={{ flex: 1 }}>
                  <Label weight="semibold" style={{ marginBottom: Spacing.xs }}>
                    Have a Trip Sitter
                  </Label>
                  <Caption>
                    Ensure you have a trusted, sober companion present
                  </Caption>
                </View>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                <MaterialIcons name="schedule" size={20} color={Colors.primary[500]} style={{ marginTop: 2, marginRight: Spacing.sm }} />
                <View style={{ flex: 1 }}>
                  <Label weight="semibold" style={{ marginBottom: Spacing.xs }}>
                    Plan Your Setting
                  </Label>
                  <Caption>
                    Create a comfortable, safe environment for your journey
                  </Caption>
                </View>
              </View>
            </View>
          </Card>

          {/* Recent Activity */}
          <Card variant="outlined">
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.md }}>
              <Heading variant="h5">Recent Activity</Heading>
              <IconButton
                icon={<MaterialIcons name="more-horiz" size={20} color={Colors.text.secondary} />}
                onPress={() => {/* TODO: Open activity menu */}}
                variant="ghost"
                size="small"
              />
            </View>
            <View style={{ gap: Spacing.sm }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <MaterialIcons name="star" size={16} color={Colors.warning[500]} style={{ marginRight: Spacing.sm }} />
                <BodyText variant="small" style={{ flex: 1 }}>
                  Completed 7-day follow-up for "Mindfulness Journey"
                </BodyText>
                <Caption>2 days ago</Caption>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <MaterialIcons name="edit" size={16} color={Colors.primary[500]} style={{ marginRight: Spacing.sm }} />
                <BodyText variant="small" style={{ flex: 1 }}>
                  Added note to "Nature Connection" trip
                </BodyText>
                <Caption>5 days ago</Caption>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <MaterialIcons name="add" size={16} color={Colors.success[500]} style={{ marginRight: Spacing.sm }} />
                <BodyText variant="small" style={{ flex: 1 }}>
                  Started new trip "Creative Exploration"
                </BodyText>
                <Caption>1 week ago</Caption>
              </View>
            </View>
          </Card>
        </Container>
      </ScrollView>
    </SafeAreaView>
  );
}
