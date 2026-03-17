import React, { useState, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, Image,
  ActivityIndicator, RefreshControl,
  Alert, StyleSheet, Share
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { useRouter, useFocusEffect } from 'expo-router';
import api from '../../utils/api';

// Types and Components
import { Post, LeaderboardEntry } from '../../types/community';
import { CreatePostModal } from '../../components/community/CreatePostModal';
import { CommentModal } from '../../components/community/CommentModal';

export default function CommunityScreen() {
  const router = useRouter();
  
  // State with proper types
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  
  // Modal states
  const [modalVisible, setModalVisible] = useState(false);
  const [newPostText, setNewPostText] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  
  const [commentModalVisible, setCommentModalVisible] = useState(false);
  const [activePostForComment, setActivePostForComment] = useState<Post | null>(null);
  const [commentText, setCommentText] = useState('');
  
  const [activeTag, setActiveTag] = useState('all');
  const [tagList] = useState(['all', 'eco-tips', 'reports', 'events']);

  const fetchData = async () => {
    try {
      const [postsRes, lbRes] = await Promise.allSettled([
        api.get('/community/posts'),
        api.get('/leaderboard?limit=3'),
      ]);
      if (postsRes.status === 'fulfilled') setPosts(postsRes.value.data.posts || []);
      if (lbRes.status === 'fulfilled') setLeaderboard(lbRes.value.data.leaderboard || []);
    } catch (e) {
      console.error('community fetch error', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchPostsByTag = async (tag: string) => {
    setLoading(true);
    setActiveTag(tag);
    try {
      const res = await api.get(`/community/posts?filter=${tag}`);
      setPosts(res.data.posts || []);
    } catch (e) {
      console.error('fetch by tag error', e);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(useCallback(() => { fetchData(); }, []));
  const onRefresh = () => { setRefreshing(true); fetchData(); };

  const handleLike = async (postId: string) => {
    try {
      const res = await api.post(`/community/posts/${postId}/like`);
      setPosts(posts.map(p => p._id === postId ? { ...p, likes: res.data.likes } : p));
    } catch (e) { console.error('like error', e); }
  };

  const handleShare = async (post: Post) => {
    try {
      await Share.share({
        message: `${post.text}\n\nShared from GreenCity App 🌿`,
        url: post.imageUrl || undefined,
      });
    } catch (e) { console.error('share error', e); }
  };

  const handleAddComment = async () => {
    if (!commentText.trim() || !activePostForComment) return;
    try {
      await api.post(`/community/posts/${activePostForComment._id}/comment`, { text: commentText });
      setCommentText('');
      setCommentModalVisible(false);
      fetchData();
      Alert.alert('Commented!', 'Your thought is shared.');
    } catch (e) { console.error('comment error', e); }
  };

  const pickPostImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images, 
      allowsEditing: true, 
      aspect: [16, 9], 
      quality: 0.7,
    });
    if (!result.canceled && result.assets?.length > 0) setSelectedImage(result.assets[0].uri);
  };

  const handleCreatePost = async () => {
    if (!newPostText.trim()) { Alert.alert('Empty post', 'Share something!'); return; }
    setCreating(true);
    try {
      const formData = new FormData();
      formData.append('text', newPostText);
      formData.append('filterTag', 'all');
      if (selectedImage) {
        const filename = selectedImage.split('/').pop() || 'post.jpg';
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : 'image';
        // @ts-ignore
        formData.append('image', { uri: selectedImage, name: filename, type });
      }
      await api.post('/community/posts', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      setModalVisible(false);
      setNewPostText('');
      setSelectedImage(null);
      fetchData();
      Alert.alert('Posted! 🌿', 'Your green story is live.');
    } catch (e: any) {
      Alert.alert('Error', e.response?.data?.error || 'Failed to create post');
    } finally {
      setCreating(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient colors={['#14532d', '#16a34a']} style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Community</Text>
          <Text style={styles.headerSub}>Join the green movement</Text>
        </View>
        <TouchableOpacity style={styles.headerBtn}>
          <Ionicons name="notifications" size={22} color="white" />
        </TouchableOpacity>
      </LinearGradient>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#16a34a" />}
      >
        {/* Mini Leaderboard */}
        <View style={styles.lbCard}>
          <LinearGradient colors={['#0f172a', '#1e293b']} style={[StyleSheet.absoluteFill, { borderRadius: 28 }]} />
          <View style={styles.lbHeader}>
            <View>
              <Text style={styles.lbTitle}>🏆 Top Leaders</Text>
              <Text style={styles.lbSub}>This week's eco champions</Text>
            </View>
            <TouchableOpacity style={styles.lbSeeAll} onPress={() => router.push('/leaderboard')}>
              <Text style={styles.lbSeeAllText}>See All</Text>
              <Ionicons name="arrow-forward" size={14} color="#22c55e" />
            </TouchableOpacity>
          </View>
          {leaderboard.length === 0 ? (
            <Text style={styles.lbEmpty}>No leaders yet — be the first!</Text>
          ) : (
            leaderboard.map((user, i) => (
              <View key={user._id || i} style={styles.lbRow}>
                <Text style={styles.lbRank}>{['🥇', '🥈', '🥉'][i] || `#${i + 1}`}</Text>
                <Image
                  source={{ uri: user.avatar || `https://i.pravatar.cc/150?u=${user.userId}` }}
                  style={styles.lbAvatar}
                />
                <View style={{ flex: 1 }}>
                  <Text style={styles.lbName}>{user.username || 'Eco Hero'}</Text>
                  <Text style={styles.lbTier}>{user.tier || 'Eco Newcomer'}</Text>
                </View>
                <Text style={styles.lbPts}>{user.points} pts</Text>
              </View>
            ))
          )}
        </View>

        {/* Tag Filters */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.tagsScroll}
          contentContainerStyle={styles.tagsContainer}
        >
          {tagList.map(tag => (
            <TouchableOpacity
              key={tag}
              onPress={() => fetchPostsByTag(tag)}
              style={[styles.tagItem, activeTag === tag && styles.tagItemActive]}
            >
              <Text style={[styles.tagText, activeTag === tag && styles.tagTextActive]}>
                {tag.toUpperCase()}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Feed label */}
        <View style={styles.feedLabelRow}>
          <Text style={styles.feedLabel}>ACTIVITY FEED</Text>
          <Text style={styles.feedCount}>{posts.length} posts</Text>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#16a34a" style={{ marginTop: 24 }} />
        ) : posts.length === 0 ? (
          <View style={styles.emptyFeed}>
            <Ionicons name="leaf-outline" size={52} color="#bbf7d0" />
            <Text style={styles.emptyFeedTitle}>No posts yet</Text>
            <Text style={styles.emptyFeedSub}>Be the first to share your green mission!</Text>
          </View>
        ) : (
          posts.map(post => (
            <PostCard
              key={post._id}
              post={post}
              onLike={() => handleLike(post._id)}
              onComment={() => { setActivePostForComment(post); setCommentModalVisible(true); }}
              onShare={() => handleShare(post)}
            />
          ))
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity style={styles.fab} onPress={() => setModalVisible(true)}>
        <LinearGradient colors={['#16a34a', '#22c55e']} style={styles.fabGradient}>
          <Ionicons name="create" size={28} color="white" />
        </LinearGradient>
      </TouchableOpacity>

      {/* Comment Modal */}
      <CommentModal
        visible={commentModalVisible}
        onClose={() => setCommentModalVisible(false)}
        commentText={commentText}
        onTextChange={setCommentText}
        onSubmit={handleAddComment}
      />

      {/* Create Post Modal */}
      <CreatePostModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        newPostText={newPostText}
        onTextChange={setNewPostText}
        selectedImage={selectedImage}
        onPickImage={pickPostImage}
        onSubmit={handleCreatePost}
        loading={creating}
      />
    </View>
  );
}

function PostCard({ post, onLike, onComment, onShare }: { post: Post; onLike: () => void; onComment: () => void; onShare: () => void }) {
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
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { paddingTop: 56, paddingBottom: 20, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerTitle: { color: 'white', fontSize: 28, fontWeight: '900' },
  headerSub: { color: 'rgba(255,255,255,0.75)', fontSize: 12, fontWeight: '600', marginTop: 3 },
  headerBtn: { backgroundColor: 'rgba(255,255,255,0.2)', padding: 10, borderRadius: 16 },
  lbCard: { margin: 16, borderRadius: 28, padding: 20, overflow: 'hidden', position: 'relative' },
  lbHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  lbTitle: { color: 'white', fontSize: 17, fontWeight: '900' },
  lbSub: { color: 'rgba(255,255,255,0.5)', fontSize: 11, marginTop: 2 },
  lbSeeAll: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(34,197,94,0.15)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  lbSeeAllText: { color: '#22c55e', fontWeight: '700', fontSize: 12 },
  lbEmpty: { color: 'rgba(255,255,255,0.4)', textAlign: 'center', paddingVertical: 12 },
  lbRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 8, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.06)' },
  lbRank: { fontSize: 22, width: 32, textAlign: 'center' },
  lbAvatar: { width: 38, height: 38, borderRadius: 12, borderWidth: 2, borderColor: 'rgba(255,255,255,0.2)' },
  lbName: { color: 'white', fontWeight: '800', fontSize: 13 },
  lbTier: { color: 'rgba(255,255,255,0.45)', fontSize: 11, fontWeight: '600', marginTop: 1 },
  lbPts: { color: '#22c55e', fontWeight: '900', fontSize: 14 },
  feedLabelRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, marginBottom: 8, marginTop: 16 },
  feedLabel: { fontSize: 10, fontWeight: '800', color: '#94a3b8', letterSpacing: 2, textTransform: 'uppercase' },
  feedCount: { fontSize: 12, fontWeight: '700', color: '#16a34a' },
  tagsScroll: { paddingHorizontal: 16, marginBottom: 4 },
  tagsContainer: { gap: 10, paddingRight: 32 },
  tagItem: { backgroundColor: 'white', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 14, borderWidth: 1, borderColor: '#e2e8f0' },
  tagItemActive: { backgroundColor: '#16a34a', borderColor: '#16a34a' },
  tagText: { fontSize: 11, fontWeight: '800', color: '#64748b' },
  tagTextActive: { color: 'white' },
  emptyFeed: { alignItems: 'center', paddingVertical: 48, gap: 10 },
  emptyFeedTitle: { fontSize: 18, fontWeight: '900', color: '#374151' },
  emptyFeedSub: { color: '#9ca3af', textAlign: 'center', fontSize: 14 },
  fab: { position: 'absolute', bottom: 28, right: 20, borderRadius: 30, shadowColor: '#16a34a', shadowOpacity: 0.5, shadowRadius: 14, shadowOffset: { width: 0, height: 6 }, elevation: 10 },
  fabGradient: { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center' },
  postCard: { backgroundColor: 'white', marginHorizontal: 16, marginBottom: 12, borderRadius: 24, padding: 18, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, elevation: 2 },
  postAuthorRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  postAvatar: { width: 44, height: 44, borderRadius: 15, backgroundColor: '#f1f5f9' },
  postAuthor: { fontSize: 14, fontWeight: '900', color: '#111827' },
  postMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 },
  postDate: { fontSize: 11, color: '#9ca3af', fontWeight: '600' },
  postTagDot: { width: 3, height: 3, borderRadius: 2, backgroundColor: '#cbd5e1' },
  postTag: { fontSize: 11, color: '#16a34a', fontWeight: '700', textTransform: 'capitalize' },
  postTagBubble: { backgroundColor: '#f0fdf4', padding: 8, borderRadius: 12 },
  postText: { fontSize: 15, color: '#374151', lineHeight: 22, marginBottom: 12 },
  postImage: { width: '100%', height: 200, borderRadius: 18, marginBottom: 12 },
  postActions: { flexDirection: 'row', alignItems: 'center', gap: 16, borderTopWidth: 1, borderTopColor: '#f8fafc', paddingTop: 12 },
  postAction: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  actionBubble: { width: 36, height: 36, borderRadius: 12, backgroundColor: '#f8fafc', alignItems: 'center', justifyContent: 'center' },
  actionCount: { fontSize: 13, fontWeight: '700', color: '#9ca3af' },
});
