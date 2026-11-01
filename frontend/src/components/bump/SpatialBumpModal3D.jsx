import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import confetti from 'canvas-confetti';

/**
 * Âm thanh Cụm Ly Thủy Tinh (Crystal Clink Chime) qua Web Audio API
 * Tần số cao vút 2200Hz + họa âm 4400Hz mô phỏng 100% tiếng va chạm ly thủy tinh
 */
function playGlassClinkSound() {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();

    const now = ctx.currentTime;
    
    // Dao động chính (2200Hz - Tiếng ly pha lê cao)
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

    // Họa âm bội 2 (4500Hz - Tiếng ngân vang 'Keng' sắc sảo)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(4500, now);

    gain2.gain.setValueAtTime(0.001, now);
    gain2.gain.linearRampToValueAtTime(0.4, now + 0.003);
    gain2.gain.exponentialRampToValueAtTime(0.0001, now + 0.6);

    osc2.connect(gain2);
    gain2.connect(ctx.destination);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 1.0);
    osc2.stop(now + 0.8);
  } catch (e) {
    console.warn('[Web Audio] Clink sound blocked by browser policy:', e);
  }
}

/**
 * Component SpatialBumpModal3D - Màn hình Cụm Ly Không Gian 3D (Three.js)
 * Tương tác va chạm 2 chiếc ly 3D thời gian thực khi 2 bạn bè gặp nhau ngoài đời (< 15m)
 * Tự động đồng bộ âm thanh, tia sáng particle, pháo hoa và tạo Story đôi trên bản đồ
 */
