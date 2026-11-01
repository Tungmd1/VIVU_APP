import React, { useState } from 'react';
import { CAMERA_FILTER_PRESETS } from '../camera/CameraViewfinder';
import { playTactileClickSound } from '../storyAudioEffects';

export default function StoryFiltersAdjuster({
  selectedFilter,
  onSelectFilter,
  adjustments,
  onChangeAdjustment,
  onResetAdjustments,
  onClose
}) {
  const [activeTab, setActiveTab] = useState('filters'); // 'filters' | 'adjust'

  return (
    <div className="absolute inset-0 z-50 bg-black/85 backdrop-blur-md flex flex-col justify-end select-none animate-fadeIn">
      <div className="flex-1" onClick={onClose} />

      <div className="bg-[#151619] rounded-t-3xl border-t border-white/10 p-5 space-y-4 max-h-[75vh] overflow-y-auto no-scrollbar shadow-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <i className="bi bi-sliders text-cyan-400 text-lg"></i>
            <h3 className="text-white font-bold text-sm tracking-wide font-display">Bộ Lọc & Chỉnh Màu</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 text-white/70 hover:text-white flex items-center justify-center"
          >
            <i className="bi bi-x-lg text-sm"></i>
          </button>
        </div>

        {/* Tab switch */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-black/40 rounded-xl border border-white/5">
          <button
            type="button"
            onClick={() => { playTactileClickSound(); setActiveTab('filters'); }}
            className={`py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'filters' ? 'bg-white text-black shadow-md' : 'text-white/60 hover:text-white'
            }`}
          >
            <i className="bi bi-palette"></i>
            <span>Bộ Lọc Preset ({CAMERA_FILTER_PRESETS.length})</span>
          </button>
          <button
            type="button"
            onClick={() => { playTactileClickSound(); setActiveTab('adjust'); }}
            className={`py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'adjust' ? 'bg-white text-black shadow-md' : 'text-white/60 hover:text-white'
            }`}
          >
            <i className="bi bi-sliders2"></i>
            <span>Tinh Chỉnh Sâu</span>
          </button>
        </div>

        {activeTab === 'filters' ? (
          <div className="grid grid-cols-4 gap-2 pt-2">
            {CAMERA_FILTER_PRESETS.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => {
                  playTactileClickSound();
                  onSelectFilter(f.id);
                }}
                className={`flex flex-col items-center gap-1.5 p-2 rounded-xl border transition-all ${
                  selectedFilter === f.id
                    ? 'bg-white/20 border-white shadow-lg scale-105'
                    : 'bg-[#1A1A1E] border-white/5 hover:border-white/20'
                }`}
              >
                <div
                  className="w-12 h-12 rounded-lg bg-gradient-to-tr from-amber-500 via-rose-500 to-indigo-500 shadow-inner"
                  style={{ filter: f.css }}
                />
                <span className="text-[11px] font-bold text-white truncate max-w-full">
                  {f.name}
                </span>
              </button>
            ))}
          </div>
        ) : (
          <div className="space-y-4 pt-2">
            {/* Brightness */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-white/70">
                <span className="flex items-center gap-1.5">
                  <i className="bi bi-sun"></i> Độ sáng
                </span>
                <span className="font-mono">{adjustments.brightness}%</span>
              </div>
              <input
                type="range"
                min="50"
                max="150"
                value={adjustments.brightness}
                onChange={e => onChangeAdjustment('brightness', Number(e.target.value))}
                className="w-full accent-cyan-400"
              />
            </div>

            {/* Contrast */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-white/70">
                <span className="flex items-center gap-1.5">
                  <i className="bi bi-circle-half"></i> Độ tương phản
                </span>
                <span className="font-mono">{adjustments.contrast}%</span>
              </div>
              <input
                type="range"
                min="50"
                max="150"
                value={adjustments.contrast}
                onChange={e => onChangeAdjustment('contrast', Number(e.target.value))}
                className="w-full accent-cyan-400"
              />
            </div>

            {/* Saturation */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-white/70">
                <span className="flex items-center gap-1.5">
                  <i className="bi bi-droplet-half"></i> Độ bão hòa
                </span>
                <span className="font-mono">{adjustments.saturation}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="200"
                value={adjustments.saturation}
                onChange={e => onChangeAdjustment('saturation', Number(e.target.value))}
                className="w-full accent-cyan-400"
              />
            </div>

            {/* Vignette */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-white/70">
                <span className="flex items-center gap-1.5">
                  <i className="bi bi-camera"></i> Tối viền (Vignette)
                </span>
                <span className="font-mono">{adjustments.vignette}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="80"
                value={adjustments.vignette}
                onChange={e => onChangeAdjustment('vignette', Number(e.target.value))}
                className="w-full accent-cyan-400"
              />
            </div>

            <button
              type="button"
              onClick={() => {
                playTactileClickSound();
                onResetAdjustments();
              }}
              className="w-full py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white/80 text-xs font-semibold"
            >
              Đặt lại mặc định
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

