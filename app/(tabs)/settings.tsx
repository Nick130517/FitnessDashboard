import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  Alert,
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
import { clearAllMeals, clearAllWorkouts, getProfile, setProfile } from '../../db/db';

const KG_TO_LBS = 2.20462;
const CM_TO_IN = 0.393701;

function kgToLbs(kg) { return kg * KG_TO_LBS; }
function lbsToKg(lbs) { return lbs / KG_TO_LBS; }
function cmToIn(cm) { return cm * CM_TO_IN; }
function inToCm(inches) { return inches / CM_TO_IN; }

function PillToggle({ options, value, onChange }) {
  return (
    <View style={styles.pillRow}>
      {options.map((opt) => (
        <TouchableOpacity
          key={opt.value}
          style={[styles.pill, value === opt.value && styles.pillActive]}
          onPress={() => onChange(opt.value)}
        >
          <Text style={[styles.pillText, value === opt.value && styles.pillTextActive]}>
            {opt.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

export default function SettingsScreen() {
  const [weightInput, setWeightInput] = useState('');
  const [heightInput, setHeightInput] = useState('');
  const [sex, setSex] = useState(null);
  const [units, setUnits] = useState('metric');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const profile = getProfile();
    const initialUnits = profile.units || 'metric';
    setUnits(initialUnits);
    setSex(profile.sex || null);

    if (profile.weight_kg != null) {
      setWeightInput(
        initialUnits === 'metric'
          ? String(profile.weight_kg)
          : kgToLbs(profile.weight_kg).toFixed(1)
      );
    }
    if (profile.height_cm != null) {
      setHeightInput(
        initialUnits === 'metric'
          ? String(profile.height_cm)
          : cmToIn(profile.height_cm).toFixed(1)
      );
    }
  }, []);

  const handleUnitsChange = (newUnits) => {
    if (newUnits === units) return;

    const currentWeight = parseFloat(weightInput);
    const currentHeight = parseFloat(heightInput);

    if (!isNaN(currentWeight)) {
      setWeightInput(
        newUnits === 'imperial' ? kgToLbs(currentWeight).toFixed(1) : lbsToKg(currentWeight).toFixed(1)
      );
    }
    if (!isNaN(currentHeight)) {
      setHeightInput(
        newUnits === 'imperial' ? cmToIn(currentHeight).toFixed(1) : inToCm(currentHeight).toFixed(1)
      );
    }
    setUnits(newUnits);
  };

  const handleSave = () => {
    const weightNum = parseFloat(weightInput);
    const heightNum = parseFloat(heightInput);

    if (isNaN(weightNum) || isNaN(heightNum) || weightNum <= 0 || heightNum <= 0) {
      Alert.alert('Check your numbers', 'Enter a valid weight and height before saving.');
      return;
    }

    const weightKg = units === 'metric' ? weightNum : lbsToKg(weightNum);
    const heightCm = units === 'metric' ? heightNum : inToCm(heightNum);

    setProfile(weightKg, heightCm, sex, units);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleClearWorkouts = () => {
    Alert.alert(
      'Clear all workouts',
      'This deletes every workout you have logged. Meals and profile settings are untouched. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear workouts',
          style: 'destructive',
          onPress: () => {
            clearAllWorkouts();
            Alert.alert('Done', 'All workout data has been cleared.');
          },
        },
      ]
    );
  };

  const handleClearMeals = () => {
    Alert.alert(
      'Clear all meals',
      'This deletes every meal you have logged. Workouts and profile settings are untouched. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear meals',
          style: 'destructive',
          onPress: () => {
            clearAllMeals();
            Alert.alert('Done', 'All meal data has been cleared.');
          },
        },
      ]
    );
  };

  return (
    <View style={styles.gradientBg}>
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={{ flex: 1 }}
        >
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <Text style={styles.header}>Settings</Text>
            <Text style={styles.subHeader}>Your profile and app preferences</Text>

            <View style={styles.panel}>
              <View style={styles.panelHeaderRow}>
                <Ionicons name="body" size={16} color="#8B93A7" style={{ marginRight: 6 }} />
                <Text style={styles.panelTitle}>Body stats</Text>
              </View>

              <Text style={styles.fieldLabel}>Sex</Text>
              <PillToggle
                options={[{ label: 'Female', value: 'female' }, { label: 'Male', value: 'male' }]}
                value={sex}
                onChange={setSex}
              />

              <Text style={styles.fieldLabel}>Units</Text>
              <PillToggle
                options={[{ label: 'Metric (kg/cm)', value: 'metric' }, { label: 'Imperial (lb/in)', value: 'imperial' }]}
                value={units}
                onChange={handleUnitsChange}
              />

              <Text style={styles.fieldLabel}>Weight ({units === 'metric' ? 'kg' : 'lb'})</Text>
              <TextInput
                style={styles.input}
                placeholder={units === 'metric' ? 'e.g. 78' : 'e.g. 172'}
                placeholderTextColor="#6B7280"
                value={weightInput}
                onChangeText={setWeightInput}
                keyboardType="decimal-pad"
              />

              <Text style={styles.fieldLabel}>Height ({units === 'metric' ? 'cm' : 'in'})</Text>
              <TextInput
                style={styles.input}
                placeholder={units === 'metric' ? 'e.g. 178' : 'e.g. 70'}
                placeholderTextColor="#6B7280"
                value={heightInput}
                onChangeText={setHeightInput}
                keyboardType="decimal-pad"
              />

              <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                <Text style={styles.saveButtonText}>{saved ? 'Saved' : 'Save changes'}</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.panel}>
              <View style={styles.panelHeaderRow}>
                <Ionicons name="watch" size={16} color="#8B93A7" style={{ marginRight: 6 }} />
                <Text style={styles.panelTitle}>Connected device</Text>
              </View>
              <View style={styles.deviceRow}>
                <View style={styles.deviceIconBadge}>
                  <Ionicons name="watch-outline" size={18} color="#6B7280" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.deviceStatus}>Not connected</Text>
                  <Text style={styles.deviceNote}>
                    Smartwatch sync via Health Connect is coming in a future update.
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.panel}>
              <View style={styles.panelHeaderRow}>
                <Ionicons name="trash" size={16} color="#8B93A7" style={{ marginRight: 6 }} />
                <Text style={styles.panelTitle}>Data management</Text>
              </View>
              <Text style={styles.dataNote}>
                Workouts and meals are automatically deleted after 7 days. Use these to clear
                them right now instead of waiting.
              </Text>
              <TouchableOpacity style={styles.dangerButton} onPress={handleClearWorkouts}>
                <Ionicons name="barbell-outline" size={15} color="#F87171" style={{ marginRight: 7 }} />
                <Text style={styles.dangerButtonText}>Clear all workouts</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.dangerButton, { marginTop: 10 }]} onPress={handleClearMeals}>
                <Ionicons name="restaurant-outline" size={15} color="#F87171" style={{ marginRight: 7 }} />
                <Text style={styles.dangerButtonText}>Clear all meals</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.note}>
              Goals and targets will live in the Coach tab once that's built — this page just
              stores your current stats and app preferences.
            </Text>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  gradientBg: { flex: 1, backgroundColor: '#000000' },
  container: { flex: 1 },
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
  panel: {
    backgroundColor: 'rgba(220,220,225,0.06)',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(220,220,225,0.09)',
    marginBottom: 16,
  },
  panelHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  panelTitle: {
    color: '#F5F7FA',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  fieldLabel: {
    color: '#8B93A7',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
    marginTop: 4,
  },
  pillRow: {
    flexDirection: 'row',
    marginBottom: 14,
  },
  pill: {
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderRadius: 9,
    backgroundColor: 'rgba(0,0,0,0.25)',
    borderWidth: 1,
    borderColor: 'rgba(220,220,225,0.08)',
    marginRight: 8,
  },
  pillActive: {
    backgroundColor: 'rgba(74,222,128,0.16)',
    borderColor: '#4ADE80',
  },
  pillText: {
    color: '#8B93A7',
    fontSize: 13,
    fontWeight: '600',
  },
  pillTextActive: {
    color: '#4ADE80',
  },
  input: {
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 10,
    padding: 14,
    color: '#F5F7FA',
    fontSize: 15,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: 'rgba(220,220,225,0.08)',
  },
  saveButton: {
    backgroundColor: '#4ADE80',
    borderRadius: 10,
    paddingVertical: 13,
    alignItems: 'center',
    marginTop: 4,
  },
  saveButtonText: {
    color: '#0B0F1E',
    fontWeight: '700',
    fontSize: 15,
  },
  deviceRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deviceIconBadge: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(107,114,128,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  deviceStatus: {
    color: '#F5F7FA',
    fontSize: 14,
    fontWeight: '600',
  },
  deviceNote: {
    color: '#6B7280',
    fontSize: 12,
    marginTop: 3,
    lineHeight: 16,
  },
  dataNote: {
    color: '#8B93A7',
    fontSize: 12.5,
    lineHeight: 18,
    marginBottom: 14,
  },
  dangerButton: {
    flexDirection: 'row',
    backgroundColor: 'rgba(239,68,68,0.14)',
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.4)',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dangerButtonText: {
    color: '#F87171',
    fontWeight: '700',
    fontSize: 13.5,
  },
  note: {
    color: '#6B7280',
    fontSize: 12,
    marginTop: 4,
    lineHeight: 18,
  },
});