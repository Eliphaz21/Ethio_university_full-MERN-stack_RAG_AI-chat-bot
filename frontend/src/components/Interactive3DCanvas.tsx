import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { University } from '../types';
import { MapPin, ArrowRight, ExternalLink } from 'lucide-react';
import { getOptimizedImageUrl } from '../utils/imageUtils';

interface Interactive3DCanvasProps {
  universities?: University[];
}

const FALLBACK_UNIS = [
  {
    name: 'Addis Ababa University (AAU)',
    city: 'Addis Ababa',
    region: 'Addis Ababa',
    type: 'Public',
    image: 'https://images.unsplash.com/photo-1541339907198-e08759dfc3ef?auto=format&fit=crop&q=80&w=800'
  },
  {
    name: 'Adama Science & Tech (ASTU)',
    city: 'Adama',
    region: 'Oromia',
    type: 'Public',
    image: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&q=80&w=800'
  },
  {
    name: 'Hawassa University (HU)',
    city: 'Hawassa',
    region: 'Sidama',
    type: 'Public',
    image: 'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&q=80&w=800'
  },
  {
    name: 'Bahir Dar University (BDU)',
    city: 'Bahir Dar',
    region: 'Amhara',
    type: 'Public',
    image: 'https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?auto=format&fit=crop&q=80&w=800'
  },
  {
    name: "St. Mary's University",
    city: 'Addis Ababa',
    region: 'Addis Ababa',
    type: 'Private',
    image: 'https://images.unsplash.com/photo-1592280771190-3e2e4d571952?auto=format&fit=crop&q=80&w=800'
  },
  {
    name: 'Unity University',
    city: 'Addis Ababa',
    region: 'Addis Ababa',
    type: 'Private',
    image: 'https://images.unsplash.com/photo-1571260899304-425eee4c7efc?auto=format&fit=crop&q=80&w=800'
  }
];

export const Interactive3DCanvas: React.FC<Interactive3DCanvasProps> = ({ universities = [] }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [activeUniIndex, setActiveUniIndex] = useState(0);

  const displayUnis = universities.length > 0
    ? universities.slice(0, 6).map(u => ({
        name: u.name,
        city: u.location?.city || 'Ethiopia',
        region: u.location?.region || 'Ethiopia',
        type: u.type,
        image: getOptimizedImageUrl(u.image, 800)
      }))
    : FALLBACK_UNIS;

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    // Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.z = 200;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Main 3D Group
    const mainGroup = new THREE.Group();
    scene.add(mainGroup);

    // Central Wireframe Mesh Sphere
    const sphereGeo = new THREE.IcosahedronGeometry(55, 3);
    const sphereMat = new THREE.MeshBasicMaterial({
      color: 0x059669,
      wireframe: true,
      transparent: true,
      opacity: 0.2
    });
    const sphereMesh = new THREE.Mesh(sphereGeo, sphereMat);
    mainGroup.add(sphereMesh);

    // Outer Orbit Ring
    const ringGeo = new THREE.RingGeometry(72, 74, 64);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x34d399,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.35
    });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.rotation.x = Math.PI / 3.5;
    mainGroup.add(ringMesh);

    // Particle Stars
    const particlesCount = 200;
    const positions = new Float32Array(particlesCount * 3);
    for (let i = 0; i < particlesCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 280;
      positions[i + 1] = (Math.random() - 0.5) * 280;
      positions[i + 2] = (Math.random() - 0.5) * 280;
    }
    const particlesGeo = new THREE.BufferGeometry();
    particlesGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particlesMat = new THREE.PointsMaterial({
      size: 1.8,
      color: 0x6ee7b7,
      transparent: true,
      opacity: 0.5
    });
    const particleSystem = new THREE.Points(particlesGeo, particlesMat);
    mainGroup.add(particleSystem);

    // Mouse Parallax Controls
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left - width / 2;
      const y = e.clientY - rect.top - height / 2;
      mouseX = x * 0.0006;
      mouseY = y * 0.0006;
    };

    window.addEventListener('mousemove', handleMouseMove);

    // Animation Loop
    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      mainGroup.rotation.y += 0.003;
      ringMesh.rotation.z -= 0.002;

      targetX += (mouseY - targetX) * 0.05;
      targetY += (mouseX - targetY) * 0.05;

      mainGroup.rotation.x = targetX;

      renderer.render(scene, camera);
    };

    animate();

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
    <div className="relative w-full overflow-hidden bg-slate-950 text-white rounded-3xl border border-emerald-500/20 shadow-2xl p-6 sm:p-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        
        {/* Left Column: 3D WebGL Canvas Sphere & Particles */}
        <div className="lg:col-span-6 relative h-[380px] sm:h-[450px] flex items-center justify-center rounded-2xl overflow-hidden bg-slate-900/60 border border-white/10">
          <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing"></div>
          
          <div className="absolute top-4 left-4 bg-slate-900/80 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-emerald-500/30 text-xs font-bold text-emerald-400">
            ✨ Interactive 3D Mesh & Nodes
          </div>
        </div>

        {/* Right Column: Moving 3D University Image Cards */}
        <div className="lg:col-span-6 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider bg-emerald-950 px-3 py-1 rounded-full border border-emerald-800">
              Featured University Photos ({activeUniIndex + 1}/{displayUnis.length})
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setActiveUniIndex((prev) => (prev > 0 ? prev - 1 : displayUnis.length - 1))}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-emerald-600 text-white flex items-center justify-center font-bold text-xs transition cursor-pointer"
              >
                ←
              </button>
              <button
                onClick={() => setActiveUniIndex((prev) => (prev < displayUnis.length - 1 ? prev + 1 : 0))}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-emerald-600 text-white flex items-center justify-center font-bold text-xs transition cursor-pointer"
              >
                →
              </button>
            </div>
          </div>

          {/* Active 3D Photo Card Preview */}
          <div className="relative group rounded-2xl overflow-hidden border border-slate-700 shadow-2xl transition-all duration-500 hover:border-emerald-500">
            <div className="h-64 sm:h-72 w-full overflow-hidden relative">
              <img
                src={displayUnis[activeUniIndex].image}
                alt={displayUnis[activeUniIndex].name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 filter brightness-90"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent"></div>
              
              <div className="absolute top-4 right-4 bg-emerald-600 text-white text-[10px] font-black uppercase px-3 py-1 rounded-full tracking-wider shadow">
                {displayUnis[activeUniIndex].type} Institution
              </div>

              <div className="absolute bottom-4 left-4 right-4 text-white">
                <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold mb-1">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{displayUnis[activeUniIndex].city}, {displayUnis[activeUniIndex].region}</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold font-serif leading-tight">
                  {displayUnis[activeUniIndex].name}
                </h3>
              </div>
            </div>
          </div>

          {/* Mini Thumbnail Row */}
          <div className="grid grid-cols-6 gap-2 pt-2">
            {displayUnis.map((uni, idx) => (
              <button
                key={idx}
                onClick={() => setActiveUniIndex(idx)}
                className={`relative h-14 rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                  activeUniIndex === idx ? 'border-emerald-400 scale-105 shadow-md' : 'border-slate-800 opacity-60 hover:opacity-100'
                }`}
              >
                <img src={uni.image} alt={uni.name} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>

        </div>

      </div>
    </div>
  );
};

export default Interactive3DCanvas;
