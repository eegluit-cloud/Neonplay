import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import defaultAvatar from '@/assets/user-avatar-new.png';

const AVATAR_STORAGE_KEY = 'userCustomAvatar';
const AVATAR_CHANGE_EVENT = 'userAvatarChanged';
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export function useUserAvatar() {
  const [avatar, setAvatar] = useState<string>(() => {
    const stored = localStorage.getItem(AVATAR_STORAGE_KEY);
    return stored || defaultAvatar;
  });

  useEffect(() => {
    const handleAvatarChange = () => {
      const stored = localStorage.getItem(AVATAR_STORAGE_KEY);
      setAvatar(stored || defaultAvatar);
    };

    window.addEventListener(AVATAR_CHANGE_EVENT, handleAvatarChange);
    window.addEventListener('storage', handleAvatarChange);

    return () => {
      window.removeEventListener(AVATAR_CHANGE_EVENT, handleAvatarChange);
      window.removeEventListener('storage', handleAvatarChange);
    };
  }, []);

  const updateAvatar = useCallback((file: File) => {
    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      toast.error('Image too large', {
        description: `Maximum file size is 5MB. Your file is ${(file.size / 1024 / 1024).toFixed(1)}MB.`,
      });
      return;
    }

    // Compress image before storing
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    img.onload = () => {
      // Max dimensions for avatar
      const maxSize = 200;
      let width = img.width;
      let height = img.height;
      
      if (width > height) {
        if (width > maxSize) {
          height = (height * maxSize) / width;
          width = maxSize;
        }
      } else {
        if (height > maxSize) {
          width = (width * maxSize) / height;
          height = maxSize;
        }
      }
      
      canvas.width = width;
      canvas.height = height;
      ctx?.drawImage(img, 0, 0, width, height);
      
      const compressedBase64 = canvas.toDataURL('image/jpeg', 0.8);
      
      try {
        localStorage.setItem(AVATAR_STORAGE_KEY, compressedBase64);
        setAvatar(compressedBase64);
        window.dispatchEvent(new CustomEvent(AVATAR_CHANGE_EVENT));
        toast.success('Profile photo updated!');
      } catch (e) {
        console.error('Failed to save avatar:', e);
        toast.error('Failed to save photo', {
          description: 'Please try a smaller image.',
        });
      }
    };
    
    img.onerror = () => {
      toast.error('Invalid image', {
        description: 'Please select a valid image file.',
      });
    };
    
    const reader = new FileReader();
    reader.onloadend = () => {
      img.src = reader.result as string;
    };
    reader.onerror = () => {
      toast.error('Failed to read file', {
        description: 'Please try again.',
      });
    };
    reader.readAsDataURL(file);
  }, []);

  const resetAvatar = useCallback(() => {
    localStorage.removeItem(AVATAR_STORAGE_KEY);
    setAvatar(defaultAvatar);
    window.dispatchEvent(new CustomEvent(AVATAR_CHANGE_EVENT));
    toast.success('Profile photo reset to default');
  }, []);

  return { avatar, updateAvatar, resetAvatar };
}
