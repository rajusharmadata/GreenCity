import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  heroWrap: { position: 'relative', paddingBottom: 0 },
  heroBg: { position: 'absolute', top: 0, left: 0, right: 0, height: 200 },
  heroContent: { alignItems: 'center', paddingTop: 60, paddingHorizontal: 20, paddingBottom: 24 },
  avatarWrap: { 
    width: 110, 
    height: 110, 
    borderRadius: 35, 
    borderWidth: 4, 
    borderColor: 'white', 
    overflow: 'hidden', 
    shadowColor: '#000', 
    shadowOpacity: 0.2, 
    shadowRadius: 10, 
    elevation: 8, 
    marginBottom: 14, 
    position: 'relative' 
  },
  avatarOverlay: { 
    ...StyleSheet.absoluteFill, 
    backgroundColor: 'rgba(255,255,255,0.7)', 
    alignItems: 'center', 
    justifyContent: 'center', 
    zIndex: 10 
  },
  avatar: { width: '100%', height: '100%' },
  cameraIcon: { 
    position: 'absolute', 
    bottom: 6, 
    right: 6, 
    backgroundColor: '#16a34a', 
    padding: 6, 
    borderRadius: 10, 
    borderWidth: 2, 
    borderColor: 'white' 
  },
  userName: { 
    color: 'white', 
    fontSize: 26, 
    fontWeight: '900', 
    textAlign: 'center' 
  },
  userEmail: { 
    color: 'rgba(255,255,255,0.75)', 
    fontSize: 13, 
    fontWeight: '500', 
    marginTop: 3 
  },
  tierBadge: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 6, 
    paddingHorizontal: 14, 
    paddingVertical: 6, 
    borderRadius: 20, 
    borderWidth: 1, 
    marginTop: 10, 
    marginBottom: 16 
  },
  tierEmoji: { fontSize: 16 },
  tierText: { fontWeight: '800', fontSize: 13 },
  statsRow: { 
    flexDirection: 'row', 
    backgroundColor: 'white', 
    borderRadius: 24, 
    paddingVertical: 18, 
    paddingHorizontal: 10, 
    width: '100%', 
    shadowColor: '#000', 
    shadowOpacity: 0.08, 
    shadowRadius: 12, 
    elevation: 4 
  },
  statItem: { flex: 1, alignItems: 'center' },
  statValue: { 
    fontSize: 24, 
    fontWeight: '900', 
    color: '#111827' 
  },
  statLabel: { 
    fontSize: 10, 
    fontWeight: '700', 
    color: '#9ca3af', 
    textTransform: 'uppercase', 
    marginTop: 2 
  },
  statDivider: { width: 1, backgroundColor: '#f1f5f9' },
  body: { padding: 16, gap: 4 },
  nextBadgeCard: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: 'white', 
    borderRadius: 22, 
    padding: 16, 
    gap: 14, 
    marginBottom: 10, 
    shadowColor: '#000', 
    shadowOpacity: 0.05, 
    shadowRadius: 8, 
    elevation: 2 
  },
  nextBadgeIcon: { 
    width: 52, 
    height: 52, 
    borderRadius: 16, 
    alignItems: 'center', 
    justifyContent: 'center' 
  },
  nextBadgeLabel: { 
    fontSize: 9, 
    fontWeight: '800', 
    color: '#94a3b8', 
    letterSpacing: 2, 
    textTransform: 'uppercase' 
  },
  nextBadgeName: { 
    fontSize: 15, 
    fontWeight: '900', 
    color: '#111827', 
    marginTop: 2 
  },
  nextBadgePts: { 
    fontSize: 12, 
    color: '#16a34a', 
    fontWeight: '700', 
    marginTop: 2 
  },
  sectionHeader: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    marginTop: 16, 
    marginBottom: 10 
  },
  sectionTitle: { 
    fontSize: 18, 
    fontWeight: '900', 
    color: '#111827', 
    marginTop: 16, 
    marginBottom: 10 
  },
  sectionLink: { 
    color: '#16a34a', 
    fontWeight: '700', 
    fontSize: 13 
  },
  badgesScroll: { marginBottom: 8 },
  badgeCard: { 
    padding: 16, 
    borderRadius: 22, 
    alignItems: 'center', 
    marginRight: 10, 
    minWidth: 90 
  },
  badgeEmoji: { fontSize: 32, marginBottom: 6 },
  badgeName: { 
    fontSize: 11, 
    fontWeight: '800', 
    color: '#111827', 
    textAlign: 'center' 
  },
  actionsGrid: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    gap: 10 
  },
  settingsCard: { 
    backgroundColor: 'white', 
    borderRadius: 24, 
    overflow: 'hidden', 
    shadowColor: '#000', 
    shadowOpacity: 0.04, 
    shadowRadius: 6, 
    elevation: 2 
  },
  menuItem: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingVertical: 14, 
    paddingHorizontal: 16, 
    borderBottomWidth: 1, 
    borderBottomColor: '#f1f5f9' 
  },
  menuIcon: { 
    width: 40, 
    height: 40, 
    borderRadius: 12, 
    alignItems: 'center', 
    justifyContent: 'center', 
    marginRight: 12 
  },
  menuTitle: { 
    flex: 1, 
    fontSize: 15, 
    fontWeight: '700', 
    color: '#111827' 
  },
});
