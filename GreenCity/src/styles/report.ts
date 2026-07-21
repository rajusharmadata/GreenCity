import { StyleSheet } from 'react-native';
import { colors } from '../theme';

export const reportStyles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { 
    paddingTop: 60, 
    paddingBottom: 30, 
    paddingHorizontal: 24, 
    borderBottomLeftRadius: 30, 
    borderBottomRightRadius: 30 
  },
  headerContent: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between' 
  },
  headerTitle: { 
    color: 'white', 
    fontSize: 32, 
    fontWeight: '900', 
    letterSpacing: -0.5 
  },
  headerSub: { 
    color: 'rgba(255,255,255,0.8)', 
    fontSize: 14, 
    fontWeight: '600', 
    marginTop: 2 
  },
  headerIcon: { 
    width: 50, 
    height: 50, 
    borderRadius: 25, 
    backgroundColor: 'rgba(255,255,255,0.2)', 
    alignItems: 'center', 
    justifyContent: 'center' 
  },
  content: { padding: 20 },
  locationCard: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: 'white', 
    borderRadius: 24, 
    padding: 16, 
    marginBottom: 20, 
    gap: 12, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 4 }, 
    shadowOpacity: 0.1, 
    shadowRadius: 10, 
    elevation: 4 
  },
  locationIcon: { 
    width: 40, 
    height: 40, 
    backgroundColor: colors.primaryLight, 
    borderRadius: 12, 
    alignItems: 'center', 
    justifyContent: 'center' 
  },
  locationLabel: { 
    fontSize: 10, 
    fontWeight: '800', 
    color: colors.textLight, 
    letterSpacing: 1.5 
  },
  locationValue: { 
    fontSize: 14, 
    fontWeight: '700', 
    color: colors.text, 
    marginTop: 2 
  },
  cameraTrigger: { 
    borderRadius: 32, 
    overflow: 'hidden', 
    marginBottom: 20, 
    shadowColor: colors.primary, 
    shadowOffset: { width: 0, height: 10 }, 
    shadowOpacity: 0.15, 
    shadowRadius: 20, 
    elevation: 6 
  },
  cameraGradient: { 
    paddingVertical: 40, 
    paddingHorizontal: 20 
  },
  cameraInner: { alignItems: 'center' },
  cameraIconContainer: { 
    marginBottom: 16, 
    position: 'relative' 
  },
  cameraBadge: { 
    position: 'absolute', 
    top: -4, 
    right: -4, 
    backgroundColor: '#fbbf24', 
    width: 20, 
    height: 20, 
    borderRadius: 10, 
    alignItems: 'center', 
    justifyContent: 'center', 
    borderWidth: 2, 
    borderColor: 'white' 
  },
  cameraTitle: { 
    fontSize: 20, 
    fontWeight: '900', 
    color: colors.primaryDark 
  },
  cameraSubtitle: { 
    fontSize: 14, 
    color: colors.primary, 
    fontWeight: '600', 
    marginTop: 4, 
    opacity: 0.8 
  },
  photoContainer: { 
    borderRadius: 32, 
    overflow: 'hidden', 
    marginBottom: 20, 
    position: 'relative', 
    height: 300, 
    shadowColor: '#000', 
    shadowOpacity: 0.2, 
    shadowRadius: 15, 
    elevation: 8 
  },
  photo: { 
    width: '100%', 
    height: '100%' 
  },
  photoOverlay: { 
    ...StyleSheet.absoluteFill 
  },
  overlayClose: { 
    position: 'absolute', 
    top: 16, 
    right: 16, 
    backgroundColor: 'rgba(0,0,0,0.5)', 
    width: 36, 
    height: 36, 
    borderRadius: 18, 
    alignItems: 'center', 
    justifyContent: 'center' 
  },
  retakeBtn: { 
    position: 'absolute', 
    bottom: 16, 
    left: 16, 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: 'white', 
    paddingHorizontal: 16, 
    paddingVertical: 10, 
    borderRadius: 16, 
    gap: 6 
  },
  retakeBtnText: { 
    color: colors.primary, 
    fontWeight: '800', 
    fontSize: 14 
  },
  submitBtn: { 
    borderRadius: 24, 
    overflow: 'hidden', 
    marginBottom: 30, 
    shadowColor: colors.primary, 
    shadowOffset: { width: 0, height: 8 }, 
    shadowOpacity: 0.3, 
    shadowRadius: 12, 
    elevation: 6 
  },
  submitGradient: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    gap: 12, 
    paddingVertical: 20 
  },
  submitText: { 
    color: 'white', 
    fontSize: 18, 
    fontWeight: '800', 
    letterSpacing: 0.5 
  },
  sectionHeader: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: 16, 
    gap: 10 
  },
  sectionTitle: { 
    fontSize: 22, 
    fontWeight: '900', 
    color: colors.text 
  },
  countBadge: { 
    backgroundColor: colors.primary, 
    paddingHorizontal: 10, 
    paddingVertical: 4, 
    borderRadius: 12 
  },
  countText: { 
    color: 'white', 
    fontSize: 12, 
    fontWeight: '800' 
  },
  emptyContainer: { 
    alignItems: 'center', 
    paddingVertical: 40, 
    opacity: 0.5 
  },
  emptyText: { 
    color: colors.text, 
    fontWeight: '600', 
    fontSize: 14, 
    marginTop: 12, 
    textAlign: 'center', 
    paddingHorizontal: 40 
  },
  reportsList: { gap: 12 },
});
