import { useState } from 'react';
import {
    KeyboardAvoidingView,
    Modal,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

export function AddWorkoutModal({ visible, onClose, onSave }) {
  const [name, setName] = useState('');
  const [duration, setDuration] = useState('');

  const handleSave = () => {
    if (!name.trim()) return;
    onSave(name.trim(), parseInt(duration, 10) || 0);
    setName('');
    setDuration('');
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.modalOverlay}
      >
        <View style={styles.modalCard}>
          <Text style={styles.modalTitle}>Add Workout</Text>
          <TextInput
            style={styles.input}
            placeholder="Workout name"
            placeholderTextColor="#6B7280"
            value={name}
            onChangeText={setName}
          />
          <TextInput
            style={styles.input}
            placeholder="Duration (min)"
            placeholderTextColor="#6B7280"
            value={duration}
            onChangeText={setDuration}
            keyboardType="numeric"
          />
          <View style={styles.modalButtonRow}>
            <TouchableOpacity style={styles.modalButtonCancel} onPress={onClose}>
              <Text style={styles.modalButtonCancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalButtonSave} onPress={handleSave}>
              <Text style={styles.modalButtonSaveText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

export function AddMealModal({ visible, onClose, onSave }) {
  const [name, setName] = useState('');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');

  const handleSave = () => {
    if (!name.trim()) return;
    const now = new Date();
    const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    onSave(name.trim(), time, parseInt(calories, 10) || 0, parseInt(protein, 10) || 0);
    setName('');
    setCalories('');
    setProtein('');
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.modalOverlay}
      >
        <View style={styles.modalCard}>
          <Text style={styles.modalTitle}>Add Meal</Text>
          <TextInput
            style={styles.input}
            placeholder="Meal name"
            placeholderTextColor="#6B7280"
            value={name}
            onChangeText={setName}
          />
          <TextInput
            style={styles.input}
            placeholder="Calories"
            placeholderTextColor="#6B7280"
            value={calories}
            onChangeText={setCalories}
            keyboardType="numeric"
          />
          <TextInput
            style={styles.input}
            placeholder="Protein (g)"
            placeholderTextColor="#6B7280"
            value={protein}
            onChangeText={setProtein}
            keyboardType="numeric"
          />
          <View style={styles.modalButtonRow}>
            <TouchableOpacity style={styles.modalButtonCancel} onPress={onClose}>
              <Text style={styles.modalButtonCancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalButtonSave} onPress={handleSave}>
              <Text style={styles.modalButtonSaveText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalCard: {
    backgroundColor: '#1A1D24',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  input: {
    backgroundColor: '#0F1115',
    borderRadius: 10,
    padding: 14,
    color: '#FFFFFF',
    fontSize: 15,
    marginBottom: 12,
  },
  modalButtonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
  },
  modalButtonCancel: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginRight: 8,
  },
  modalButtonCancelText: {
    color: '#9CA3AF',
    fontSize: 15,
  },
  modalButtonSave: {
    backgroundColor: '#4ADE80',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  modalButtonSaveText: {
    color: '#0F1115',
    fontWeight: '700',
    fontSize: 15,
  },
});