import React, { useState } from 'react';
import { playTactileClickSound } from '../storyAudioEffects';

export default function StoryInteractiveLayer({
  storyId,
  stickers = [],
  currentUserId,
  onVotePoll,
  onReplyQA
}) {
  const [qaInput, setQaInput] = useState('');
  const [qaSubmitted, setQaSubmitted] = useState(false);
  const [activePollVotes, setActivePollVotes] = useState({});

  const handleVote = (pollId, optionIndex) => {
    playTactileClickSound();
    if (navigator.vibrate) navigator.vibrate(25);
    setActivePollVotes(prev => ({ ...prev, [pollId]: optionIndex }));
    if (onVotePoll) onVotePoll(storyId, pollId, optionIndex);
  };

  const handleSendQAReply = (qaId, prompt) => {
    if (!qaInput.trim()) return;
    playTactileClickSound();
    if (onReplyQA) onReplyQA(storyId, qaId, prompt, qaInput.trim());
    setQaSubmitted(true);
    setQaInput('');
  };

  if (!stickers || stickers.length === 0) return null;

  return (
    <div className="absolute inset-0 pointer-events-none p-6 flex flex-col items-center justify-end pb-32 space-y-3 z-30">
      {stickers.map((stk, idx) => {
        if (stk.type === 'poll') {
          const userVote = activePollVotes[stk.id];
          const hasVoted = userVote !== undefined;

          // Tính tổng số vote
          const votes0 = (stk.votes?.[0]?.length || 0) + (userVote === 0 ? 1 : 0);
          const votes1 = (stk.votes?.[1]?.length || 0) + (userVote === 1 ? 1 : 0);
          const totalVotes = votes0 + votes1;
          const pct0 = totalVotes > 0 ? Math.round((votes0 / totalVotes) * 100) : 50;
          const pct1 = 100 - pct0;

          return (
            <div
              key={stk.id || idx}
              className="pointer-events-auto w-72 p-4 rounded-2xl bg-black/80 backdrop-blur-md border border-white/20 text-center shadow-2xl space-y-3"
            >
              <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-amber-400">
                <i className="bi bi-bar-chart-fill"></i>
                <span>Bình Chọn Không Gian</span>
              </div>
              <h4 className="text-sm font-bold text-white">{stk.question}</h4>

              <div className="space-y-2">
                {/* Lựa chọn 1 */}
                <button
                  type="button"
                  disabled={hasVoted}
                  onClick={() => handleVote(stk.id, 0)}
                  className={`relative w-full h-11 rounded-xl overflow-hidden border text-xs font-bold transition-all flex items-center justify-between px-3 ${
                    userVote === 0 ? 'border-teal-400 text-white' : 'border-white/10 text-white/90'
                  }`}
                >
                  {hasVoted && (
                    <div
                      className="absolute inset-y-0 left-0 bg-teal-500/40 transition-all duration-500"
                      style={{ width: `${pct0}%` }}
                    />
                  )}
                  <span className="relative z-10 truncate">{stk.options[0]}</span>
                  {hasVoted && <span className="relative z-10 font-mono">{pct0}%</span>}
                </button>

                {/* Lựa chọn 2 */}
                <button
                  type="button"
                  disabled={hasVoted}
                  onClick={() => handleVote(stk.id, 1)}
                  className={`relative w-full h-11 rounded-xl overflow-hidden border text-xs font-bold transition-all flex items-center justify-between px-3 ${
                    userVote === 1 ? 'border-purple-400 text-white' : 'border-white/10 text-white/90'
                  }`}
                >
                  {hasVoted && (
                    <div
                      className="absolute inset-y-0 left-0 bg-purple-500/40 transition-all duration-500"
                      style={{ width: `${pct1}%` }}
                    />
                  )}
                  <span className="relative z-10 truncate">{stk.options[1]}</span>
                  {hasVoted && <span className="relative z-10 font-mono">{pct1}%</span>}
                </button>
              </div>
            </div>
          );
        }

        if (stk.type === 'qa') {
          return (
            <div
              key={stk.id || idx}
              className="pointer-events-auto w-72 p-3.5 rounded-2xl bg-gradient-to-r from-pink-600/90 to-rose-600/90 text-white shadow-2xl space-y-2 border border-white/20"
            >
              <div className="flex items-center justify-center gap-1.5 text-[10px] font-bold tracking-wider uppercase">
                <i className="bi bi-chat-heart-fill"></i>
                <span>Hỏi Tôi</span>
              </div>
              <p className="text-xs font-bold text-center">{stk.prompt}</p>

              {qaSubmitted ? (
                <div className="py-2 px-3 rounded-xl bg-black/30 text-center text-xs font-semibold text-emerald-300">
                  <i className="bi bi-check-circle-fill mr-1"></i>
                  Đã gửi câu trả lời!
                </div>
              ) : (
                <div className="flex items-center gap-1.5 bg-black/40 rounded-xl p-1 border border-white/20">
                  <input
                    type="text"
                    value={qaInput}
                    onChange={e => setQaInput(e.target.value)}
                    placeholder="Gửi tin nhắn..."
                    className="flex-1 bg-transparent px-2.5 py-1 text-xs text-white placeholder-white/50 outline-none"
                    onKeyDown={e => {
                      if (e.key === 'Enter') handleSendQAReply(stk.id, stk.prompt);
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => handleSendQAReply(stk.id, stk.prompt)}
                    className="w-7 h-7 rounded-lg bg-white text-black flex items-center justify-center text-xs active:scale-95"
                  >
                    <i className="bi bi-arrow-up-short text-base"></i>
                  </button>
                </div>
              )}
            </div>
          );
        }

        if (stk.type === 'location') {
          return (
            <div
              key={stk.id || idx}
              className="pointer-events-auto px-4 py-1.5 rounded-full bg-[#0A8395]/90 backdrop-blur-md text-white text-xs font-bold flex items-center gap-2 border border-white/20 shadow-xl"
            >
              <i className="bi bi-geo-alt-fill text-amber-300"></i>
              <span>{stk.name}</span>
              <span className="text-white/40">•</span>
              <span className="text-[11px] text-teal-200">{stk.weather}</span>
            </div>
          );
        }

        if (stk.type === 'meme') {
          return (
            <div
              key={stk.id || idx}
              className="pointer-events-auto flex items-center gap-2.5 px-3 py-1.5 rounded-2xl bg-black/75 backdrop-blur-md border border-white/20 shadow-2xl"
            >
              <img src={stk.image} alt={stk.label} className="w-10 h-10 rounded-xl object-cover" />
              <span className="text-xs font-bold text-white pr-1">{stk.label}</span>
            </div>
          );
        }

        return null;
      })}
    </div>
  );
}
