import React, { useState, useEffect, useRef } from 'react';

/**
 * Nén ảnh phía client bằng HTML5 Canvas
 * Tự động thu gọn kích thước (tối đa 1600px) và nén JPEG 85%
 * Giảm ~85% dung lượng giúp tải nhanh vượt trội và tiết kiệm RAM máy chủ VPS
 */
async function compressImageClientSide(file) {
  if (!file || !file.type.startsWith('image/')) return file;
  if (file.type === 'image/gif') return file; // Không nén ảnh động GIF

  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const maxDim = 1600;
        let width = img.width;
        let height = img.height;

        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (!blob || blob.size >= file.size) {
              resolve(file); // Nếu nén xong lớn hơn bản gốc thì giữ bản gốc
            } else {
              const compressedFile = new File([blob], file.name.replace(/\.[^.]+$/, '.jpg'), {
                type: 'image/jpeg',
                lastModified: Date.now()
              });
              resolve(compressedFile);
            }
          },
          'image/jpeg',
          0.85
        );
      };
      img.onerror = () => resolve(file);
      img.src = e.target.result;
    };
    reader.onerror = () => resolve(file);
    reader.readAsDataURL(file);
  });
}

/**
 * MediaPreviewModal - Modal xem trước toàn màn hình trước khi gửi Ảnh/Video
 * Chuẩn Fullscreen Cyberpunk HUD, hiển thị thanh tiến trình và hỗ trợ Thử lại khi lỗi mạng
 */
