import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import confetti from 'canvas-confetti';
import { DEFAULT_WHITE_PERSON_AVATAR } from '../../utils/avatarUtils';

/**
 * Âm thanh Cụm Ly Thủy Tinh (Crystal Clink Chime) qua Web Audio API
 * Tần số cao vút 2200Hz + họa âm 4400Hz mô phỏng tiếng va chạm ly pha lê
 */
function playGlassClinkSound() {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const now = ctx.currentTime;
    
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(2250, now);
    osc1.frequency.exponentialRampToValueAtTime(2200, now + 0.8);
    gain1.gain.setValueAtTime(0.001, now);
    gain1.gain.linearRampToValueAtTime(0.7, now + 0.005);
    gain1.gain.exponentialRampToValueAtTime(0.0001, now + 0.9);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);

    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(4500, now);
    gain2.gain.setValueAtTime(0.001, now);
    gain2.gain.linearRampToValueAtTime(0.4, now + 0.003);
    gain2.gain.exponentialRampToValueAtTime(0.0001, now + 0.6);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);

    osc1.start(now); osc2.start(now);
    osc1.stop(now + 1.0); osc2.stop(now + 0.8);
  } catch (e) {
    console.warn('[Web Audio] Clink sound blocked by browser policy:', e);
  }
}

/**
 * SpatialBumpModal3D - Màn hình Cụm Ly Không Gian 3D (Three.js)
 * Giao thức Mutual Handshake: 2 thiết bị cùng bấm nút để kích hoạt va chạm đồng bộ
 */
