import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Image, Animated, Dimensions } from 'react-native';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

const { width, height } = Dimensions.get('window');

const WelcomeScreen = () => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    // Logo animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: true,
      }),
    ]).start();

    // Navigate to wizard after 4 seconds
    const timer = setTimeout(() => {
      router.replace('/wizard/step1');
    }, 4000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      {/* Background Gradient Effect */}
      <View style={styles.gradientBackground} />
      
      <View style={styles.content}>
        {/* Logo */}
        <Animated.View 
          style={[
            styles.logoContainer,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }]
            }
          ]}
        >
          <Image
            source={{ uri: 'https://customer-assets.emergentagent.com/job_cash-flow-mobile/artifacts/nn5126wi_1760107880526.png' }}
            style={styles.logo}
            resizeMode="contain"
          />
        </Animated.View>

        {/* Title and Subtitle */}
        <Animated.View 
          style={[
            styles.textContainer,
            { opacity: fadeAnim }
          ]}
        >
          <Text style={styles.title}>ARQUEO</Text>
          <Text style={styles.subtitle}>Sistema de Gestión Financiera</Text>
        </Animated.View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Diseñado por Levi Rodríguez</Text>
          <Text style={styles.versionText}>Versión 1.0</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0E27',
  },
  gradientBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#0A0E27',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: height * 0.15,
    paddingBottom: 50,
    paddingHorizontal: 20,
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: width * 0.4,
    height: width * 0.4,
    marginBottom: 30,
  },
  textContainer: {
    alignItems: 'center',
    marginTop: -height * 0.1,
  },
  title: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 3,
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: '#B0B8D4',
    textAlign: 'center',
    lineHeight: 24,
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
});

export default WelcomeScreen;