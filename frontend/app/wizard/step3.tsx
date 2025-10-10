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
import { router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

const denominations = [
  { value: 1, label: 'C$ 1' },
  { value: 5, label: 'C$ 5' },
  { value: 10, label: 'C$ 10' },
  { value: 20, label: 'C$ 20' },
  { value: 50, label: 'C$ 50' },
  { value: 100, label: 'C$ 100' },
  { value: 500, label: 'C$ 500' },
];

const Step3Screen = () => {
  const params = useLocalSearchParams();
  const [counts, setCounts] = useState<{ [key: number]: string }>({
    1: '',
    5: '',
    10: '',
    20: '',
    50: '',
    100: '',
    500: '',
  });
  const [total, setTotal] = useState(0);

  useEffect(() => {
    // Calculate total whenever counts change
    const calculatedTotal = denominations.reduce((sum, denom) => {
      const count = parseInt(counts[denom.value] || '0');
      return sum + (denom.value * count);
    }, 0);
    setTotal(calculatedTotal);
  }, [counts]);

  const updateCount = (denomination: number, value: string) => {
    setCounts(prev => ({
      ...prev,
      [denomination]: value,
    }));
  };

  const handleNext = () => {
    const cordobasData = {
      cordobas_1: parseInt(counts[1] || '0'),
      cordobas_5: parseInt(counts[5] || '0'),
      cordobas_10: parseInt(counts[10] || '0'),
      cordobas_20: parseInt(counts[20] || '0'),
      cordobas_50: parseInt(counts[50] || '0'),
      cordobas_100: parseInt(counts[100] || '0'),
      cordobas_500: parseInt(counts[500] || '0'),
      totalCordobas: total,
    };

    router.push({
      pathname: '/wizard/step4',
      params: {
        ...params,
        ...cordobasData,
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
            <Text style={styles.title}>Ventas en Córdobas</Text>
            <Text style={styles.stepIndicator}>Paso 3 de 7</Text>
          </View>

          {/* Total Display */}
          <View style={styles.totalCard}>
            <Text style={styles.totalLabel}>Total en Córdobas</Text>
            <Text style={styles.totalValue}>C$ {total.toFixed(2)}</Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <Text style={styles.instruction}>
              Ingrese la cantidad de billetes por denominación:
            </Text>
            
            {denominations.map((denom) => {
              const count = parseInt(counts[denom.value] || '0');
              const subtotal = denom.value * count;
              
              return (
                <View key={denom.value} style={styles.denominationRow}>
                  <View style={styles.denominationInfo}>
                    <Text style={styles.denominationLabel}>{denom.label}</Text>
                    {count > 0 && (
                      <Text style={styles.subtotal}>
                        {count} × C$ {denom.value} = C$ {subtotal.toFixed(2)}
                      </Text>
                    )}
                  </View>
                  
                  <TextInput
                    style={styles.countInput}
                    value={counts[denom.value]}
                    onChangeText={(value) => updateCount(denom.value, value)}
                    placeholder="0"
                    placeholderTextColor="#8A92B2"
                    keyboardType="numeric"
                  />
                </View>
              );
            })}
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
              style={styles.nextButton}
              onPress={handleNext}
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
    marginBottom: 20,
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
  totalCard: {
    backgroundColor: '#1A2040',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 2,
    borderColor: '#4A9EFF',
  },
  totalLabel: {
    fontSize: 16,
    color: '#B0B8D4',
    marginBottom: 4,
  },
  totalValue: {
    fontSize: 32,
    color: '#4A9EFF',
    fontWeight: 'bold',
  },
  form: {
    flex: 1,
  },
  instruction: {
    fontSize: 16,
    color: '#B0B8D4',
    marginBottom: 20,
    textAlign: 'center',
  },
  denominationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A2040',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#2A3754',
  },
  denominationInfo: {
    flex: 1,
  },
  denominationLabel: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  subtotal: {
    fontSize: 14,
    color: '#4A9EFF',
    marginTop: 2,
  },
  countInput: {
    borderWidth: 2,
    borderColor: '#2A3754',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#FFFFFF',
    backgroundColor: '#0A0E27',
    textAlign: 'center',
    minWidth: 80,
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
  nextButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default Step3Screen;