/**
 * Kho 21 bài hát thịnh hành V-Pop & Quốc Tế cho VIVU Story
 * Tích hợp Web Audio API Synthesizer để phát giai điệu preview chân thực ngay trong app
 */

export const TRENDING_SONGS = [
  {
    id: 'song-1',
    title: 'Vạn Lần Để Dành Cho Em',
    artist: 'Emcee L (Da LAB) ft. Orange',
    genre: 'Pop / Ballad',
    duration: '0:30',
    cover: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=200',
    bpm: 92,
    key: 'C Major',
    notes: [261.63, 329.63, 392.00, 440.00, 392.00, 329.63, 293.66, 261.63]
  },
  {
    id: 'song-2',
    title: 'Đừng Làm Trái Tim Anh Đau',
    artist: 'Sơn Tùng M-TP',
    genre: 'Pop / Dance',
    duration: '0:30',
    cover: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=200',
    bpm: 110,
    key: 'G Major',
    notes: [392.00, 440.00, 493.88, 587.33, 523.25, 493.88, 440.00, 392.00]
  },
  {
    id: 'song-3',
    title: 'Không Thể Say',
    artist: 'HIEUTHUHAI',
    genre: 'Hip-Hop / Melodic Rap',
    duration: '0:30',
    cover: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=200',
    bpm: 95,
    key: 'D Minor',
    notes: [293.66, 349.23, 440.00, 523.25, 440.00, 349.23, 329.63, 293.66]
  },
  {
    id: 'song-4',
    title: 'Từng Quen',
    artist: 'Wren Evans',
    genre: 'R&B / Soul',
    duration: '0:30',
    cover: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=200',
    bpm: 102,
    key: 'F Major',
    notes: [349.23, 392.00, 440.00, 523.25, 440.00, 392.00, 349.23, 261.63]
  },
  {
    id: 'song-5',
    title: 'Nếu Lúc Đó',
    artist: 'tlinh ft. 2pillz',
    genre: 'Trap / R&B',
    duration: '0:30',
    cover: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=200',
    bpm: 88,
    key: 'A Minor',
    notes: [440.00, 523.25, 659.25, 587.33, 523.25, 440.00, 392.00, 440.00]
  },
  {
    id: 'song-6',
    title: 'Cắt Đôi Nỗi Sầu',
    artist: 'Tăng Duy Tân',
    genre: 'Vinahouse / Pop',
    duration: '0:30',
    cover: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=200',
    bpm: 128,
    key: 'E Minor',
    notes: [329.63, 392.00, 493.88, 440.00, 392.00, 329.63, 293.66, 329.63]
  },
  {
    id: 'song-7',
    title: 'Waiting For You',
    artist: 'MONO',
    genre: 'City Pop / 80s Synth',
    duration: '0:30',
    cover: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=200',
    bpm: 115,
    key: 'B Minor',
    notes: [493.88, 554.37, 587.33, 659.25, 587.33, 554.37, 493.88, 440.00]
  },
  {
    id: 'song-8',
    title: 'Đưa Em Về Nhà',
    artist: 'GREY D ft. Chillies',
    genre: 'Indie Pop',
    duration: '0:30',
    cover: 'https://images.unsplash.com/photo-1511735111819-9a3f7709049c?w=200',
    bpm: 90,
    key: 'C Major',
    notes: [261.63, 329.63, 392.00, 440.00, 523.25, 440.00, 392.00, 329.63]
  },
  {
    id: 'song-9',
    title: 'Lạ Lùng',
    artist: 'Vũ.',
    genre: 'Acoustic / Indie',
    duration: '0:30',
    cover: 'https://images.unsplash.com/photo-1445985543469-433ecdd62977?w=200',
    bpm: 80,
    key: 'G Major',
    notes: [392.00, 440.00, 493.88, 523.25, 493.88, 440.00, 392.00, 329.63]
  },
  {
    id: 'song-10',
    title: 'Bước Qua Nhau',
    artist: 'Vũ.',
    genre: 'Indie Pop',
    duration: '0:30',
    cover: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=200',
    bpm: 85,
    key: 'D Major',
    notes: [293.66, 369.99, 440.00, 554.37, 440.00, 369.99, 293.66, 261.63]
  },
  {
    id: 'song-11',
    title: 'Mascara',
    artist: 'Chillies',
    genre: 'Indie Rock',
    duration: '0:30',
    cover: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=200',
    bpm: 98,
    key: 'A Minor',
    notes: [440.00, 493.88, 523.25, 587.33, 523.25, 493.88, 440.00, 392.00]
  },
  {
    id: 'song-12',
    title: 'Anh Là Ngoại Lệ Của Em',
    artist: 'Phương Ly',
    genre: 'Disco Pop',
    duration: '0:30',
    cover: 'https://images.unsplash.com/photo-1520523839898-507125cd53c1?w=200',
    bpm: 118,
    key: 'E Major',
    notes: [329.63, 415.30, 493.88, 587.33, 493.88, 415.30, 329.63, 293.66]
  },
  {
    id: 'song-13',
    title: 'Ưng Quá Chừng',
    artist: 'AMEE',
    genre: 'Cute Pop / Acoustic',
    duration: '0:30',
    cover: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=200',
    bpm: 104,
    key: 'F# Major',
    notes: [369.99, 440.00, 554.37, 659.25, 554.37, 440.00, 369.99, 329.63]
  },
  {
    id: 'song-14',
    title: 'Nấu Ăn Cho Em',
    artist: 'Đen ft. PiaLinh',
    genre: 'Hip-Hop / Acoustic',
    duration: '0:30',
    cover: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=200',
    bpm: 86,
    key: 'C Major',
    notes: [261.63, 329.63, 392.00, 523.25, 440.00, 392.00, 329.63, 261.63]
  },
  {
    id: 'song-15',
    title: 'Có Em',
    artist: 'Madihu ft. Low G',
    genre: 'Lofi / Rap',
    duration: '0:30',
    cover: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=200',
    bpm: 84,
    key: 'F Major',
    notes: [349.23, 440.00, 523.25, 587.33, 523.25, 440.00, 349.23, 293.66]
  },
  {
    id: 'song-16',
    title: 'Nàng Thơ',
    artist: 'Hoàng Dũng',
    genre: 'Ballad',
    duration: '0:30',
    cover: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=200',
    bpm: 78,
    key: 'G Major',
    notes: [392.00, 440.00, 493.88, 587.33, 523.25, 493.88, 392.00, 329.63]
  },
  {
    id: 'song-17',
    title: 'Chìm Sâu',
    artist: 'RPT MCK ft. Trung Trần',
    genre: 'Trap Soul / RnB',
    duration: '0:30',
    cover: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=200',
    bpm: 96,
    key: 'C# Minor',
    notes: [277.18, 329.63, 415.30, 493.88, 415.30, 329.63, 277.18, 246.94]
  },
  {
    id: 'song-18',
    title: 'Bật Tình Yêu Lên',
    artist: 'Tăng Duy Tân x Hòa Minzy',
    genre: 'Pop Dance',
    duration: '0:30',
    cover: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=200',
    bpm: 120,
    key: 'A Major',
    notes: [440.00, 554.37, 659.25, 554.37, 440.00, 392.00, 369.99, 440.00]
  },
  {
    id: 'song-19',
    title: 'Ánh Sao Và Bầu Trời',
    artist: 'T.R.I',
    genre: 'Indie Lofi',
    duration: '0:30',
    cover: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=200',
    bpm: 82,
    key: 'D Major',
    notes: [293.66, 369.99, 440.00, 493.88, 440.00, 369.99, 293.66, 220.00]
  },
  {
    id: 'song-20',
    title: 'Sau Lời Từ Khước',
    artist: 'Phan Mạnh Quỳnh',
    genre: 'Soundtrack / Ballad',
    duration: '0:30',
    cover: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=200',
    bpm: 76,
    key: 'Bb Major',
    notes: [233.08, 293.66, 349.23, 440.00, 349.23, 293.66, 233.08, 196.00]
  },
  {
    id: 'song-21',
    title: 'Daylight',
    artist: 'David Kushner',
    genre: 'Indie Folk / Dark Pop',
    duration: '0:30',
    cover: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=200',
    bpm: 72,
    key: 'F Minor',
    notes: [174.61, 207.65, 261.63, 311.13, 261.63, 207.65, 174.61, 130.81]
  }
];

