import { useState, useCallback } from 'react';

export function useCamera() {
  const [showCamera, setShowCamera] = useState(false);
  const [photo, setPhoto] = useState<string | null>(null);

  const openCamera = useCallback(() => setShowCamera(true), []);
  const closeCamera = useCallback(() => setShowCamera(false), []);
  const onCapture = useCallback((uri: string) => {
    setPhoto(uri);
    setShowCamera(false);
  }, []);
  const clearPhoto = useCallback(() => setPhoto(null), []);

  return { showCamera, photo, openCamera, closeCamera, onCapture, clearPhoto, setPhoto };
}
