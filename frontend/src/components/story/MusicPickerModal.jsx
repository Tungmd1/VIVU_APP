import React, { useState, useEffect, useRef } from 'react';
import { TRENDING_SONGS, searchOnlineSongs, storyAudioPlayer } from '../../data/trendingSongs';

/**
 * MusicPickerModal - Khay chọn bài hát trực tuyến cho Story & Trạng Thái
 * - 100% Nhạc hát thật từ Apple Music / iTunes Preview (chất lượng phòng thu)
 * - Tìm kiếm trực tuyến theo thời gian thực (Live Search) mọi bài hát V-Pop & Quốc tế
 * - 100% Bootstrap Icons (Rule 5), < 450 dòng (Rule 7)
 */
export default function MusicPickerModal({
  isOpen,
  onClose,
  selectedSong,
  onSelectSong
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [onlineResults, setOnlineResults] = useState([]);
  const [playingSongId, setPlayingSongId] = useState(null);
  const searchTimeoutRef = useRef(null);

  useEffect(() => {
    if (!isOpen) {
      storyAudioPlayer.stop();
      setPlayingSongId(null);
      setSearchQuery('');
      setOnlineResults([]);
      setIsSearching(false);
    }
  }, [isOpen]);

  // Tìm kiếm trực tuyến thời gian thực với Debounce 350ms
  useEffect(() => {
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);

    const q = searchQuery.trim();
    if (!q) {
      setOnlineResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const results = await searchOnlineSongs(q);
        setOnlineResults(results);
      } catch (err) {
        console.warn('[Music Picker] Search error:', err);
      } finally {
        setIsSearching(false);
      }
    }, 350);

    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
  }, [searchQuery]);

  if (!isOpen) return null;

  // Nếu đang tìm kiếm online và có kết quả: hiển thị onlineResults
  // Nếu ô tìm kiếm rỗng: hiển thị 21 bài hát thịnh hành TRENDING_SONGS
  // Nếu đang tìm kiếm mà chưa có kết quả online: lọc nhanh theo TRENDING_SONGS
  const localFiltered = TRENDING_SONGS.filter(song =>
    song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    song.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
    song.genre?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const displaySongs = searchQuery.trim()
    ? (onlineResults.length > 0 ? onlineResults : localFiltered)
    : TRENDING_SONGS;

  const handleTogglePlay = (e, song) => {
    e.stopPropagation();
    if (playingSongId === song.id) {
      storyAudioPlayer.stop();
      setPlayingSongId(null);
    } else {
      storyAudioPlayer.playSong(song, { loop: true });
      setPlayingSongId(song.id);
    }
  };

  const handleChoose = (song) => {
    storyAudioPlayer.stop();
    setPlayingSongId(null);
    onSelectSong(song);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-70 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 select-none font-sans animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white border border-[#D8E3E7] rounded-t-3xl sm:rounded-3xl max-h-[85vh] flex flex-col overflow-hidden shadow-[0_20px_60px_rgba(20,37,46,0.3)] text-[#14252E]">
        
        {/* Header Modal */}
        <div className="p-4 border-b border-[#D8E3E7] flex items-center justify-between bg-white">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#FF2A85]/10 flex items-center justify-center text-[#FF2A85] border border-[#FF2A85]/20">
              <i className="bi bi-music-note-beamed text-base"></i>
            </div>
            <div>
              <h2 className="font-bold text-sm text-[#14252E] flex items-center gap-2">
                <span>Chọn Bài Hát</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-gradient-to-r from-[#FF2A85]/15 to-purple-500/15 text-[#FF2A85] border border-[#FF2A85]/30 font-bold">
                  Hát Thật 100%
                </span>
              </h2>
              <p className="text-[11px] text-[#52646D]">Kho nhạc trực tuyến Apple Music & V-Pop thịnh hành</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              storyAudioPlayer.stop();
              onClose();
            }}
            className="w-8 h-8 rounded-xl bg-[#F8FAFB] hover:bg-[#EEF3F5] text-[#52646D] hover:text-[#14252E] flex items-center justify-center transition-colors cursor-pointer"
            title="Đóng"
          >
            <i className="bi bi-x-lg text-xs"></i>
          </button>
        </div>

        {/* Ô Tìm Kiếm Bài Hát Trực Tuyến */}
        <div className="p-3 border-b border-[#D8E3E7] bg-white">
          <div className="flex items-center gap-2.5 bg-[#F8FAFB] border border-[#D8E3E7] rounded-2xl px-3.5 py-2.5 text-xs focus-within:border-[#FF2A85] focus-within:shadow-[0_0_12px_rgba(255,42,133,0.15)] transition-all">
            {isSearching ? (
              <i className="bi bi-arrow-repeat text-[#FF2A85] animate-spin text-sm"></i>
            ) : (
              <i className="bi bi-search text-[#7E909A] text-sm"></i>
            )}
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm theo tên bài hát, ca sĩ V-Pop hoặc Quốc tế..."
              className="bg-transparent border-none outline-none flex-1 text-[#14252E] placeholder-[#7E909A] text-xs font-medium"
              autoFocus
            />
            {searchQuery && (
              <button 
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setOnlineResults([]);
                }} 
                className="text-[#7E909A] hover:text-[#14252E] cursor-pointer"
              >
                <i className="bi bi-x-circle-fill text-xs"></i>
              </button>
            )}
          </div>
          {searchQuery.trim() && (
            <div className="flex items-center justify-between text-[11px] text-[#7E909A] px-1 pt-2">
              <span>{isSearching ? 'Đang tìm kiếm trực tuyến...' : `Tìm thấy ${displaySongs.length} bài hát`}</span>
              <span className="text-[10px] text-[#FF2A85] font-semibold flex items-center gap-1">
                <i className="bi bi-broadcast"></i>
                <span>Apple Music Stream</span>
              </span>
            </div>
          )}
        </div>

        {/* Danh Sách Bài Hát Hát Thật */}
        <div className="flex-1 overflow-y-auto no-scrollbar p-3 space-y-2 bg-white min-h-[300px]">
          {displaySongs.length === 0 ? (
            <div className="py-12 text-center text-[#7E909A] space-y-2">
              <i className="bi bi-music-note-slash text-3xl text-neutral-300"></i>
              <p className="text-xs font-medium">Không tìm thấy bài hát phù hợp.</p>
              <p className="text-[11px] text-neutral-400">Hãy thử gõ tên ca sĩ hoặc bài hát khác xem sao nhé!</p>
            </div>
          ) : (
            displaySongs.map(song => {
              const isPlaying = playingSongId === song.id;
              const isSelected = selectedSong?.id === song.id || selectedSong?.title === song.title;

              return (
                <div
                  key={song.id}
                  onClick={() => handleChoose(song)}
                  className={`p-2.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 group ${
                    isSelected
                      ? 'bg-[#FF2A85]/10 border-[#FF2A85] shadow-xs'
                      : 'bg-[#F8FAFB] border-[#D8E3E7] hover:border-[#FF2A85]/40 hover:bg-[#FFF5F8]'
                  }`}
                >
                  {/* Ảnh bìa + Nút Play / Pause */}
                  <div className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-[#D8E3E7] shadow-xs">
                    <img src={song.cover} alt="" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={(e) => handleTogglePlay(e, song)}
                      className={`absolute inset-0 flex items-center justify-center transition-all cursor-pointer ${
                        isPlaying
                          ? 'bg-black/60 opacity-100 text-white'
                          : 'bg-black/35 opacity-70 group-hover:opacity-100 text-white hover:scale-105'
                      }`}
                      title={isPlaying ? 'Dừng phát' : 'Nghe thử hát thật'}
                    >
                      <i className={`bi ${isPlaying ? 'bi-pause-fill text-lg text-[#10FFA0]' : 'bi-play-fill text-lg'}`}></i>
                    </button>
                  </div>

                  {/* Thông tin bài hát */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-xs font-bold text-[#14252E] truncate">{song.title}</h4>
                      {isPlaying && (
                        <span className="w-1.5 h-1.5 rounded-full bg-[#FF2A85] animate-ping"></span>
                      )}
                    </div>
                    <p className="text-[11px] text-[#52646D] truncate mt-0.5">{song.artist}</p>
                    {isPlaying && (
                      <span className="text-[9px] text-[#FF2A85] font-bold flex items-center gap-1 mt-0.5">
                        <i className="bi bi-soundwave animate-pulse"></i>
                        <span>Đang phát điệp khúc ca sĩ hát thật...</span>
                      </span>
                    )}
                  </div>

                  {/* Nút Chọn */}
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[10px] text-[#7E909A] font-mono">{song.duration || '0:30'}</span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleChoose(song);
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#FF2A85] text-white shadow-xs'
                          : 'bg-white border border-[#D8E3E7] text-[#14252E] hover:bg-[#FF2A85] hover:text-white hover:border-[#FF2A85]'
                      }`}
                    >
                      {isSelected ? 'Đã Chọn' : 'Chọn'}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

      </div>
    </div>
  );
}
