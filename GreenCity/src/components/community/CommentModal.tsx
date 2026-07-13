import React from 'react';
import {
  View, Text, TextInput, TouchableOpacity, Modal, 
  KeyboardAvoidingView, Platform, StyleSheet
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Spacing, BorderRadius, FontSizes, FontWeights } from '../../styles/theme';

interface CommentModalProps {
  visible: boolean;
  onClose: () => void;
  commentText: string;
  onTextChange: (text: string) => void;
  onSubmit: () => void;
}

export const CommentModal: React.FC<CommentModalProps> = ({
  visible, onClose, commentText, onTextChange, onSubmit
}) => {
  return (
    <Modal animationType="slide" transparent visible={visible} onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalOuter}>
        <View style={styles.modalSheet}>
          <View style={styles.modalHandle} />
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Add Comment 💬</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close-circle" size={30} color={Colors.neutral[300]} />
            </TouchableOpacity>
          </View>

          <TextInput
            style={styles.modalInput}
            placeholder="What's on your mind?"
            placeholderTextColor={Colors.neutral[500]}
            multiline
            value={commentText}
            onChangeText={onTextChange}
          />

          <TouchableOpacity 
            style={[styles.postBtn, !commentText.trim() && { opacity: 0.6 }]} 
            onPress={onSubmit} 
            disabled={!commentText.trim()}
          >
            <LinearGradient colors={[Colors.primary[900], Colors.primary[500]]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.postBtnGradient}>
              <Text style={styles.postBtnText}>Post Comment</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOuter: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: Colors.overlay,
  },
  modalSheet: {
    backgroundColor: Colors.backgroundAlt,
    borderTopLeftRadius: BorderRadius['3xl'],
    borderTopRightRadius: BorderRadius['3xl'],
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    paddingBottom: Spacing['2xl'],
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: Colors.neutral[200],
    borderRadius: BorderRadius.sm,
    alignSelf: 'center',
    marginBottom: Spacing.md,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  modalTitle: {
    fontSize: FontSizes.xl,
    fontWeight: FontWeights.extrabold,
    color: Colors.neutral[900],
  },
  modalInput: {
    backgroundColor: Colors.neutral[50],
    borderRadius: BorderRadius.xl,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    fontSize: FontSizes.base,
    color: Colors.neutral[900],
    height: 130,
    textAlignVertical: 'top',
    marginBottom: Spacing.md,
  },
  postBtn: {
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
  },
  postBtnGradient: {
    paddingVertical: Spacing.md,
    alignItems: 'center',
  },
  postBtnText: {
    color: Colors.neutral[0],
    fontWeight: FontWeights.extrabold,
    fontSize: FontSizes.base,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
