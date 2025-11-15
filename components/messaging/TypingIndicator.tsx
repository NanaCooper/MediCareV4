import React from 'react';
import { View, Animated, StyleSheet } from 'react-native';

export default function TypingIndicator() {
  return (
    <View style={styles.container}>
      <View style={styles.dot} />
      <View style={[styles.dot, { opacity: 0.7 }]} />
      <View style={[styles.dot, { opacity: 0.4 }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', padding: 8, alignItems: 'center' },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#666', marginHorizontal: 4 },
});
