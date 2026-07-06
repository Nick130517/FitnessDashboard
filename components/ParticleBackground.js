import { useEffect, useRef } from 'react';
import { Animated, Dimensions, Easing, StyleSheet, View } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const EDGE_MARGIN = 20; // keep particles from spawning flush against the very edge

function randomCoord(max) {
  return EDGE_MARGIN + Math.random() * (max - EDGE_MARGIN * 2);
}

function generateParticles(count) {
  const particles = [];
  for (let i = 0; i < count; i++) {
    particles.push({
      id: i,
      startX: randomCoord(SCREEN_WIDTH),
      startY: randomCoord(SCREEN_HEIGHT),
      size: 3 + Math.random() * 5, // 3–8px
    });
  }
  return particles;
}

function Particle({ config }) {
  const x = useRef(new Animated.Value(config.startX)).current;
  const y = useRef(new Animated.Value(config.startY)).current;
  const opacity = useRef(new Animated.Value(0.5 + Math.random() * 0.3)).current;

  useEffect(() => {
    let active = true;

    const wander = () => {
      if (!active) return;

      const nextX = randomCoord(SCREEN_WIDTH);
      const nextY = randomCoord(SCREEN_HEIGHT);
      const nextOpacity = 0.4 + Math.random() * 0.5;

      // Speed scales with distance, plus its own randomness, so nothing feels
      // uniform or patterned. Slower and floatier than a straight linear drift.
      const distance = Math.hypot(nextX - x._value, nextY - y._value);
      const duration = 2200 + distance * 7 + Math.random() * 1500;

      Animated.parallel([
        Animated.timing(x, {
          toValue: nextX,
          duration,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(y, {
          toValue: nextY,
          duration,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: nextOpacity,
          duration,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]).start(({ finished }) => {
        if (finished) wander();
      });
    };

    wander();
    return () => {
      active = false;
    };
  }, [x, y, opacity]);

  return (
    <Animated.View
      style={[
        styles.particleWrapper,
        {
          transform: [{ translateX: x }, { translateY: y }],
          opacity,
        },
      ]}
    >
      <View
        style={[
          styles.glow,
          {
            width: config.size * 4,
            height: config.size * 4,
            borderRadius: config.size * 2,
          },
        ]}
      />
      <View
        style={[
          styles.core,
          {
            width: config.size,
            height: config.size,
            borderRadius: config.size / 2,
          },
        ]}
      />
    </Animated.View>
  );
}

export default function ParticleBackground({ count = 18 }) {
  const particles = useRef(generateParticles(count)).current;

  return (
    <View style={styles.container} pointerEvents="none">
      {particles.map((p) => (
        <Particle key={p.id} config={p} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  particleWrapper: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  glow: {
    position: 'absolute',
    backgroundColor: '#2E2E34',
    opacity: 0.5,
    shadowColor: '#2E2E34',
    shadowOpacity: 0.9,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 0 },
  },
  core: {
    backgroundColor: '#2E2E34',
  },
});