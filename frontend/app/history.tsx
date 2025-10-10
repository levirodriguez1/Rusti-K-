import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  RefreshControl,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';

interface Arqueo {
  id: string;
  tienda: string;
  responsable: string;
  fecha: string;
  fondo_inicial: number;
  venta_tarjetas: number;
  total_cordobas: number;
  total_dolares: number;
  total_dolares_cordobas: number;
  total_gastos: number;
  total_final: number;
}

const HistoryScreen = () => {
  const [arqueos, setArqueos] = useState<Arqueo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  
  const backendUrl = Constants.expoConfig?.extra?.EXPO_PUBLIC_BACKEND_URL || process.env.EXPO_PUBLIC_BACKEND_URL;

  const fetchArqueos = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${backendUrl}/api/arqueo`);
      
      if (response.ok) {
        const data = await response.json();
        setArqueos(data);
      } else {
        throw new Error('Error al cargar historial');
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo cargar el historial. Verifique su conexión e inténtelo de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchArqueos();
    setRefreshing(false);
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-NI', {
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

  const handleArqueoPress = (arqueo: Arqueo) => {
    Alert.alert(
      `Arqueo - ${arqueo.tienda}`,
      `Responsable: ${arqueo.responsable}\nFecha: ${formatDate(arqueo.fecha)}\nTotal Final: C$ ${arqueo.total_final.toFixed(2)}`,
      [
        { text: 'Cerrar', style: 'cancel' },
        { 
          text: 'Ver Detalles', 
          onPress: () => {
            // Navigate to detail view (could be implemented later)
            Alert.alert('Información', 'Vista de detalles próximamente');
          }
        }
      ]
    );
  };

  const handleBack = () => {
    router.back();
  };

  const handleNewRecord = () => {
    router.replace('/');
  };

  useEffect(() => {
    fetchArqueos();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.title}>Historial de Arqueos</Text>
        <TouchableOpacity style={styles.refreshButton} onPress={fetchArqueos}>
          <Ionicons name="refresh" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#4A9EFF"
            colors={['#4A9EFF']}
          />
        }
      >
        {isLoading && arqueos.length === 0 ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Cargando historial...</Text>
          </View>
        ) : arqueos.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="document-outline" size={64} color="#8A92B2" />
            <Text style={styles.emptyTitle}>Sin Registros</Text>
            <Text style={styles.emptySubtitle}>
              Aún no hay arqueos registrados en el sistema
            </Text>
            <TouchableOpacity style={styles.newRecordButton} onPress={handleNewRecord}>
              <Text style={styles.newRecordButtonText}>Crear Primer Arqueo</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.arqueosList}>
            <Text style={styles.listHeader}>
              {arqueos.length} registro{arqueos.length !== 1 ? 's' : ''} encontrado{arqueos.length !== 1 ? 's' : ''}
            </Text>
            
            {arqueos.map((arqueo) => (
              <TouchableOpacity
                key={arqueo.id}
                style={styles.arqueoCard}
                onPress={() => handleArqueoPress(arqueo)}
              >
                <View style={styles.cardHeader}>
                  <View style={styles.cardTitleContainer}>
                    <Text style={styles.cardTitle}>{arqueo.tienda}</Text>
                    <Text style={styles.cardDate}>{formatDate(arqueo.fecha)}</Text>
                  </View>
                  <View style={styles.totalContainer}>
                    <Text style={styles.totalAmount}>C$ {arqueo.total_final.toFixed(2)}</Text>
                  </View>
                </View>
                
                <View style={styles.cardContent}>
                  <Text style={styles.responsableText}>
                    <Ionicons name="person" size={14} color="#B0B8D4" />
                    {' '}{arqueo.responsable}
                  </Text>
                  
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryText}>
                      Fondo: C$ {arqueo.fondo_inicial.toFixed(2)}
                    </Text>
                    <Text style={styles.summaryText}>
                      Tarjetas: C$ {arqueo.venta_tarjetas.toFixed(2)}
                    </Text>
                  </View>
                  
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryText}>
                      Efectivo: C$ {(arqueo.total_cordobas + arqueo.total_dolares_cordobas).toFixed(2)}
                    </Text>
                    <Text style={styles.summaryText}>
                      Gastos: C$ {arqueo.total_gastos.toFixed(2)}
                    </Text>
                  </View>
                </View>
                
                <View style={styles.cardFooter}>
                  <Text style={styles.viewDetailsText}>Toque para ver detalles</Text>
                  <Ionicons name="chevron-forward" size={16} color="#8A92B2" />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Floating Action Button */}
      {arqueos.length > 0 && (
        <TouchableOpacity style={styles.fab} onPress={handleNewRecord}>
          <Ionicons name="add" size={28} color="#FFFFFF" />
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0E27',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2A3754',
  },
  backButton: {
    padding: 8,
    marginRight: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    flex: 1,
  },
  refreshButton: {
    padding: 8,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 100, // Space for FAB
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 100,
  },
  loadingText: {
    fontSize: 16,
    color: '#B0B8D4',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 100,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#B0B8D4',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
  },
  newRecordButton: {
    backgroundColor: '#4A9EFF',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
  },
  newRecordButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  arqueosList: {},
  listHeader: {
    fontSize: 16,
    color: '#B0B8D4',
    marginBottom: 16,
  },
  arqueoCard: {
    backgroundColor: '#1A2040',
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#2A3754',
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 16,
    paddingBottom: 8,
  },
  cardTitleContainer: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  cardDate: {
    fontSize: 14,
    color: '#B0B8D4',
  },
  totalContainer: {
    alignItems: 'flex-end',
  },
  totalAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#28A745',
  },
  cardContent: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  responsableText: {
    fontSize: 14,
    color: '#B0B8D4',
    marginBottom: 8,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  summaryText: {
    fontSize: 12,
    color: '#8A92B2',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#141829',
  },
  viewDetailsText: {
    fontSize: 12,
    color: '#8A92B2',
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#4A9EFF',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
});

export default HistoryScreen;