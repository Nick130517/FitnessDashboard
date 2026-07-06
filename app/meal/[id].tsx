import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { formatRelativeDate, getMealById, updateMealNotes } from '../../db/db';

export default function MealDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [meal, setMeal] = useState(null);
  const [notes, setNotes] = useState('');
  const [saved, setSaved] = useState(false);

  const loadMeal = useCallback(() => {
    const m = getMealById(Number(id));
    setMeal(m);
    setNotes(m?.notes || '');
  }, [id]);

  useEffect(() => {
    loadMeal();
  }, [loadMeal]);

  const handleSaveNotes = () => {
    updateMealNotes(Number(id), notes);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  if (!meal) {
    return (
      <LinearGradient colors={['#0B0F1E', '#0E1326', '#0B0F1E']} style={styles.gradientBg}>
        <Stack.Screen options={{ headerShown: false }} />
        <SafeAreaView style={styles.container}>
          <Text style={styles.notFoundText}>Meal not found</Text>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={['#0B0F1E', '#0E1326', '#0B0F1E']} style={styles.gradientBg}>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={{ flex: 1 }}
        >
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <Ionicons name="chevron-back" size={20} color="#4ADE80" />
              <Text style={styles.backButtonText}>Back</Text>
            </TouchableOpacity>

            <View style={styles.titleRow}>
              <View style={styles.iconBadge}>
                <Ionicons name="restaurant" size={22} color="#FBBF24" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.title}>{meal.name}</Text>
                <Text style={styles.subtitle}>{meal.time} · {formatRelativeDate(meal.date)}</Text>
              </View>
            </View>

            <View style={styles.statsRow}>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{meal.calories}</Text>
                <Text style={styles.statLabel}>kcal</Text>
              </View>
              <View style={[styles.statCard, { marginLeft: 10 }]}>
                <Text style={styles.statValue}>{meal.protein_g}</Text>
                <Text style={styles.statLabel}>g protein</Text>
              </View>
            </View>

            <View style={styles.panel}>
              <View style={styles.panelHeaderRow}>
                <Ionicons name="document-text" size={16} color="#8B93A7" style={{ marginRight: 6 }} />
                <Text style={styles.panelTitle}>Notes</Text>
              </View>
              <TextInput
                style={styles.notesInput}
                placeholder="How did it taste? Would you make it again? Anything worth remembering..."
                placeholderTextColor="#6B7280"
                value={notes}
                onChangeText={setNotes}
                multiline
                textAlignVertical="top"
              />
              <TouchableOpacity style={styles.saveButton} onPress={handleSaveNotes}>
                <Text style={styles.saveButtonText}>{saved ? 'Saved' : 'Save notes'}</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradientBg: { flex: 1 },
  container: { flex: 1 },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  notFoundText: {
    color: '#8B93A7',
    fontSize: 15,
    textAlign: 'center',
    marginTop: 40,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  backButtonText: {
    color: '#4ADE80',
    fontSize: 15,
    fontWeight: '600',
    marginLeft: 2,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  iconBadge: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(251,191,36,0.14)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  title: {
    fontSize: 21,
    fontWeight: '800',
    color: '#F5F7FA',
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  statsRow: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  statCard: {
    backgroundColor: 'rgba(220,220,225,0.06)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(220,220,225,0.09)',
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#F5F7FA',
  },
  statLabel: {
    fontSize: 11,
    color: '#8B93A7',
    marginTop: 2,
  },
  panel: {
    backgroundColor: 'rgba(220,220,225,0.06)',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(220,220,225,0.09)',
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
  notesInput: {
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 10,
    padding: 14,
    color: '#F5F7FA',
    fontSize: 14,
    minHeight: 140,
    borderWidth: 1,
    borderColor: 'rgba(220,220,225,0.08)',
    marginBottom: 14,
    lineHeight: 20,
  },
  saveButton: {
    backgroundColor: '#4ADE80',
    borderRadius: 10,
    paddingVertical: 13,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#0B0F1E',
    fontWeight: '700',
    fontSize: 15,
  },
});