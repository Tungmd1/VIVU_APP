import React, { useState } from 'react';

/**
 * CreatePollModal - Modal tạo bình chọn lịch hẹn
 * Phong cách Luminous Solar-Cyber HUD (White Cyberpunk) & Bootstrap Icons 100%
 */
export default function CreatePollModal({ 
  isOpen, 
  onClose, 
  onCreatePoll 
}) {
  const [pollTitle, setPollTitle] = useState('');
  const [pollOptions, setPollOptions] = useState(['', '']);

  if (!isOpen) return null;

  const handleOptionChange = (idx, val) => {
    const updated = [...pollOptions];
    updated[idx] = val;
    setPollOptions(updated);
  };

  const handleAddOption = () => {
    if (pollOptions.length < 5) {
      setPollOptions([...pollOptions, '']);
    }
  };

  const handleRemoveOption = (idx) => {
    if (pollOptions.length > 2) {
      setPollOptions(pollOptions.filter((_, i) => i !== idx));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!pollTitle.trim()) {
      alert('Vui lòng nhập câu hỏi bình chọn');
      return;
    }
    const validOptions = pollOptions.filter(o => o.trim().length > 0);
    if (validOptions.length < 2) {
      alert('Vui lòng nhập tối thiểu 2 lựa chọn');
      return;
    }
    onCreatePoll({
      title: pollTitle.trim(),
      options: validOptions.map((text, idx) => ({
        id: `opt-${idx + 1}`,
        text,
        votes: 0
      }))
    });
    setPollTitle('');
    setPollOptions(['', '']);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-60 bg-black/40 backdrop-blur-xs flex justify-center items-center p-4 animate-in fade-in select-none font-sans">
      <div className="w-full max-w-sm bg-white rounded-3xl p-5 shadow-[0_25px_60px_rgba(0,0,0,0.15)] border border-[#D2D9F4] text-[#131315] space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#D2D9F4]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[rgba(0,229,255,0.15)] text-[#00838F] border border-[rgba(0,229,255,0.4)] flex items-center justify-center">
              <i className="bi bi-bar-chart-fill text-sm"></i>
            </div>
            <div>
              <h3 className="font-bold text-sm text-[#131315] font-display">Tạo Bình Chọn Lịch Hẹn</h3>
              <p className="text-[10px] text-[#70787E]">Vote địa điểm, thời gian trong chat</p>
            </div>
          </div>
          <button 
            type="button"
            onClick={onClose} 
            className="w-7 h-7 rounded-lg bg-[#F2F3FF] border border-[#D2D9F4] hover:bg-[#E6E7F6] text-[#131315] flex items-center justify-center transition-colors cursor-pointer"
          >
            <i className="bi bi-x-lg text-xs"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="text-xs font-bold text-[#131315] block mb-1">Chủ đề bình chọn</label>
            <input 
              type="text" 
              value={pollTitle}
              onChange={(e) => setPollTitle(e.target.value)}
              placeholder="VD: Chiều nay đi uống cafe ở đâu hợp lý?"
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#D2D9F4] bg-[#F2F3FF] text-xs text-[#131315] placeholder-[#70787E] outline-none focus:border-[#00E5FF] focus:ring-1 focus:ring-[rgba(0,229,255,0.3)] transition-all font-medium"
              required
            />
          </div>

          <div>
            <label className="text-xs font-bold text-[#131315] block mb-1">
              Các phương án lựa chọn (tối thiểu 2)
            </label>
            <div className="space-y-2">
              {pollOptions.map((opt, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="w-5 text-center text-xs font-bold text-[#70787E] font-mono">{idx + 1}.</span>
                  <input 
                    type="text"
                    value={opt}
                    onChange={(e) => handleOptionChange(idx, e.target.value)}
                    placeholder={`Phương án ${idx + 1}...`}
                    className="flex-1 px-3.5 py-2 rounded-xl border border-[#D2D9F4] bg-[#F2F3FF] text-xs text-[#131315] placeholder-[#70787E] outline-none focus:border-[#00E5FF] focus:ring-1 focus:ring-[rgba(0,229,255,0.3)] transition-all font-medium"
                    required
                  />
                  {pollOptions.length > 2 && (
                    <button 
                      type="button"
                      onClick={() => handleRemoveOption(idx)}
                      className="p-1.5 text-[#70787E] hover:text-[#EF4444] cursor-pointer transition-colors"
                    >
                      <i className="bi bi-trash3 text-xs"></i>
                    </button>
                  )}
                </div>
              ))}
            </div>

            {pollOptions.length < 5 && (
              <button 
                type="button"
                onClick={handleAddOption}
                className="mt-2 text-xs font-bold text-[#00838F] flex items-center gap-1.5 hover:underline cursor-pointer transition-all"
              >
                <i className="bi bi-plus-circle-fill"></i>
                <span>Thêm phương án</span>
              </button>
            )}
          </div>

          <div className="pt-2 flex gap-2">
            <button 
              type="submit"
              className="flex-1 py-3 bg-gradient-to-r from-[#00E5FF] to-[#00B4D8] text-[#08202E] rounded-xl font-display font-bold text-xs border border-[#00F0FF] shadow-[0_0_12px_rgba(0,229,255,0.35)] active:scale-98 transition-all cursor-pointer"
            >
              Đăng vào đoạn chat
            </button>
            <button 
              type="button"
              onClick={onClose}
              className="px-4 py-3 bg-[#F2F3FF] border border-[#D2D9F4] text-[#131315] hover:bg-[#E6E7F6] rounded-xl font-semibold text-xs transition-colors cursor-pointer"
            >
              Hủy
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
