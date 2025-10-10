import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Alert,
  Linking,
  Modal,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';

const Step7Screen = () => {
  const params = useLocalSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [completedActions, setCompletedActions] = useState({
    whatsapp: false,
    pdf: false,
    save: false,
  });
  const [showCompletedModal, setShowCompletedModal] = useState(false);
  const [arqueoId, setArqueoId] = useState<string | null>(null);
  
  const backendUrl = Constants.expoConfig?.extra?.EXPO_PUBLIC_BACKEND_URL || process.env.EXPO_PUBLIC_BACKEND_URL;

  const formatWhatsAppMessage = () => {
    const tienda = params.tienda;
    const responsable = params.responsable;
    const fecha = new Date().toLocaleDateString('es-NI');
    const fondoInicial = parseFloat(params.fondoInicial as string) || 0;
    const ventaTarjetas = parseFloat(params.ventaTarjetas as string) || 0;
    const totalCordobas = parseFloat(params.totalCordobas as string) || 0;
    const totalDolares = parseFloat(params.totalDolares as string) || 0;
    const totalDolaresCordobas = parseFloat(params.totalDolaresCordobas as string) || 0;
    const totalGastos = parseFloat(params.totalGastos as string) || 0;
    const totalFinal = ventaTarjetas + totalCordobas + totalDolaresCordobas - totalGastos;

    return `🏦 *ARQUEO - ${tienda}*
👥 Responsable: ${responsable}
📅 Fecha: ${fecha}

💰 *RESUMEN DE VENTAS:*
• Ventas Tarjetas: C$ ${ventaTarjetas.toFixed(2)}
• Total Córdobas: C$ ${totalCordobas.toFixed(2)}
• Total Dólares: US$ ${totalDolares.toFixed(2)} (C$ ${totalDolaresCordobas.toFixed(2)})
• Total Gastos: -C$ ${totalGastos.toFixed(2)}

🎯 *TOTAL NETO DE VENTAS: C$ ${totalFinal.toFixed(2)}*

📌 *Nota:* El fondo inicial (C$ ${fondoInicial.toFixed(2)}) se mantiene separado del cálculo de ventas netas.

_Generado por ARQUEO - Sistema de Gestión Financiera_`;
  };

  const handleWhatsAppShare = async () => {
    try {
      const message = formatWhatsAppMessage();
      const url = `https://wa.me/?text=${encodeURIComponent(message)}`;
      
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
        setCompletedActions(prev => ({ ...prev, whatsapp: true }));
      } else {
        Alert.alert('Error', 'No se pudo abrir WhatsApp. Asegúrese de que esté instalado en su dispositivo.');
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo compartir por WhatsApp');
    }
  };

  const handleSaveRecord = async () => {
    setIsLoading(true);
    try {
      // Parse gastos
      let gastos = [];
      try {
        gastos = params.gastos ? JSON.parse(params.gastos as string) : [];
      } catch (e) {
        gastos = [];
      }

      const arqueoData = {
        tienda: params.tienda,
        responsable: params.responsable,
        fecha: params.fecha,
        fondo_inicial: parseFloat(params.fondoInicial as string) || 0,
        venta_tarjetas: parseFloat(params.ventaTarjetas as string) || 0,
        cordobas_1: parseInt(params.cordobas_1 as string) || 0,
        cordobas_5: parseInt(params.cordobas_5 as string) || 0,
        cordobas_10: parseInt(params.cordobas_10 as string) || 0,
        cordobas_20: parseInt(params.cordobas_20 as string) || 0,
        cordobas_50: parseInt(params.cordobas_50 as string) || 0,
        cordobas_100: parseInt(params.cordobas_100 as string) || 0,
        cordobas_500: parseInt(params.cordobas_500 as string) || 0,
        dolares_1: parseInt(params.dolares_1 as string) || 0,
        dolares_5: parseInt(params.dolares_5 as string) || 0,
        dolares_10: parseInt(params.dolares_10 as string) || 0,
        dolares_20: parseInt(params.dolares_20 as string) || 0,
        dolares_50: parseInt(params.dolares_50 as string) || 0,
        dolares_100: parseInt(params.dolares_100 as string) || 0,
        gastos: gastos,
      };

      const response = await fetch(`${backendUrl}/api/arqueo`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(arqueoData),
      });

      if (response.ok) {
        const result = await response.json();
        setArqueoId(result.id);
        setCompletedActions(prev => ({ ...prev, save: true }));
        Alert.alert('Éxito', 'Registro guardado correctamente');
      } else {
        throw new Error('Error al guardar');
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo guardar el registro. Verifique su conexión e inténtelo de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportPDF = async () => {
    if (!arqueoId) {
      Alert.alert('Error', 'Primero debe guardar el registro para exportar el PDF');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${backendUrl}/api/arqueo/${arqueoId}/pdf`, {
        method: 'POST',
      });

      if (response.ok) {
        const result = await response.json();
        setCompletedActions(prev => ({ ...prev, pdf: true }));
        Alert.alert('Éxito', `PDF generado: ${result.filename}`);
        // Note: In a real app, you'd handle the base64 PDF data here
        // For now, we just mark it as completed
      } else {
        throw new Error('Error al generar PDF');
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo generar el PDF');
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewHistory = () => {
    router.push('/history');
  };

  const handleNewRecord = () => {
    router.replace('/');
  };

  useEffect(() => {
    // Check if all actions are completed
    const { whatsapp, pdf, save } = completedActions;
    if (whatsapp && pdf && save) {
      setShowCompletedModal(true);
      // Auto-hide modal after 3 seconds
      setTimeout(() => {
        setShowCompletedModal(false);
      }, 3000);
    }
  }, [completedActions]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Enviar y Compartir</Text>
          <Text style={styles.stepIndicator}>Paso 7 de 7</Text>
        </View>

        {/* Success Message */}
        <View style={styles.successCard}>
          <Ionicons name="checkmark-circle" size={48} color="#28A745" />
          <Text style={styles.successTitle}>Arqueo Completado</Text>
          <Text style={styles.successSubtitle}>
            Ahora puede compartir, exportar y guardar los resultados
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={[
              styles.actionButton,
              styles.whatsappButton,
              completedActions.whatsapp && styles.actionButtonCompleted
            ]}
            onPress={handleWhatsAppShare}
            disabled={isLoading}
          >
            <Ionicons 
              name={completedActions.whatsapp ? "checkmark-circle" : "logo-whatsapp"} 
              size={24} 
              color="#FFFFFF" 
            />
            <Text style={styles.actionButtonText}>
              {completedActions.whatsapp ? 'Compartido en WhatsApp' : 'Compartir WhatsApp'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.actionButton,
              styles.saveButton,
              completedActions.save && styles.actionButtonCompleted
            ]}
            onPress={handleSaveRecord}
            disabled={isLoading || completedActions.save}
          >
            <Ionicons 
              name={completedActions.save ? "checkmark-circle" : "save-outline"} 
              size={24} 
              color="#FFFFFF" 
            />
            <Text style={styles.actionButtonText}>
              {completedActions.save ? 'Registro Guardado' : 'Guardar Registro'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.actionButton,
              styles.pdfButton,
              completedActions.pdf && styles.actionButtonCompleted,
              !arqueoId && styles.actionButtonDisabled
            ]}
            onPress={handleExportPDF}
            disabled={isLoading || !arqueoId || completedActions.pdf}
          >
            <Ionicons 
              name={completedActions.pdf ? "checkmark-circle" : "document-text-outline"} 
              size={24} 
              color="#FFFFFF" 
            />
            <Text style={styles.actionButtonText}>
              {completedActions.pdf ? 'PDF Exportado' : 'Exportar PDF'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.historyButton]}
            onPress={handleViewHistory}
          >
            <Ionicons name="time-outline" size={24} color="#FFFFFF" />
            <Text style={styles.actionButtonText}>Ver Historial</Text>
          </TouchableOpacity>
        </View>

        {/* New Record Button */}
        <View style={styles.newRecordContainer}>
          <TouchableOpacity
            style={styles.newRecordButton}
            onPress={handleNewRecord}
          >
            <Ionicons name="add-circle-outline" size={24} color="#FFFFFF" />
            <Text style={styles.newRecordButtonText}>NUEVO REGISTRO</Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Diseñado por Levi Rodríguez</Text>
          <Text style={styles.versionText}>Versión 1.0</Text>
        </View>
      </ScrollView>

      {/* Completed Modal */}
      <Modal
        visible={showCompletedModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowCompletedModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Ionicons name="checkmark-circle" size={64} color="#28A745" />
            <Text style={styles.modalTitle}>COMPLETADO</Text>
            <Text style={styles.modalSubtitle}>
              Todas las acciones han sido realizadas exitosamente
            </Text>
          </View>
        </View>
      </Modal>
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
  successCard: {
    backgroundColor: '#1A2040',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    marginBottom: 32,
    borderWidth: 2,
    borderColor: '#28A745',
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 12,
    marginBottom: 8,
  },
  successSubtitle: {
    fontSize: 16,
    color: '#B0B8D4',
    textAlign: 'center',
    lineHeight: 22,
  },
  actionsContainer: {
    marginBottom: 32,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginBottom: 16,
    gap: 12,
  },
  whatsappButton: {
    backgroundColor: '#25D366',
  },
  saveButton: {
    backgroundColor: '#4A9EFF',
  },
  pdfButton: {
    backgroundColor: '#FF6B6B',
  },
  historyButton: {
    backgroundColor: '#9B59B6',
  },
  actionButtonCompleted: {
    backgroundColor: '#28A745',
  },
  actionButtonDisabled: {
    backgroundColor: '#2A3754',
  },
  actionButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  newRecordContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  newRecordButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF9500',
    paddingVertical: 18,
    paddingHorizontal: 32,
    borderRadius: 12,
    gap: 12,
    minWidth: 200,
  },
  newRecordButtonText: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  footer: {
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#7A82A6',
    marginBottom: 5,
  },
  versionText: {
    fontSize: 12,
    color: '#5A6280',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#1A2040',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    marginHorizontal: 40,
    borderWidth: 2,
    borderColor: '#28A745',
  },
  modalTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#28A745',
    marginTop: 16,
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 16,
    color: '#B0B8D4',
    textAlign: 'center',
    lineHeight: 22,
  },
});

export default Step7Screen;