export default function MediaPreviewModal({
  isOpen,
  file,
  mediaType = 'image',
  onClose,
  onSendMedia
}) {
  const [caption, setCaption] = useState('');
  const [previewUrl, setPreviewUrl] = useState(null);
  const [status, setStatus] = useState('idle'); // 'idle' | 'compressing' | 'uploading' | 'error'
  const [progress, setProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');
  const inputRef = useRef(null);

  // Tạo URL tạm thời để xem trước
  useEffect(() => {
    if (!file || !isOpen) {
      setPreviewUrl(null);
      setCaption('');
      setStatus('idle');
      setProgress(0);
      setErrorMessage('');
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [file, isOpen]);

  if (!isOpen || !file) return null;

  const isVideo = mediaType === 'video' || file.type.startsWith('video/');
  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
  };

  const handleSend = async () => {
    if (status === 'uploading' || status === 'compressing') return;
    setErrorMessage('');

    try {
      let finalFile = file;
      if (!isVideo) {
        setStatus('compressing');
        finalFile = await compressImageClientSide(file);
      }

      setStatus('uploading');
      setProgress(5);

      await onSendMedia({
        file: finalFile,
        caption: caption.trim(),
        type: isVideo ? 'video' : 'image',
        onProgress: (percent) => {
          setProgress(Math.max(5, percent));
        }
      });

      setStatus('idle');
      onClose();
    } catch (err) {
      console.warn('[MediaPreviewModal] Lỗi gửi media:', err);
      setStatus('error');
      setErrorMessage(err.message || 'Lỗi kết nối khi gửi tệp. Vui lòng bấm Thử lại.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#0B0C10]/95 backdrop-blur-2xl flex flex-col justify-between animate-fadeIn text-white select-none">
      {/* Top Header Bar */}
      <div className="p-4 flex items-center justify-between border-b border-white/10 bg-black/40">
        <button
          onClick={onClose}
          disabled={status === 'uploading'}
          className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 flex items-center justify-center transition-all cursor-pointer disabled:opacity-40"
          title="Hủy bỏ"
        >
          <i className="bi bi-x-lg text-lg text-white" />
        </button>

        <div className="text-center">
          <p className="text-sm font-bold font-display tracking-wide text-white flex items-center justify-center gap-1.5">
            <i className={`bi ${isVideo ? 'bi-camera-video-fill text-[#FF2A85]' : 'bi-image-fill text-[#00E5FF]'}`} />
            Xem trước {isVideo ? 'Video' : 'Ảnh'}
          </p>
          <p className="text-[11px] text-[#A0A5B5] font-mono">
            {file.name} ({formatFileSize(file.size)})
          </p>
        </div>

        <div className="w-10" /> {/* Giữ cân đối header */}
      </div>

      {/* Main Preview Container */}
      <div className="flex-1 flex items-center justify-center p-4 overflow-hidden relative">
        {isVideo ? (
          <div className="relative max-w-2xl max-h-[65vh] w-full flex items-center justify-center rounded-2xl overflow-hidden bg-black/60 border border-white/15 shadow-2xl">
            <video
              src={previewUrl}
              controls
              autoPlay
              loop
              playsInline
              className="w-full max-h-[65vh] object-contain rounded-2xl"
            />
          </div>
        ) : (
          <div className="relative max-w-2xl max-h-[65vh] w-full flex items-center justify-center rounded-2xl overflow-hidden bg-black/40 border border-white/15 shadow-2xl">
            <img
              src={previewUrl}
              alt="Xem trước"
              className="w-full max-h-[65vh] object-contain rounded-2xl"
            />
          </div>
        )}

        {/* Thanh trạng thái tiến trình tải lên nổi trên ảnh */}
        {(status === 'compressing' || status === 'uploading') && (
          <div className="absolute inset-0 bg-black/75 backdrop-blur-md flex flex-col items-center justify-center gap-3 z-20">
            <div className="relative w-16 h-16 flex items-center justify-center">
              <div className="w-16 h-16 rounded-full border-4 border-[#00E5FF]/20 border-t-[#00E5FF] animate-spin" />
              <span className="absolute text-xs font-bold font-mono text-[#00E5FF]">
                {status === 'compressing' ? '...' : `${progress}%`}
              </span>
            </div>
            <p className="text-sm font-bold text-white font-display">
              {status === 'compressing' ? 'Đang nén ảnh tối ưu...' : `Đang tải lên máy chủ (${progress}%)...`}
            </p>
            <div className="w-48 h-2 bg-white/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#00E5FF] to-[#00B4D8] transition-all duration-200"
                style={{ width: `${status === 'compressing' ? 40 : progress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Error Alert Box nếu có lỗi mạng */}
      {status === 'error' && (
        <div className="mx-4 mb-2 p-3 rounded-2xl bg-[#EF4444]/20 border border-[#EF4444]/40 flex items-center justify-between gap-3 text-xs text-[#FCA5A5]">
          <div className="flex items-center gap-2">
            <i className="bi bi-exclamation-triangle-fill text-base text-[#EF4444]" />
            <span>{errorMessage}</span>
          </div>
          <button
            onClick={handleSend}
            className="px-3 py-1.5 rounded-xl bg-[#EF4444] text-white font-bold font-display hover:bg-[#DC2626] transition-all cursor-pointer whitespace-nowrap active:scale-95"
          >
            <i className="bi bi-arrow-clockwise mr-1" />
            Thử lại
          </button>
        </div>
      )}

      {/* Bottom Action Footer (Caption Input + Send Button) */}
      <div className="p-4 bg-black/60 border-t border-white/10 flex items-center gap-2.5 pb-[max(1rem,env(safe-area-inset-bottom,0px))]">
        <div className="flex-1 relative flex items-center">
          <input
            ref={inputRef}
            type="text"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            disabled={status === 'uploading' || status === 'compressing'}
            placeholder="Thêm lời nhắn... (tùy chọn)"
            className="w-full bg-white/10 hover:bg-white/15 focus:bg-white/20 border border-white/15 focus:border-[#00E5FF] rounded-2xl py-3 pl-4 pr-10 text-sm text-white placeholder-white/40 focus:outline-hidden transition-all disabled:opacity-40"
          />
          {caption && (
            <button
              onClick={() => setCaption('')}
              className="absolute right-3 w-5 h-5 rounded-full bg-white/20 text-white flex items-center justify-center text-xs hover:bg-white/30 cursor-pointer"
            >
              <i className="bi bi-x" />
            </button>
          )}
        </div>

        <button
          onClick={handleSend}
          disabled={status === 'uploading' || status === 'compressing'}
          className="px-5 py-3 rounded-2xl bg-gradient-to-r from-[#00E5FF] to-[#00B4D8] text-[#08202E] font-bold font-display text-sm flex items-center gap-2 transition-all active:scale-95 shadow-[0_0_20px_rgba(0,229,255,0.4)] disabled:opacity-40 cursor-pointer shrink-0"
        >
          {status === 'uploading' || status === 'compressing' ? (
            <>
              <span className="w-4 h-4 border-2 border-[#08202E] border-t-transparent rounded-full animate-spin" />
              <span>Đang gửi...</span>
            </>
          ) : (
            <>
              <span>Gửi</span>
              <i className="bi bi-send-fill text-xs" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
