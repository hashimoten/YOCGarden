import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { Trophy, TrendingUp, Sparkles, ArrowUpRight } from 'lucide-react';

const App = () => {
    const mountRef = useRef(null);
    const [yoc, setYoc] = useState(4.2);
    const [showUI, setShowUI] = useState(false);
    const [isLevelUp, setIsLevelUp] = useState(false);

    useEffect(() => {
        if (!mountRef.current) return;

        // --- Scene Setup ---
        const scene = new THREE.Scene();
        scene.background = new THREE.Color('#052e16'); // Dark Green night
        scene.fog = new THREE.FogExp2('#052e16', 0.1);

        const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.set(0, 5, 10);
        camera.lookAt(0, 1.5, 0);

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
        mountRef.current.appendChild(renderer.domElement);

        // --- Lights ---
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        scene.add(ambientLight);

        const spotLight = new THREE.SpotLight(0x34d399, 5);
        spotLight.position.set(0, 10, 0);
        spotLight.angle = Math.PI / 6;
        scene.add(spotLight);

        // --- Snow Ground ---
        const groundGeom = new THREE.PlaneGeometry(20, 20);
        const groundMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.8 });
        const ground = new THREE.Mesh(groundGeom, groundMat);
        ground.rotation.x = -Math.PI / 2;
        scene.add(ground);

        // Grid lines for "Box Garden" feel
        const grid = new THREE.GridHelper(20, 20, 0x064e3b, 0x064e3b);
        grid.position.y = 0.01;
        scene.add(grid);

        // --- The Growth Tree ---
        const treeGroup = new THREE.Group();

        // Trunk
        const trunkGeom = new THREE.CylinderGeometry(0.1, 0.2, 1, 8);
        const trunkMat = new THREE.MeshStandardMaterial({ color: 0x3f2a14 });
        const trunk = new THREE.Mesh(trunkGeom, trunkMat);
        trunk.position.y = 0.5;
        treeGroup.add(trunk);

        // Leaves (Layered Cones for "Level Up" look)
        const createLeafLayer = (radius, height, yPos, color) => {
            const geom = new THREE.ConeGeometry(radius, height, 8);
            const mat = new THREE.MeshStandardMaterial({ color: color, emissive: color, emissiveIntensity: 0.1 });
            const mesh = new THREE.Mesh(geom, mat);
            mesh.position.y = yPos;
            return mesh;
        };

        const leafColor = 0x059669;
        const layer1 = createLeafLayer(0.8, 1.2, 1.2, leafColor);
        const layer2 = createLeafLayer(0.6, 1.0, 1.8, leafColor);
        const layer3 = createLeafLayer(0.4, 0.8, 2.3, leafColor);

        treeGroup.add(layer1, layer2, layer3);
        scene.add(treeGroup);

        // --- Particles (Leaves/Sparkles) ---
        const particleCount = 40;
        const particleGeom = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const velocities = new Float32Array(particleCount * 3);

        for (let i = 0; i < particleCount; i++) {
            positions[i * 3] = 0;
            positions[i * 3 + 1] = 0;
            positions[i * 3 + 2] = 0;
            velocities[i * 3] = (Math.random() - 0.5) * 0.1;
            velocities[i * 3 + 1] = Math.random() * 0.2;
            velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.1;
        }

        particleGeom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        const particleMat = new THREE.PointsMaterial({
            color: 0x34d399,
            size: 0.15,
            transparent: true,
            opacity: 0
        });
        const particles = new THREE.Points(particleGeom, particleMat);
        scene.add(particles);

        // --- Animation Logic ---
        let frame = 0;
        let growthStartTime = 60; // Start after 1s
        let isAnimating = true;

        const animate = () => {
            if (!isAnimating) return;
            requestAnimationFrame(animate);
            frame++;

            // Tree initial state (Small)
            if (frame < growthStartTime) {
                treeGroup.scale.set(0.6, 0.4, 0.6);
            }

            // Growth Phase
            if (frame >= growthStartTime && frame < growthStartTime + 120) {
                const progress = (frame - growthStartTime) / 120;
                const scaleY = 0.4 + (progress * 1.1); // Grows from 0.4 to 1.5
                const scaleXZ = 0.6 + (progress * 0.6); // Grows from 0.6 to 1.2
                treeGroup.scale.set(scaleXZ, scaleY, scaleXZ);

                // Intensity & Particles
                spotLight.intensity = 5 + (progress * 10);
                particleMat.opacity = progress > 0.8 ? (1 - progress) * 5 : progress;

                // Update Particles
                const posAttr = particleGeom.getAttribute('position');
                for (let i = 0; i < particleCount; i++) {
                    posAttr.array[i * 3] += velocities[i * 3];
                    posAttr.array[i * 3 + 1] += velocities[i * 3 + 1];
                    posAttr.array[i * 3 + 2] += velocities[i * 3 + 2];

                    if (posAttr.array[i * 3 + 1] > 4) {
                        posAttr.array[i * 3 + 1] = 0;
                        posAttr.array[i * 3] = 0;
                        posAttr.array[i * 3 + 2] = 0;
                    }
                }
                posAttr.needsUpdate = true;

                if (frame === growthStartTime + 10) setShowUI(true);
                if (frame === growthStartTime + 110) setIsLevelUp(true);
            }

            // Subtle rotation
            treeGroup.rotation.y += 0.005;

            renderer.render(scene, camera);
        };

        animate();

        // YOC Counter Animation
        setTimeout(() => {
            let start = 4.2;
            const end = 4.8;
            const duration = 1500;
            const startTime = performance.now();

            const updateCounter = (now) => {
                const elapsed = now - startTime;
                const progress = Math.min(elapsed / duration, 1);
                const currentYoc = start + (end - start) * progress;
                setYoc(currentYoc.toFixed(1));
                if (progress < 1) requestAnimationFrame(updateCounter);
            };
            requestAnimationFrame(updateCounter);
        }, 1000);

        return () => {
            isAnimating = false;
            mountRef.current?.removeChild(renderer.domElement);
        };
    }, []);

    return (
        <div className="relative w-full h-screen bg-emerald-950 overflow-hidden font-sans select-none">
            {/* 3D Canvas Container */}
            <div ref={mountRef} className="absolute inset-0" />

            {/* Decorative Night Elements */}
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-black/40 via-transparent to-black/60" />

            {/* Main Announcement Pop-up */}
            <div className={`absolute top-20 left-1/2 -translate-x-1/2 w-[85%] transition-all duration-700 transform ${showUI ? 'translate-y-0 opacity-100' : '-translate-y-20 opacity-0'}`}>
                <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 shadow-2xl overflow-hidden relative">
                    {/* Animated Shine Effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />

                    <div className="flex flex-col items-center text-center">
                        <div className="w-16 h-16 bg-emerald-500 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-emerald-500/30">
                            <Trophy className="text-white" size={32} />
                        </div>

                        <h1 className="text-2xl font-black text-white mb-1 tracking-tight">🎉 JT 増配発表！</h1>
                        <p className="text-emerald-300 text-sm font-medium mb-6">株主還元方針の変更によるサプライズ</p>

                        {/* YOC Change Visual */}
                        <div className="flex items-center gap-6 mb-8">
                            <div className="text-center">
                                <p className="text-[10px] text-white/50 uppercase font-bold tracking-widest mb-1">Before</p>
                                <p className="text-2xl font-bold text-white/40">4.2%</p>
                            </div>
                            <div className="flex flex-col items-center">
                                <div className="w-12 h-0.5 bg-white/20 relative">
                                    <ArrowUpRight className="absolute -right-2 -top-2 text-emerald-400" size={20} />
                                </div>
                            </div>
                            <div className="text-center">
                                <p className="text-[10px] text-emerald-400 uppercase font-bold tracking-widest mb-1">New YOC</p>
                                <p className="text-5xl font-black text-emerald-400 drop-shadow-[0_0_15px_rgba(52,211,153,0.5)] transition-all">
                                    {yoc}<span className="text-xl ml-1">%</span>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Success Message */}
            <div className={`absolute bottom-16 left-0 w-full px-8 transition-all duration-500 delay-500 transform ${isLevelUp ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                <div className="bg-emerald-900/80 backdrop-blur-md border border-emerald-400/30 rounded-2xl p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-emerald-400/20 rounded-lg text-emerald-400">
                            <Sparkles size={20} />
                        </div>
                        <div>
                            <p className="text-white font-bold text-sm">年間配当 <span className="text-emerald-400">+1,200円</span></p>
                            <p className="text-emerald-300/70 text-[10px]">日本たばこ産業 (2914)</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <span className="inline-block px-2 py-1 rounded bg-white text-emerald-900 text-[10px] font-black uppercase tracking-tighter">
                            Level Up!
                        </span>
                    </div>
                </div>
            </div>

            {/* Background Grid Particle CSS */}
            <style dangerouslySetInnerHTML={{
                __html: `
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        @keyframes bounce-subtle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        .animate-bounce-subtle {
          animation: bounce-subtle 2s ease-in-out infinite;
        }
      `}} />

            {/* Floating Sparkles in UI */}
            {isLevelUp && [...Array(10)].map((_, i) => (
                <div
                    key={i}
                    className="absolute pointer-events-none text-emerald-400/50 animate-pulse"
                    style={{
                        top: `${Math.random() * 100}%`,
                        left: `${Math.random() * 100}%`,
                        fontSize: `${Math.random() * 20 + 10}px`
                    }}
                >
                    ✦
                </div>
            ))}

            {/* Close/Confirm Button */}
            <div className={`absolute bottom-28 left-1/2 -translate-x-1/2 w-full px-8 transition-all duration-500 ${isLevelUp ? 'opacity-100 scale-100' : 'opacity-0 scale-90 pointer-events-none'}`}>
                <button className="w-full bg-white text-emerald-950 font-black py-4 rounded-2xl shadow-xl active:scale-95 transition-transform flex items-center justify-center gap-2">
                    庭園を確認する <TrendingUp size={18} />
                </button>
            </div>
        </div>
    );
};

export default App;