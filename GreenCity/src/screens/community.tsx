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
import { useApi } from '../hooks/api/useApi';
import { showErrorToast, showSuccessToast } from '../components/ui/Toast';

// Types and Components
import { Post, LeaderboardEntry } from '../types/community';
import { CreatePostModal } from '../components/community/CreatePostModal';
import { CommentModal } from '../components/community/CommentModal';
import { PostCard } from '../components/community/PostCard';

import { styles } from "../styles/community";

export default function CommunityScreen() {
  const router = useRouter();
  const { get, post } = useApi();
  
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
        get('/community/posts', { showToast: false }),
        get('/leaderboard?limit=3', { showToast: false }),
      ]);
      if (postsRes.status === 'fulfilled') setPosts(postsRes.value?.data?.posts || []);
      if (lbRes.status === 'fulfilled') setLeaderboard(lbRes.value?.data?.leaderboard || []);
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
      const res = await get(`/community/posts?filter=${tag}`, { showToast: false });
      setPosts(res?.data?.posts || []);
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
      const res = await post(`/community/posts/${postId}/like`, {}, { showToast: false });
      setPosts(posts.map(p => p._id === postId ? { ...p, likes: res?.data?.likes } : p));
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
      await post(`/community/posts/${activePostForComment._id}/comment`, { text: commentText }, { showToast: false });
      setCommentText('');
      setCommentModalVisible(false);
      fetchData();
      showSuccessToast('Comment added successfully!');
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
      await post('/community/posts', formData, { showToast: false });
      setModalVisible(false);
      setNewPostText('');
      setSelectedImage(null);
      fetchData();
      showSuccessToast('Your green story is live! 🌿');
    } catch (e) {
      console.error('create post error', e);
      showErrorToast('Failed to create post');
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
              <Text style={styles.lbSub}>{"This week's eco champions"}</Text>
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

