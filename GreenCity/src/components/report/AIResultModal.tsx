import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../../theme';

interface AIResultModalProps {
  visible: boolean;
  aiResult: any;
  onClose: () => void;
}

const SEV_COLOR: Record<string, string> = colors.severity as Record<string, string>;

export function AIResultModal({ visible, aiResult, onClose }: AIResultModalProps) {
  if (!aiResult) return null;

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.modalBackdrop}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <LinearGradient colors={[colors.primaryDark, colors.primary]} style={styles.modalHero}>
              <View style={styles.successIcon}>
                <Ionicons name="checkmark-done" size={40} color="white" />
              </View>
              <Text style={styles.modalHeadline}>Great Job!</Text>
              <Text style={styles.modalSubheadline}>Your report has been received</Text>
              
              <View style={styles.rewardCard}>
                <Ionicons name="star" size={18} color="#fbbf24" />
                <Text style={styles.rewardText}>+{aiResult?.pointsEarned || 10} XP EARNED</Text>
              </View>
            </LinearGradient>

            <View style={styles.aiBreakdown}>
              <View style={styles.aiTag}>
                <Ionicons name="hardware-chip" size={12} color={colors.primary} />
                <Text style={styles.aiTagText}>AI ANALYSIS</Text>
              </View>
              
              <View style={styles.aiDetailBox}>
                <Text style={styles.aiResultTitle}>{aiResult?.ai?.category || 'Environmental Issue'}</Text>
                <Text style={styles.aiResultDescription}>
                  {aiResult?.ai?.description || 'Your report has been successfully processed by our AI systems.'}
                </Text>
                
                <View style={styles.aiStatRow}>
                  <View style={styles.aiStat}>
                    <Text style={styles.aiStatLabel}>SEVERITY</Text>
                    <Text style={[styles.aiStatValue, { color: SEV_COLOR[aiResult?.ai?.severity] || colors.primary }]}>
                      {aiResult?.ai?.severity || 'Normal'}
                    </Text>
                  </View>
                  <View style={styles.aiStatDivider} />
                  <View style={styles.aiStat}>
                    <Text style={styles.aiStatLabel}>CONFIDENCE</Text>
                    <Text style={styles.aiStatValue}>{((aiResult?.ai?.confidence || 0.95) * 100).toFixed(0)}%</Text>
                  </View>
                </View>
              </View>
            </View>

            <TouchableOpacity 
              style={styles.modalCloseBtn} 
              onPress={onClose}
            >
              <Text style={styles.modalCloseBtnText}>Continue</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 36,
    overflow: 'hidden',
  },
  modalContent: {
    backgroundColor: 'white',
  },
  modalHero: {
    padding: 40,
    alignItems: 'center',
  },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  modalHeadline: {
    color: 'white',
    fontSize: 28,
    fontWeight: '900',
  },
  modalSubheadline: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 4,
  },
  rewardCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 24,
  },
  rewardText: {
    color: 'white',
    fontWeight: '900',
    fontSize: 14,
    letterSpacing: 1,
  },
  aiBreakdown: {
    padding: 30,
  },
  aiTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 16,
  },
  aiTagText: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 2,
  },
  aiDetailBox: {
    backgroundColor: '#f8fafc',
    borderRadius: 24,
    padding: 20,
  },
  aiResultTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: colors.text,
    marginBottom: 8,
  },
  aiResultDescription: {
    fontSize: 14,
    color: colors.textMuted,
    lineHeight: 22,
    fontWeight: '500',
  },
  aiStatRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  aiStat: {
    flex: 1,
    alignItems: 'center',
  },
  aiStatDivider: {
    width: 1,
    height: 30,
    backgroundColor: '#e2e8f0',
  },
  aiStatLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.textLight,
    marginBottom: 4,
    letterSpacing: 1,
  },
  aiStatValue: {
    fontSize: 16,
    fontWeight: '900',
    color: colors.text,
  },
  modalCloseBtn: {
    margin: 30,
    marginTop: 0,
    backgroundColor: colors.text,
    borderRadius: 20,
    padding: 18,
  },
  modalCloseBtnText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: '900',
    fontSize: 16,
  },
});
