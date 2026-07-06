import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { ActivityChart, ActivityDonut, RingCard } from '../../components/DashboardWidgets';
import {
  deleteMeal,
  deleteWorkout,
  formatRelativeDate,
  getRecentMeals,
  getRecentWorkouts,
  getTodayStats,
  initDatabase,
  pruneOldData,
  seedIfEmpty,
} from '../../db/db';

const RECENT_LIMIT = 3;

function ListSection({ title, icon, children, onSeeAllPress }) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeaderRow}>
        <View style={styles.sectionTitleRow}>
          <Ionicons name={icon} size={16} color="#8B93A7" style={{ marginRight: 6 }} />
          <Text style={styles.sectionTitle}>{title}</Text>
        </View>
        <TouchableOpacity onPress={onSeeAllPress} style={styles.seeAllButton}>
          <Text style={styles.seeAllText}>See all</Text>
          <Ionicons name="chevron-forward" size={14} color="#4ADE80" />
        </TouchableOpacity>
      </View>
      {children}
    </View>
  );
}

function EmptyState({ message }) {
  return (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateText}>{message}</Text>
    </View>
  );
}

function PanelHeader({ icon, title }) {
  return (
    <View style={styles.panelHeaderRow}>
      <Ionicons name={icon} size={16} color="#8B93A7" style={{ marginRight: 6 }} />
      <Text style={styles.panelTitle}>{title}</Text>
    </View>
  );
}

function getFormattedHeaderDate() {
  const now = new Date();
  return now.toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
}

// Mock weekly trend data — will become real once we store daily historical
// snapshots in SQLite (currently we only track "today").
const mockWeeklyTrend = {
  steps: [6200, 7400, 5800, 8900, 7200, 9100, 8432],
  calories: [1900, 2100, 1750, 2300, 2000, 2250, 2140],
};

// Mock activity breakdown — will become real once workouts have a "type" field.
const mockActivityBreakdown = [
  { label: 'Running', value: 35, color: '#4ADE80' },
  { label: 'Swimming', value: 20, color: '#38BDF8' },
  { label: 'Cycling', value: 25, color: '#FBBF24' },
  { label: 'Walking', value: 20, color: '#818CF8' },
];