export default function SpatialBumpModal3D({
  isOpen = false,
  onClose,
  initiatorName = 'Bạn',
  initiatorAvatar = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
  targetName = 'Người bạn',
  targetAvatar = 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
  isInitiator = true
}) {
  const containerRef = useRef(null);
  const [animationStage, setAnimationStage] = useState('APPROACH'); // 'APPROACH' | 'CLINK' | 'CELEBRATE'

  useEffect(() => {
    if (!isOpen || !containerRef.current) return;

    setAnimationStage('APPROACH');

    const width = window.innerWidth;
    const height = window.innerHeight;

    // 1. Scene, Camera, Renderer (Three.js r186)
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, 8);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    containerRef.current.appendChild(renderer.domElement);

    // 2. Hệ thống chiếu sáng 3D
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

    // 3. Xây dựng mô hình 3D: Cặp Ly Thủy Tinh / Cocktail
    const createGlassMesh = (isLeft) => {
      const group = new THREE.Group();

      // Thân ly hình nón cụt pha lê
      const bowlGeom = new THREE.CylinderGeometry(0.7, 0.2, 1.2, 32, 1, true);
      const glassMat = new THREE.MeshStandardMaterial({
        color: isLeft ? 0x0284c7 : 0xe11d48,
        metalness: 0.15,
        roughness: 0.05,
        transparent: true,
        opacity: 0.75,
        side: THREE.DoubleSide
      });
      const bowl = new THREE.Mesh(bowlGeom, glassMat);
      bowl.position.y = 0.6;
      group.add(bowl);

      // Nước cocktail sóng sánh bên trong
      const liquidGeom = new THREE.CylinderGeometry(0.65, 0.22, 0.9, 32);
      const liquidMat = new THREE.MeshStandardMaterial({
        color: isLeft ? 0x38bdf8 : 0xfb7185,
        roughness: 0.2,
        emissive: isLeft ? 0x0369a1 : 0xbe123c,
        emissiveIntensity: 0.4
      });
      const liquid = new THREE.Mesh(liquidGeom, liquidMat);
      liquid.position.y = 0.5;
      group.add(liquid);

      // Chân ly thon dài
      const stemGeom = new THREE.CylinderGeometry(0.06, 0.06, 1.1, 16);
      const stemMat = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        metalness: 0.3,
        roughness: 0.1,
        transparent: true,
        opacity: 0.8
      });
      const stem = new THREE.Mesh(stemGeom, stemMat);
      stem.position.y = -0.55;
      group.add(stem);

      // Đế ly tròn vững chắc
      const baseGeom = new THREE.CylinderGeometry(0.6, 0.6, 0.06, 32);
      const base = new THREE.Mesh(baseGeom, stemMat);
      base.position.y = -1.1;
      group.add(base);

      return group;
    };

    const leftGlass = createGlassMesh(true);
    const rightGlass = createGlassMesh(false);

    // Vị trí xuất phát ở 2 rìa màn hình
    leftGlass.position.set(-4.5, 0, 0);
    leftGlass.rotation.z = -0.15;
    rightGlass.position.set(4.5, 0, 0);
    rightGlass.rotation.z = 0.15;

    scene.add(leftGlass);
    scene.add(rightGlass);

    // 4. Hệ thống hạt lóe sáng (Particle System) khi va chạm
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

    // 5. Vòng lặp Render & Hoạt Cảnh Vật Lý
    let startTime = performance.now();
    let hasClinked = false;
    let animId = null;

    const animate = (time) => {
      const elapsed = (time - startTime) / 1000; // giây

      if (elapsed < 1.1) {
        // Giai đoạn 1: Tiếp cận (Approach)
        const t = Math.min(elapsed / 1.0, 1.0);
        // Easing cubic out
        const ease = 1 - Math.pow(1 - t, 3);

        leftGlass.position.x = -4.5 + ease * 3.8; // Dừng tại -0.7
        leftGlass.rotation.z = -0.15 + ease * 0.35; // Nghiêng vào giữa

        rightGlass.position.x = 4.5 - ease * 3.8; // Dừng tại 0.7
        rightGlass.rotation.z = 0.15 - ease * 0.35;
      } else if (elapsed >= 1.1 && !hasClinked) {
        // Giai đoạn 2: VA CHẠM 'KENG!' (Impact Point)
        hasClinked = true;
        setAnimationStage('CLINK');

        leftGlass.position.x = -0.62;
        leftGlass.rotation.z = 0.22;
        rightGlass.position.x = 0.62;
        rightGlass.rotation.z = -0.22;

        // Âm thanh ly thủy tinh va chạm
        playGlassClinkSound();

        // Rung thiết bị di động
        if (navigator.vibrate) {
          navigator.vibrate([60, 40, 90]);
        }

        // Bật đèn chớp lóe tâm va chạm
        centerFlashLight.intensity = 8.0;

        // Kích hoạt hạt sáng
        particleMat.opacity = 1.0;

        // Pháo hoa ăn mừng
        confetti({
          particleCount: 70,
          spread: 80,
          origin: { y: 0.45 },
          colors: ['#38bdf8', '#f43f5e', '#fbbf24', '#ffffff']
        });

        setTimeout(() => {
          setAnimationStage('CELEBRATE');
        }, 500);
      } else if (elapsed > 1.1 && elapsed < 4.0) {
        // Giai đoạn 3: Nảy nhẹ sau va chạm & Hạt sáng bung nở
        const postElapsed = elapsed - 1.1;

        // Nảy nhẹ ra sau khi chạm
        leftGlass.position.x = -0.62 - Math.sin(postElapsed * 5) * 0.15 * Math.exp(-postElapsed * 2);
        rightGlass.position.x = 0.62 + Math.sin(postElapsed * 5) * 0.15 * Math.exp(-postElapsed * 2);

        // Giảm đèn chớp
        centerFlashLight.intensity = Math.max(0, 8.0 - postElapsed * 10);

        // Cập nhật vị trí các hạt sáng particle
        const pos = particleGeom.attributes.position.array;
        for (let i = 0; i < particleCount; i++) {
          pos[i * 3] += particleVelocities[i].x * 0.016;
          pos[i * 3 + 1] += particleVelocities[i].y * 0.016;
          pos[i * 3 + 2] += particleVelocities[i].z * 0.016;

          // Trọng lực rơi chậm
          particleVelocities[i].y -= 0.05;
        }
        particleGeom.attributes.position.needsUpdate = true;
        particleMat.opacity = Math.max(0, 1.0 - postElapsed * 0.6);
      }

      renderer.render(scene, camera);
      animId = requestAnimationFrame(animate);
    };

    animId = requestAnimationFrame(animate);

    // Xử lý Resize
    const handleResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // Cleanup tài nguyên Three.js sạch sẽ, chống rò rỉ GPU VRAM
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      if (renderer.domElement && renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
      scene.traverse((obj) => {
        if (obj.geometry) {
          obj.geometry.dispose();
        }
        if (obj.material) {
          if (Array.isArray(obj.material)) {
            obj.material.forEach((m) => m.dispose());
          } else {
            obj.material.dispose();
          }
        }
      });
      renderer.dispose();
      scene.clear();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-between p-4 sm:p-6 bg-[#0E0E10]/90 backdrop-blur-2xl text-slate-100 overflow-hidden select-none animate-in fade-in duration-300">
      {/* 1. Header Báo Cáo Gặp Gỡ & HUD Telemetry */}
      <div className="w-full max-w-sm text-center pt-4 sm:pt-6 space-y-2 z-20 pointer-events-none">
        <div className="inline-flex items-center justify-between w-full px-3 py-1.5 rounded-full bg-[#151619]/90 border border-white/10 backdrop-blur-md shadow-lg">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-[11px] font-medium text-slate-300">
              Gia tốc chạm: <strong className="text-white font-mono">19.4 m/s²</strong>
            </span>
          </div>
          <div className="flex items-center gap-1 text-[11px] text-[#00F5FF] font-mono font-bold">
            <i className="bi bi-reception-4"></i>
            <span>UWB Active</span>
          </div>
        </div>

        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#00F5FF]/10 border border-[#00F5FF]/30 text-[#00F5FF] text-[11px] font-bold tracking-wide uppercase shadow-[0_0_15px_rgba(0,245,255,0.2)]">
          <i className="bi bi-phone-vibrate animate-pulse"></i>
          <span>Spatial Bump 3.0 • Cự ly &lt; 15m</span>
        </div>

        <h2 className="text-lg sm:text-xl font-black text-white tracking-tight flex items-center justify-center gap-2 mt-1">
          <span>{initiatorName}</span>
          <i className="bi bi-lightning-charge-fill text-[#00F5FF] text-base animate-pulse"></i>
          <span>{targetName}</span>
        </h2>
      </div>

      {/* 2. Canvas Three.js Layer chèn ở giữa màn hình */}
      <div ref={containerRef} className="absolute inset-0 pointer-events-none z-10"></div>

      {/* 3. Avatars Hai Người Bay Theo Hai Bên Kèm Luồng Hạt Plasma */}
      <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex items-center justify-between px-6 sm:px-20 z-20 pointer-events-none">
        {/* Left Avatar (Bạn) */}
        <div className="flex flex-col items-center gap-1.5 animate-in slide-in-from-left duration-500">
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#00F5FF]/20 to-blue-600/30 p-[2px] border border-[#00F5FF]/60 shadow-[0_0_20px_rgba(0,245,255,0.35)]">
              <img 
                src={initiatorAvatar} 
                alt={initiatorName}
                className="w-full h-full object-cover rounded-[14px]"
              />
            </div>
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#00F5FF] text-black text-[9px] font-black flex items-center justify-center ring-2 ring-[#0E0E10]">
              <i className="bi bi-person-fill"></i>
            </span>
          </div>
          <span className="text-xs font-bold text-white max-w-[90px] truncate">{initiatorName}</span>
          <span className="text-[10px] font-mono text-[#00F5FF]">BẠN</span>
        </div>

        {/* Cầu hạt năng lượng nối 2 Avatar */}
        <div className="flex flex-col items-center gap-1 px-2">
          <div className="px-2.5 py-0.5 rounded-full bg-[#0E0E10]/90 border border-[#00F5FF]/40 text-[10px] font-mono text-[#00F5FF] shadow-lg backdrop-blur-md">
            1.2 m
          </div>
          <div className="w-16 sm:w-28 h-[2px] bg-gradient-to-r from-[#00F5FF] via-[#A855F7] to-[#00F5FF] animate-pulse"></div>
        </div>

        {/* Right Avatar (Đối phương) */}
        <div className="flex flex-col items-center gap-1.5 animate-in slide-in-from-right duration-500">
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#A855F7]/20 to-fuchsia-600/30 p-[2px] border border-[#A855F7]/60 shadow-[0_0_20px_rgba(168,85,247,0.35)]">
              <img 
                src={targetAvatar} 
                alt={targetName}
                className="w-full h-full object-cover rounded-[14px]"
              />
            </div>
            <span className="absolute -top-1 -left-1 w-4 h-4 rounded-full bg-[#A855F7] text-white text-[9px] font-black flex items-center justify-center ring-2 ring-[#0E0E10]">
              <i className="bi bi-check-lg"></i>
            </span>
          </div>
          <span className="text-xs font-bold text-white max-w-[90px] truncate">{targetName}</span>
          <span className="text-[10px] font-mono text-[#A855F7]">BẠN BÈ</span>
        </div>
      </div>

      {/* 4. Target Partner HUD Card & Footer Controls */}
      <div className="w-full max-w-sm pb-6 text-center space-y-2.5 z-20">
        
        {/* Partner HUD Card */}
        <div className="p-3.5 bg-[#151619]/90 border border-white/10 rounded-2xl shadow-2xl backdrop-blur-md text-left space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-bold text-white text-sm">{targetName}</span>
              <i className="bi bi-patch-check-fill text-[#00F5FF] text-xs"></i>
            </div>
            <span className="text-[10px] font-mono text-emerald-400 font-bold flex items-center gap-1">
              <i className="bi bi-shield-check"></i> Bạn bè xác thực
            </span>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-slate-400">
            <span className="px-2 py-0.5 rounded bg-white/5 border border-white/5 text-slate-300">
              <i className="bi bi-geo-alt-fill text-[#00F5FF] mr-1"></i>Cự ly: Cận kề
            </span>
            <span className="px-2 py-0.5 rounded bg-[#A855F7]/10 border border-[#A855F7]/20 text-purple-300">
              <i className="bi bi-person-check-fill mr-1 text-emerald-400"></i>Bạn bè thân thiết
            </span>
          </div>
        </div>

        {/* Nút hành động Cụng Ly Bạn Bè */}
        <div className="space-y-2">
          <button
            type="button"
            onClick={() => {
              playGlassClinkSound();
              confetti({ particleCount: 70, spread: 80, origin: { y: 0.6 } });
              setAnimationStage('CELEBRATE');
              setTimeout(onClose, 1200);
            }}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#00E5FF] to-[#00B4D8] hover:from-[#38f8ff] hover:to-[#00E5FF] text-[#08202E] font-black text-xs shadow-[0_0_20px_rgba(0,229,255,0.45)] active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2 tracking-wide font-display"
          >
            <i className="bi bi-cup-straw text-base"></i>
            <span>Cụng Ly Chúc Mừng</span>
          </button>

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

