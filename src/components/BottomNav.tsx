import React from 'react';
import { NavigationTab } from '../types';

interface BottomNavProps {
  activeTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onSelectTab }) => {
  return (
    <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center h-16 md:hidden bg-[#262a33] border-t border-[#424754] shadow-2xl rounded-t-xl px-2">
      <button
        id="bottom-nav-home-btn"
        onClick={() => onSelectTab('home')}
        className={`flex flex-col items-center justify-center transition-all cursor-pointer ${
          activeTab === 'home'
            ? 'text-[#adc6ff] scale-110'
            : 'text-[#c2c6d6] hover:text-[#dfe2ee]'
        }`}
      >
        <span
          className="material-symbols-outlined text-[22px]"
          style={{ fontVariationSettings: activeTab === 'home' ? "'FILL' 1" : "'FILL' 0" }}
        >
          home
        </span>
        <span className="text-[11px] font-semibold mt-0.5">Home</span>
      </button>

      <button
        id="bottom-nav-tasks-btn"
        onClick={() => onSelectTab('tasks')}
        className={`flex flex-col items-center justify-center transition-all cursor-pointer ${
          activeTab === 'tasks'
            ? 'text-[#adc6ff] scale-110'
            : 'text-[#c2c6d6] hover:text-[#dfe2ee]'
        }`}
      >
        <span
          className="material-symbols-outlined text-[22px]"
          style={{ fontVariationSettings: activeTab === 'tasks' ? "'FILL' 1" : "'FILL' 0" }}
        >
          check_circle
        </span>
        <span className="text-[11px] font-semibold mt-0.5">Tasks</span>
      </button>

      <button
        id="bottom-nav-money-btn"
        onClick={() => onSelectTab('money')}
        className={`flex flex-col items-center justify-center transition-all cursor-pointer ${
          activeTab === 'money'
            ? 'text-[#adc6ff] scale-110'
            : 'text-[#c2c6d6] hover:text-[#dfe2ee]'
        }`}
      >
        <span
          className="material-symbols-outlined text-[22px]"
          style={{ fontVariationSettings: activeTab === 'money' ? "'FILL' 1" : "'FILL' 0" }}
        >
          account_balance_wallet
        </span>
        <span className="text-[11px] font-semibold mt-0.5">Money</span>
      </button>

      <button
        id="bottom-nav-habits-btn"
        onClick={() => onSelectTab('habits')}
        className={`flex flex-col items-center justify-center transition-all cursor-pointer ${
          activeTab === 'habits'
            ? 'text-[#adc6ff] scale-110'
            : 'text-[#c2c6d6] hover:text-[#dfe2ee]'
        }`}
      >
        <span
          className="material-symbols-outlined text-[22px]"
          style={{ fontVariationSettings: activeTab === 'habits' ? "'FILL' 1" : "'FILL' 0" }}
        >
          rebase_edit
        </span>
        <span className="text-[11px] font-semibold mt-0.5">Habits</span>
      </button>

      <button
        id="bottom-nav-more-btn"
        onClick={() => onSelectTab('more')}
        className={`flex flex-col items-center justify-center transition-all cursor-pointer ${
          activeTab === 'more'
            ? 'text-[#adc6ff] scale-110'
            : 'text-[#c2c6d6] hover:text-[#dfe2ee]'
        }`}
      >
        <span
          className="material-symbols-outlined text-[22px]"
          style={{ fontVariationSettings: activeTab === 'more' ? "'FILL' 1" : "'FILL' 0" }}
        >
          more_horiz
        </span>
        <span className="text-[11px] font-semibold mt-0.5">More</span>
      </button>
    </nav>
  );
};