export default function DashboardScreen() {
  const router = useRouter();
  const [stats, setStats] = useState({ steps: 0, caloriesBurned: 0, caloriesConsumed: 0, proteinG: 0 });
  const [workouts, setWorkouts] = useState([]);
  const [meals, setMeals] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const refreshData = useCallback(() => {
    setStats(getTodayStats());
    setWorkouts(getRecentWorkouts(RECENT_LIMIT));
    setMeals(getRecentMeals(RECENT_LIMIT));
  }, []);

  useEffect(() => {
    initDatabase();
    pruneOldData();
    seedIfEmpty();
    refreshData();
  }, [refreshData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    refreshData();
    setTimeout(() => setRefreshing(false), 400);
  }, [refreshData]);

  const handleDeleteWorkout = (id, name) => {
    Alert.alert('Delete Workout', `Remove "${name}" from your workouts?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          deleteWorkout(id);
          refreshData();
        },
      },
    ]);
  };

  const handleDeleteMeal = (id, name) => {
    Alert.alert('Delete Meal', `Remove "${name}" from your meals?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          deleteMeal(id);
          refreshData();
        },
      },
    ]);
  };

  // Placeholder heart rate & distance until HealthKit/Health Connect sync (component 2)
  const heartRate = 72;
  const distanceKm = 3.8;

  return (
    <LinearGradient colors={['#0B0F1E', '#0E1326', '#0B0F1E']} style={styles.gradientBg}>
      <SafeAreaView style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#4ADE80"
              colors={['#4ADE80']}
            />
          }
        >
          <Text style={styles.header}>Dashboard</Text>
          <Text style={styles.subHeader}>{getFormattedHeaderDate()}</Text>

          <View style={styles.ringGrid}>
            <RingCard
              id="heartrate"
              label="Heart Rate"
              value={heartRate}
              unit="bpm"
              progress={(heartRate / 120) * 100}
              colors={['#FB7185', '#F43F5E']}
              icon="heart"
            />
            <RingCard
              id="calburn"
              label="Calories Burn"
              value={stats.caloriesBurned}
              unit="kcal"
              progress={(stats.caloriesBurned / 3000) * 100}
              colors={['#FBBF24', '#F59E0B']}
              icon="flame"
            />
            <RingCard
              id="steps"
              label="Steps"
              value={stats.steps > 999 ? `${(stats.steps / 1000).toFixed(1)}k` : stats.steps}
              unit="steps"
              progress={(stats.steps / 10000) * 100}
              colors={['#4ADE80', '#22C55E']}
              icon="walk"
            />
            <RingCard
              id="distance"
              label="Distance"
              value={distanceKm}
              unit="km"
              progress={(distanceKm / 8) * 100}
              colors={['#38BDF8', '#3B82F6']}
              icon="navigate"
            />
          </View>

          <LinearGradient colors={['#151B30', '#10152A']} style={styles.panel}>
            <PanelHeader icon="stats-chart" title="Activity Chart" />
            <ActivityChart
              series={[
                { label: 'Steps', color: '#4ADE80', data: mockWeeklyTrend.steps },
                { label: 'Calories', color: '#38BDF8', data: mockWeeklyTrend.calories },
              ]}
            />
          </LinearGradient>

          <LinearGradient colors={['#151B30', '#10152A']} style={styles.panel}>
            <PanelHeader icon="pie-chart" title="Activity Rating" />
            <ActivityDonut segments={mockActivityBreakdown} />
          </LinearGradient>

          <ListSection title="Recent Workouts" icon="barbell" onSeeAllPress={() => router.push('/planner')}>
            {workouts.length === 0 ? (
              <EmptyState message="No workouts yet — head to Planner to log one" />
            ) : (
              workouts.map((w) => (
                <TouchableOpacity
                  key={w.id}
                  style={styles.listRow}
                  onPress={() => router.push(`/workout/${w.id}`)}
                  onLongPress={() => handleDeleteWorkout(w.id, w.name)}
                >
                  <View style={[styles.accentBar, { backgroundColor: '#4ADE80' }]} />
                  <View style={styles.listRowIconBadge}>
                    <Ionicons name="barbell" size={16} color="#4ADE80" />
                  </View>
                  <View style={styles.listRowTextGroup}>
                    <Text style={styles.listRowTitle}>{w.name}</Text>
                    <Text style={styles.listRowSubtitle}>{formatRelativeDate(w.date)}</Text>
                  </View>
                  <Text style={styles.listRowValue}>{w.duration_min} min</Text>
                </TouchableOpacity>
              ))
            )}
          </ListSection>

          <ListSection title="Recent Meals" icon="restaurant" onSeeAllPress={() => router.push('/planner')}>
            {meals.length === 0 ? (
              <EmptyState message="No meals logged yet — head to Planner to log one" />
            ) : (
              meals.map((m) => (
                <TouchableOpacity
                  key={m.id}
                  style={styles.listRow}
                  onPress={() => router.push(`/meal/${m.id}`)}
                  onLongPress={() => handleDeleteMeal(m.id, m.name)}
                >
                  <View style={[styles.accentBar, { backgroundColor: '#FBBF24' }]} />
                  <View style={[styles.listRowIconBadge, { backgroundColor: 'rgba(251,191,36,0.14)' }]}>
                    <Ionicons name="restaurant" size={16} color="#FBBF24" />
                  </View>
                  <View style={styles.listRowTextGroup}>
                    <Text style={styles.listRowTitle}>{m.name}</Text>
                    <Text style={styles.listRowSubtitle}>{m.time} · {formatRelativeDate(m.date)}</Text>
                  </View>
                  <Text style={styles.listRowValue}>{m.calories} kcal</Text>
                </TouchableOpacity>
              ))
            )}
          </ListSection>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradientBg: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    fontSize: 27,
    fontWeight: '800',
    color: '#F5F7FA',
    letterSpacing: -0.5,
  },
  subHeader: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 18,
  },
  ringGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  panel: {
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
    marginTop: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  panelHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  panelTitle: {
    color: '#F5F7FA',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#F5F7FA',
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  seeAllText: {
    color: '#4ADE80',
    fontWeight: '600',
    fontSize: 13,
    marginRight: 2,
  },
  listRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(220,220,225,0.06)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(220,220,225,0.09)',
    overflow: 'hidden',
  },
  accentBar: {
    width: 3,
    alignSelf: 'stretch',
    borderRadius: 2,
    marginRight: 10,
  },
  listRowIconBadge: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: 'rgba(74,222,128,0.14)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  listRowTextGroup: {
    flex: 1,
  },
  listRowTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#F5F7FA',
  },
  listRowSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  listRowValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#F5F7FA',
  },
  emptyState: {
    backgroundColor: 'rgba(220,220,225,0.06)',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(220,220,225,0.09)',
  },
  emptyStateText: {
    color: '#6B7280',
    fontSize: 13,
    textAlign: 'center',
  },
});