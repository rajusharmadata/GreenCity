import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Colors, Spacing, BorderRadius } from '../../styles/theme';

export function IssueCardSkeleton() {
  return (
    <View style={[styles.issueCard, styles.skeletonCard]}>
      <View style={[styles.issueImage, styles.skeletonBlock]} />
      <View style={{ flex: 1, marginLeft: Spacing.md, gap: 8 }}>
        <View style={[styles.skeletonBlock, { height: 14, width: '70%', borderRadius: 6 }]} />
        <View style={[styles.skeletonBlock, { height: 11, width: '45%', borderRadius: 6 }]} />
        <View style={[styles.skeletonBlock, { height: 18, width: '35%', borderRadius: 8 }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  issueCard: {
    backgroundColor: Colors.neutral[0],
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius['3xl'],
    marginBottom: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.neutral[100],
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  skeletonCard: { shadowOpacity: 0, elevation: 0 },
  skeletonBlock: { backgroundColor: Colors.neutral[100] },
  issueImage: {
    width: 72,
    height: 72,
    borderRadius: BorderRadius.xl,
    backgroundColor: Colors.neutral[100],
  },
});
