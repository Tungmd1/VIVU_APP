import React, { useState, useRef, useMemo } from 'react';
import { playTactileClickSound } from '../storyAudioEffects';
import { 
  CHIBI_MASCOT_FAMILIES, 
  CHIBI_MASCOTS, 
  getChibiDataUrl, 
  playChibiSound 
} from '../../../data/chibiMascotData';

export default function StoryStickerPicker({
  userLocationName = 'TP. Hồ Chí Minh',
  onSelectMeme,
  onAddPoll,
  onAddQA,
  onAddLocationBadge,
  onClose
}) {
  const [activeTab, setActiveTab] = useState('meme'); // 'meme' | 'poll' | 'qa' | 'location'
  const [chibiFamily, setChibiFamily] = useState('droplet');
  const customMemeInputRef = useRef(null);

  const displayedChibis = useMemo(() => {
    return CHIBI_MASCOTS.filter(m => m.family === chibiFamily);
  }, [chibiFamily]);

  // Poll form state
  const [pollQuestion, setPollQuestion] = useState('Đi dạo không?');
  const [pollOpt1, setPollOpt1] = useState('Đi ngay!');
  const [pollOpt2, setPollOpt2] = useState('Bận rồi');

  // QA form state
  const [qaPrompt, setQaPrompt] = useState('Hỏi tôi một câu gì đó?');

  const handleCustomMemeUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    playTactileClickSound();
    const reader = new FileReader();
    reader.onload = () => {
      onSelectMeme({
        id: `custom-meme-${Date.now()}`,
        label: 'Meme của bạn',
        image: reader.result,
        icon: 'bi-stars',
        bg: 'bg-[#0A8395]/15 text-[#0A8395] border-[#0A8395]/40',
        isCustom: true
      });
      onClose();
    };
    reader.readAsDataURL(file);
  };

  const handleCreatePoll = (e) => {
    e.preventDefault();
    if (!pollQuestion.trim() || !pollOpt1.trim() || !pollOpt2.trim()) return;
    playTactileClickSound();
    onAddPoll({
      id: `poll-${Date.now()}`,
      type: 'poll',
      question: pollQuestion.trim(),
      options: [pollOpt1.trim(), pollOpt2.trim()],
      votes: { 0: [], 1: [] }
    });
    onClose();
  };

  const handleCreateQA = (e) => {
    e.preventDefault();
    if (!qaPrompt.trim()) return;
    playTactileClickSound();
    onAddQA({
      id: `qa-${Date.now()}`,
      type: 'qa',
      prompt: qaPrompt.trim(),
      replies: []
    });
    onClose();
  };

  return (
    <div className="absolute inset-0 z-50 bg-black/85 backdrop-blur-md flex flex-col justify-end select-none animate-fadeIn">
      {/* Nền bấm để đóng */}
      <div className="flex-1" onClick={onClose} />

      {/* Sheet nội dung trượt lên */}
      <div className="bg-[#151619] rounded-t-3xl border-t border-white/10 p-5 space-y-4 max-h-[85vh] overflow-y-auto no-scrollbar shadow-2xl">
        {/* Thanh tiêu đề & nút đóng */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <i className="bi bi-stickies text-amber-400 text-lg"></i>
            <h3 className="text-white font-bold text-sm tracking-wide font-display">Nhãn Dán Không Gian</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 text-white/70 hover:text-white flex items-center justify-center"
          >
            <i className="bi bi-x-lg text-sm"></i>
          </button>
        </div>

        {/* Tab chuyển đổi phân loại */}
        <div className="grid grid-cols-4 gap-1.5 p-1 bg-black/40 rounded-xl border border-white/5">
          <button
            type="button"
            onClick={() => { playTactileClickSound(); setActiveTab('meme'); }}
            className={`py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'meme' ? 'bg-white text-black shadow-md' : 'text-white/60 hover:text-white'
            }`}
          >
            <i className="bi bi-image"></i>
            <span>Meme</span>
          </button>

          <button
            type="button"
            onClick={() => { playTactileClickSound(); setActiveTab('poll'); }}
            className={`py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'poll' ? 'bg-white text-black shadow-md' : 'text-white/60 hover:text-white'
            }`}
          >
            <i className="bi bi-bar-chart-fill"></i>
            <span>Poll</span>
          </button>

          <button
            type="button"
            onClick={() => { playTactileClickSound(); setActiveTab('qa'); }}
            className={`py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'qa' ? 'bg-white text-black shadow-md' : 'text-white/60 hover:text-white'
            }`}
          >
            <i className="bi bi-chat-heart-fill"></i>
            <span>Q&A</span>
          </button>

          <button
            type="button"
            onClick={() => { playTactileClickSound(); setActiveTab('location'); }}
            className={`py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'location' ? 'bg-white text-black shadow-md' : 'text-white/60 hover:text-white'
            }`}
          >
            <i className="bi bi-geo-alt-fill"></i>
            <span>Vị Trí</span>
          </button>
        </div>

        {/* Nội dung Tab Meme / Chibi Stickers */}
        {activeTab === 'meme' && (
          <div className="space-y-3">
            {/* Phân nhóm 3 gia đình Chibi */}
            <div className="grid grid-cols-3 gap-1.5 p-1 bg-black/60 rounded-xl border border-white/10">
              {CHIBI_MASCOT_FAMILIES.map((fam) => {
                const isActive = chibiFamily === fam.id;
                return (
                  <button
                    key={fam.id}
                    type="button"
                    onClick={() => { playTactileClickSound(); setChibiFamily(fam.id); }}
                    className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      isActive
                        ? 'bg-gradient-to-r from-[#FF2A85] to-[#7928CA] text-white shadow-md'
                        : 'text-white/60 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <i className={`bi ${fam.icon} text-xs`}></i>
                    <span className="truncate">{fam.label.split(' ')[0]}</span>
                  </button>
                );
              })}
            </div>

            {/* Danh sách 12 Mascot Chibi của nhóm */}
            <div className="grid grid-cols-3 gap-2 max-h-[260px] overflow-y-auto no-scrollbar pt-1">
              {displayedChibis.map((mascot) => {
                const dataUrl = getChibiDataUrl(mascot);
                return (
                  <div
                    key={mascot.id}
                    onClick={() => {
                      playChibiSound(mascot.soundType);
                      onSelectMeme({
                        id: mascot.id,
                        type: 'meme',
                        label: mascot.name,
                        image: dataUrl,
                        icon: 'bi-emoji-smile-fill',
                        bg: 'bg-cyan-500/20 text-cyan-400 border-cyan-400/40'
                      });
                      onClose();
                    }}
                    className="flex flex-col items-center p-2 rounded-xl bg-[#1A1A1E] hover:bg-[#222228] border border-white/10 hover:border-cyan-400/50 cursor-pointer active:scale-95 transition-all group"
                  >
                    <div className="w-12 h-12 flex items-center justify-center mb-1 group-hover:scale-115 transition-transform">
                      <img
                        src={dataUrl}
                        alt={mascot.name}
                        className="w-full h-full object-contain pointer-events-none"
                      />
                    </div>
                    <p className="text-[10px] font-bold text-white truncate max-w-full leading-tight text-center">
                      {mascot.name}
                    </p>
                    <span className="text-[9px] text-[#8E8E93] font-mono mt-0.5">
                      {mascot.emotion}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Nút tải meme riêng từ máy */}
            <button
              type="button"
              onClick={() => customMemeInputRef.current?.click()}
              className="w-full py-2 px-3 rounded-xl border border-dashed border-white/20 bg-white/5 text-white/70 hover:text-white hover:bg-white/10 flex items-center justify-center gap-2 text-xs font-semibold active:scale-98 transition-all"
            >
              <i className="bi bi-cloud-arrow-up-fill text-sm"></i>
              <span>Hoặc tải ảnh nhãn dán từ máy</span>
            </button>
            <input
              ref={customMemeInputRef}
              type="file"
              accept="image/*"
              onChange={handleCustomMemeUpload}
              className="hidden"
            />
          </div>
        )}

        {/* Nội dung Tab Poll */}
        {activeTab === 'poll' && (
          <form onSubmit={handleCreatePoll} className="space-y-3 p-3 bg-[#1A1A1E] rounded-2xl border border-white/10">
            <div>
              <label className="text-[11px] font-bold text-white/70 uppercase tracking-wider block mb-1">
                Câu hỏi thăm dò ý kiến
              </label>
              <input
                type="text"
                value={pollQuestion}
                onChange={e => setPollQuestion(e.target.value)}
                placeholder="Ví dụ: Tối nay đi cafe không?"
                className="w-full bg-[#151619] border border-white/10 rounded-xl px-3 py-2 text-white font-medium text-xs placeholder-[#8E8E93] focus:border-white/40 outline-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-white/60 block mb-1">Lựa chọn 1</label>
                <input
                  type="text"
                  value={pollOpt1}
                  onChange={e => setPollOpt1(e.target.value)}
                  className="w-full bg-[#151619] border border-white/10 rounded-xl px-3 py-2 text-white text-xs placeholder-[#8E8E93] focus:border-white/40 outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] text-white/60 block mb-1">Lựa chọn 2</label>
                <input
                  type="text"
                  value={pollOpt2}
                  onChange={e => setPollOpt2(e.target.value)}
                  className="w-full bg-[#151619] border border-white/10 rounded-xl px-3 py-2 text-white text-xs placeholder-[#8E8E93] focus:border-white/40 outline-none"
                />
              </div>
            </div>
            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 text-black font-bold text-xs shadow-md active:scale-98 transition-transform"
            >
              Chèn Nhãn Dán Thăm Dò
            </button>
          </form>
        )}

        {/* Nội dung Tab Q&A Box */}
        {activeTab === 'qa' && (
          <form onSubmit={handleCreateQA} className="space-y-3 p-3 bg-[#1A1A1E] rounded-2xl border border-white/10">
            <div>
              <label className="text-[11px] font-bold text-white/70 uppercase tracking-wider block mb-1">
                Chủ đề câu hỏi Q&A
              </label>
              <textarea
                rows={2}
                value={qaPrompt}
                onChange={e => setQaPrompt(e.target.value)}
                placeholder="Ví dụ: Hỏi tôi về chuyến đi này..."
                className="w-full bg-[#151619] border border-white/10 rounded-xl p-3 text-white font-medium text-xs placeholder-[#8E8E93] focus:border-white/40 outline-none resize-none"
              />
            </div>
            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 text-white font-bold text-xs shadow-md active:scale-98 transition-transform"
            >
              Chèn Hộp Hỏi Đáp Q&A
            </button>
          </form>
        )}

        {/* Nội dung Tab Location & Weather */}
        {activeTab === 'location' && (
          <div className="space-y-2.5">
            <button
              type="button"
              onClick={() => {
                playTactileClickSound();
                onAddLocationBadge({
                  id: `loc-${Date.now()}`,
                  type: 'location',
                  name: userLocationName,
                  weather: '29°C Nắng Đẹp'
                });
                onClose();
              }}
              className="w-full p-4 rounded-2xl bg-gradient-to-r from-[#0A8395]/20 to-teal-900/30 border border-[#0A8395]/40 text-left hover:border-[#0A8395] transition-all flex items-center justify-between group active:scale-98"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#0A8395] text-white flex items-center justify-center text-lg shadow-md">
                  <i className="bi bi-geo-alt-fill"></i>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">{userLocationName}</h4>
                  <p className="text-[11px] text-teal-300 flex items-center gap-1 mt-0.5">
                    <i className="bi bi-brightness-high-fill text-amber-400"></i>
                    <span>29°C Nắng Đẹp • GPS Tọa Độ Thật</span>
                  </p>
                </div>
              </div>
              <i className="bi bi-plus-circle-fill text-xl text-[#0A8395] group-hover:scale-110 transition-transform"></i>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

