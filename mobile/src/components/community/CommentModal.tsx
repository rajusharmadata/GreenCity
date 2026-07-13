import React from 'react';
import {
  View, Text, TextInput, TouchableOpacity, Modal, 
  KeyboardAvoidingView, Platform, StyleSheet
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

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
              <Ionicons name="close-circle" size={30} color="#cbd5e1" />
            </TouchableOpacity>
          </View>

          <TextInput
            style={styles.modalInput}
            placeholder="What's on your mind?"
            placeholderTextColor="#94a3b8"
            multiline
            value={commentText}
            onChangeText={onTextChange}
          />

          <TouchableOpacity 
            style={[styles.postBtn, !commentText.trim() && { opacity: 0.6 }]} 
            onPress={onSubmit} 
            disabled={!commentText.trim()}
          >
            <LinearGradient colors={['#14532d', '#16a34a']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.postBtnGradient}>
              <Text style={styles.postBtnText}>Post Comment</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOuter: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.45)' },
  modalSheet: { backgroundColor: 'white', borderTopLeftRadius: 36, borderTopRightRadius: 36, padding: 24, paddingBottom: 36 },
  modalHandle: { width: 40, height: 4, backgroundColor: '#e5e7eb', borderRadius: 4, alignSelf: 'center', marginBottom: 16 },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  modalTitle: { fontSize: 20, fontWeight: '900', color: '#111827' },
  modalInput: { backgroundColor: '#f8fafc', borderRadius: 20, padding: 18, fontSize: 16, color: '#111827', height: 130, textAlignVertical: 'top', marginBottom: 12 },
  postBtn: { borderRadius: 20, overflow: 'hidden' },
  postBtnGradient: { padding: 18, alignItems: 'center' },
  postBtnText: { color: 'white', fontWeight: '900', fontSize: 16, textTransform: 'uppercase', letterSpacing: 0.5 },
});
