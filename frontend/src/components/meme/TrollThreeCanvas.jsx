import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

/**
 * TrollThreeCanvas - WebGL 3D Physics Screen Takeover Engine
 * - Throws 3D weapon from depth (z: -35) hurling straight towards the screen glass
 * - Slams on glass at z: 4.5 with shockwave ring and 120+ particle burst
 * - Automatic resource disposal (geometries, textures, materials, renderer)
 * - Strict adherence to Rule 7 (< 250 lines) and Three.js performance guidelines
 */
export default function TrollThreeCanvas({ item, onImpact }) {
  const mountRef = useRef(null);
  const onImpactRef = useRef(onImpact);
  onImpactRef.current = onImpact;

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    let width = container.clientWidth || window.innerWidth;
    let height = container.clientHeight || window.innerHeight;

    // 1. Scene, Camera, Renderer Setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100);
    camera.position.set(0, 0, 10);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    container.appendChild(renderer.domElement);

    // 2. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(5, 8, 6);
    scene.add(dirLight);

    // 3. 3D Projectile Mesh with 3D Texture
    const textureLoader = new THREE.TextureLoader();
    let projectileMesh = null;
    let projectileGeo = null;
    let projectileMat = null;
    let loadedTexture = null;

    const startPos = new THREE.Vector3(0, -1.8, -35);
    const targetPos = new THREE.Vector3(0, 0.3, 4.6);

    const iconUrl = item?.image3d || '';
    if (iconUrl) {
      loadedTexture = textureLoader.load(
        iconUrl,
        (tex) => {
          tex.colorSpace = THREE.SRGBColorSpace;
          if (projectileMat) projectileMat.needsUpdate = true;
        },
        undefined,
        (err) => {
          console.warn('[TrollThreeCanvas] Texture load error, using fallback:', err?.message || err);
        }
      );

      projectileGeo = new THREE.PlaneGeometry(3.6, 3.6);
      projectileMat = new THREE.MeshBasicMaterial({
        map: loadedTexture,
        transparent: true,
        side: THREE.DoubleSide,
        depthWrite: false
      });

      projectileMesh = new THREE.Mesh(projectileGeo, projectileMat);
      projectileMesh.position.copy(startPos);
      projectileMesh.rotation.set(-0.4, 0.6, -1.2);
      scene.add(projectileMesh);
    }

    // 4. Shockwave Ring Mesh
    const ringGeo = new THREE.RingGeometry(0.2, 0.45, 32);
    const ringMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color(item?.particleColor || '#00E5FF'),
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide,
      depthWrite: false
    });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.position.set(0, 0.3, 4.5);
    scene.add(ringMesh);

    // 5. 120+ WebGL Particle Burst System
    const particleCount = 120;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const velocities = [];

    const pColor = new THREE.Color(item?.particleColor || '#FF2A85');
    const particleMat = new THREE.PointsMaterial({
      color: pColor,
      size: 0.22,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = targetPos.x;
      positions[i * 3 + 1] = targetPos.y;
      positions[i * 3 + 2] = targetPos.z;

      const angle = Math.random() * Math.PI * 2;
      const speed = 0.08 + Math.random() * 0.18;
      const zVel = (Math.random() - 0.5) * 0.12;

      velocities.push({
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        vz: zVel
      });
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particleSystem = new THREE.Points(particleGeo, particleMat);
    scene.add(particleSystem);

    // 6. Animation Physics Loop
    let animId = null;
    let hasImpacted = false;
    const flightDuration = 380; // ms to reach screen
    const startTime = performance.now();

    const animate = (currentTime) => {
      animId = requestAnimationFrame(animate);
      const elapsed = currentTime - startTime;

      if (elapsed < flightDuration) {
        // Thrown towards the glass with cubic acceleration
        const progress = elapsed / flightDuration;
        const easeInCubic = progress * progress * progress;

        if (projectileMesh) {
          projectileMesh.position.lerpVectors(startPos, targetPos, easeInCubic);
          projectileMesh.rotation.z += 0.22;
          projectileMesh.rotation.x += 0.12;
          projectileMesh.rotation.y += 0.08;
        }
      } else {
        // Impact Moment
        if (!hasImpacted) {
          hasImpacted = true;
          if (projectileMesh) {
            projectileMesh.position.copy(targetPos);
            projectileMesh.rotation.set(0, 0, (Math.random() - 0.5) * 0.3); // slight natural tilt
          }
          if (onImpactRef.current) {
            onImpactRef.current();
          }
          particleMat.opacity = 1.0;
          ringMat.opacity = 0.9;
        }

        // Post-impact: Projectile floating gently on glass
        const postImpactTime = elapsed - flightDuration;
        if (projectileMesh) {
          projectileMesh.position.y = targetPos.y + Math.sin(postImpactTime * 0.005) * 0.08;
          projectileMesh.position.x = targetPos.x + Math.cos(postImpactTime * 0.004) * 0.05;
        }

        // Expand shockwave ring
        if (ringMesh && ringMat.opacity > 0.01) {
          ringMesh.scale.x += 0.22;
          ringMesh.scale.y += 0.22;
          ringMat.opacity *= 0.92;
        }

        // Particle Burst dispersion & fade
        if (particleSystem && particleMat.opacity > 0.02) {
          const posArr = particleGeo.attributes.position.array;
          for (let i = 0; i < particleCount; i++) {
            posArr[i * 3] += velocities[i].vx;
            posArr[i * 3 + 1] += velocities[i].vy;
            posArr[i * 3 + 2] += velocities[i].vz;

            // slight drag & gravity
            velocities[i].vx *= 0.96;
            velocities[i].vy *= 0.96;
            velocities[i].vy -= 0.002;
          }
          particleGeo.attributes.position.needsUpdate = true;
          particleMat.opacity *= 0.96;
        }
      }

      renderer.render(scene, camera);
    };

    animId = requestAnimationFrame(animate);

    // 7. Responsive Resize Handler
    const handleResize = () => {
      if (!container) return;
      width = container.clientWidth || window.innerWidth;
      height = container.clientHeight || window.innerHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    window.addEventListener('resize', handleResize);

    // 8. Clean Resource Disposal
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);

      if (projectileGeo) projectileGeo.dispose();
      if (projectileMat) projectileMat.dispose();
      if (loadedTexture) loadedTexture.dispose();
      if (ringGeo) ringGeo.dispose();
      if (ringMat) ringMat.dispose();
      if (particleGeo) particleGeo.dispose();
      if (particleMat) particleMat.dispose();

      renderer.dispose();
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [item]);

  return <div ref={mountRef} className="absolute inset-0 pointer-events-none overflow-hidden z-10" />;
}
