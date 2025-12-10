import { create } from 'zustand';
import { uid } from '../helpers';

type State = {
  showLogin: boolean;
  setShowLogin: (showLogin: boolean) => void;
  pageKey: string; //页面key 刷新这个key重载页面
  setPageKey: (pageKey: string) => void;
};

// Create your store, which includes both state and (optionally) actions
export const useAdminStore = create<State>((set) => ({
  showLogin: false,
  setShowLogin: (showLogin) => set(() => ({ showLogin })),
  pageKey: uid(),
  setPageKey: (pageKey) => set(() => ({ pageKey })),
}));
