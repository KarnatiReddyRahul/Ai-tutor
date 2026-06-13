import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@/types';

interface ProfileState {
  profileData: User | null;
  isLoading: boolean;
  setProfileData: (data: User) => void;
  updateBio: (bio: string) => void;
  updateProfilePicture: (url: string) => void;
}

export const useProfileStore = create<ProfileState>()(
  persist(
    (set) => ({
      profileData: null,
      isLoading: false,

      setProfileData: (data) => {
        set({ profileData: data });
      },

      updateBio: (bio: string) => {
        set((state) => ({
          profileData: state.profileData
            ? { ...state.profileData, bio }
            : null,
        }));
      },

      updateProfilePicture: (url: string) => {
        set((state) => ({
          profileData: state.profileData
            ? { ...state.profileData, profilePicture: url }
            : null,
        }));
      },
    }),
    {
      name: 'ai-reverse-tutor-profile',
    }
  )
);
