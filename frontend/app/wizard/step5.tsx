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
  Alert,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

interface Gasto {
  id: string;
  concepto: string;
  monto: number;
}

const Step5Screen = () => {
  const params = useLocalSearchParams();
  const [concepto, setConcepto] = useState('');
  const [monto, setMonto] = useState('');
  const [gastos, setGastos] = useState<Gasto[]>([]);
  const [totalGastos, setTotalGastos] = useState(0);

  useEffect(() => {
    // Calculate total expenses whenever gastos change
    const total = gastos.reduce((sum, gasto) => sum + gasto.monto, 0);
    setTotalGastos(total);
  }, [gastos]);

  const addGasto = () => {
    if (!concepto.trim() || !monto) {
      Alert.alert('Error', 'Por favor, complete todos los campos');
      return;
    }

    const montoFloat = parseFloat(monto);
    if (isNaN(montoFloat) || montoFloat <= 0) {
      Alert.alert('Error', 'El monto debe ser un número válido mayor que cero');
      return;
    }

    const newGasto: Gasto = {
      id: Date.now().toString(),
      concepto: concepto.trim(),
      monto: montoFloat,
    };

    setGastos(prev => [...prev, newGasto]);
    setConcepto('');
    setMonto('');
  };

  const removeGasto = (id: string) => {
    Alert.alert(
      'Eliminar Gasto',
      '¿Está seguro que desea eliminar este gasto?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => setGastos(prev => prev.filter(gasto => gasto.id !== id))
        }
      ]
    );
  };

  const handleNext = () => {
    const gastosData = {
      gastos: JSON.stringify(gastos),
      totalGastos,
    };

    router.push({
      pathname: '/wizard/step6',
      params: {
        ...params,
        ...gastosData,
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
            <Text style={styles.title}>Gastos</Text>
            <Text style={styles.stepIndicator}>Paso 5 de 7</Text>
          </View>

          {/* Total Display */}
          <View style={styles.totalCard}>
            <Text style={styles.totalLabel}>Total de Gastos</Text>
            <Text style={styles.totalValue}>C$ {totalGastos.toFixed(2)}</Text>
            <Text style={styles.totalCount}>{gastos.length} gasto{gastos.length !== 1 ? 's' : ''} registrado{gastos.length !== 1 ? 's' : ''}</Text>
          </View>

          {/* Add Expense Form */}
          <View style={styles.form}>
            <Text style={styles.formTitle}>Agregar Nuevo Gasto</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Concepto</Text>
              <TextInput
                style={styles.input}
                value={concepto}
                onChangeText={setConcepto}
                placeholder="Ej: Combustible, Mantenimiento, etc."
                placeholderTextColor="#8A92B2"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Monto (C$)</Text>
              <TextInput
                style={styles.input}
                value={monto}
                onChangeText={setMonto}
                placeholder="0.00"
                placeholderTextColor="#8A92B2"
                keyboardType="numeric"
              />
            </View>

            <TouchableOpacity
              style={[
                styles.addButton,
                (!concepto.trim() || !monto) && styles.addButtonDisabled
              ]}
              onPress={addGasto}
              disabled={!concepto.trim() || !monto}
            >
              <Ionicons name="add" size={20} color="#FFFFFF" />
              <Text style={styles.addButtonText}>Agregar Gasto</Text>
            </TouchableOpacity>
          </View>

          {/* Expenses List */}
          {gastos.length > 0 && (
            <View style={styles.gastosList}>
              <Text style={styles.listTitle}>Gastos Registrados</Text>
              {gastos.map((gasto) => (
                <View key={gasto.id} style={styles.gastoItem}>
                  <View style={styles.gastoInfo}>
                    <Text style={styles.gastoConcepto}>{gasto.concepto}</Text>
                    <Text style={styles.gastoMonto}>C$ {gasto.monto.toFixed(2)}</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => removeGasto(gasto.id)}
                  >
                    <Ionicons name="trash-outline" size={20} color="#FF4757" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}

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
    borderColor: '#FF6B6B',
  },
  totalLabel: {
    fontSize: 16,
    color: '#B0B8D4',
    marginBottom: 4,
  },
  totalValue: {
    fontSize: 32,
    color: '#FF6B6B',
    fontWeight: 'bold',
  },
  totalCount: {
    fontSize: 14,
    color: '#8A92B2',
    marginTop: 4,
  },
  form: {
    backgroundColor: '#1A2040',
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#2A3754',
  },
  formTitle: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: '600',
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: '#B0B8D4',
    marginBottom: 8,
  },
  input: {
    borderWidth: 2,
    borderColor: '#2A3754',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#FFFFFF',
    backgroundColor: '#0A0E27',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#28A745',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    gap: 8,
  },
  addButtonDisabled: {
    backgroundColor: '#2A3754',
  },
  addButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  gastosList: {
    marginBottom: 24,
  },
  listTitle: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: '600',
    marginBottom: 12,
  },
  gastoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A2040',
    borderRadius: 8,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#2A3754',
  },
  gastoInfo: {
    flex: 1,
  },
  gastoConcepto: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '500',
    marginBottom: 2,
  },
  gastoMonto: {
    fontSize: 14,
    color: '#FF6B6B',
    fontWeight: '600',
  },
  removeButton: {
    padding: 8,
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

export default Step5Screen;