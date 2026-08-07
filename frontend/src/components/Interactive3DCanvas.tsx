import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

const CITY_NODES = [
  { name: 'Addis Ababa (AAU)', lat: 9.03, lon: 38.74, color: 0x10b981 },
  { name: 'Adama (ASTU)', lat: 8.54, lon: 39.27, color: 0x3b82f6 },
  { name: 'Hawassa (HU)', lat: 7.05, lon: 38.47, color: 0xf59e0b },
  { name: 'Bahir Dar (BDU)', lat: 11.59, lon: 37.39, color: 0xec4899 },
  { name: 'Jimma (JU)', lat: 7.67, lon: 36.83, color: 0x8b5cf6 },
  { name: 'Mekelle (MU)', lat: 13.49, lon: 39.47, color: 0x06b6d4 },
  { name: 'Dire Dawa (DDU)', lat: 9.60, lon: 41.86, color: 0x10b981 },
  { name: 'Gondar (UOG)', lat: 12.60, lon: 37.46, color: 0xf97316 },
  { name: 'Haramaya (HU)', lat: 9.42, lon: 42.01, color: 0x6366f1 }
];

export const Interactive3DCanvas: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    // Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.z = 220;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Group for rotation
    const globeGroup = new THREE.Group();
    scene.add(globeGroup);

    // Wireframe Sphere (Globe Wireframe)
    const sphereGeometry = new THREE.IcosahedronGeometry(60, 3);
    const sphereMaterial = new THREE.MeshBasicMaterial({
      color: 0x059669,
      wireframe: true,
      transparent: true,
      opacity: 0.25
    });
    const globeMesh = new THREE.Mesh(sphereGeometry, sphereMaterial);
    globeGroup.add(globeMesh);

    // Inner Glowing Core Sphere
    const coreGeometry = new THREE.IcosahedronGeometry(58, 2);
    const coreMaterial = new THREE.MeshBasicMaterial({
      color: 0x064e3b,
      transparent: true,
      opacity: 0.15
    });
    const coreMesh = new THREE.Mesh(coreGeometry, coreMaterial);
    globeGroup.add(coreMesh);

    // Atmosphere Ring Outer Orbit
    const ringGeo = new THREE.RingGeometry(75, 77, 64);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x34d399,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.3
    });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.rotation.x = Math.PI / 3;
    globeGroup.add(ringMesh);

    // Floating Star Particles
    const particlesCount = 250;
    const positions = new Float32Array(particlesCount * 3);
    for (let i = 0; i < particlesCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 300;
      positions[i + 1] = (Math.random() - 0.5) * 300;
      positions[i + 2] = (Math.random() - 0.5) * 300;
    }
    const particlesGeo = new THREE.BufferGeometry();
    particlesGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particlesMat = new THREE.PointsMaterial({
      size: 1.8,
      color: 0xa7f3d0,
      transparent: true,
      opacity: 0.6
    });
    const particleSystem = new THREE.Points(particlesGeo, particlesMat);
    globeGroup.add(particleSystem);

    // Convert Lat/Lon to 3D Coordinates
    const convertLatLonToVector3 = (lat: number, lon: number, radius: number) => {
      const phi = (90 - lat) * (Math.PI / 180);
      const theta = (lon + 180) * (Math.PI / 180);
      const x = -(radius * Math.sin(phi) * Math.cos(theta));
      const z = radius * Math.sin(phi) * Math.sin(theta);
      const y = radius * Math.cos(phi);
      return new THREE.Vector3(x, y, z);
    };

    // Node Markers & Connecting Arc Lines
    const nodeVectors: THREE.Vector3[] = [];
    CITY_NODES.forEach((node) => {
      const vec = convertLatLonToVector3(node.lat, node.lon, 61);
      nodeVectors.push(vec);

      // Node Marker Point
      const nodeGeo = new THREE.SphereGeometry(2.2, 16, 16);
      const nodeMat = new THREE.MeshBasicMaterial({ color: node.color });
      const nodeMesh = new THREE.Mesh(nodeGeo, nodeMat);
      nodeMesh.position.copy(vec);
      globeGroup.add(nodeMesh);

      // Pulsing Halo Outer Sphere
      const haloGeo = new THREE.SphereGeometry(3.5, 16, 16);
      const haloMat = new THREE.MeshBasicMaterial({
        color: node.color,
        transparent: true,
        opacity: 0.35
      });
      const haloMesh = new THREE.Mesh(haloGeo, haloMat);
      haloMesh.position.copy(vec);
      globeGroup.add(haloMesh);
    });

    // Connecting Arcs between Addis Ababa and other cities
    const hubVec = nodeVectors[0]; // Addis Ababa
    for (let i = 1; i < nodeVectors.length; i++) {
      const targetVec = nodeVectors[i];
      const midPoint = new THREE.Vector3()
        .addVectors(hubVec, targetVec)
        .multiplyScalar(0.5)
        .normalize()
        .multiplyScalar(78); // Arc height above globe surface

      const curve = new THREE.QuadraticBezierCurve3(hubVec, midPoint, targetVec);
      const points = curve.getPoints(30);
      const arcGeometry = new THREE.BufferGeometry().setFromPoints(points);
      const arcMaterial = new THREE.LineBasicMaterial({
        color: 0x34d399,
        transparent: true,
        opacity: 0.5
      });
      const arcLine = new THREE.Line(arcGeometry, arcMaterial);
      globeGroup.add(arcLine);
    }

    // Mouse Parallax Interaction
    let mouseX = 0;
    let mouseY = 0;
    let targetRotationX = 0;
    let targetRotationY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left - width / 2;
      const y = e.clientY - rect.top - height / 2;
      mouseX = x * 0.0005;
      mouseY = y * 0.0005;
    };

    window.addEventListener('mousemove', handleMouseMove);

    // Animation Loop
    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      // Rotation & Inertia
      globeGroup.rotation.y += 0.003;
      ringMesh.rotation.z -= 0.002;

      targetRotationX += (mouseY - targetRotationX) * 0.05;
      targetRotationY += (mouseX - targetRotationY) * 0.05;

      globeGroup.rotation.x = targetRotationX;

      renderer.render(scene, camera);
    };

    animate();

    // Handle Window Resize
    const handleResize = () => {
      if (!container) return;
      const newW = container.clientWidth;
      const newH = container.clientHeight;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div className="relative w-full h-[450px] lg:h-[550px] flex items-center justify-center overflow-hidden bg-slate-950 text-white rounded-3xl border border-emerald-500/20 shadow-2xl">
      {/* Background Radial Glow */}
      <div className="absolute inset-0 bg-gradient-to-b from-emerald-950/40 via-slate-950/80 to-slate-950 pointer-events-none"></div>

      {/* Interactive Canvas Mount Container */}
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing"></div>

      {/* Floating Info Overlay Header */}
      <div className="absolute top-6 left-6 right-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 pointer-events-none bg-slate-900/60 backdrop-blur-md p-4 rounded-2xl border border-white/10 shadow-lg">
        <div>
          <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Interactive 3D Network</span>
          <h3 className="text-lg font-extrabold text-white">Ethiopian University Hubs & Academic Mesh</h3>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-300 font-medium bg-emerald-950/70 border border-emerald-500/30 px-3 py-1.5 rounded-xl">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
          <span>Addis Ababa, Adama, Hawassa, Bahir Dar, Mekelle & More</span>
        </div>
      </div>

      {/* Floating Bottom Legend */}
      <div className="absolute bottom-6 left-6 right-6 pointer-events-none flex items-center justify-center">
        <p className="text-xs text-slate-400 bg-slate-950/80 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
          ✨ Move your mouse across the canvas to tilt & inspect Ethiopia's academic network mesh
        </p>
      </div>
    </div>
  );
};

export default Interactive3DCanvas;
