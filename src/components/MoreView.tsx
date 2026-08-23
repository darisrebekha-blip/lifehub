import React, { useState } from 'react';
import { QuickNoteData, UserProfileData } from '../types';

interface MoreViewProps {
  scratchpad: QuickNoteData;
  profile: UserProfileData;
  onUpdateScratchpad: (content: string) => void;
  onOpenAiModal: () => void;
  onOpenClimateModal?: () => void;
  onResetData: () => void;
}

export const MoreView: React.FC<MoreViewProps> = ({
  scratchpad,
  profile,
  onUpdateScratchpad,
  onOpenAiModal,
  onOpenClimateModal,
  onResetData
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopyNotes = () => {
    navigator.clipboard.writeText(scratchpad.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="px-4 sm:px-6 py-4 max-w-2xl mx-auto space-y-4 pb-24">
      {/* Scratchpad Full View */}
      <section className="bg-[#1c2028] p-5 rounded-xl micro-border space-y-3">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-[#dfe2ee]">Quick Scratchpad</h1>
            <p className="text-xs text-[#c2c6d6]">Autosaved local workspace</p>
          </div>
          <button
            id="more-copy-notes-btn"
            onClick={handleCopyNotes}
            className="px-3 py-1.5 bg-[#31353e] hover:bg-[#353942] text-[#adc6ff] rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">
              {copied ? 'check' : 'content_copy'}
            </span>
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>

        <textarea
          id="more-scratchpad-textarea"
          value={scratchpad.content}
          onChange={(e) => onUpdateScratchpad(e.target.value)}
          placeholder="Jot down quick thoughts, meeting notes, or ideas..."
          className="w-full bg-[#181c24] border border-[#424754] rounded-lg p-3 text-sm text-[#dfe2ee] placeholder-[#8c909f] focus:border-[#adc6ff] resize-none min-h-[160px] outline-none font-mono"
        />
      </section>

      {/* AI Assistant Banner */}
      <section
        onClick={onOpenAiModal}
        className="bg-[#1c2028] p-5 rounded-xl micro-border hover:border-[#adc6ff]/50 transition-all cursor-pointer flex items-center justify-between group"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#00285d]/40 flex items-center justify-center border border-[#adc6ff]/30 text-[#adc6ff]">
            <span className="material-symbols-outlined text-[24px]">auto_awesome</span>
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#dfe2ee]">AI Assistant & Voice Commands</h3>
            <p className="text-xs text-[#c2c6d6]">
              Ask Gemini to analyze budget, organize tasks, or summarize your day
            </p>
          </div>
        </div>
        <span className="material-symbols-outlined text-[#adc6ff] group-hover:translate-x-1 transition-transform">
          chevron_right
        </span>
      </section>

      {/* Weather & Location Card */}
      <section
        onClick={onOpenClimateModal}
        className="bg-[#1c2028] p-5 rounded-xl micro-border hover:border-[#adc6ff]/40 transition-all cursor-pointer space-y-2 group"
      >
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-1.5">
            <h3 className="text-sm font-bold text-[#dfe2ee]">Location & Climate</h3>
            <span className="material-symbols-outlined text-[14px] text-[#8c909f] group-hover:text-[#adc6ff]">
              tune
            </span>
          </div>
          <span className="text-xs text-[#adc6ff] font-semibold">{profile.location || 'Add City'}</span>
        </div>
        <div className="flex items-center gap-4 bg-[#181c24] p-3.5 rounded-lg micro-border">
          <span className="material-symbols-outlined text-[36px] text-[#ffb95f]">
            {profile.weatherIconSymbol || 'wb_sunny'}
          </span>
          <div className="flex-1">
            <p className="text-lg font-bold text-[#dfe2ee]">
              {profile.tempUnit === 'F' ? `${profile.tempF ?? 82}°F` : `${profile.tempC ?? 28}°C`} - {profile.weatherCondition || 'Sunny'}
            </p>
            <p className="text-xs text-[#8c909f]">
              Click to choose your city and automatically fetch live climate, or switch between °C / °F.
            </p>
          </div>
        </div>
      </section>

      {/* App Settings & Data Management */}
      <section className="bg-[#1c2028] p-5 rounded-xl micro-border space-y-3">
        <h3 className="text-sm font-bold text-[#dfe2ee]">Data & Reset</h3>
        <p className="text-xs text-[#c2c6d6]">
          All LifeHub data is saved locally in your browser session state.
        </p>

        <div className="flex justify-between items-center pt-2 border-t border-[#21262d]">
          <span className="text-xs font-semibold text-[#ffb4ab]">Reset Demo State</span>
          <button
            id="reset-lifehub-demo-data-btn"
            onClick={onResetData}
            className="px-3 py-1.5 bg-[#93000a]/30 hover:bg-[#93000a]/50 text-[#ffb4ab] border border-[#ffb4ab]/30 rounded-lg text-xs font-bold transition-all cursor-pointer"
          >
            Reset to Default
          </button>
        </div>
      </section>
    </div>
  );
};
