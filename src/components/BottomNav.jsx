// @ts-ignore;
import React from 'react';

export function BottomNav({
  activeTab,
  onTabChange
}) {
  return <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 safe-area-bottom">
      <div className="max-w-md mx-auto flex justify-around py-2">
        <button className={`flex flex-col items-center py-2 ${activeTab === 'home' ? 'text-cyan-500' : 'text-gray-400'}`} onClick={() => onTabChange('home')}>
          <i className="fas fa-home text-xl"></i>
          <span className="text-xs mt-1">首页</span>
        </button>
        <button className={`flex flex-col items-center py-2 ${activeTab === 'my' ? 'text-cyan-500' : 'text-gray-400'}`} onClick={() => onTabChange('my')}>
          <i className="fas fa-clipboard-list text-xl"></i>
          <span className="text-xs mt-1">我的报名</span>
        </button>
      </div>
    </nav>;
}