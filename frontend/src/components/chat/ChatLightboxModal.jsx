import React from 'react';

/**
 * ChatLightboxModal - Modal phóng to Ảnh & Video trong phòng chat (Rule 7 Anti-Monolith)
 * - 100% Bootstrap Icons (Rule 5)
 */
export default function ChatLightboxModal({ media, selectedMedia, onClose }) {
  const activeMedia = media || selectedMedia;
  if (!activeMedia) return null;

  return (
    <div 
      onClick={onClose}
      className="fixed inset-0 z-[60] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 cursor-pointer animate-fadeIn select-none"
    >
      <button 
        type="button"
        onClick={onClose}
        className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center text-lg z-10 transition-all cursor-pointer"
        title="Đóng xem media"
      >
        <i className="bi bi-x-lg" />
      </button>

      {activeMedia.type === 'video' ? (
        <video 
          src={activeMedia.url} 
          controls 
          autoPlay 
          className="max-w-full max-h-[90vh] object-contain rounded-2xl shadow-2xl" 
          onClick={(e) => e.stopPropagation()} 
        />
      ) : (
        <img 
          src={activeMedia.url} 
          alt="Phóng to" 
          className="max-w-full max-h-[90vh] object-contain rounded-2xl shadow-2xl" 
          onClick={(e) => e.stopPropagation()} 
        />
      )}
    </div>
  );
}
