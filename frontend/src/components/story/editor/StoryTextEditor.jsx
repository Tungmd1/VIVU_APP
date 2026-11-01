import React, { useState } from 'react';
import { playTactileClickSound } from '../storyAudioEffects';

const FONT_STYLES = [
  { id: 'font-sans', name: 'Hiện Đại', className: 'font-sans font-bold' },
  { id: 'font-neon', name: 'Neon Glow', className: 'font-mono font-black tracking-widest drop-shadow-[0_0_12px_rgba(34,211,238,0.8)]' },
  { id: 'font-serif', name: 'Cổ Điển', className: 'font-serif italic font-bold' },
  { id: 'font-mono', name: 'Máy Đánh Chữ', className: 'font-mono font-medium' }
];

const COLOR_PALETTE = [
  '#FFFFFF', '#000000', '#F43F5E', '#EC4899', '#A855F7', 
  '#06B6D4', '#10B981', '#EAB308', '#F97316'
];

export default function StoryTextEditor({
  initialText = '',
  initialFont = 'font-sans',
  initialColor = '#FFFFFF',
  initialHighlight = true,
  onSave,
  onCancel
}) {
  const [text, setText] = useState(initialText);
  const [font, setFont] = useState(initialFont);
  const [color, setColor] = useState(initialColor);
  const [hasHighlight, setHasHighlight] = useState(initialHighlight);

  const selectedFontObj = FONT_STYLES.find(f => f.id === font) || FONT_STYLES[0];

  const handleDone = () => {
    if (!text.trim()) {
      onCancel();
      return;
    }
    playTactileClickSound();
    onSave({
      text: text.trim(),
      font,
      color,
      hasHighlight
    });
  };

  return (
    <div className="absolute inset-0 z-50 bg-black/85 backdrop-blur-md flex flex-col justify-between p-6 select-none animate-fadeIn">
      {/* Thanh đỉnh: Thoát, Đổi nền highlight, Xong */}
      <div className="flex items-center justify-between pt-safe">
        <button
          type="button"
          onClick={() => {
            playTactileClickSound();
            onCancel();
          }}
          className="text-white/80 hover:text-white font-medium text-sm"
        >
          Hủy
        </button>

        {/* Nút bật tắt nền highlight chữ */}
        <button
          type="button"
          onClick={() => {
            playTactileClickSound();
            setHasHighlight(v => !v)}
          }
          className={`px-3 py-1 rounded-full text-xs font-bold border transition-all ${
            hasHighlight 
              ? 'bg-white text-black border-white shadow-md' 
              : 'bg-white/10 text-white border-white/20'
          }`}
        >
          <i className="bi bi-fonts mr-1"></i>
          {hasHighlight ? 'Nền Nổi Bật' : 'Chữ Trong Suốt'}
        </button>

        <button
          type="button"
          onClick={handleDone}
          className="px-4 py-1.5 rounded-full bg-gradient-to-r from-teal-400 to-cyan-500 text-black font-bold text-sm shadow-md active:scale-95 transition-transform"
        >
          Xong
        </button>
      </div>

      {/* Vùng nhập chữ trung tâm */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md text-center">
          <textarea
            autoFocus
            rows={3}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Nhập trạng thái của bạn..."
            className={`w-full bg-transparent resize-none text-center outline-none text-2xl md:text-3xl leading-relaxed transition-all ${
              selectedFontObj.className
            } ${hasHighlight ? 'p-3 rounded-2xl bg-black/60 backdrop-blur-sm' : ''}`}
            style={{ color }}
          />
        </div>
      </div>

      {/* Thanh công cụ đáy: Chọn Font & Bảng Màu */}
      <div className="space-y-4 pb-safe">
        {/* Chọn Font */}
        <div className="flex items-center justify-center gap-2 overflow-x-auto no-scrollbar py-1">
          {FONT_STYLES.map(f => (
            <button
              key={f.id}
              type="button"
              onClick={() => {
                playTactileClickSound();
                setFont(f.id);
              }}
              className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                font === f.id
                  ? 'bg-white text-black shadow-md scale-105'
                  : 'bg-white/15 text-white/80 hover:text-white'
              }`}
            >
              {f.name}
            </button>
          ))}
        </div>

        {/* Bảng Màu */}
        <div className="flex items-center justify-center gap-2.5 overflow-x-auto no-scrollbar py-1">
          {COLOR_PALETTE.map(c => (
            <button
              key={c}
              type="button"
              onClick={() => {
                playTactileClickSound();
                setColor(c);
              }}
              className={`w-7 h-7 rounded-full border-2 transition-transform ${
                color === c ? 'scale-125 border-white shadow-lg' : 'border-white/30 hover:scale-110'
              }`}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
