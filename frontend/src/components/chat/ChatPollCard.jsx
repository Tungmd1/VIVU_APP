import React, { useState } from 'react';
import apiClient from '../../services/apiClient';

/**
 * ChatPollCard - Thẻ Bình Chọn Lịch Hẹn / Ý Kiến Trong Chat
 * Tương tác bình chọn realtime, cập nhật thanh tiến trình % và số phiếu
 * Tuân thủ Rule 5 (100% Bootstrap Icons), Rule 7 (< 450 dòng)
 */
export default function ChatPollCard({ msg, isMe, currentUserId, onPollUpdated }) {
  const [isVoting, setIsVoting] = useState(false);

  const parsePollFromMessage = () => {
    if (msg.poll && Array.isArray(msg.poll.options) && msg.poll.options.length > 0) return msg.poll;
    if (msg.customPoll && Array.isArray(msg.customPoll.options)) return msg.customPoll;
    
    const title = typeof msg.text === 'string' 
      ? msg.text.replace(/^\[(BÌNH CHỌN|BÃŒNH CHá»ŒN|POLL)\]:\s*/i, '').trim() 
      : 'Bình chọn';

    return {
      id: msg.id ? `poll-${msg.id}` : `poll-${Date.now()}`,
      title: title || 'Bình chọn ý kiến',
      options: [
        { id: 'opt-1', text: 'Đồng ý', votes: [] },
        { id: 'opt-2', text: 'Từ chối', votes: [] }
      ]
    };
  };

  const [localPoll, setLocalPoll] = useState(parsePollFromMessage);
  const poll = localPoll || parsePollFromMessage();

  // Tính tổng số phiếu
  const totalVotes = poll.options.reduce((sum, opt) => {
    return sum + (Array.isArray(opt.votes) ? opt.votes.length : 0);
  }, 0);

  const handleVote = async (optionId) => {
    if (isVoting) return;
    setIsVoting(true);
    try {
      const msgId = msg.id || msg.client_msg_id;
      const res = await apiClient.voteMessagePoll(msgId, optionId, currentUserId);
      if (res?.poll) {
        setLocalPoll(res.poll);
        if (onPollUpdated) onPollUpdated(msgId, res.poll);
      }
    } catch (err) {
      console.warn('Lỗi bình chọn:', err.message);
    } finally {
      setIsVoting(false);
    }
  };

  return (
    <div className="p-3.5 rounded-2xl bg-[#151619] border border-white/10 space-y-3 max-w-[280px] sm:max-w-[320px] text-white shadow-md select-none">
      {/* Header Bình chọn */}
      <div className="flex items-center justify-between border-b border-white/10 pb-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <div className="w-6 h-6 rounded-lg bg-[rgba(0,229,255,0.12)] border border-[rgba(0,229,255,0.3)] text-[#00E5FF] flex items-center justify-center shrink-0">
            <i className="bi bi-bar-chart-fill text-xs"></i>
          </div>
          <span className="text-xs font-bold text-white tracking-tight truncate">
            {poll.title || 'Bình chọn'}
          </span>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/10 text-white/70 shrink-0">
          {totalVotes} phiếu
        </span>
      </div>

      {/* Danh sách các lựa chọn */}
      <div className="space-y-2">
        {poll.options.map((opt, idx) => {
          const votes = Array.isArray(opt.votes) ? opt.votes : [];
          const voteCount = votes.length;
          const percent = totalVotes > 0 ? Math.round((voteCount / totalVotes) * 100) : 0;
          const hasVoted = currentUserId && votes.includes(currentUserId);

          return (
            <button
              key={opt.id || idx}
              type="button"
              disabled={isVoting}
              onClick={() => handleVote(opt.id || `opt-${idx}`)}
              className={`w-full relative overflow-hidden p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between gap-2 ${
                hasVoted
                  ? 'border-[#00E5FF] bg-[rgba(0,229,255,0.08)] shadow-[0_0_10px_rgba(0,229,255,0.15)]'
                  : 'border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20'
              }`}
            >
              {/* Thanh tiến trình % hiển thị dưới nền */}
              <div
                className={`absolute left-0 top-0 bottom-0 transition-all duration-300 pointer-events-none ${
                  hasVoted ? 'bg-[rgba(0,229,255,0.18)]' : 'bg-white/10'
                }`}
                style={{ width: `${percent}%` }}
              />

              {/* Nội dung lựa chọn */}
              <div className="relative z-10 flex items-center gap-2 min-w-0">
                <div
                  className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 transition-colors ${
                    hasVoted
                      ? 'border-[#00E5FF] bg-[#00E5FF] text-[#08202E]'
                      : 'border-white/30 bg-transparent text-transparent'
                  }`}
                >
                  <i className="bi bi-check text-xs font-bold"></i>
                </div>
                <span
                  className={`text-xs truncate ${
                    hasVoted ? 'text-white font-bold' : 'text-white/90 font-medium'
                  }`}
                >
                  {opt.text}
                </span>
              </div>

              {/* Số % và số phiếu */}
              <div className="relative z-10 flex items-center gap-1.5 shrink-0 text-right">
                <span className="text-[11px] font-mono font-bold text-white/90">
                  {percent}%
                </span>
                <span className="text-[9px] font-mono text-white/50">
                  ({voteCount})
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Footer gợi ý */}
      <div className="flex items-center justify-between text-[10px] text-white/40 pt-0.5">
        <span>Chạm vào lựa chọn để biểu quyết</span>
        <span>
          {msg.created_at
            ? new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            : ''}
        </span>
      </div>
    </div>
  );
}
