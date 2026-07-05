import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { SafeAreaView, StyleSheet, Text, View } from 'react-native';

export default function PlannerScreen() {
  return (
    <LinearGradient colors={['#0B0F1E', '#0E1326', '#0B0F1E']} style={styles.gradientBg}>
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <View style={styles.iconCircle}>
            <Ionicons name="calendar" size={32} color="#38BDF8" />
          </View>
          <Text style={styles.title}>Planner is on the way</Text>
          <Text style={styles.body}>
            This tab will let you plan workouts and meals ahead of time, instead of only
            logging what already happened.
          </Text>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradientBg: { flex: 1 },
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  content: {
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: 'rgba(56,189,248,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 19,
    fontWeight: '700',
    color: '#F5F7FA',
    marginBottom: 8,
  },
  body: {
    fontSize: 14,
    color: '#8B93A7',
    textAlign: 'center',
    lineHeight: 20,
  },
});