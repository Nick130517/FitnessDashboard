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
import { AddMealModal, AddWorkoutModal } from '../../components/Modals';
import {
  addMeal,
  addWorkout,
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

function ListSection({ title, children, onAddPress }) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <TouchableOpacity onPress={onAddPress} style={styles.addButton}>
          <Text style={styles.addButtonText}>+ Add</Text>
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
  { label: 'Swimming', value: 20, color: '#F87171' },
  { label: 'Cycling', value: 25, color: '#FBBF24' },
  { label: 'Walking', value: 20, color: '#60A5FA' },
];

export default function DashboardScreen() {
  const [stats, setStats] = useState({ steps: 0, caloriesBurned: 0, caloriesConsumed: 0, proteinG: 0 });
  const [workouts, setWorkouts] = useState([]);
  const [meals, setMeals] = useState([]);
  const [workoutModalVisible, setWorkoutModalVisible] = useState(false);
  const [mealModalVisible, setMealModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const refreshData = useCallback(() => {
    setStats(getTodayStats());
    setWorkouts(getRecentWorkouts());
    setMeals(getRecentMeals());
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
    // Small delay so the refresh spinner is visible even on very fast local reads
    setTimeout(() => setRefreshing(false), 400);
  }, [refreshData]);

  const handleAddWorkout = (name, durationMin) => {
    addWorkout(name, durationMin);
    refreshData();
  };

  const handleAddMeal = (name, time, calories, proteinG) => {
    addMeal(name, time, calories, proteinG);
    refreshData();
  };

  const handleDeleteWorkout = (id, name) => {
    Alert.alert(
      'Delete Workout',
      `Remove "${name}" from your workouts?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deleteWorkout(id);
            refreshData();
          },
        },
      ]
    );
  };

  const handleDeleteMeal = (id, name) => {
    Alert.alert(
      'Delete Meal',
      `Remove "${name}" from your meals?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deleteMeal(id);
            refreshData();
          },
        },
      ]
    );
  };

  // Placeholder heart rate & distance until HealthKit/Health Connect sync (component 2)
  const heartRate = 72;
  const distanceKm = 3.8;

  return (
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
            label="Heart Rate"
            value={heartRate}
            unit="bpm"
            progress={(heartRate / 120) * 100}
            color="#F87171"
          />
          <RingCard
            label="Calories Burn"
            value={stats.caloriesBurned}
            unit="kcal"
            progress={(stats.caloriesBurned / 3000) * 100}
            color="#FBBF24"
          />
          <RingCard
            label="Steps"
            value={stats.steps > 999 ? `${(stats.steps / 1000).toFixed(1)}k` : stats.steps}
            unit="steps"
            progress={(stats.steps / 10000) * 100}
            color="#4ADE80"
          />
          <RingCard
            label="Distance"
            value={distanceKm}
            unit="km"
            progress={(distanceKm / 8) * 100}
            color="#60A5FA"
          />
        </View>

        <View style={styles.panel}>
          <Text style={styles.panelTitle}>Activity Chart</Text>
          <ActivityChart
            series={[
              { label: 'Steps', color: '#4ADE80', data: mockWeeklyTrend.steps },
              { label: 'Calories', color: '#60A5FA', data: mockWeeklyTrend.calories },
            ]}
          />
        </View>

        <View style={styles.panel}>
          <Text style={styles.panelTitle}>Activity Rating</Text>
          <ActivityDonut segments={mockActivityBreakdown} />
        </View>

        <ListSection title="Recent Workouts" onAddPress={() => setWorkoutModalVisible(true)}>
          {workouts.length === 0 ? (
            <EmptyState message="No workouts yet — tap + Add to log one" />
          ) : (
            workouts.map((w) => (
              <TouchableOpacity
                key={w.id}
                style={styles.listRow}
                onLongPress={() => handleDeleteWorkout(w.id, w.name)}
              >
                <View>
                  <Text style={styles.listRowTitle}>{w.name}</Text>
                  <Text style={styles.listRowSubtitle}>{formatRelativeDate(w.date)}</Text>
                </View>
                <Text style={styles.listRowValue}>{w.duration_min} min</Text>
              </TouchableOpacity>
            ))
          )}
        </ListSection>

        <ListSection title="Recent Meals" onAddPress={() => setMealModalVisible(true)}>
          {meals.length === 0 ? (
            <EmptyState message="No meals logged yet — tap + Add to log one" />
          ) : (
            meals.map((m) => (
              <TouchableOpacity
                key={m.id}
                style={styles.listRow}
                onLongPress={() => handleDeleteMeal(m.id, m.name)}
              >
                <View>
                  <Text style={styles.listRowTitle}>{m.name}</Text>
                  <Text style={styles.listRowSubtitle}>{m.time} · {formatRelativeDate(m.date)}</Text>
                </View>
                <Text style={styles.listRowValue}>{m.calories} kcal</Text>
              </TouchableOpacity>
            ))
          )}
        </ListSection>
      </ScrollView>

      <AddWorkoutModal
        visible={workoutModalVisible}
        onClose={() => setWorkoutModalVisible(false)}
        onSave={handleAddWorkout}
      />
      <AddMealModal
        visible={mealModalVisible}
        onClose={() => setMealModalVisible(false)}
        onSave={handleAddMeal}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F1115',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    fontSize: 26,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  subHeader: {
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 16,
  },
  ringGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  panel: {
    backgroundColor: '#1A1D24',
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    marginTop: 4,
  },
  panelTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
    letterSpacing: 0.5,
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  addButton: {
    backgroundColor: '#1A1D24',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  addButtonText: {
    color: '#4ADE80',
    fontWeight: '600',
    fontSize: 13,
  },
  listRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1A1D24',
    borderRadius: 10,
    padding: 14,
    marginBottom: 8,
  },
  listRowTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  listRowSubtitle: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },
  listRowValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4ADE80',
  },
  emptyState: {
    backgroundColor: '#1A1D24',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  emptyStateText: {
    color: '#6B7280',
    fontSize: 13,
    textAlign: 'center',
  },
});