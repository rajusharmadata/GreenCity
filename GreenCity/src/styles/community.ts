import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { 
    paddingTop: 56, 
    paddingBottom: 20, 
    paddingHorizontal: 20, 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between' 
  },
  headerTitle: { 
    color: 'white', 
    fontSize: 28, 
    fontWeight: '900' 
  },
  headerSub: { 
    color: 'rgba(255,255,255,0.75)', 
    fontSize: 12, 
    fontWeight: '600', 
    marginTop: 3 
  },
  headerBtn: { 
    backgroundColor: 'rgba(255,255,255,0.2)', 
    padding: 10, 
    borderRadius: 16 
  },
  lbCard: { 
    margin: 16, 
    borderRadius: 28, 
    padding: 20, 
    overflow: 'hidden', 
    position: 'relative' 
  },
  lbHeader: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    marginBottom: 16 
  },
  lbTitle: { 
    color: 'white', 
    fontSize: 17, 
    fontWeight: '900' 
  },
  lbSub: { 
    color: 'rgba(255,255,255,0.5)', 
    fontSize: 11, 
    marginTop: 2 
  },
  lbSeeAll: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 4, 
    backgroundColor: 'rgba(34,197,94,0.15)', 
    paddingHorizontal: 12, 
    paddingVertical: 6, 
    borderRadius: 12 
  },
  lbSeeAllText: { 
    color: '#22c55e', 
    fontWeight: '700', 
    fontSize: 12 
  },
  lbEmpty: { 
    color: 'rgba(255,255,255,0.4)', 
    textAlign: 'center', 
    paddingVertical: 12 
  },
  lbRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 12, 
    paddingVertical: 8, 
    borderTopWidth: 1, 
    borderTopColor: 'rgba(255,255,255,0.06)' 
  },
  lbRank: { 
    fontSize: 22, 
    width: 32, 
    textAlign: 'center' 
  },
  lbAvatar: { 
    width: 38, 
    height: 38, 
    borderRadius: 12, 
    borderWidth: 2, 
    borderColor: 'rgba(255,255,255,0.2)' 
  },
  lbName: { 
    color: 'white', 
    fontWeight: '800', 
    fontSize: 13 
  },
  lbTier: { 
    color: 'rgba(255,255,255,0.45)', 
    fontSize: 11, 
    fontWeight: '600', 
    marginTop: 1 
  },
  lbPts: { 
    color: '#22c55e', 
    fontWeight: '900', 
    fontSize: 14 
  },
  feedLabelRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    paddingHorizontal: 16, 
    marginBottom: 8, 
    marginTop: 16 
  },
  feedLabel: { 
    fontSize: 10, 
    fontWeight: '800', 
    color: '#94a3b8', 
    letterSpacing: 2, 
    textTransform: 'uppercase' 
  },
  feedCount: { 
    fontSize: 12, 
    fontWeight: '700', 
    color: '#16a34a' 
  },
  tagsScroll: { 
    paddingHorizontal: 16, 
    marginBottom: 4 
  },
  tagsContainer: { 
    gap: 10, 
    paddingRight: 32 
  },
  tagItem: { 
    backgroundColor: 'white', 
    paddingHorizontal: 16, 
    paddingVertical: 8, 
    borderRadius: 14, 
    borderWidth: 1, 
    borderColor: '#e2e8f0' 
  },
  tagItemActive: { 
    backgroundColor: '#16a34a', 
    borderColor: '#16a34a' 
  },
  tagText: { 
    fontSize: 11, 
    fontWeight: '800', 
    color: '#64748b' 
  },
  tagTextActive: { 
    color: 'white' 
  },
  emptyFeed: { 
    alignItems: 'center', 
    paddingVertical: 48, 
    gap: 10 
  },
  emptyFeedTitle: { 
    fontSize: 18, 
    fontWeight: '900', 
    color: '#374151' 
  },
  emptyFeedSub: { 
    color: '#9ca3af', 
    textAlign: 'center', 
    fontSize: 14 
  },
  fab: { 
    position: 'absolute', 
    bottom: 28, 
    right: 20, 
    borderRadius: 30, 
    shadowColor: '#16a34a', 
    shadowOpacity: 0.5, 
    shadowRadius: 14, 
    shadowOffset: { width: 0, height: 6 }, 
    elevation: 10 
  },
  fabGradient: { 
    width: 64, 
    height: 64, 
    borderRadius: 32, 
    alignItems: 'center', 
    justifyContent: 'center' 
  },
});
