import { Ionicons } from '@expo/vector-icons';
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
import { AddMealModal, AddWorkoutModal } from '../../components/Modals';
import ParticleBackground from '../../components/ParticleBackground';
import {
  addMeal,
  addWorkout,
  deleteMeal,
  deleteWorkout,
  formatRelativeDate,
  getRecentMeals,
  getRecentWorkouts,
  initDatabase,
  pruneOldData,
  seedIfEmpty,
} from '../../db/db';

// High limit so this effectively returns everything still within the
// 7-day retention window (pruneOldData already trims anything older).
const FULL_HISTORY_LIMIT = 200;

function ListSection({ title, icon, children, onAddPress }) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeaderRow}>
        <View style={styles.sectionTitleRow}>
          <Ionicons name={icon} size={16} color="#8B93A7" style={{ marginRight: 6 }} />
          <Text style={styles.sectionTitle}>{title}</Text>
        </View>
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

export default function PlannerScreen() {
  const router = useRouter();
  const [workouts, setWorkouts] = useState([]);
  const [meals, setMeals] = useState([]);
  const [workoutModalVisible, setWorkoutModalVisible] = useState(false);
  const [mealModalVisible, setMealModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const refreshData = useCallback(() => {
    setWorkouts(getRecentWorkouts(FULL_HISTORY_LIMIT));
    setMeals(getRecentMeals(FULL_HISTORY_LIMIT));
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

  const handleAddWorkout = (name, durationMin) => {
    addWorkout(name, durationMin);
    refreshData();
  };

  const handleAddMeal = (name, time, calories, proteinG) => {
    addMeal(name, time, calories, proteinG);
    refreshData();
  };

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

  return (
    <View style={styles.gradientBg}>
      <ParticleBackground count={18} />
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
          <Text style={styles.header}>Planner</Text>
          <Text style={styles.subHeader}>Log workouts and meals — last 7 days</Text>

          <ListSection title="Workouts" icon="barbell" onAddPress={() => setWorkoutModalVisible(true)}>
            {workouts.length === 0 ? (
              <EmptyState message="No workouts logged in the last 7 days — tap + Add to log one" />
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

          <ListSection title="Meals" icon="restaurant" onAddPress={() => setMealModalVisible(true)}>
            {meals.length === 0 ? (
              <EmptyState message="No meals logged in the last 7 days — tap + Add to log one" />
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
    </View>
  );
}

const styles = StyleSheet.create({
  gradientBg: {
    backgroundColor: '#000000',
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
  addButton: {
    backgroundColor: '#2E2E34',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  addButtonText: {
    color: '#4ADE80',
    fontWeight: '700',
    fontSize: 13,
  },
  listRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2E2E34',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#2E2E34',
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
    backgroundColor: '#2E2E34',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2E2E34',
  },
  emptyStateText: {
    color: '#6B7280',
    fontSize: 13,
    textAlign: 'center',
  },
});