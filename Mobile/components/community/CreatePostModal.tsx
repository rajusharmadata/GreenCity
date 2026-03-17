import React from 'react';
import {
  View, Text, TextInput, TouchableOpacity, Modal, 
  KeyboardAvoidingView, Platform, ActivityIndicator, 
  StyleSheet, Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

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
          <div style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Share with Community 🌿</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close-circle" size={30} color="#cbd5e1" />
            </TouchableOpacity>
          </div>

          <TextInput
            style={styles.modalInput}
            placeholder="What's your green mission today?"
            placeholderTextColor="#94a3b8"
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
                <Ionicons name="image-outline" size={26} color="#16a34a" />
                <Text style={styles.addImgText}>Add a photo</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.postBtn, (loading || !newPostText.trim()) && { opacity: 0.6 }]} 
            onPress={onSubmit} 
            disabled={loading || !newPostText.trim()}
          >
            <LinearGradient colors={['#14532d', '#16a34a']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.postBtnGradient}>
              {loading ? <ActivityIndicator color="white" /> : <Text style={styles.postBtnText}>Share to Community</Text>}
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
  imagePickBtn: { flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1.5, borderColor: '#e5e7eb', borderStyle: 'dashed', borderRadius: 18, padding: 16, marginBottom: 16 },
  pickedImg: { width: 52, height: 52, borderRadius: 12 },
  changeImgText: { color: '#16a34a', fontWeight: '700', flex: 1 },
  addImgText: { color: '#9ca3af', fontWeight: '600', fontSize: 15 },
  postBtn: { borderRadius: 20, overflow: 'hidden' },
  postBtnGradient: { padding: 18, alignItems: 'center' },
  postBtnText: { color: 'white', fontWeight: '900', fontSize: 16, textTransform: 'uppercase', letterSpacing: 0.5 },
});
