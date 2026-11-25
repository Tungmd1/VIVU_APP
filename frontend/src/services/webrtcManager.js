/**
 * webrtcManager.js
 * Quản lý kết nối WebRTC RTCPeerConnection P2P & MediaStream cho VIVU
 * Hỗ trợ gọi thoại & gọi video, STUN NAT traversal, lật camera, bật/tắt mic & video
 * Tuân thủ Rule 7 (< 250 dòng) và quy tắc Zero-Crash
 */

const RTC_CONFIG = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' }
  ]
};

class WebRTCManager {
  constructor() {
    this.peerConnection = null;
    this.localStream = null;
    this.remoteStream = null;
    this.currentFacingMode = 'user'; // 'user' (trước) | 'environment' (sau)
    this.isMuted = false;
    this.isVideoOff = false;
    this.iceCandidateQueue = [];
  }

  // Khởi tạo luồng MediaStream từ thiết bị (Camera & Mic)
  async startLocalStream({ isVideo = true, facingMode = 'user' } = {}) {
    this.cleanupLocalStream();
    this.currentFacingMode = facingMode;

    const constraints = {
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true
      },
      video: isVideo ? {
        facingMode: { ideal: facingMode },
        width: { ideal: 1280 },
        height: { ideal: 720 }
      } : false
    };

    if (!navigator.mediaDevices?.getUserMedia) {
      throw new Error('Trình duyệt không hỗ trợ WebRTC MediaDevices.');
    }

