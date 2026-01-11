import React, { useMemo, useState, useEffect, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrthographicCamera, Text, useTexture, Preload } from '@react-three/drei';
import * as THREE from 'three';
import { Stock } from '../../types';
import { getTreeLevel } from '../../utils/treeLevel';

interface IsometricGardenProps {
    stocks: Stock[];
    onStockClick?: (stock: Stock) => void;
}

const TILE_SIZE = 1.0; // Slightly reduced for tighter packing if using blocks
// Actually keep 1.2 for spacing, or adjust if the image is square. 
// Let's assume standard spacing first.
const GRID_COLS = 5;
const GRID_ROWS = 5;

// --- Ground Block Using Texture ---
const GroundBlock: React.FC<{ position: [number, number, number] }> = ({ position }) => {
    const texture = useTexture('/trees/block_grass.png');

    // Assuming block_grass.png is an isometric view similar to the trees.
    // We render it on a plane facing the camera.
    return (
        <mesh
            position={[position[0], position[1], position[2]]}
            rotation={[0, Math.PI / 4, 0]} // Face camera like trees
            receiveShadow
        >
            {/* Size might need adjustment based on the image aspect ratio */}
            <planeGeometry args={[1.8, 1.8]} />
            <meshBasicMaterial
                map={texture}
                transparent={true}
                side={THREE.DoubleSide}
                depthWrite={false} // Prevent Z-fighting if overlapping
                toneMapped={false}
            />
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
    const texture = useTexture(imagePath);

    useEffect(() => {
        document.body.style.cursor = hovered ? 'pointer' : 'auto';
        return () => { document.body.style.cursor = 'auto'; };
    }, [hovered]);

    // Determine custom offset based on image type
    const getCustomPosition = (): [number, number, number] => {
        if (imagePath.includes('YoungTree')) {
            return [0, 0, 0]; // Raise YoungTree slightly or adjust X/Z
        }
        if (imagePath.includes('GrowingTree')) {
            return [0, 0.2, 0]; // Raise YoungTree slightly or adjust X/Z
        }
        if (imagePath.includes('CoreHolding')) {
            return [0, 0.5, 0]; // Raise YoungTree slightly or adjust X/Z
        }
        if (imagePath.includes('LegendaryTree')) {
            // Legendary tree might be large, adjust if needed
            return [0, 0.25, 0];
        }
        return [0, 0.4, 0];
    };

    // Determine custom scale based on image type
    const getCustomScale = (): number => {
        const baseScale = hovered ? 1.3 : 1.1; // Hover effect multiplier

        let visualScale = 1.0;
        if (imagePath.includes('YoungTree')) {
            visualScale = 0.8; // Make YoungTree smaller
        } else if (imagePath.includes('GrowingTree')) {
            visualScale = 0.8;
        } else if (imagePath.includes('CoreHolding')) {
            visualScale = 1.2;
        } else if (imagePath.includes('LegendaryTree')) {
            visualScale = 1.2; // Legendary is huge
        }

        return baseScale * visualScale;
    };

    return (
        <group position={position}>
            {/* INVISIBLE HIT BOX for interaction - smaller than visual to prevent overlap */}
            <mesh
                position={[0, 0.5, 0]}
                onClick={(e) => {
                    e.stopPropagation();
                    onClick();
                }}
                onPointerOver={(e) => {
                    e.stopPropagation();
                    setHovered(true);
                }}
                onPointerOut={(e) => {
                    e.stopPropagation();
                    setHovered(false);
                }}
                visible={false} // Invisible but interactive
            >
                <boxGeometry args={[0.6, 1.0, 0.6]} />
                <meshBasicMaterial color="red" wireframe />
            </mesh>

            {/* Visual Tree Texture - No interaction events here */}
            <mesh
                position={getCustomPosition()}
                scale={getCustomScale()}
                rotation={[0, Math.PI / 4, 0]}
                renderOrder={10}
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
                <group position={[0, 1.5, 0]} renderOrder={20}>
                    <Text fontSize={0.22} color="#1E293B" anchorX="center" anchorY="middle" outlineWidth={0.03} outlineColor="white" rotation={[0, Math.PI / 4, 0]}>
                        {name}
                    </Text>
                    <Text position={[0, -0.28, 0]} fontSize={0.16} color="#059669" anchorX="center" anchorY="middle" outlineWidth={0.02} outlineColor="white" rotation={[0, Math.PI / 4, 0]}>
                        {`YOC: ${yoc.toFixed(2)}%`}
                    </Text>
                </group>
            )}
        </group>
    );
};

