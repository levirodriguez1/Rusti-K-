import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

const EXCHANGE_RATE = 36.5;

const Step6Screen = () => {
  const params = useLocalSearchParams();
  const [isConfirmed, setIsConfirmed] = useState(false);

  // Parse gastos safely
  const gastos = useMemo(() => {
    try {
      return params.gastos ? JSON.parse(params.gastos as string) : [];
    } catch (e) {
      return [];
    }
  }, [params.gastos]);

  // Calculate all totals using useMemo to prevent re-renders
  const totals = useMemo(() => {
    const fondoInicial = parseFloat(params.fondoInicial as string) || 0;
    const ventaTarjetas = parseFloat(params.ventaTarjetas as string) || 0;
    const totalCordobas = parseFloat(params.totalCordobas as string) || 0;
    const totalDolares = parseFloat(params.totalDolares as string) || 0;
    const totalDolaresCordobas = parseFloat(params.totalDolaresCordobas as string) || 0;
    const totalGastos = parseFloat(params.totalGastos as string) || 0;
    
    const totalFinal = ventaTarjetas + totalCordobas + totalDolaresCordobas - totalGastos;

    return {
      fondoInicial,
      ventaTarjetas,
      totalCordobas,
      totalDolares,
      totalDolaresCordobas,
      totalGastos,
      totalFinal,
    };
  }, [
    params.fondoInicial,
    params.ventaTarjetas, 
    params.totalCordobas,
    params.totalDolares,
    params.totalDolaresCordobas,
    params.totalGastos
  ]);

  const handleNext = () => {
    if (!isConfirmed) {
      alert('Por favor, confirme que ha revisado todos los datos antes de continuar.');
      return;
    }

    router.push({
      pathname: '/wizard/step7',
      params,
    });
  };

  const handleBack = () => {
    router.back();
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleString('es-NI', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return 'Fecha no disponible';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Resumen Final</Text>
          <Text style={styles.stepIndicator}>Paso 6 de 7</Text>
        </View>

        {/* Summary Cards */}
        <View style={styles.summaryContainer}>
          {/* Basic Info */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Información General</Text>
            <View style={styles.cardContent}>
              <Text style={styles.infoRow}>
                <Text style={styles.infoLabel}>Tienda: </Text>
                <Text style={styles.infoValue}>{params.tienda}</Text>
              </Text>
              <Text style={styles.infoRow}>
                <Text style={styles.infoLabel}>Responsable: </Text>
                <Text style={styles.infoValue}>{params.responsable}</Text>
              </Text>
              <Text style={styles.infoRow}>
                <Text style={styles.infoLabel}>Fecha: </Text>
                <Text style={styles.infoValue}>{formatDate(params.fecha as string)}</Text>
              </Text>
            </View>
          </View>

          {/* Financial Summary */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Resumen Financiero</Text>
            <View style={styles.cardContent}>
              <View style={styles.financialRow}>
                <Text style={styles.financialLabel}>Fondo Inicial:</Text>
                <Text style={styles.financialValue}>C$ {totals.fondoInicial.toFixed(2)}</Text>
              </View>
              <View style={styles.financialRow}>
                <Text style={styles.financialLabel}>Ventas con Tarjetas:</Text>
                <Text style={styles.financialValue}>C$ {totals.ventaTarjetas.toFixed(2)}</Text>
              </View>
              <View style={styles.financialRow}>
                <Text style={styles.financialLabel}>Total Córdobas:</Text>
                <Text style={styles.financialValue}>C$ {totals.totalCordobas.toFixed(2)}</Text>
              </View>
              <View style={styles.financialRow}>
                <Text style={styles.financialLabel}>Total Dólares:</Text>
                <Text style={styles.financialValue}>US$ {totals.totalDolares.toFixed(2)}</Text>
              </View>
              <View style={styles.financialRow}>
                <Text style={styles.financialSubLabel}>Equivalente en Córdobas:</Text>
                <Text style={styles.financialValue}>C$ {totals.totalDolaresCordobas.toFixed(2)}</Text>
              </View>
              <View style={styles.financialRow}>
                <Text style={styles.financialLabel}>Total Gastos:</Text>
                <Text style={styles.expenseValue}>-C$ {totals.totalGastos.toFixed(2)}</Text>
              </View>
              
              <View style={styles.separator} />
              
              <View style={styles.financialRow}>
                <Text style={styles.totalLabel}>TOTAL FINAL:</Text>
                <Text style={styles.totalValue}>C$ {totals.totalFinal.toFixed(2)}</Text>
              </View>
            </View>
          </View>

          {/* Expenses Detail */}
          {gastos.length > 0 && (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Detalle de Gastos ({gastos.length})</Text>
              <View style={styles.cardContent}>
                {gastos.map((gasto: any, index: number) => (
                  <View key={index} style={styles.gastoRow}>
                    <Text style={styles.gastoConcepto}>{gasto.concepto}</Text>
                    <Text style={styles.gastoMonto}>C$ {gasto.monto.toFixed(2)}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>

        {/* Confirmation */}
        <View style={styles.confirmationContainer}>
          <TouchableOpacity
            style={styles.checkboxContainer}
            onPress={() => setIsConfirmed(!isConfirmed)}
          >
            <View style={[styles.checkbox, isConfirmed && styles.checkboxChecked]}>
              {isConfirmed && (
                <Ionicons name="checkmark" size={16} color="#FFFFFF" />
              )}
            </View>
            <Text style={styles.checkboxText}>
              He revisado los datos anteriores y doy fe de que todos los datos son correctos
            </Text>
          </TouchableOpacity>
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
              !isConfirmed && styles.nextButtonDisabled
            ]}
            onPress={handleNext}
            disabled={!isConfirmed}
          >
            <Text style={styles.nextButtonText}>Finalizar →</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0E27',
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
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
  summaryContainer: {
    marginBottom: 24,
  },
  card: {
    backgroundColor: '#1A2040',
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#2A3754',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  cardContent: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  infoRow: {
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 16,
    color: '#B0B8D4',
  },
  infoValue: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  financialRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  financialLabel: {
    fontSize: 16,
    color: '#B0B8D4',
  },
  financialSubLabel: {
    fontSize: 14,
    color: '#8A92B2',
    paddingLeft: 16,
  },
  financialValue: {
    fontSize: 16,
    color: '#4A9EFF',
    fontWeight: '600',
  },
  expenseValue: {
    fontSize: 16,
    color: '#FF6B6B',
    fontWeight: '600',
  },
  separator: {
    height: 1,
    backgroundColor: '#2A3754',
    marginVertical: 12,
  },
  totalLabel: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  totalValue: {
    fontSize: 20,
    color: '#28A745',
    fontWeight: 'bold',
  },
  gastoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  gastoConcepto: {
    fontSize: 14,
    color: '#B0B8D4',
    flex: 1,
  },
  gastoMonto: {
    fontSize: 14,
    color: '#FF6B6B',
    fontWeight: '600',
  },
  confirmationContainer: {
    backgroundColor: '#1A2040',
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    borderWidth: 2,
    borderColor: '#FF9500',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#2A3754',
    borderRadius: 4,
    marginRight: 12,
    marginTop: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#28A745',
    borderColor: '#28A745',
  },
  checkboxText: {
    fontSize: 16,
    color: '#FFFFFF',
    flex: 1,
    lineHeight: 22,
  },
  navigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
    backgroundColor: '#28A745',
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

export default Step6Screen;