import React, { useState, useEffect } from 'react';
import { TRENDING_SONGS, storyAudioPlayer } from '../../data/trendingSongs';

/**
 * MusicPickerModal - Khay chọn bài hát cho Story
 * Hỗ trợ chọn từ kho bài hát thịnh hành hoặc dán link nhạc riêng của người dùng
 * Chuẩn Design System: Nền trắng, viền #D8E3E7, chữ #14252E, điểm nhấn #0A8395
 */
export default function MusicPickerModal({
  isOpen,
  onClose,
  selectedSong,
  onSelectSong
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [playingSongId, setPlayingSongId] = useState(null);
  const [customAudioUrl, setCustomAudioUrl] = useState('');
  const [customAudioTitle, setCustomAudioTitle] = useState('');

  useEffect(() => {
    if (!isOpen) {
      storyAudioPlayer.stop();
      setPlayingSongId(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const filteredSongs = TRENDING_SONGS.filter(song =>
    song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    song.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
    song.genre.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleTogglePlay = (e, song) => {
    e.stopPropagation();
    if (playingSongId === song.id) {
      storyAudioPlayer.stop();
      setPlayingSongId(null);
    } else {
      storyAudioPlayer.playSong(song);
      setPlayingSongId(song.id);
    }
  };

  const handleChoose = (song) => {
    storyAudioPlayer.stop();
    setPlayingSongId(null);
    onSelectSong(song);
    onClose();
  };

  const handleApplyCustomAudio = () => {
    if (!customAudioUrl.trim()) return;
    const customSong = {
      id: `custom-song-${Date.now()}`,
      title: customAudioTitle.trim() || 'Nhạc tự chọn',
      artist: 'Người dùng tải lên',
      genre: 'Custom Audio',
      duration: '3:00',
      audioUrl: customAudioUrl.trim(),
      cover: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=200'
    };
    storyAudioPlayer.stop();
    onSelectSong(customSong);
    onClose();
  };

  const handleTogglePlayCustom = () => {
    if (!customAudioUrl.trim()) return;
    const customSong = {
      id: 'custom-preview',
      title: customAudioTitle.trim() || 'Nhạc tự chọn',
      audioUrl: customAudioUrl.trim()
    };
    if (playingSongId === 'custom-preview') {
      storyAudioPlayer.stop();
      setPlayingSongId(null);
    } else {
      storyAudioPlayer.playSong(customSong);
      setPlayingSongId('custom-preview');
    }
  };

  return (
    <div className="fixed inset-0 z-70 bg-black/40 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 select-none font-sans animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white border border-[#D8E3E7] rounded-t-3xl sm:rounded-3xl max-h-[85vh] flex flex-col overflow-hidden shadow-[0_20px_50px_rgba(20,37,46,0.15)] text-[#14252E]">
        
        {/* Header Modal */}
        <div className="p-4 border-b border-[#D8E3E7] flex items-center justify-between bg-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#0A8395]/10 flex items-center justify-center text-[#0A8395] border border-[#0A8395]/20">
              <i className="bi bi-music-note-beamed text-sm"></i>
            </div>
            <div>
              <h2 className="font-bold text-sm text-[#14252E] flex items-center gap-2">
                <span>Chọn Nhạc Cho Ghim</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-[#0A8395]/10 text-[#0A8395] font-mono font-bold">
                  {TRENDING_SONGS.length} bài
                </span>
              </h2>
              <p className="text-[11px] text-[#52646D]">Bấm Play để nghe thử hoặc dán link nhạc riêng của bạn</p>
            </div>
          </div>

          <button
            onClick={() => {
              storyAudioPlayer.stop();
              onClose();
            }}
            className="w-8 h-8 rounded-xl bg-[#F8FAFB] hover:bg-[#EEF3F5] text-[#52646D] hover:text-[#14252E] flex items-center justify-center transition-colors cursor-pointer"
          >
            <i className="bi bi-x-lg text-xs"></i>
          </button>
        </div>

        {/* Khu Vực Nạp Link Nhạc Riêng */}
        <div className="p-3 bg-[#F8FAFB] border-b border-[#D8E3E7] space-y-2">
          <div className="text-[11px] font-semibold text-[#14252E] flex items-center gap-1.5">
            <i className="bi bi-link-45deg text-[#0A8395] text-sm"></i>
            <span>Dán đường link nhạc riêng (.mp3 / audio URL)</span>
          </div>
          <div className="flex gap-2">
            <input
              type="url"
              value={customAudioUrl}
              onChange={(e) => setCustomAudioUrl(e.target.value)}
              placeholder="https://example.com/song.mp3..."
              className="flex-1 px-3 py-1.5 bg-white border border-[#D8E3E7] rounded-xl text-xs text-[#14252E] placeholder-[#7E909A] outline-none focus:border-[#0A8395]"
            />
            {customAudioUrl.trim() && (
              <button
                type="button"
                onClick={handleTogglePlayCustom}
                className="px-2.5 py-1.5 bg-[#F8FAFB] hover:bg-[#EEF3F5] border border-[#D8E3E7] rounded-xl text-xs font-semibold text-[#14252E] flex items-center gap-1 cursor-pointer"
                title="Nghe thử link nhạc"
              >
                <i className={`bi ${playingSongId === 'custom-preview' ? 'bi-pause-fill text-[#DC2626]' : 'bi-play-fill text-[#0A8395]'}`}></i>
                <span>{playingSongId === 'custom-preview' ? 'Dừng' : 'Thử'}</span>
              </button>
            )}
            <button
              type="button"
              onClick={handleApplyCustomAudio}
              disabled={!customAudioUrl.trim()}
              className="px-3 py-1.5 bg-[#0A8395] hover:bg-[#086E7D] disabled:opacity-50 text-white rounded-xl text-xs font-semibold cursor-pointer transition-colors"
            >
              Dùng
            </button>
          </div>
        </div>

        {/* Ô Tìm Kiếm Bài Hát Thịnh Hành */}
        <div className="p-3 border-b border-[#D8E3E7] bg-white">
          <div className="flex items-center gap-2 bg-[#F8FAFB] border border-[#D8E3E7] rounded-xl px-3 py-2 text-xs focus-within:border-[#0A8395] transition-colors">
            <i className="bi bi-search text-[#7E909A]"></i>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm theo tên bài hát, nghệ sĩ..."
              className="bg-transparent border-none outline-none flex-1 text-[#14252E] placeholder-[#7E909A] text-xs font-medium"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="text-[#7E909A] hover:text-[#14252E]">
                <i className="bi bi-x-circle-fill text-xs"></i>
              </button>
            )}
          </div>
        </div>

        {/* Danh Sách Bài Hát Thịnh Hành */}
        <div className="flex-1 overflow-y-auto no-scrollbar p-3 space-y-2 bg-white">
          {filteredSongs.map(song => {
            const isPlaying = playingSongId === song.id;
            const isSelected = selectedSong?.id === song.id || selectedSong === song.title;

            return (
              <div
                key={song.id}
                onClick={() => handleChoose(song)}
                className={`p-2.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 group ${
                  isSelected
                    ? 'bg-[#0A8395]/10 border-[#0A8395] shadow-xs'
                    : 'bg-[#F8FAFB] border-[#D8E3E7] hover:border-[#0A8395]/40 hover:bg-[#F3F7F8]'
                }`}
              >
                {/* Ảnh bìa & Nút Play/Pause nghe thử */}
                <div className="relative w-11 h-11 rounded-xl overflow-hidden shrink-0 border border-[#D8E3E7]">
                  <img src={song.cover} alt="" className="w-full h-full object-cover" />
                  
                  <button
                    onClick={(e) => handleTogglePlay(e, song)}
                    className={`absolute inset-0 flex items-center justify-center transition-all cursor-pointer ${
                      isPlaying
                        ? 'bg-black/50 opacity-100 text-white'
                        : 'bg-black/30 opacity-70 group-hover:opacity-100 text-white hover:scale-110'
                    }`}
                    title={isPlaying ? 'Dừng phát' : 'Nghe thử'}
                  >
                    <i className={`bi ${isPlaying ? 'bi-pause-fill text-lg text-[#00E5FF]' : 'bi-play-fill text-lg'}`}></i>
                  </button>
                </div>

                {/* Thông tin bài hát */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-[#14252E] truncate">{song.title}</span>
                    {isPlaying && (
                      <span className="inline-flex items-end gap-0.5 h-3 px-1">
                        <span className="w-0.5 bg-[#0A8395] rounded-full animate-bounce h-3"></span>
                        <span className="w-0.5 bg-[#0A8395] rounded-full animate-bounce delay-75 h-2"></span>
                        <span className="w-0.5 bg-[#0A8395] rounded-full animate-bounce delay-150 h-3.5"></span>
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-[#52646D] truncate">{song.artist}</div>
                  <div className="text-[10px] text-[#7E909A] flex items-center gap-2 mt-0.5 font-mono">
                    <span>{song.genre}</span>
                    <span>•</span>
                    <span>{song.duration}</span>
                  </div>
                </div>

                {/* Nút Chọn bài */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleChoose(song);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 cursor-pointer ${
                    isSelected
                      ? 'bg-[#0A8395] text-white'
                      : 'bg-white hover:bg-[#0A8395] text-[#14252E] hover:text-white border border-[#D8E3E7]'
                  }`}
                >
                  {isSelected ? 'Đang chọn' : 'Chọn'}
                </button>
              </div>
            );
          })}

          {filteredSongs.length === 0 && (
            <div className="py-10 text-center text-[#7E909A] text-xs space-y-1">
              <i className="bi bi-music-note-list text-2xl block text-[#D8E3E7]"></i>
              <p>Không tìm thấy bài hát phù hợp</p>
            </div>
          )}
        </div>

        {/* Thanh đang phát ở đáy nếu có bài đang nghe thử */}
        {playingSongId && (
          <div className="p-3 bg-[#F8FAFB] border-t border-[#D8E3E7] flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 truncate text-[#14252E]">
              <i className="bi bi-disc-fill text-[#0A8395] animate-spin text-base"></i>
              <span className="truncate">
                Đang phát: <b>{TRENDING_SONGS.find(s => s.id === playingSongId)?.title || 'Link nhạc riêng'}</b>
              </span>
            </div>
            <button
              onClick={() => {
                storyAudioPlayer.stop();
                setPlayingSongId(null);
              }}
              className="px-2.5 py-1 rounded-lg bg-white border border-[#D8E3E7] hover:bg-[#F3F7F8] text-[#14252E] font-medium text-[11px] cursor-pointer"
            >
              Dừng
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
