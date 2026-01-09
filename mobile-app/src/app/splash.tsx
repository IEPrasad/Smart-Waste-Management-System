import React, { useEffect, useRef } from 'react';
import { Animated, Dimensions, Easing, StatusBar, StyleSheet, View } from 'react-native';

type Props = {
  duration?: number; // milliseconds
  onFinish?: () => void;
};

export default function Splash({ duration = 5000, onFinish }: Props) {
  const opacity = useRef(new Animated.Value(1)).current;
  const rotateValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Fade out animation
    const timeout = setTimeout(() => {
      Animated.timing(opacity, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }).start(() => onFinish && onFinish());
    }, duration);

    // Rotation animation
    const rotationAnim = Animated.loop(
      Animated.timing(rotateValue, {
        toValue: 1,
        duration: 2000, // 2 seconds per rotation
        useNativeDriver: true,
        easing: Easing.linear,
      })
    );
    rotationAnim.start();

    return () => {
      clearTimeout(timeout);
      rotationAnim.stop();
    };
  }, [duration, onFinish, opacity, rotateValue]);

  const rotate = rotateValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Animated.View pointerEvents="auto" style={[styles.container, { opacity }]}>
      <StatusBar hidden />
      <View style={styles.inner}>
        <Animated.Image
          source={require('../assets/images/logo-icon.png')}
          style={[styles.logo, { transform: [{ rotate }] }]}
        />
      </View>
    </Animated.View>
  );
}

const { width } = Dimensions.get('window');
const logoSize = Math.min(260, Math.floor(width * 0.4));

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#fff',
    zIndex: 9999,
    elevation: 9999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inner: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: logoSize,
    height: logoSize,
    resizeMode: 'contain',
  },
});
