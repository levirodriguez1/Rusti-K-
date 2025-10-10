import React, { useState } from 'react';
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
import { router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

const Step2Screen = () => {
  const params = useLocalSearchParams();
  const [ventaTarjetas, setVentaTarjetas] = useState('');

  const handleNext = () => {
    if (!ventaTarjetas) {
      alert('Por favor, ingrese el monto de ventas con tarjetas');
      return;
    }

    router.push({
      pathname: '/wizard/step3',
      params: {
        ...params,
        ventaTarjetas,
      },
    });
  };

  const handleBack = () => {
    router.back();
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
            <Text style={styles.title}>Venta con Tarjetas</Text>
            <Text style={styles.stepIndicator}>Paso 2 de 7</Text>
          </View>

          {/* Info Display */}
          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>Tienda:</Text>
            <Text style={styles.infoValue}>{params.tienda}</Text>
            <Text style={styles.infoLabel}>Responsable:</Text>
            <Text style={styles.infoValue}>{params.responsable}</Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Monto de Ventas con Tarjeta de Crédito (C$)</Text>
              <Text style={styles.description}>
                Ingrese el total de las ventas realizadas con tarjetas de crédito o débito
              </Text>
              <TextInput
                style={styles.input}
                value={ventaTarjetas}
                onChangeText={setVentaTarjetas}
                placeholder="0.00"
                placeholderTextColor="#8A92B2"
                keyboardType="numeric"
                autoFocus
              />
              {ventaTarjetas ? (
                <Text style={styles.preview}>
                  Total: C$ {parseFloat(ventaTarjetas || '0').toFixed(2)}
                </Text>
              ) : null}
            </View>
          </View>

          {/* Navigation */}
          <View style={styles.navigation}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={handleBack}
            >
              <Text style={styles.backButtonText}>← Atrás</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.nextButton,
                !ventaTarjetas && styles.nextButtonDisabled
              ]}
              onPress={handleNext}
              disabled={!ventaTarjetas}
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
    marginBottom: 30,
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
  infoCard: {
    backgroundColor: '#1A2040',
    borderRadius: 12,
    padding: 16,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: '#2A3754',
  },
  infoLabel: {
    fontSize: 14,
    color: '#B0B8D4',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
    marginBottom: 8,
  },
  form: {
    flex: 1,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 18,
    color: '#FFFFFF',
    marginBottom: 8,
    fontWeight: '600',
  },
  description: {
    fontSize: 14,
    color: '#B0B8D4',
    marginBottom: 16,
    lineHeight: 20,
  },
  input: {
    borderWidth: 2,
    borderColor: '#2A3754',
    borderRadius: 12,
    paddingVertical: 20,
    paddingHorizontal: 24,
    fontSize: 20,
    color: '#FFFFFF',
    backgroundColor: '#1A2040',
    textAlign: 'center',
  },
  preview: {
    fontSize: 16,
    color: '#4A9EFF',
    textAlign: 'center',
    marginTop: 12,
    fontWeight: '600',
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

export default Step2Screen;