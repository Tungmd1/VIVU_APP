import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { gsap } from 'gsap';

/**
 * Tạo texture đĩa than siêu thực (Realistic Vinyl Record Procedural Texture)
 */
function createVinylTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  const cx = 256;
  const cy = 256;

  // Nền đĩa đen bóng
  ctx.fillStyle = '#0d0d11';
  ctx.fillRect(0, 0, 512, 512);

  // Các rãnh đĩa siêu thực (Micro-grooves)
  for (let r = 80; r < 245; r += 2.5) {
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.strokeStyle = (r % 6 === 0) ? '#282835' : '#14141c';
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  // Nhãn giấy trung tâm (Center Album Label: Hồng & Xanh VIVU)
  const grad = ctx.createLinearGradient(176, 176, 336, 336);
  grad.addColorStop(0, '#FF2A85');
  grad.addColorStop(0.5, '#99004d');
  grad.addColorStop(1, '#00E5FF');
  ctx.beginPath();
  ctx.arc(cx, cy, 75, 0, Math.PI * 2);
  ctx.fillStyle = grad;
  ctx.fill();

  // Tâm lỗ trục đĩa
  ctx.beginPath();
  ctx.arc(cx, cy, 14, 0, Math.PI * 2);
  ctx.fillStyle = '#ffffff';
  ctx.fill();

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/**
 * Tạo texture địa cầu chi tiết (Realistic Earth Procedural Texture)
 */
function createEarthTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  // Đại dương sâu thẳm
  const oceanGrad = ctx.createLinearGradient(0, 0, 0, 512);
  oceanGrad.addColorStop(0, '#041226');
  oceanGrad.addColorStop(0.5, '#07244a');
  oceanGrad.addColorStop(1, '#041226');
  ctx.fillStyle = oceanGrad;
  ctx.fillRect(0, 0, 1024, 512);

  // Các mảng lục địa với bờ biển phát quang
  ctx.fillStyle = '#105646';
  ctx.shadowColor = '#00E5FF';
  ctx.shadowBlur = 12;

  // Vẽ các khối lục địa cách điệu
  const drawContinent = (x, y, w, h) => {
    ctx.beginPath();
    ctx.ellipse(x, y, w, h, 0.2, 0, Math.PI * 2);
    ctx.fill();
  };
  drawContinent(250, 180, 120, 80);
  drawContinent(320, 320, 90, 120);
  drawContinent(680, 190, 160, 90);
  drawContinent(780, 260, 110, 70);
  drawContinent(820, 360, 70, 60);

  // Ánh đèn thành phố đêm (City Night Lights)
  ctx.shadowBlur = 4;
  ctx.shadowColor = '#FFD700';
  ctx.fillStyle = '#FFF8DB';
  for (let i = 0; i < 180; i++) {
    const lx = Math.random() * 1024;
    const ly = Math.random() * 512;
    ctx.fillRect(lx, ly, 1.8, 1.8);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/**
 * SpatialGalaxyCanvas - Không Gian Vũ Trụ Siêu Thực (Hyper-Realistic Three.js + GSAP)
 */
export default function SpatialGalaxyCanvas({
  userAvatar,
  userName = 'Tôi',
  focusedPlanet = null,
  onSelectPlanet,
  onResetFocus
}) {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const planetsRef = useRef({});
  const cloudsRef = useRef(null);
  const vinylMeshRef = useRef(null);
  const isDraggingRef = useRef(false);
  const prevPointerRef = useRef({ x: 0, y: 0 });
  const sphericalRef = useRef({ radius: 17, theta: 0.35, phi: 1.15 });
  const lookAtTargetRef = useRef(new THREE.Vector3(0, 0, 0));

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // 1. Scene, Camera, Renderer với Cinematic Tone-Mapping
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.fog = new THREE.FogExp2(0x0a0e1c, 0.022);

    const camera = new THREE.PerspectiveCamera(50, container.clientWidth / container.clientHeight, 0.1, 120);
    cameraRef.current = camera;
    camera.position.set(0, 7, 17);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    rendererRef.current = renderer;
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.35;
    container.appendChild(renderer.domElement);

    // 2. Hệ Thống Ánh Sáng Đa Tầng (Studio Rim & Key Lights)
    scene.add(new THREE.AmbientLight(0xddeeff, 0.65));

    const coreLight = new THREE.PointLight(0xFF2A85, 4.5, 35, 1.8);
    coreLight.position.set(0, 0, 0);
    scene.add(coreLight);

    const rimLight = new THREE.DirectionalLight(0x00E5FF, 2.4);
    rimLight.position.set(12, 18, 12);
    scene.add(rimLight);

    const fillLight = new THREE.DirectionalLight(0xFF539A, 1.2);
    fillLight.position.set(-15, -8, -10);
    scene.add(fillLight);

    // 3. Biển Sao Bụi Vũ Trụ Tinh Tú (Dynamic Twinkling Starfield)
    const starCount = 1800;
    const starGeo = new THREE.BufferGeometry();
    const starPos = new Float32Array(starCount * 3);
    const starColors = new Float32Array(starCount * 3);
    const cPink = new THREE.Color(0xFF2A85);
    const cCyan = new THREE.Color(0x00E5FF);
    const cGold = new THREE.Color(0xFFD700);
    const cWhite = new THREE.Color(0xffffff);

    for (let i = 0; i < starCount; i++) {
      const dist = 14 + Math.random() * 50;
      const th = Math.random() * Math.PI * 2;
      const ph = Math.acos(2 * Math.random() - 1);
      starPos[i * 3] = dist * Math.sin(ph) * Math.cos(th);
      starPos[i * 3 + 1] = dist * Math.sin(ph) * Math.sin(th);
      starPos[i * 3 + 2] = dist * Math.cos(ph);

      const rand = Math.random();
      const col = rand > 0.7 ? cPink : (rand > 0.4 ? cCyan : (rand > 0.25 ? cGold : cWhite));
      starColors[i * 3] = col.r;
      starColors[i * 3 + 1] = col.g;
      starColors[i * 3 + 2] = col.b;
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    starGeo.setAttribute('color', new THREE.BufferAttribute(starColors, 3));
    const starMat = new THREE.PointsMaterial({ size: 0.17, vertexColors: true, transparent: true, opacity: 0.9 });
    scene.add(new THREE.Points(starGeo, starMat));

    // 4. MẶT TRỜI TRUNG TÂM: AVATAR CORE BỌC PHA LÊ & VÒNG QUAY GYROSCOPE
    const coreGroup = new THREE.Group();
    coreGroup.name = 'core';
    scene.add(coreGroup);

    // Ảnh avatar bên trong lõi
    const avatarDiscGeo = new THREE.CircleGeometry(1.35, 32);
    const textureLoader = new THREE.TextureLoader();
    const safeAvatarUrl = userAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=250';
    
    textureLoader.load(safeAvatarUrl, (tex) => {
      tex.colorSpace = THREE.SRGBColorSpace;
      const avatarMat = new THREE.MeshBasicMaterial({ map: tex, side: THREE.DoubleSide });
      const avatarMesh = new THREE.Mesh(avatarDiscGeo, avatarMat);
      avatarMesh.name = 'core';
      coreGroup.add(avatarMesh);
    });

    // Quả cầu pha lê bọc ngoài (Refractive Glass Orb)
    const glassSphereGeo = new THREE.SphereGeometry(1.6, 32, 32);
    const glassSphereMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transmission: 0.88,
      opacity: 1,
      transparent: true,
      roughness: 0.08,
      ior: 1.52,
      thickness: 1.2,
      reflectivity: 0.8
    });
    const glassSphere = new THREE.Mesh(glassSphereGeo, glassSphereMat);
    glassSphere.name = 'core';
    coreGroup.add(glassSphere);

    // Vành đai Gyroscope kép bằng kim loại chải xước (Brushed Chrome Gyro Rings)
    const ringMatCyan = new THREE.MeshStandardMaterial({ color: 0x00E5FF, metalness: 0.9, roughness: 0.15 });
    const ringMatPink = new THREE.MeshStandardMaterial({ color: 0xFF2A85, metalness: 0.9, roughness: 0.15 });
    
    const gyroRing1 = new THREE.Mesh(new THREE.TorusGeometry(1.95, 0.04, 16, 64), ringMatCyan);
    const gyroRing2 = new THREE.Mesh(new THREE.TorusGeometry(2.15, 0.04, 16, 64), ringMatPink);
    gyroRing1.rotation.x = Math.PI / 4;
    gyroRing2.rotation.y = Math.PI / 3;
    coreGroup.add(gyroRing1);
    coreGroup.add(gyroRing2);
    planetsRef.current['core'] = coreGroup;

    // 5. CÁC HÀNH TINH THIÊN THỂ SIÊU THỰC
    // 5.1 Hành tinh 📍 Địa Điểm Gu: Địa Cầu 3D + Lớp Mây Trôi + Ghim Giọt Nước
    const earthGroup = new THREE.Group();
    earthGroup.name = 'places';
    const earthGeo = new THREE.SphereGeometry(0.85, 32, 32);
    const earthMat = new THREE.MeshStandardMaterial({
      map: createEarthTexture(),
      roughness: 0.45,
      metalness: 0.15
    });
    const earthMesh = new THREE.Mesh(earthGeo, earthMat);
    earthMesh.name = 'places';
    earthGroup.add(earthMesh);

    // Lớp mây quyển khí quyển bồng bềnh
    const cloudsGeo = new THREE.SphereGeometry(0.88, 32, 32);
    const cloudsMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.35,
      blending: THREE.AdditiveBlending
    });
    const cloudsMesh = new THREE.Mesh(cloudsGeo, cloudsMat);
    earthGroup.add(cloudsMesh);
    cloudsRef.current = cloudsMesh;

    // Ghim giọt nước thu nhỏ cắm trên địa cầu
    const pinGeo = new THREE.ConeGeometry(0.12, 0.3, 16);
    pinGeo.rotateX(Math.PI);
    const pinMat = new THREE.MeshBasicMaterial({ color: 0xFF2A85 });
    const pinMesh = new THREE.Mesh(pinGeo, pinMat);
    pinMesh.position.set(0.4, 0.75, 0.4);
    earthGroup.add(pinMesh);
    scene.add(earthGroup);
    planetsRef.current['places'] = earthGroup;

    // 5.2 Hành tinh 🎵 Đĩa Than Âm Nhạc: Đĩa Vinyl Micro-Grooves + Kim Tone-arm
    const vinylGroup = new THREE.Group();
    vinylGroup.name = 'music';
    const vinylGeo = new THREE.CylinderGeometry(1.05, 1.05, 0.05, 48);
    const vinylTex = createVinylTexture();
    const vinylMat = [
      new THREE.MeshStandardMaterial({ color: 0x111111 }),
      new THREE.MeshStandardMaterial({ map: vinylTex, roughness: 0.3, metalness: 0.4 }),
      new THREE.MeshStandardMaterial({ map: vinylTex, roughness: 0.3, metalness: 0.4 })
    ];
    const vinylMesh = new THREE.Mesh(vinylGeo, vinylMat);
    vinylMesh.name = 'music';
    vinylMesh.rotation.x = Math.PI / 4;
    vinylGroup.add(vinylMesh);
    vinylMeshRef.current = vinylMesh;

    // Cần kim gạt đĩa thu nhỏ (Miniature Tonearm)
    const armGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.7, 8);
    const armMat = new THREE.MeshStandardMaterial({ color: 0x00E5FF, metalness: 0.9, roughness: 0.1 });
    const armMesh = new THREE.Mesh(armGeo, armMat);
    armMesh.position.set(0.65, 0.15, -0.2);
    armMesh.rotation.z = Math.PI / 3;
    vinylGroup.add(armMesh);
    scene.add(vinylGroup);
    planetsRef.current['music'] = vinylGroup;

    // 5.3 Hành tinh 📸 Kho Ảnh: Khung Ảnh Thủy Tinh Khúc Xạ 3D
    const photoGroup = new THREE.Group();
    photoGroup.name = 'photos';
    const frameGeo = new THREE.BoxGeometry(1.3, 1.5, 0.08);
    const frameMat = new THREE.MeshPhysicalMaterial({
      color: 0x10FFA0,
      transmission: 0.7,
      roughness: 0.1,
      metalness: 0.8,
      transparent: true
    });
    const frameMesh = new THREE.Mesh(frameGeo, frameMat);
    frameMesh.name = 'photos';
    photoGroup.add(frameMesh);
    scene.add(photoGroup);
    planetsRef.current['photos'] = photoGroup;

    // 5.4 Hành tinh ⚡ Cảm Biến Realtime: Quả Cầu Năng Lượng Plasma Xung Điện
    const telemetryGroup = new THREE.Group();
    telemetryGroup.name = 'telemetry';
    const teleGeo = new THREE.IcosahedronGeometry(0.8, 2);
    const teleMat = new THREE.MeshStandardMaterial({
      color: 0x00E5FF,
      emissive: 0x0088cc,
      wireframe: true,
      roughness: 0.2
    });
    const teleMesh = new THREE.Mesh(teleGeo, teleMat);
    teleMesh.name = 'telemetry';
    telemetryGroup.add(teleMesh);
    scene.add(telemetryGroup);
    planetsRef.current['telemetry'] = telemetryGroup;

    // 5.5 Hành tinh 🏆 Tước Hiệu Hộ Chiếu: Tinh Thể Kim Cương Đa Diện Phát Quang
    const badgeGroup = new THREE.Group();
    badgeGroup.name = 'badges';
    const badgeGeo = new THREE.OctahedronGeometry(0.9, 0);
    const badgeMat = new THREE.MeshPhysicalMaterial({
      color: 0xFF539A,
      emissive: 0x660033,
      emissiveIntensity: 0.5,
      metalness: 0.7,
      roughness: 0.1,
      reflectivity: 0.9
    });
    const badgeMesh = new THREE.Mesh(badgeGeo, badgeMat);
    badgeMesh.name = 'badges';
    badgeGroup.add(badgeMesh);
    scene.add(badgeGroup);
    planetsRef.current['badges'] = badgeGroup;

    // 6. TƯƠNG TÁC CON TRỎ & CHẠM XOAY 360° (TOUCH/MOUSE DRAG & PINCH/WHEEL)
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();

    const onPointerDown = (e) => {
      isDraggingRef.current = true;
      prevPointerRef.current = { x: e.clientX, y: e.clientY };
    };

    const onPointerMove = (e) => {
      if (!isDraggingRef.current) return;
      const dx = e.clientX - prevPointerRef.current.x;
      const dy = e.clientY - prevPointerRef.current.y;
      prevPointerRef.current = { x: e.clientX, y: e.clientY };

      sphericalRef.current.theta -= dx * 0.0055;
      sphericalRef.current.phi = Math.max(0.18, Math.min(Math.PI - 0.18, sphericalRef.current.phi - dy * 0.0055));
    };

    const onPointerUp = (e) => {
      isDraggingRef.current = false;
      const rect = container.getBoundingClientRect();
      pointer.x = ((e.clientX - rect.left) / container.clientWidth) * 2 - 1;
      pointer.y = -((e.clientY - rect.top) / container.clientHeight) * 2 + 1;

      raycaster.setFromCamera(pointer, camera);
      const hits = raycaster.intersectObjects(scene.children, true);

      if (hits.length > 0) {
        let hitObj = hits[0].object;
        let id = hitObj.name;
        while (hitObj.parent && !id) {
          hitObj = hitObj.parent;
          id = hitObj.name;
        }
        if (id && planetsRef.current[id]) {
          onSelectPlanet?.(id);
        }
      }
    };

    const onWheel = (e) => {
      e.preventDefault();
      sphericalRef.current.radius = Math.max(6.5, Math.min(30, sphericalRef.current.radius + e.deltaY * 0.018));
    };

    container.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    container.addEventListener('wheel', onWheel, { passive: false });

    // 7. ANIMATION LOOP 60FPS & GSAP CAMERA FLY-TO
    let animId;
    const clock = new THREE.Clock();

    const renderLoop = () => {
      animId = requestAnimationFrame(renderLoop);
      const t = clock.getElapsedTime();

      // Hiệu ứng xoay mây địa cầu & đĩa than
      if (cloudsRef.current) cloudsRef.current.rotation.y = t * 0.12;
      if (vinylMeshRef.current) vinylMeshRef.current.rotation.y = t * 0.6;
      gyroRing1.rotation.z = t * 0.4;
      gyroRing2.rotation.x = t * 0.35;
      teleMesh.rotation.x = t * 0.4;
      badgeMesh.rotation.y = t * 0.5;

      // Xoay các hành tinh theo quỹ đạo
      const ORBITS = [
        { id: 'places', r: 5.0, sp: 0.007, ph: 0 },
        { id: 'music', r: 7.6, sp: 0.005, ph: 1.3 },
        { id: 'photos', r: 10.2, sp: 0.0036, ph: 2.8 },
        { id: 'telemetry', r: 12.8, sp: 0.0028, ph: 4.2 },
        { id: 'badges', r: 15.2, sp: 0.0021, ph: 5.5 }
      ];

      ORBITS.forEach(orb => {
        const pObj = planetsRef.current[orb.id];
        if (pObj) {
          const a = t * orb.sp * 8 + orb.ph;
          pObj.position.x = Math.cos(a) * orb.r;
          pObj.position.z = Math.sin(a) * orb.r;
          pObj.position.y = Math.sin(a * 2.5) * 0.5;
        }
      });

      // CAMERA POSITION & LOOK-AT LERP
      if (focusedPlanet && planetsRef.current[focusedPlanet]) {
        const target = planetsRef.current[focusedPlanet];
        lookAtTargetRef.current.lerp(target.position, 0.08);
        const camOffset = new THREE.Vector3(1, 1, 3.2).normalize().multiplyScalar(4.2);
        camera.position.lerp(target.position.clone().add(camOffset), 0.08);
      } else {
        lookAtTargetRef.current.lerp(new THREE.Vector3(0, 0, 0), 0.08);
        const s = sphericalRef.current;
        const tx = s.radius * Math.sin(s.phi) * Math.sin(s.theta);
        const ty = s.radius * Math.cos(s.phi);
        const tz = s.radius * Math.sin(s.phi) * Math.cos(s.theta);
        camera.position.lerp(new THREE.Vector3(tx, ty, tz), 0.08);
      }

      camera.lookAt(lookAtTargetRef.current);
      renderer.render(scene, camera);
    };

    renderLoop();

    const onResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', onResize);
      container.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      container.removeEventListener('wheel', onWheel);
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [userAvatar]);

  return (
    <div 
      ref={mountRef} 
      className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing select-none overflow-hidden touch-none"
    />
  );
}
