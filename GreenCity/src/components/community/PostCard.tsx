import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Post } from '../../types/community';

interface PostCardProps {
  post: Post;
  onLike: () => void;
  onComment: () => void;
  onShare: () => void;
}

export function PostCard({ post, onLike, onComment, onShare }: PostCardProps) {
  return (
    <View style={styles.postCard}>
      {/* Author */}
      <View style={styles.postAuthorRow}>
        <Image
          source={{ uri: post.userId?.avatar || `https://i.pravatar.cc/150?u=${post.userId?.email || post._id}` }}
          style={styles.postAvatar}
        />
        <View style={{ flex: 1 }}>
          <Text style={styles.postAuthor}>{post.userId?.name || 'Green Citizen'}</Text>
          <View style={styles.postMetaRow}>
            <Text style={styles.postDate}>{new Date(post.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</Text>
            <View style={styles.postTagDot} />
            <Text style={styles.postTag}>{post.filterTag || 'post'}</Text>
          </View>
        </View>
        <View style={styles.postTagBubble}>
          <Ionicons name="leaf" size={12} color="#16a34a" />
        </View>
      </View>

      {/* Content */}
      <Text style={styles.postText}>{post.text}</Text>
      {post.imageUrl && (
        <Image source={{ uri: post.imageUrl }} style={styles.postImage} resizeMode="cover" />
      )}

      {/* Actions */}
      <View style={styles.postActions}>
        <TouchableOpacity style={styles.postAction} onPress={onLike}>
          <View style={[styles.actionBubble, post.likes?.length > 0 && { backgroundColor: '#fee2e2' }]}>
            <Ionicons name="heart" size={18} color={post.likes?.length > 0 ? '#f43f5e' : '#9ca3af'} />
          </View>
          <Text style={[styles.actionCount, post.likes?.length > 0 && { color: '#f43f5e' }]}>
            {post.likes?.length || 0}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.postAction} onPress={onComment}>
          <View style={styles.actionBubble}>
            <Ionicons name="chatbubble-outline" size={18} color="#9ca3af" />
          </View>
          <Text style={styles.actionCount}>{post.comments?.length || 0}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.postAction, { marginLeft: 'auto' }]} onPress={onShare}>
          <View style={styles.actionBubble}>
            <Ionicons name="share-social-outline" size={18} color="#9ca3af" />
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  postCard: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 24,
    padding: 18,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  postAuthorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  postAvatar: {
    width: 44,
    height: 44,
    borderRadius: 15,
    backgroundColor: '#f1f5f9',
  },
  postAuthor: {
    fontSize: 14,
    fontWeight: '900',
    color: '#111827',
  },
  postMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  postDate: {
    fontSize: 11,
    color: '#9ca3af',
    fontWeight: '600',
  },
  postTagDot: {
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor: '#cbd5e1',
  },
  postTag: {
    fontSize: 11,
    color: '#16a34a',
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  postTagBubble: {
    backgroundColor: '#f0fdf4',
    padding: 8,
    borderRadius: 12,
  },
  postText: {
    fontSize: 15,
    color: '#374151',
    lineHeight: 22,
    marginBottom: 12,
  },
  postImage: {
    width: '100%',
    height: 200,
    borderRadius: 18,
    marginBottom: 12,
  },
  postActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    borderTopWidth: 1,
    borderTopColor: '#f8fafc',
    paddingTop: 12,
  },
  postAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionBubble: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#f8fafc',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionCount: {
    fontSize: 13,
    fontWeight: '700',
    color: '#9ca3af',
  },
});
