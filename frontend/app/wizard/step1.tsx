import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
} from 'react-native';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

const stores = ['Rusti-K', 'El Parque', 'Pollo Manía'];

const Step1Screen = () => {
  const [selectedStore, setSelectedStore] = useState('');
  const [responsable, setResponsable] = useState('');
  const [fondoInicial, setFondoInicial] = useState('');
  const [currentTime, setCurrentTime] = useState('');

  useEffect(() => {
    // Update current time
    const updateTime = () => {
      const now = new Date();
      const formattedTime = now.toLocaleString('es-NI', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      });
      setCurrentTime(formattedTime);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleNext = () => {
    if (!selectedStore || !responsable || !fondoInicial) {
      alert('Por favor, complete todos los campos obligatorios');
      return;
    }

    // Store data in router params for next screen
    router.push({
      pathname: '/wizard/step2',
      params: {
        tienda: selectedStore,
        responsable,
        fondoInicial,
        fecha: new Date().toISOString(),
      },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardContainer}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Información Inicial</Text>
            <Text style={styles.stepIndicator}>Paso 1 de 7</Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {/* Store Selection */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Tienda *</Text>
              <View style={styles.storeSelector}>
                {stores.map((store) => (
                  <TouchableOpacity
                    key={store}
                    style={[
                      styles.storeOption,
                      selectedStore === store && styles.storeOptionSelected,
                    ]}
                    onPress={() => setSelectedStore(store)}
                  >
                    <Text
                      style={[
                        styles.storeOptionText,
                        selectedStore === store && styles.storeOptionTextSelected,
                      ]}
                    >
                      {store}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Responsable */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nombre del Responsable *</Text>
              <TextInput
                style={styles.input}
                value={responsable}
                onChangeText={setResponsable}
                placeholder="Ingrese el nombre del responsable"
                placeholderTextColor="#8A92B2"
              />
            </View>

            {/* Current Date/Time */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Fecha y Hora Actual</Text>
              <View style={styles.readOnlyInput}>
                <Text style={styles.readOnlyText}>{currentTime}</Text>
              </View>
            </View>

            {/* Fondo Inicial */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Fondo Inicial (C$) *</Text>
              <TextInput
                style={styles.input}
                value={fondoInicial}
                onChangeText={setFondoInicial}
                placeholder="0.00"
                placeholderTextColor="#8A92B2"
                keyboardType="numeric"
              />
            </View>
          </View>

          {/* Navigation */}
          <View style={styles.navigation}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Text style={styles.backButtonText}>← Atrás</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.nextButton,
                (!selectedStore || !responsable || !fondoInicial) && styles.nextButtonDisabled
              ]}
              onPress={handleNext}
              disabled={!selectedStore || !responsable || !fondoInicial}
            >
              <Text style={styles.nextButtonText}>Siguiente →</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0E27',
  },
  keyboardContainer: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  stepIndicator: {
    fontSize: 16,
    color: '#B0B8D4',
  },
  form: {
    flex: 1,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: 8,
    fontWeight: '600',
  },
  storeSelector: {
    gap: 12,
  },
  storeOption: {
    borderWidth: 2,
    borderColor: '#2A3754',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: '#1A2040',
  },
  storeOptionSelected: {
    borderColor: '#4A9EFF',
    backgroundColor: '#2A4A7A',
  },
  storeOptionText: {
    fontSize: 16,
    color: '#B0B8D4',
    textAlign: 'center',
    fontWeight: '500',
  },
  storeOptionTextSelected: {
    color: '#FFFFFF',
  },
  input: {
    borderWidth: 2,
    borderColor: '#2A3754',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    fontSize: 16,
    color: '#FFFFFF',
    backgroundColor: '#1A2040',
  },
  readOnlyInput: {
    borderWidth: 2,
    borderColor: '#2A3754',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: '#141829',
  },
  readOnlyText: {
    fontSize: 16,
    color: '#8A92B2',
  },
  navigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
  },
  backButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  backButtonText: {
    fontSize: 16,
    color: '#B0B8D4',
  },
  nextButton: {
    backgroundColor: '#4A9EFF',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    minWidth: 120,
  },
  nextButtonDisabled: {
    backgroundColor: '#2A3754',
  },
  nextButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default Step1Screen;