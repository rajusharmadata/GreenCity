import { useAuthStore } from '../store/authStore';

export function usePoints() {
  const points = useAuthStore((s) => s.user?.points ?? 0);
  const updatePoints = useAuthStore((s) => s.updatePoints);
  return { points, updatePoints };
}