// --- Scene Content ---
const GardenScene: React.FC<{
    stocks: Stock[];
    gridSpots: Array<{ x: number; z: number; index: number }>;
    onStockClick?: (stock: Stock) => void;
}> = ({ stocks, gridSpots, onStockClick }) => {
    return (
        <group position={[0, -0.5, 0]}> {/* Adjust overall height */}
            {gridSpots.map((spot) => {
                const stock = stocks[spot.index];

                // Calculate position for Z-sorting (painter's algorithm)
                // In isometric grid, items 'behind' (lower X/Z) should be drawn first?
                // Or just rely on Z-buffer + alpha test. 
                // With transparent planes, renderOrder is helpful.
                // We'll give closer items higher renderOrder if needed, but standard depth might work if cutoff is used.
                // For now, let's just render.

                return (
                    <group key={spot.index} position={[spot.x, 0, spot.z]}>
                        <Suspense fallback={null}>
                            <GroundBlock position={[0, 0, 0]} />
                        </Suspense>
                        {stock && (
                            <Suspense fallback={null}>
                                <TreeImage
                                    imagePath={getTreeLevel(stock.yoc).image}
                                    name={stock.name}
                                    yoc={stock.yoc}
                                    position={[0, 0.5, 0]} // Sit on top of block
                                    onClick={() => onStockClick && onStockClick(stock)}
                                />
                            </Suspense>
                        )}
                    </group>
                );
            })}
        </group>
    );
};

export const IsometricGarden: React.FC<IsometricGardenProps> = ({ stocks, onStockClick }) => {

    const gridSpots = useMemo(() => {
        // Generate grid spots
        // To ensure correct overlap in isometric view (Painter's Algorithm for sprites),
        // we might want to sort them: Back (-Z/-X) to Front (+Z/+X)
        const spots = [];
        for (let i = 0; i < 25; i++) {
            const col = i % GRID_COLS;
            const row = Math.floor(i / GRID_COLS);
            const x = (col - (GRID_COLS - 1) / 2) * TILE_SIZE * 1.0; // Spacing multiplier
            const z = (row - (GRID_ROWS - 1) / 2) * TILE_SIZE * 1.0;
            spots.push({ x, z, index: i, col, row });
        }

        // Sorting for isometric sprite overlap: 
        // Draw far items first (Low Row/Col?) -> Draw near items last.
        // In this camera setup, [20,20,20] looking at [0,0,0].
        // +X and +Z are closer to camera? No, camera is at +20,+20,+20.
        // So +X/+Z is closer.
        // Far is -X/-Z.
        // We should render -X/-Z first. 
        spots.sort((a, b) => (a.x + a.z) - (b.x + b.z));

        return spots;
    }, []);

    return (
        <div style={{ width: '100%', height: '100%', minHeight: '400px' }}>
            <Canvas
                className="w-full h-full"
                gl={{
                    antialias: true,
                    alpha: true,
                    preserveDrawingBuffer: true
                }}
            >
                <OrthographicCamera
                    makeDefault
                    position={[20, 20, 20]} // Isometric Angle
                    zoom={55} // Zoom in to fill space
                    near={0.1}
                    far={1000}
                    onUpdate={c => c.lookAt(0, 0, 0)}
                />

                <ambientLight intensity={1.0} />

                {/* No base island, just tiles */}

                <Suspense fallback={null}>
                    <GardenScene stocks={stocks} gridSpots={gridSpots} onStockClick={onStockClick} />
                </Suspense>

                <Preload all />
            </Canvas>
        </div>
    );
};