// Singleton Web Audio Player Engine (Hỗ trợ cả Web Audio Synthesizer và URL Audio thật)
class WebAudioStoryPlayer {
  constructor() {
    this.ctx = null;
    this.activeInterval = null;
    this.currentPlayingSongId = null;
    this.gainNode = null;
    this.audioElement = null;
    this.onStateChange = null;
  }

  init() {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        this.ctx = new AudioContextClass();
        this.gainNode = this.ctx.createGain();
        this.gainNode.gain.setValueAtTime(0.35, this.ctx.currentTime);
        this.gainNode.connect(this.ctx.destination);
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playSong(song, onTick) {
    if (!song) return;
    this.stop();

    const songId = song.id || (typeof song === 'string' ? song : 'custom-audio');
    const audioUrl = song.audioUrl || song.url || (typeof song === 'string' && song.startsWith('http') ? song : null);

    this.currentPlayingSongId = songId;

    // Nếu bài hát có URL audio trực tiếp
    if (audioUrl) {
      try {
        this.audioElement = new Audio(audioUrl);
        this.audioElement.volume = 0.5;
        this.audioElement.play().catch(e => console.warn('[Audio Player] Play error:', e));
        this.audioElement.onended = () => {
          this.stop();
          if (this.onStateChange) this.onStateChange(null);
        };
        if (this.onStateChange) this.onStateChange(songId);
        return;
      } catch (e) {
        console.warn('[Audio Player] HTML5 Audio failed, falling back:', e);
      }
    }

    // Nếu bài hát dùng Web Audio Synthesizer
    this.init();
    if (!this.ctx) return;

    const notes = song.notes || [261.63, 329.63, 392.00, 523.25];
    let noteIndex = 0;
    const intervalTime = Math.round((60 / (song.bpm || 95)) * 500);

    const playNote = () => {
      if (!this.ctx || this.currentPlayingSongId !== songId) return;
      const now = this.ctx.currentTime;
      const freq = notes[noteIndex % notes.length];

      const osc = this.ctx.createOscillator();
      const noteGain = this.ctx.createGain();

      osc.type = song.genre?.includes('Rock') || song.genre?.includes('Dance') ? 'sawtooth' : 'sine';
      osc.frequency.setValueAtTime(freq, now);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.008, now + 0.15);
      osc.frequency.exponentialRampToValueAtTime(freq, now + 0.35);

      noteGain.gain.setValueAtTime(0.001, now);
      noteGain.gain.linearRampToValueAtTime(0.25, now + 0.05);
      noteGain.gain.exponentialRampToValueAtTime(0.001, now + (intervalTime / 1000) * 1.3);

      osc.connect(noteGain);
      noteGain.connect(this.gainNode);

      osc.start(now);
      osc.stop(now + (intervalTime / 1000) * 1.4);

      if (noteIndex % 2 === 0) {
        const bassOsc = this.ctx.createOscillator();
        const bassGain = this.ctx.createGain();
        bassOsc.type = 'triangle';
        bassOsc.frequency.setValueAtTime(freq / 2, now);
        bassGain.gain.setValueAtTime(0.18, now);
        bassGain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
        bassOsc.connect(bassGain);
        bassGain.connect(this.gainNode);
        bassOsc.start(now);
        bassOsc.stop(now + 0.45);
      }

      noteIndex++;
      if (onTick) onTick(noteIndex);
    };

    playNote();
    this.activeInterval = setInterval(playNote, intervalTime);
    if (this.onStateChange) this.onStateChange(songId);
  }

  togglePlay(song, onTick) {
    const songId = song?.id || (typeof song === 'string' ? song : 'custom-audio');
    if (this.isPlaying(songId)) {
      this.stop();
      if (this.onStateChange) this.onStateChange(null);
      return false;
    } else {
      this.playSong(song, onTick);
      return true;
    }
  }

  stop() {
    if (this.activeInterval) {
      clearInterval(this.activeInterval);
      this.activeInterval = null;
    }
    if (this.audioElement) {
      try {
        this.audioElement.pause();
        this.audioElement.currentTime = 0;
      } catch (e) {}
      this.audioElement = null;
    }
    this.currentPlayingSongId = null;
    if (this.onStateChange) this.onStateChange(null);
  }

  isPlaying(songId) {
    if (!songId) return Boolean(this.currentPlayingSongId);
    return this.currentPlayingSongId === songId;
  }

  getCurrentSongId() {
    return this.currentPlayingSongId;
  }
}

export const storyAudioPlayer = new WebAudioStoryPlayer();
