import React, { useEffect, useMemo, useRef } from 'react';
import { Animated, Dimensions, StatusBar, StyleSheet, View } from 'react-native';

type Props = {
  duration?: number;
  onFinish?: () => void;
};

const BRAND_TEXT = 'Waste Wise';
const { width, height } = Dimensions.get('window');
const logoSize = Math.min(220, Math.floor(width * 0.38));

export default function Splash({ duration = 2500, onFinish }: Props) {
  // Phase 1: Logo drops from top to center
  const logoTranslateY = useRef(new Animated.Value(-height * 0.45)).current;

  // Phase 2: Letter-by-letter scale animation (anime.js ml9 style)
  const letterScales = useMemo(
    () => BRAND_TEXT.split('').map(() => new Animated.Value(0)),
    []
  );

  // Phase 3: Fade out everything
  const containerOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // === Phase 1: Logo drops from top to center with spring bounce ===
    const phase1 = Animated.spring(logoTranslateY, {
      toValue: 0,
      friction: 6,
      tension: 50,
      useNativeDriver: true,
    });

    // === Phase 2: Each letter scales [0 → 1] with elastic spring, staggered delay ===
    const letterAnimations = letterScales.map((scale, i) =>
      Animated.sequence([
        Animated.delay(55 * (i + 1)),
        Animated.spring(scale, {
          toValue: 1,
          friction: 4, // elasticity ~600 equivalent
          tension: 80,
          useNativeDriver: true,
        }),
      ])
    );
    const phase2 = Animated.parallel(letterAnimations);

    // === Phase 3: Fade out ===
    const phase3 = Animated.timing(containerOpacity, {
      toValue: 0,
      duration: 800,
      useNativeDriver: true,
    });

    // Run all phases in sequence
    Animated.sequence([
      phase1,
      Animated.delay(200),
      phase2,
      Animated.delay(1000),
      phase3,
    ]).start(() => {
      onFinish && onFinish();
    });
  }, []);

  return (
    <Animated.View
      pointerEvents="auto"
      style={[styles.container, { opacity: containerOpacity }]}
    >
      <StatusBar hidden />
      <View style={styles.inner}>
        {/* Logo */}
        <Animated.Image
          source={require('../assets/images/logo-icon.png')}
          style={[
            styles.logo,
            { transform: [{ translateY: logoTranslateY }] },
          ]}
        />

        {/* "Waste Wise" letter-by-letter animation */}
        <View style={styles.textRow}>
          {BRAND_TEXT.split('').map((letter, index) => (
            <Animated.Text
              key={index}
              style={[
                letter === ' ' ? styles.space : styles.letter,
                {
                  transform: [{ scale: letterScales[index] }],
                },
              ]}
            >
              {letter}
            </Animated.Text>
          ))}
        </View>
      </View>
    </Animated.View>
  );
}

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
    marginBottom: 20,
  },
  textRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  letter: {
    fontSize: 36,
    fontWeight: '600',
    color: '#2E7D32',
    lineHeight: 42,
  },
  space: {
    width: 12,
  },
});
