"use client";

import { useEffect } from 'react';
import { useStore } from '@/lib/store';
import { Loader2 } from 'lucide-react';

export default function StoreLoader({ children }: { children: React.ReactNode }) {
  const loadData = useStore(state => state.loadData);
  const isLoading = useStore(state => state.isLoading);
  const isLoaded = useStore(state => state.isLoaded);
  
  useEffect(() => {
    if (!isLoaded) {
      loadData();
    }
  }, [loadData, isLoaded]);
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#0a0a0f]">
        <div className="text-center space-y-4">
          <Loader2 className="animate-spin text-indigo-500 mx-auto" size={48} />
          <p className="text-slate-400 font-black uppercase tracking-widest text-xs">Intelligence System Loading...</p>
        </div>
      </div>
    );
  }
  
  return <>{children}</>;
}
