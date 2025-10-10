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

const EXCHANGE_RATE = 36.5;

const denominations = [
  { value: 1, label: 'US$ 1' },
  { value: 5, label: 'US$ 5' },
  { value: 10, label: 'US$ 10' },
  { value: 20, label: 'US$ 20' },
  { value: 50, label: 'US$ 50' },
  { value: 100, label: 'US$ 100' },
];

const Step4Screen = () => {
  const params = useLocalSearchParams();
  const [counts, setCounts] = useState<{ [key: number]: string }>({
    1: '',
    5: '',
    10: '',
    20: '',
    50: '',
    100: '',
  });
  const [totalUSD, setTotalUSD] = useState(0);
  const [totalCordobas, setTotalCordobas] = useState(0);

  useEffect(() => {
    // Calculate total whenever counts change
    const calculatedTotalUSD = denominations.reduce((sum, denom) => {
      const count = parseInt(counts[denom.value] || '0');
      return sum + (denom.value * count);
    }, 0);
    
    setTotalUSD(calculatedTotalUSD);
    setTotalCordobas(calculatedTotalUSD * EXCHANGE_RATE);
  }, [counts]);

  const updateCount = (denomination: number, value: string) => {
    setCounts(prev => ({
      ...prev,
      [denomination]: value,
    }));
  };

  const handleNext = () => {
    const dolaresData = {
      dolares_1: parseInt(counts[1] || '0'),
      dolares_5: parseInt(counts[5] || '0'),
      dolares_10: parseInt(counts[10] || '0'),
      dolares_20: parseInt(counts[20] || '0'),
      dolares_50: parseInt(counts[50] || '0'),
      dolares_100: parseInt(counts[100] || '0'),
      totalDolares: totalUSD,
      totalDolaresCordobas: totalCordobas,
    };

    router.push({
      pathname: '/wizard/step5',
      params: {
        ...params,
        ...dolaresData,
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
            <Text style={styles.title}>Ventas en Dólares</Text>
            <Text style={styles.stepIndicator}>Paso 4 de 7</Text>
          </View>

          {/* Total Display */}
          <View style={styles.totalCard}>
            <Text style={styles.totalLabel}>Total en Dólares</Text>
            <Text style={styles.totalValueUSD}>US$ {totalUSD.toFixed(2)}</Text>
            <Text style={styles.exchangeRate}>1 USD = {EXCHANGE_RATE} NIO</Text>
            <Text style={styles.totalValueNIO}>Equivalente: C$ {totalCordobas.toFixed(2)}</Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <Text style={styles.instruction}>
              Ingrese la cantidad de billetes por denominación:
            </Text>
            
            {denominations.map((denom) => {
              const count = parseInt(counts[denom.value] || '0');
              const subtotal = denom.value * count;
              const subtotalCordobas = subtotal * EXCHANGE_RATE;
              
              return (
                <View key={denom.value} style={styles.denominationRow}>
                  <View style={styles.denominationInfo}>
                    <Text style={styles.denominationLabel}>{denom.label}</Text>
                    {count > 0 && (
                      <View>
                        <Text style={styles.subtotal}>
                          {count} × US$ {denom.value} = US$ {subtotal.toFixed(2)}
                        </Text>
                        <Text style={styles.subtotalCordobas}>
                          Equivalente: C$ {subtotalCordobas.toFixed(2)}
                        </Text>
                      </View>
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
    borderColor: '#28A745',
  },
  totalLabel: {
    fontSize: 16,
    color: '#B0B8D4',
    marginBottom: 4,
  },
  totalValueUSD: {
    fontSize: 32,
    color: '#28A745',
    fontWeight: 'bold',
  },
  exchangeRate: {
    fontSize: 14,
    color: '#8A92B2',
    marginTop: 8,
    marginBottom: 4,
  },
  totalValueNIO: {
    fontSize: 16,
    color: '#4A9EFF',
    fontWeight: '600',
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
    color: '#28A745',
    marginTop: 2,
  },
  subtotalCordobas: {
    fontSize: 12,
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

export default Step4Screen;