import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';

/**
 * Profile3DCanvas - Lớp phủ đồ họa không gian Three.js (WebGL) cho Hồ sơ cá nhân
 * Mô phỏng hào quang không gian tương tự Spatial Bump 3D
 * Tự động giải phóng GPU VRAM khi unmount
 */
export default function Profile3DCanvas() {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const width = window.innerWidth;
    const height = window.innerHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100);
    camera.position.set(0, 0, 8);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.8));
    containerRef.current.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 1.0);
    scene.add(ambientLight);

    const cyanLight = new THREE.PointLight(0x00E5FF, 3.0, 18);
    cyanLight.position.set(4, 5, 4);
    scene.add(cyanLight);

    const pinkLight = new THREE.PointLight(0xFF2A85, 2.5, 18);
    pinkLight.position.set(-4, -5, 4);
    scene.add(pinkLight);

    // Vòng tròn Hologram không gian quay chậm
    const ringGeom = new THREE.TorusGeometry(3.5, 0.02, 16, 90);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x00E5FF, transparent: true, opacity: 0.25 });
    const ring = new THREE.Mesh(ringGeom, ringMat);
    scene.add(ring);

    const ring2Geom = new THREE.TorusGeometry(4.2, 0.015, 16, 90);
    const ring2Mat = new THREE.MeshBasicMaterial({ color: 0xFF2A85, transparent: true, opacity: 0.20 });
    const ring2 = new THREE.Mesh(ring2Geom, ring2Mat);
    scene.add(ring2);

    // 75 hạt lượng tử bay lơ lửng
    const particleCount = 75;
    const particleGeom = new THREE.BufferGeometry();
    const posArray = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      posArray[i] = (Math.random() - 0.5) * 14;
      posArray[i + 1] = (Math.random() - 0.5) * 14;
      posArray[i + 2] = (Math.random() - 0.5) * 6;
    }
    particleGeom.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0x00E5FF,
      size: 0.05,
      transparent: true,
      opacity: 0.5,
      blending: THREE.AdditiveBlending
    });
    const particles = new THREE.Points(particleGeom, particleMat);
    scene.add(particles);

    let animId = null;
    const animate = () => {
      ring.rotation.x += 0.002;
      ring.rotation.y += 0.003;
      ring2.rotation.y -= 0.002;
      ring2.rotation.z += 0.002;
      particles.rotation.y += 0.0008;

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
      if (renderer.domElement?.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
      scene.traverse((obj) => {
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) {
          if (Array.isArray(obj.material)) obj.material.forEach(m => m.dispose());
          else obj.material.dispose();
        }
      });
      renderer.dispose();
    };
  }, []);

  return <div ref={containerRef} className="fixed inset-0 pointer-events-none z-0"></div>;
}

