import React from 'react';
import {
  View, Text, TextInput, TouchableOpacity, Modal, 
  KeyboardAvoidingView, Platform, ActivityIndicator, 
  StyleSheet, Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Spacing, BorderRadius, FontSizes, FontWeights } from '../../styles/theme';

interface CreatePostModalProps {
  visible: boolean;
  onClose: () => void;
  newPostText: string;
  onTextChange: (text: string) => void;
  selectedImage: string | null;
  onPickImage: () => void;
  onSubmit: () => void;
  loading: boolean;
}

export const CreatePostModal: React.FC<CreatePostModalProps> = ({
  visible, onClose, newPostText, onTextChange, 
  selectedImage, onPickImage, onSubmit, loading
}) => {
  return (
    <Modal animationType="slide" transparent visible={visible} onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalOuter}>
        <View style={styles.modalSheet}>
          <View style={styles.modalHandle} />
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Share with Community 🌿</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close-circle" size={30} color={Colors.neutral[300]} />
            </TouchableOpacity>
          </View>

          <TextInput
            style={styles.modalInput}
            placeholder="What's your green mission today?"
            placeholderTextColor={Colors.neutral[500]}
            multiline
            value={newPostText}
            onChangeText={onTextChange}
          />

          <TouchableOpacity onPress={onPickImage} style={styles.imagePickBtn}>
            {selectedImage ? (
              <>
                <Image source={{ uri: selectedImage }} style={styles.pickedImg} />
                <Text style={styles.changeImgText}>Image selected — tap to change</Text>
              </>
            ) : (
              <>
                <Ionicons name="image-outline" size={26} color={Colors.primary[500]} />
                <Text style={styles.addImgText}>Add a photo</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.postBtn, (loading || !newPostText.trim()) && { opacity: 0.6 }]} 
            onPress={onSubmit} 
            disabled={loading || !newPostText.trim()}
          >
            <LinearGradient colors={[Colors.primary[900], Colors.primary[500]]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.postBtnGradient}>
              {loading ? (
                <ActivityIndicator color={Colors.neutral[0]} />
              ) : (
                <Text style={styles.postBtnText}>Share to Community</Text>
              )}
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
  imagePickBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    borderWidth: 1.5,
    borderColor: Colors.neutral[200],
    borderStyle: 'dashed',
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    marginBottom: Spacing.md,
  },
  pickedImg: {
    width: 52,
    height: 52,
    borderRadius: BorderRadius.md,
  },
  changeImgText: {
    color: Colors.primary[500],
    fontWeight: FontWeights.bold,
    flex: 1,
    marginLeft: Spacing.md,
  },
  addImgText: {
    color: Colors.neutral[400],
    fontWeight: FontWeights.semibold,
    fontSize: FontSizes.sm,
    marginLeft: Spacing.md,
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
