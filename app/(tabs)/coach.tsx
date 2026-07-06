import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { SafeAreaView, StyleSheet, Text, View } from 'react-native';
import ParticleBackground from '../../components/ParticleBackground';

export default function CoachScreen() {
  return (
    <View style={styles.gradientBg}>
      <ParticleBackground count={18} />
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <View style={styles.iconCircle}>
            <Ionicons name="chatbubble-ellipses" size={32} color="#4ADE80" />
          </View>
          <Text style={styles.title}>Coach is on the way</Text>
          <Text style={styles.body}>
            This tab will hold an AI chat that knows your recent workouts, meals, and goals —
            for meal ideas, motivation, and progress check-ins.
          </Text>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  gradientBg: { flex: 1, backgroundColor: '#000000' },
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  content: {
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: '#2E2E34',
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