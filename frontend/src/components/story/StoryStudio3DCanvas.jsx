import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';

/**
 * StoryStudio3DCanvas - Lớp phủ đồ họa không gian Three.js (WebGL)
 * Tạo trường hạt bụi lượng tử và 2 vòng hào quang Hologram xoay 3D
 * Giải phóng GPU VRAM sạch sẽ khi unmount
 */
export default function StoryStudio3DCanvas({ isOpen }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!isOpen || !containerRef.current) return;

    const width = window.innerWidth;
    const height = window.innerHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100);
    camera.position.set(0, 0, 7);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    containerRef.current.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    const keyLight = new THREE.PointLight(0x00E5FF, 3.5, 20);
    keyLight.position.set(4, 5, 5);
    scene.add(keyLight);

    const rimLight = new THREE.PointLight(0xFF2A85, 3.0, 20);
    rimLight.position.set(-4, -4, 4);
    scene.add(rimLight);

    // Vòng tròn Hologram quay quanh không gian
    const ringGeom = new THREE.TorusGeometry(3.2, 0.02, 16, 100);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x00E5FF, transparent: true, opacity: 0.35 });
    const ring = new THREE.Mesh(ringGeom, ringMat);
    scene.add(ring);

    const ring2Geom = new THREE.TorusGeometry(3.8, 0.015, 16, 100);
    const ring2Mat = new THREE.MeshBasicMaterial({ color: 0xFF2A85, transparent: true, opacity: 0.25 });
    const ring2 = new THREE.Mesh(ring2Geom, ring2Mat);
    scene.add(ring2);

    // Hệ thống 90 hạt bụi lượng tử bay lơ lửng
    const particleCount = 90;
    const particleGeom = new THREE.BufferGeometry();
    const posArray = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      posArray[i] = (Math.random() - 0.5) * 12;
      posArray[i + 1] = (Math.random() - 0.5) * 12;
      posArray[i + 2] = (Math.random() - 0.5) * 6;
    }
    particleGeom.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0x00E5FF,
      size: 0.06,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending
    });
    const particles = new THREE.Points(particleGeom, particleMat);
    scene.add(particles);

    let animId = null;
    const animate = () => {
      ring.rotation.x += 0.003;
      ring.rotation.y += 0.005;
      ring2.rotation.y -= 0.004;
      ring2.rotation.z += 0.003;
      particles.rotation.y += 0.001;
      particles.rotation.x += 0.0008;

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
  }, [isOpen]);

  return <div ref={containerRef} className="absolute inset-0 pointer-events-none z-0"></div>;
}