    try {
      this.localStream = await navigator.mediaDevices.getUserMedia(constraints);
      this.isMuted = false;
      this.isVideoOff = !isVideo;
      return this.localStream;
    } catch (err) {
      console.warn('[WebRTCManager] getUserMedia error:', err.name, err.message);
      if (isVideo && (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError' || err.name === 'OverconstrainedError' || err.name === 'NotAllowedError')) {
        try {
          console.warn('[WebRTCManager] Camera không khả dụng, chuyển sang chế độ chỉ nhận hình & dùng mic thoại');
          this.localStream = await navigator.mediaDevices.getUserMedia({
            audio: constraints.audio,
            video: false
          });
          this.isMuted = false;
          this.isVideoOff = true;
          return this.localStream;
        } catch (audioErr) {
          console.warn('[WebRTCManager] Fallback audio cũng thất bại:', audioErr.message);
        }
      }
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        throw new Error('Quyền truy cập Camera/Microphone đã bị từ chối.');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        throw new Error('Không tìm thấy thiết bị Camera hoặc Microphone.');
      }
      throw err;
    }
  }

  // Tạo và thiết lập RTCPeerConnection
  createPeerConnection({ onRemoteStream, onIceCandidate, onConnectionStateChange } = {}) {
    this.closePeerConnection();
    this.iceCandidateQueue = [];
    this.remoteRawStream = new MediaStream();

    this.peerConnection = new RTCPeerConnection(RTC_CONFIG);

    // Gắn local tracks vào peer connection
    let hasLocalVideo = false;
    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => {
        if (track.kind === 'video') hasLocalVideo = true;
        this.peerConnection.addTrack(track, this.localStream);
      });
    }

    // Nếu không có local video (VD: PC không camera hoặc camera tắt), đảm bảo sẵn sàng nhận video từ đối phương
    if (!hasLocalVideo) {
      try {
        this.peerConnection.addTransceiver('video', { direction: 'recvonly' });
      } catch (_) {}
    }

    // Gom audio/video track bền vững vào một MediaStream mới để React gắn lại srcObject tin cậy
    this.peerConnection.ontrack = (event) => {
      if (!this.remoteRawStream) this.remoteRawStream = new MediaStream();
      const incomingTracks = (event.streams && event.streams[0])
        ? event.streams[0].getTracks()
        : (event.track ? [event.track] : []);

      incomingTracks.forEach((track) => {
        const existingSameKind = this.remoteRawStream.getTracks().filter(
          (t) => t.kind === track.kind && t.id !== track.id
        );
        existingSameKind.forEach((oldTrack) => {
          try { this.remoteRawStream.removeTrack(oldTrack); } catch (_) {}
        });
        if (!this.remoteRawStream.getTracks().some((t) => t.id === track.id)) {
          this.remoteRawStream.addTrack(track);
        }
      });

      this.remoteStream = new MediaStream(this.remoteRawStream.getTracks());
      if (onRemoteStream && this.remoteStream.getTracks().length > 0) {
        onRemoteStream(this.remoteStream);
      }
    };

    // Khi tìm thấy ICE Candidate
    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate && onIceCandidate) {
        onIceCandidate(event.candidate);
      }
    };

    // Theo dõi trạng thái kết nối P2P
    this.peerConnection.onconnectionstatechange = () => {
      if (onConnectionStateChange) {
        onConnectionStateChange(this.peerConnection.connectionState);
      }
    };

    return this.peerConnection;
  }

  // Tạo SDP Offer (Phía người gọi)
  async createOffer() {
    if (!this.peerConnection) throw new Error('PeerConnection chưa được khởi tạo');
    const offer = await this.peerConnection.createOffer({
      offerToReceiveAudio: true,
      offerToReceiveVideo: true
    });
    await this.peerConnection.setLocalDescription(offer);
    return offer;
  }

  // Xử lý Offer và tạo Answer (Phía người nhận)
  async handleOfferAndCreateAnswer(offerSdp) {
    if (!this.peerConnection) throw new Error('PeerConnection chưa được khởi tạo');
    await this.peerConnection.setRemoteDescription(new RTCSessionDescription(offerSdp));
    await this.flushIceCandidates();
    const answer = await this.peerConnection.createAnswer();
    await this.peerConnection.setLocalDescription(answer);
    return answer;
  }

  // Xử lý Answer nhận được (Phía người gọi)
  async handleAnswer(answerSdp) {
    if (!this.peerConnection) return;
    if (this.peerConnection.signalingState !== 'stable') {
      await this.peerConnection.setRemoteDescription(new RTCSessionDescription(answerSdp));
      await this.flushIceCandidates();
    }
  }

  // Thêm ICE Candidate hoặc lưu vào hàng đợi đệm nếu remoteDescription chưa sẵn sàng
  async addIceCandidate(candidate) {
    if (!candidate) return;
    if (!this.peerConnection || !this.peerConnection.remoteDescription || !this.peerConnection.remoteDescription.type) {
      this.iceCandidateQueue.push(candidate);
      return;
    }
    try {
      await this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
    } catch (err) {
      console.warn('[WebRTCManager] Lỗi addIceCandidate:', err.message);
    }
  }

  // Xả toàn bộ candidate đã lưu đệm vào RTCPeerConnection sau khi remoteDescription được set
  async flushIceCandidates() {
    if (!this.peerConnection || !this.peerConnection.remoteDescription) return;
    while (this.iceCandidateQueue.length > 0) {
      const candidate = this.iceCandidateQueue.shift();
      try {
        await this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (err) {
        console.warn('[WebRTCManager] Lỗi flush ICE candidate:', err.message);
      }
    }
  }

  // Bật / Tắt Microphone
  toggleAudio(enabled) {
    if (!this.localStream) return false;
    const audioTrack = this.localStream.getAudioTracks()[0];
    if (audioTrack) {
      const nextState = typeof enabled === 'boolean' ? enabled : !audioTrack.enabled;
      audioTrack.enabled = nextState;
      this.isMuted = !nextState;
      return nextState;
    }
    return false;
  }

  // Bật / Tắt Camera
  toggleVideo(enabled) {
    if (!this.localStream) return false;
    const videoTrack = this.localStream.getVideoTracks()[0];
    if (videoTrack) {
      const nextState = typeof enabled === 'boolean' ? enabled : !videoTrack.enabled;
      videoTrack.enabled = nextState;
      this.isVideoOff = !nextState;
      return nextState;
    }
    return false;
  }

  // Đổi Camera Trước / Sau (Flip Camera trên thiết bị di động)
  async switchCamera() {
    if (!this.localStream) return;
    const nextFacingMode = this.currentFacingMode === 'user' ? 'environment' : 'user';

    try {
      const oldVideoTrack = this.localStream.getVideoTracks()[0];
      if (oldVideoTrack) oldVideoTrack.stop();

      const newStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: nextFacingMode } }
      });
      const newVideoTrack = newStream.getVideoTracks()[0];

      if (this.peerConnection) {
        const sender = this.peerConnection.getSenders().find(s => s.track && s.track.kind === 'video');
        if (sender) {
          await sender.replaceTrack(newVideoTrack);
        }
      }

      // Tạo tham chiếu MediaStream mới để useWebRTCCall cập nhật lại thẻ <video>
      this.localStream.removeTrack(oldVideoTrack);
      this.localStream.addTrack(newVideoTrack);
      this.localStream = new MediaStream(this.localStream.getTracks());
      this.currentFacingMode = nextFacingMode;
      return this.localStream;
    } catch (err) {
      console.warn('[WebRTCManager] Lỗi switchCamera:', err.message);
      return this.localStream;
    }
  }

  // Dọn dẹp local MediaStream (tắt đèn camera/micro)
  cleanupLocalStream() {
    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => {
        try { track.stop(); } catch (_) {}
      });
      this.localStream = null;
    }
    this.remoteStream = null;
    this.remoteRawStream = null;
  }

  // Đóng kết nối P2P
  closePeerConnection() {
    this.iceCandidateQueue = [];
    this.remoteRawStream = null;
    if (this.peerConnection) {
      try {
        this.peerConnection.ontrack = null;
        this.peerConnection.onicecandidate = null;
        this.peerConnection.onconnectionstatechange = null;
        this.peerConnection.close();
      } catch (_) {}
      this.peerConnection = null;
    }
  }

  // Dọn dẹp hoàn toàn
  destroy() {
    this.cleanupLocalStream();
    this.closePeerConnection();
  }
}

export const webrtcManager = new WebRTCManager();