export default function SpatialBumpModal3D({
  isOpen = false,
  onClose,
  initiatorName = 'Bạn',
  initiatorAvatar = DEFAULT_WHITE_PERSON_AVATAR,
  targetName = 'Người bạn',
  targetAvatar = DEFAULT_WHITE_PERSON_AVATAR,
  isInitiator = true,
  isMyReady = false,
  isPeerReady = false,
  clinkTriggered = false,
  onReady
}) {
  const containerRef = useRef(null);
  const [animationStage, setAnimationStage] = useState('APPROACH'); // 'APPROACH' | 'READY' | 'CLINK' | 'CELEBRATE'
  const clinkTriggeredRef = useRef(false);

  // Đồng bộ ref với prop clinkTriggered để vòng lặp Three.js đọc được
  useEffect(() => {
    clinkTriggeredRef.current = clinkTriggered;
  }, [clinkTriggered]);

  // Chuẩn hóa định danh: Bên trái luôn là Chính Mình (BẠN), bên phải luôn là Bạn Bè (BẠN BÈ)
  const myName = isInitiator ? initiatorName : targetName;
  const myAvatar = isInitiator ? initiatorAvatar : targetAvatar;
  const partnerName = isInitiator ? targetName : initiatorName;
  const partnerAvatar = isInitiator ? targetAvatar : initiatorAvatar;

  // Tự động đóng modal sau khi cụng ly ăn mừng thành công (1.6s)
  useEffect(() => {
    if (clinkTriggered) {
      const timer = setTimeout(() => {
        if (onClose) onClose();
      }, 1600);
      return () => clearTimeout(timer);
    }
  }, [clinkTriggered, onClose]);

  // Khởi tạo và điều khiển Three.js Canvas
  useEffect(() => {
    if (!isOpen || !containerRef.current) return;

    setAnimationStage('APPROACH');

    const width = window.innerWidth;
    const height = window.innerHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, 8);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    containerRef.current.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0x38bdf8, 3.0);
    keyLight.position.set(5, 6, 6);
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0xf43f5e, 2.5);
    rimLight.position.set(-5, -4, 4);
    scene.add(rimLight);

    const centerFlashLight = new THREE.PointLight(0xffffff, 0, 15);
    centerFlashLight.position.set(0, 0, 2);
    scene.add(centerFlashLight);

    const createGlassMesh = (isLeft) => {
      const group = new THREE.Group();
      const bowlGeom = new THREE.CylinderGeometry(0.7, 0.2, 1.2, 32, 1, true);
      const glassMat = new THREE.MeshStandardMaterial({
        color: isLeft ? 0x0284c7 : 0xe11d48, metalness: 0.15, roughness: 0.05, transparent: true, opacity: 0.75, side: THREE.DoubleSide
      });
      const bowl = new THREE.Mesh(bowlGeom, glassMat);
      bowl.position.y = 0.6;
      group.add(bowl);

      const liquidGeom = new THREE.CylinderGeometry(0.65, 0.22, 0.9, 32);
      const liquidMat = new THREE.MeshStandardMaterial({
        color: isLeft ? 0x38bdf8 : 0xfb7185, roughness: 0.2, emissive: isLeft ? 0x0369a1 : 0xbe123c, emissiveIntensity: 0.4
      });
      const liquid = new THREE.Mesh(liquidGeom, liquidMat);
      liquid.position.y = 0.5;
      group.add(liquid);

      const stemGeom = new THREE.CylinderGeometry(0.06, 0.06, 1.1, 16);
      const stemMat = new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 0.3, roughness: 0.1, transparent: true, opacity: 0.8 });
      const stem = new THREE.Mesh(stemGeom, stemMat);
      stem.position.y = -0.55;
      group.add(stem);

      const baseGeom = new THREE.CylinderGeometry(0.6, 0.6, 0.06, 32);
      const base = new THREE.Mesh(baseGeom, stemMat);
      base.position.y = -1.1;
      group.add(base);
      return group;
    };

    const leftGlass = createGlassMesh(true);
    const rightGlass = createGlassMesh(false);

    leftGlass.position.set(-4.5, 0, 0);
    leftGlass.rotation.z = -0.15;
    rightGlass.position.set(4.5, 0, 0);
    rightGlass.rotation.z = 0.15;

    scene.add(leftGlass);
    scene.add(rightGlass);

    const particleCount = 120;
    const particleGeom = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const particleVelocities = [];

    for (let i = 0; i < particleCount; i++) {
      particlePositions[i * 3] = 0;
      particlePositions[i * 3 + 1] = 0.8;
      particlePositions[i * 3 + 2] = 0;

      const angle = Math.random() * Math.PI * 2;
      const speed = 1.5 + Math.random() * 3.5;
      particleVelocities.push({
        x: Math.cos(angle) * speed,
        y: Math.sin(angle) * speed + 1.2,
        z: (Math.random() - 0.5) * speed
      });
    }

    particleGeom.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0xfacc15,
      size: 0.14,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending
    });
    const particleSystem = new THREE.Points(particleGeom, particleMat);
    scene.add(particleSystem);

    const startTime = performance.now();
    let hasClinked = false;
    let clinkTime = 0;
    let animId = null;

    const animate = (time) => {
      const elapsed = (time - startTime) / 1000;

      if (!clinkTriggeredRef.current && !hasClinked) {
        // Giai đoạn đón chờ (Approach & Idle Float)
        const t = Math.min(elapsed / 0.8, 1.0);
        const ease = 1 - Math.pow(1 - t, 3);
        const baseLeftX = -4.5 + ease * 3.2; // Dừng tại -1.3
        const baseRightX = 4.5 - ease * 3.2; // Dừng tại 1.3

        // Dao động lơ lửng nhẹ nhàng chờ cả hai sẵn sàng
        const bob = Math.sin(time * 0.0035) * 0.05;
        leftGlass.position.x = baseLeftX + bob;
        leftGlass.position.y = bob * 0.5;
        leftGlass.rotation.z = -0.15 + ease * 0.25 + bob * 0.2;

        rightGlass.position.x = baseRightX - bob;
        rightGlass.position.y = -bob * 0.5;
        rightGlass.rotation.z = 0.15 - ease * 0.25 - bob * 0.2;
      } else if (clinkTriggeredRef.current && !hasClinked) {
        // KÍCH HOẠT VA CHẠM CỤNG LY ĐỒNG BỘ
        hasClinked = true;
        clinkTime = time;
        setAnimationStage('CLINK');

        leftGlass.position.x = -0.62;
        leftGlass.rotation.z = 0.22;
        rightGlass.position.x = 0.62;
        rightGlass.rotation.z = -0.22;

        playGlassClinkSound();

        if (navigator.vibrate) {
          navigator.vibrate([60, 40, 90]);
        }

        centerFlashLight.intensity = 8.0;
        particleMat.opacity = 1.0;

        confetti({
          particleCount: 80,
          spread: 80,
          origin: { y: 0.45 },
          colors: ['#38bdf8', '#f43f5e', '#fbbf24', '#ffffff']
        });

        setTimeout(() => {
          setAnimationStage('CELEBRATE');
        }, 400);
      } else if (hasClinked) {
        // Giai đoạn bung nảy sau va chạm
        const postElapsed = (time - clinkTime) / 1000;
        leftGlass.position.x = -0.62 - Math.sin(postElapsed * 5) * 0.15 * Math.exp(-postElapsed * 2);
        rightGlass.position.x = 0.62 + Math.sin(postElapsed * 5) * 0.15 * Math.exp(-postElapsed * 2);

        centerFlashLight.intensity = Math.max(0, 8.0 - postElapsed * 10);

        const pos = particleGeom.attributes.position.array;
        for (let i = 0; i < particleCount; i++) {
          pos[i * 3] += particleVelocities[i].x * 0.016;
          pos[i * 3 + 1] += particleVelocities[i].y * 0.016;
          pos[i * 3 + 2] += particleVelocities[i].z * 0.016;
          particleVelocities[i].y -= 0.05;
        }
        particleGeom.attributes.position.needsUpdate = true;
        particleMat.opacity = Math.max(0, 1.0 - postElapsed * 0.6);
      }

      renderer.render(scene, camera);
      animId = requestAnimationFrame(animate);
    };

    animId = requestAnimationFrame(animate);

    const handleResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      scene.traverse((obj) => {
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) {
          if (Array.isArray(obj.material)) obj.material.forEach(m => m.dispose());
          else obj.material.dispose();
        }
      });
      renderer.dispose();
      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[120] flex flex-col justify-between items-center p-4 bg-[#0a0a0c]/85 backdrop-blur-xl animate-in fade-in duration-300 select-none overflow-hidden font-sans">
      {/* 1. Header Trạng Thái & Nút Đóng */}
      <div className="w-full max-w-md flex items-center justify-between pt-4 px-2 z-20">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#00E5FF] animate-ping"></span>
          <span className="text-[11px] font-mono tracking-widest text-[#00E5FF] uppercase font-bold">
            VIVU SPATIAL BUMP
          </span>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 active:scale-90 text-white flex items-center justify-center transition-all cursor-pointer"
          title="Đóng"
        >
          <i className="bi bi-x-lg text-sm"></i>
        </button>
      </div>

      {/* 2. Three.js Canvas Layer */}
      <div ref={containerRef} className="absolute inset-0 pointer-events-none z-10"></div>

      {/* 3. Avatars Hai Người Bay Theo Hai Bên (Trái: Bạn, Phải: Đối phương) */}
      <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex items-center justify-between px-6 sm:px-20 z-20 pointer-events-none">
        {/* Left Avatar (BẠN) */}
        <div className="flex flex-col items-center gap-1.5 animate-in slide-in-from-left duration-500">
          <div className="relative">
            <div className={`w-16 h-16 rounded-2xl p-[2px] border transition-all duration-300 ${isMyReady ? 'bg-gradient-to-tr from-emerald-400 to-[#00E5FF] border-emerald-400 shadow-[0_0_20px_rgba(16,255,160,0.6)]' : 'bg-gradient-to-tr from-[#00F5FF]/20 to-blue-600/30 border-[#00F5FF]/60 shadow-[0_0_20px_rgba(0,245,255,0.35)]'}`}>
              <img 
                src={myAvatar} 
                alt={myName}
                className="w-full h-full object-cover rounded-[14px]"
              />
            </div>
            <span className={`absolute -top-1 -right-1 w-5 h-5 rounded-full text-[10px] font-black flex items-center justify-center ring-2 ring-[#0E0E10] ${isMyReady ? 'bg-emerald-400 text-black' : 'bg-[#00F5FF] text-black'}`}>
              <i className={`bi ${isMyReady ? 'bi-check-lg' : 'bi-person-fill'}`}></i>
            </span>
          </div>
          <span className="text-xs font-bold text-white max-w-[90px] truncate">{myName}</span>
          <span className="text-[10px] font-mono text-[#00F5FF] font-bold">BẠN {isMyReady ? '✓' : ''}</span>
        </div>

        {/* Cầu hạt năng lượng nối 2 Avatar */}
        <div className="flex flex-col items-center gap-1 px-2">
          <div className="px-2.5 py-0.5 rounded-full bg-[#0E0E10]/90 border border-[#00F5FF]/40 text-[10px] font-mono text-[#00F5FF] shadow-lg backdrop-blur-md">
            1.2 m
          </div>
          <div className="w-16 sm:w-28 h-[2px] bg-gradient-to-r from-[#00F5FF] via-[#A855F7] to-[#00F5FF] animate-pulse"></div>
        </div>

        {/* Right Avatar (BẠN BÈ) */}
        <div className="flex flex-col items-center gap-1.5 animate-in slide-in-from-right duration-500">
          <div className="relative">
            <div className={`w-16 h-16 rounded-2xl p-[2px] border transition-all duration-300 ${isPeerReady ? 'bg-gradient-to-tr from-amber-400 to-[#FF2A85] border-amber-400 shadow-[0_0_22px_rgba(255,42,133,0.6)] animate-pulse' : 'bg-gradient-to-tr from-[#A855F7]/20 to-fuchsia-600/30 border-[#A855F7]/60 shadow-[0_0_20px_rgba(168,85,247,0.35)]'}`}>
              <img 
                src={partnerAvatar} 
                alt={partnerName}
                className="w-full h-full object-cover rounded-[14px]"
              />
            </div>
            <span className={`absolute -top-1 -left-1 w-5 h-5 rounded-full text-[10px] font-black flex items-center justify-center ring-2 ring-[#0E0E10] ${isPeerReady ? 'bg-emerald-400 text-black animate-bounce' : 'bg-[#A855F7] text-white'}`}>
              <i className={`bi ${isPeerReady ? 'bi-check-lg' : 'bi-check'}`}></i>
            </span>
          </div>
          <span className="text-xs font-bold text-white max-w-[90px] truncate">{partnerName}</span>
          <span className="text-[10px] font-mono text-[#A855F7] font-bold">
            {isPeerReady ? 'ĐÃ SẴN SÀNG' : 'BẠN BÈ'}
          </span>
        </div>
      </div>

      {/* 4. Target Partner HUD Card & Footer Controls */}
      <div className="w-full max-w-sm pb-6 text-center space-y-2.5 z-20">
        
        {/* Partner HUD Card */}
        <div className="p-3.5 bg-[#151619]/90 border border-white/10 rounded-2xl shadow-2xl backdrop-blur-md text-left space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-bold text-white text-sm">{partnerName}</span>
              <i className="bi bi-patch-check-fill text-[#00F5FF] text-xs"></i>
            </div>
            <span className="text-[10px] font-mono text-emerald-400 font-bold flex items-center gap-1">
              <i className="bi bi-shield-check"></i> Bạn bè xác thực
            </span>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-slate-400">
            <span className="px-2 py-0.5 rounded bg-white/5 border border-white/5 text-slate-300">
              <i className="bi bi-geo-alt-fill text-[#00F5FF] mr-1"></i>Cự ly: Cận kề (&lt; 15m)
            </span>
            <span className="px-2 py-0.5 rounded bg-[#A855F7]/10 border border-[#A855F7]/20 text-purple-300">
              <i className="bi bi-person-check-fill mr-1 text-emerald-400"></i>Bạn bè thân thiết
            </span>
          </div>
        </div>

        {/* Nút hành động Cụng Ly: Chờ bắt tay 2 chiều (Mutual Handshake) */}
        <div className="space-y-2">
          {clinkTriggered ? (
            <div className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-400 to-[#10FFA0] text-[#08202E] font-black text-xs shadow-[0_0_25px_rgba(16,255,160,0.6)] flex items-center justify-center gap-2 animate-bounce">
              <i className="bi bi-cup-straw text-base"></i>
              <span>🎉 ĐANG CỤNG LY... KENG!</span>
            </div>
          ) : isMyReady ? (
            <div className="w-full py-3 px-4 rounded-xl bg-neutral-800/90 border border-white/20 text-[#00E5FF] font-bold text-xs flex items-center justify-center gap-2">
              <span className="w-3.5 h-3.5 border-2 border-[#00E5FF] border-t-transparent rounded-full animate-spin"></span>
              <span>Đã sẵn sàng! Đang chờ {partnerName} chạm ly...</span>
            </div>
          ) : isPeerReady ? (
            <button
              type="button"
              onClick={onReady}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-400 via-[#FF2A85] to-[#00E5FF] hover:opacity-95 text-white font-black text-xs shadow-[0_0_25px_rgba(255,42,133,0.7)] active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2 animate-pulse font-display"
            >
              <i className="bi bi-lightning-charge-fill text-base text-yellow-300"></i>
              <span>⚡ {partnerName} ĐÃ SẴN SÀNG! CHẠM ĐỂ CỤNG LY!</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onReady}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#00E5FF] to-[#00B4D8] hover:from-[#38f8ff] hover:to-[#00E5FF] text-[#08202E] font-black text-xs shadow-[0_0_20px_rgba(0,229,255,0.45)] active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2 tracking-wide font-display"
            >
              <i className="bi bi-cup-straw text-base"></i>
              <span>Cụng Ly Chúc Mừng</span>
            </button>
          )}

          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 px-4 rounded-xl bg-[#151619] hover:bg-white/10 text-slate-400 hover:text-white font-medium text-xs border border-white/5 transition-all cursor-pointer flex items-center justify-center gap-1.5"
          >
            <i className="bi bi-x-circle text-xs"></i>
            <span>Đóng</span>
          </button>
        </div>

      </div>
    </div>
  );
}
