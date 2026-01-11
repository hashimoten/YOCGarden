import React, { useMemo, useState, useEffect, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrthographicCamera, Billboard, Text, useTexture, SoftShadows, Preload } from '@react-three/drei';
import * as THREE from 'three';
import { Stock } from '../../types';
import { getTreeLevel } from '../../utils/treeLevel';

interface IsometricGardenProps {
    stocks: Stock[];
    onStockClick?: (stock: Stock) => void;
}

const TILE_SIZE = 1.2;
const GRID_COLS = 5;
const GRID_ROWS = 5;

// --- Ground Block ---
const GroundBlock: React.FC<{ position: [number, number, number]; isDark: boolean }> = ({ position, isDark }) => {
    return (
        <mesh position={[position[0], position[1] + 0.01, position[2]]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
            <planeGeometry args={[1, 1]} />
            <meshStandardMaterial color={isDark ? "#22c55e" : "#4ade80"} />
        </mesh>
    );
};

// --- Tree Component (Image Only) ---
const TreeImage: React.FC<{
    imagePath: string;
    name: string;
    yoc: number;
    position: [number, number, number];
    onClick: () => void;
}> = ({ imagePath, name, yoc, position, onClick }) => {
    const [hovered, setHovered] = useState(false);

    // useTexture from drei
    const texture = useTexture(imagePath);

    // Ensure proper color space for the texture
    useEffect(() => {
        if (texture) {
            texture.colorSpace = THREE.SRGBColorSpace;
            texture.needsUpdate = true;
        }
    }, [texture]);

    useEffect(() => {
        document.body.style.cursor = hovered ? 'pointer' : 'auto';
        return () => { document.body.style.cursor = 'auto'; };
    }, [hovered]);

    return (
        <group
            position={position}
            onClick={(e) => { e.stopPropagation(); onClick(); }}
            onPointerOver={() => setHovered(true)}
            onPointerOut={() => setHovered(false)}
        >
            {/* Shadow blob */}
            <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <circleGeometry args={[0.3, 32]} />
                <meshBasicMaterial color="black" transparent opacity={0.2} />
            </mesh>



            {/* Tree Texture - Regular mesh instead of Billboard */}
            <mesh
                position={[0, 0.7, 0]}
                scale={hovered ? 1.3 : 1.1}
                rotation={[0, Math.PI / 4, 0]}
            >
                <planeGeometry args={[1.5, 1.5]} />
                <meshBasicMaterial
                    map={texture}
                    transparent={true}
                    side={THREE.DoubleSide}
                    depthWrite={false}
                    toneMapped={false}
                    opacity={1.0}
                />
            </mesh>

            {/* Hover Label */}
            {hovered && (
                <Billboard position={[0, 1.8, 0]}>
                    <Text fontSize={0.22} color="#1E293B" anchorX="center" anchorY="middle" outlineWidth={0.03} outlineColor="white">
                        {name}
                    </Text>
                    <Text position={[0, -0.28, 0]} fontSize={0.16} color="#059669" anchorX="center" anchorY="middle" outlineWidth={0.02} outlineColor="white">
                        {`YOC: ${yoc.toFixed(2)}%`}
                    </Text>
                </Billboard>
            )}
        </group>
    );
};

// --- Loading Placeholder ---
const LoadingPlaceholder: React.FC = () => {
    return (
        <mesh position={[0, 0.5, 0]}>
            <sphereGeometry args={[0.1]} />
            <meshBasicMaterial color="#cccccc" />
        </mesh>
    );
};

// --- Scene Content (separated for Suspense) ---
const GardenScene: React.FC<{
    stocks: Stock[];
    gridSpots: Array<{ x: number; z: number; index: number }>;
    onStockClick?: (stock: Stock) => void;
}> = ({ stocks, gridSpots, onStockClick }) => {
    return (
        <>
            {/* Base Island */}
            <group position={[0, 0.2, 0]}>
                {/* Large soil block */}
                <mesh position={[0, -0.4, 0]} receiveShadow>
                    <boxGeometry args={[GRID_COLS * TILE_SIZE + 0.2, 0.8, GRID_ROWS * TILE_SIZE + 0.2]} />
                    <meshStandardMaterial color="#5D4037" />
                </mesh>
                {/* Grass top layer */}
                <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
                    <planeGeometry args={[GRID_COLS * TILE_SIZE, GRID_ROWS * TILE_SIZE]} />
                    <meshStandardMaterial color="#86EFAC" />
                </mesh>
            </group>

            {/* Grid Cells */}
            <group position={[0, 0.25, 0]}>
                {gridSpots.map((spot) => {
                    const stock = stocks[spot.index];
                    const isDark = (spot.index % 2 === ((Math.floor(spot.index / GRID_COLS) % 2) ? 0 : 1));
                    return (
                        <group key={spot.index} position={[spot.x, 0, spot.z]}>
                            <GroundBlock position={[0, 0, 0]} isDark={isDark} />
                            {stock && (
                                <Suspense fallback={<LoadingPlaceholder />}>
                                    <TreeImage
                                        imagePath={getTreeLevel(stock.yoc).image}
                                        name={stock.name}
                                        yoc={stock.yoc}
                                        position={[0, 0.05, 0]}
                                        onClick={() => onStockClick && onStockClick(stock)}
                                    />
                                </Suspense>
                            )}
                        </group>
                    );
                })}
            </group>
        </>
    );
};

export const IsometricGarden: React.FC<IsometricGardenProps> = ({ stocks, onStockClick }) => {

    const gridSpots = useMemo(() => {
        const spots = [];
        for (let i = 0; i < 25; i++) {
            const col = i % GRID_COLS;
            const row = Math.floor(i / GRID_COLS);
            const x = (col - (GRID_COLS - 1) / 2) * TILE_SIZE;
            const z = (row - (GRID_ROWS - 1) / 2) * TILE_SIZE;
            spots.push({ x, z, index: i });
        }
        return spots;
    }, []);

    return (
        <div style={{ width: '100%', height: '100%', minHeight: '400px' }}>
            <Canvas
                className="w-full h-full"
                shadows
                gl={{
                    antialias: true,
                    alpha: true,
                    preserveDrawingBuffer: true
                }}
            >
                <OrthographicCamera
                    makeDefault
                    position={[20, 20, 20]}
                    zoom={45}
                    near={0.1}
                    far={1000}
                    onUpdate={c => c.lookAt(0, 0, 0)}
                />

                {/* Lighting */}
                <ambientLight intensity={0.8} />
                <directionalLight
                    position={[10, 20, 5]}
                    intensity={1.0}
                    castShadow
                    shadow-mapSize={[1024, 1024]}
                />
                <SoftShadows size={10} samples={10} focus={0} />

                <Suspense fallback={null}>
                    <GardenScene stocks={stocks} gridSpots={gridSpots} onStockClick={onStockClick} />
                </Suspense>

                <Preload all />
            </Canvas>
        </div>
    );
};
