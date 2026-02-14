// toastConfig.tsx
import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, ViewStyle, TextStyle, Platform } from 'react-native';
import { BaseToastProps } from 'react-native-toast-message';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ColorConfig {
  iconName: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  iconBg: string;
  title: string;
  subtitle: string;
  progressBar: string;
  glowColor: string;
  containerBg: string;
}

interface CustomToastProps extends BaseToastProps {
  type: ToastType;
}

interface ToastConfigOptions {
  titleFont?: string;
  subtitleFont?: string;
}

const createToastConfig = (options: ToastConfigOptions = {}) => {
  const { titleFont, subtitleFont } = options;

  const CustomToast: React.FC<CustomToastProps> = ({ text1, text2, type }) => {
    const progress = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(-100)).current;
    const opacity = useRef(new Animated.Value(0)).current;
    const scale = useRef(new Animated.Value(0.9)).current;

    useEffect(() => {
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 45,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.spring(scale, {
          toValue: 1,
          tension: 60,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();

      Animated.timing(progress, {
        toValue: 100,
        duration: 4000,
        useNativeDriver: false,
      }).start();
    }, []);

    const progressWidth = progress.interpolate({
      inputRange: [0, 100],
      outputRange: ['0%', '100%'],
    });

    const config: Record<ToastType, ColorConfig> = {
      success: {
        iconName: 'checkmark-circle',
        iconColor: '#059669',
        iconBg: 'rgba(16, 185, 129, 0.15)',
        title: '#065f46',
        subtitle: 'rgba(6, 95, 70, 0.75)',
        progressBar: '#10b981',
        glowColor: 'rgba(16, 185, 129, 0.2)',
        containerBg: 'rgba(236, 253, 245, 0.95)',
      },
      error: {
        iconName: 'close-circle',
        iconColor: '#dc2626',
        iconBg: 'rgba(239, 68, 68, 0.15)',
        title: '#7f1d1d',
        subtitle: 'rgba(127, 29, 29, 0.75)',
        progressBar: '#ef4444',
        glowColor: 'rgba(239, 68, 68, 0.2)',
        containerBg: 'rgba(254, 242, 242, 0.95)',
      },
      warning: {
        iconName: 'warning',
        iconColor: '#d97706',
        iconBg: 'rgba(245, 158, 11, 0.15)',
        title: '#78350f',
        subtitle: 'rgba(120, 53, 15, 0.75)',
        progressBar: '#f59e0b',
        glowColor: 'rgba(245, 158, 11, 0.2)',
        containerBg: 'rgba(254, 252, 232, 0.95)',
      },
      info: {
        iconName: 'information-circle',
        iconColor: '#2563eb',
        iconBg: 'rgba(59, 130, 246, 0.15)',
        title: '#1e3a8a',
        subtitle: 'rgba(30, 58, 138, 0.75)',
        progressBar: '#3b82f6',
        glowColor: 'rgba(59, 130, 246, 0.2)',
        containerBg: 'rgba(239, 246, 255, 0.95)',
      },
    };

    const colors: ColorConfig = config[type] || config.info;

    return (
      <Animated.View
        style={[
          styles.wrapper,
          {
            opacity,
            transform: [{ translateY: slideAnim }, { scale }],
          },
        ]}
      >
        {Platform.OS === 'ios' ? (
          <BlurView intensity={100} tint="light" style={styles.container}>
            <View style={[styles.overlay, { backgroundColor: colors.containerBg }]} />
            <ToastContent colors={colors} text1={text1} text2={text2} progressWidth={progressWidth} />
          </BlurView>
        ) : (
          <View style={[styles.container, styles.androidBg, { backgroundColor: colors.containerBg }]}>
            <ToastContent colors={colors} text1={text1} text2={text2} progressWidth={progressWidth} />
          </View>
        )}
        
        {/* Glow effect */}
        <View style={[styles.glow, { backgroundColor: colors.glowColor }]} />
      </Animated.View>
    );
  };

  const ToastContent: React.FC<{
    colors: ColorConfig;
    text1?: string;
    text2?: string;
    progressWidth: any;
  }> = ({ colors, text1, text2, progressWidth }) => {
    return (
      <>
  
        <View style={[styles.iconContainer, { backgroundColor: colors.iconBg }]}>
          <Ionicons name={colors.iconName} size={26} color={colors.iconColor} />
        </View>

        <View style={styles.content}>
          <Text 
            style={[
              styles.title, 
              { 
                color: colors.title,
                fontFamily: titleFont,
              }
            ]} 
            numberOfLines={1}
          >
            {text1}
          </Text>
          {text2 && (
            <Text 
              style={[
                styles.subtitle, 
                { 
                  color: colors.subtitle,
                  fontFamily: subtitleFont,
                }
              ]} 
              numberOfLines={2}
            >
              {text2}
            </Text>
          )}
        </View>

        {/* Progress Bar */}
        <View style={styles.progressBg}>
          <Animated.View
            style={[
              styles.progressBar,
              {
                width: progressWidth,
                backgroundColor: colors.progressBar,
              },
            ]}
          />
        </View>
      </>
    );
  };

  return {
    success: (props: BaseToastProps) => <CustomToast {...props} type="success" />,
    error: (props: BaseToastProps) => <CustomToast {...props} type="error" />,
    warning: (props: BaseToastProps) => <CustomToast {...props} type="warning" />,
    info: (props: BaseToastProps) => <CustomToast {...props} type="info" />,
  };
};

export default createToastConfig;

interface Styles {
  wrapper: ViewStyle;
  container: ViewStyle;
  overlay: ViewStyle;
  androidBg: ViewStyle;
  glow: ViewStyle;
  iconContainer: ViewStyle;
  content: ViewStyle;
  title: TextStyle;
  subtitle: TextStyle;
  progressBg: ViewStyle;
  progressBar: ViewStyle;
}

const styles = StyleSheet.create<Styles>({
  wrapper: {
    width: '90%',
    maxWidth: 500,
    marginHorizontal: 20,
  },
  container: {
    minHeight: 70,
    borderRadius: 20,
    paddingVertical: 16,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  androidBg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 14,
  },
  glow: {
    position: 'absolute',
    top: -2,
    left: -2,
    right: -2,
    bottom: -2,
    borderRadius: 22,
    zIndex: -1,
    opacity: 0.5,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  content: {
    flex: 1,
    paddingRight: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 3,
    letterSpacing: 0.3,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 19,
    letterSpacing: 0.1,
    opacity: 0.85,
  },
  progressBg: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: 'rgba(0, 0, 0, 0.06)',
  },
  progressBar: {
    height: '100%',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
  },
});