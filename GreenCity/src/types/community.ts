export interface User {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  bio?: string;
  location?: string;
  tier?: string;
  points?: number;
  rank?: number;
  badges?: string[];
  reportsCount?: number;
  resolvedCount?: number;
  isEmailVerified: boolean;
  createdAt?: string;
}

export interface Comment {
  _id: string;
  userId: User | string;
  text: string;
  createdAt: string;
}

export interface Post {
  _id: string;
  userId: User;
  text: string;
  imageUrl?: string;
  filterTag?: string;
  likes: string[]; // Set of user IDs
  comments: Comment[];
  createdAt: string;
  updatedAt: string;
}

export interface LeaderboardEntry {
  _id: string;
  userId: string;
  username: string;
  avatar?: string;
  points: number;
  tier: string;
  rank?: number;
}
