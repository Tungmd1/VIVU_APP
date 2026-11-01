import React, { useState } from 'react';
import { playTactileClickSound } from '../storyAudioEffects';

const REACTION_ICONS = [
  { id: 'heart', icon: 'bi-heart-fill', color: 'text-rose-500' },
  { id: 'fire', icon: 'bi-fire', color: 'text-amber-500' },
  { id: 'thumbs', icon: 'bi-hand-thumbs-up-fill', color: 'text-teal-400' },
  { id: 'stars', icon: 'bi-stars', color: 'text-yellow-400' },
  { id: 'laugh', icon: 'bi-emoji-laughing-fill', color: 'text-orange-400' }
];

export default function StoryFloatingReactions({ onReact }) {
  const [particles, setParticles] = useState([]);

  const handleTriggerReaction = (item) => {
    playTactileClickSound();
    if (navigator.vibrate) navigator.vibrate(30);

    const newParticles = Array.from({ length: 5 }).map((_, i) => ({
      id: `${Date.now()}-${i}`,
      icon: item.icon,
      color: item.color,
      left: 30 + Math.random() * 40, // 30% - 70% width
      duration: 1.2 + Math.random() * 0.8
    }));

    setParticles(prev => [...prev, ...newParticles]);

    setTimeout(() => {
      setParticles(prev => prev.filter(p => !newParticles.some(np => np.id === p.id)));
    }, 2200);

    if (onReact) onReact(item.id);
  };

  return (
    <>
      {/* Hiệu ứng hạt icon bay lơ lửng */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-40">
        {particles.map(p => (
          <div
            key={p.id}
            className={`absolute bottom-20 text-3xl ${p.color} animate-floatUp drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)]`}
            style={{
              left: `${p.left}%`,
              animationDuration: `${p.duration}s`
            }}
          >
            <i className={`bi ${p.icon}`}></i>
          </div>
        ))}
      </div>

      {/* Dải nút cảm xúc nhanh */}
      <div className="flex items-center gap-2">
        {REACTION_ICONS.map(item => (
          <button
            key={item.id}
            type="button"
            onClick={() => handleTriggerReaction(item)}
            className="w-9 h-9 rounded-full bg-black/60 backdrop-blur-md border border-white/15 flex items-center justify-center text-lg hover:scale-125 active:scale-95 transition-all shadow-lg"
          >
            <i className={`bi ${item.icon} ${item.color}`}></i>
          </button>
        ))}
      </div>
    </>
  );
}

