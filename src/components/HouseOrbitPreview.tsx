import React, { useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { PerspectiveCamera } from "@react-three/drei";
import * as THREE from "three";

interface HouseOrbitPreviewProps {
  rotation: number; // Xoay (Yaw) 0 - 360
  tilt: number; // Nghiêng (Pitch) -90 - 90
  zoom: number; // Phóng 0 - 100
  viewType: string; // "exterior" | "interior"
}

// Orbits the camera around the target point using the same rotation/tilt
// convention as the 2D gimbal widget, so the 3D view always matches the
// angle the user is dragging/selecting.
const OrbitCamera: React.FC<{ rotation: number; tilt: number; zoom: number; target: THREE.Vector3; baseRadius: number }> = ({
  rotation,
  tilt,
  zoom,
  target,
  baseRadius,
}) => {
  const rotRad = (rotation * Math.PI) / 180;
  const tiltRad = (tilt * Math.PI) / 180;
  const radius = baseRadius - (zoom / 100) * (baseRadius * 0.55);

  const x = radius * Math.cos(tiltRad) * Math.sin(rotRad);
  const y = target.y + radius * Math.sin(tiltRad);
  const z = radius * Math.cos(tiltRad) * Math.cos(rotRad);

  return (
    <PerspectiveCamera
      makeDefault
      fov={45}
      position={[x, y, z]}
      onUpdate={(camera) => camera.lookAt(target)}
    />
  );
};

const ExteriorHouse: React.FC = () => {
  return (
    <group>
      {/* Main body */}
      <mesh position={[0, 0.6, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.2, 1.2, 1.7]} />
        <meshStandardMaterial color="#e8e2d8" roughness={0.85} />
      </mesh>

      {/* Hip roof */}
      <mesh position={[0, 1.55, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
        <coneGeometry args={[1.75, 0.9, 4]} />
        <meshStandardMaterial color="#7c3aed" roughness={0.6} />
      </mesh>

      {/* Chimney */}
      <mesh position={[0.6, 1.75, -0.3]}>
        <boxGeometry args={[0.18, 0.5, 0.18]} />
        <meshStandardMaterial color="#4b5563" roughness={0.9} />
      </mesh>

      {/* Door */}
      <mesh position={[0, 0.35, 0.86]}>
        <boxGeometry args={[0.45, 0.7, 0.04]} />
        <meshStandardMaterial color="#1e1b4b" roughness={0.5} />
      </mesh>

      {/* Front windows */}
      {[-0.75, 0.75].map((wx) => (
        <mesh key={`front-${wx}`} position={[wx, 0.7, 0.86]}>
          <boxGeometry args={[0.4, 0.4, 0.04]} />
          <meshStandardMaterial color="#a78bfa" emissive="#818cf8" emissiveIntensity={0.4} roughness={0.2} />
        </mesh>
      ))}

      {/* Side windows */}
      {[-0.5, 0.5].map((wz) => (
        <mesh key={`side-${wz}`} position={[1.11, 0.7, wz]} rotation={[0, Math.PI / 2, 0]}>
          <boxGeometry args={[0.4, 0.4, 0.04]} />
          <meshStandardMaterial color="#a78bfa" emissive="#818cf8" emissiveIntensity={0.4} roughness={0.2} />
        </mesh>
      ))}

      {/* Ground disc */}
      <mesh position={[0, -0.005, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[2.6, 48]} />
        <meshStandardMaterial color="#0f172a" roughness={1} />
      </mesh>
      <gridHelper args={[5.2, 18, "#4c1d95", "#1e293b"]} position={[0, 0.002, 0]} />
    </group>
  );
};

const InteriorRoom: React.FC = () => {
  return (
    <group>
      {/* Floor */}
      <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[2.6, 2.6]} />
        <meshStandardMaterial color="#d6cdbf" roughness={0.9} />
      </mesh>

      {/* Back wall */}
      <mesh position={[0, 0.9, -1.3]}>
        <planeGeometry args={[2.6, 1.8]} />
        <meshStandardMaterial color="#eef0f3" roughness={0.95} side={THREE.DoubleSide} />
      </mesh>

      {/* Left wall */}
      <mesh position={[-1.3, 0.9, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[2.6, 1.8]} />
        <meshStandardMaterial color="#e4e7eb" roughness={0.95} side={THREE.DoubleSide} />
      </mesh>

      {/* Window on back wall */}
      <mesh position={[0.6, 1, -1.28]}>
        <boxGeometry args={[0.6, 0.6, 0.03]} />
        <meshStandardMaterial color="#a78bfa" emissive="#818cf8" emissiveIntensity={0.5} roughness={0.2} />
      </mesh>

      {/* Sofa placeholder */}
      <mesh position={[-0.6, 0.22, 0.6]} castShadow>
        <boxGeometry args={[1.1, 0.44, 0.5]} />
        <meshStandardMaterial color="#7c3aed" roughness={0.7} />
      </mesh>
      <mesh position={[-0.6, 0.5, 0.38]} castShadow>
        <boxGeometry args={[1.1, 0.3, 0.12]} />
        <meshStandardMaterial color="#6d28d9" roughness={0.7} />
      </mesh>

      {/* Coffee table placeholder */}
      <mesh position={[0.5, 0.15, 0.4]} castShadow>
        <boxGeometry args={[0.5, 0.06, 0.35]} />
        <meshStandardMaterial color="#4b5563" roughness={0.4} />
      </mesh>
      <gridHelper args={[2.6, 8, "#4c1d95", "#cbd5e1"]} position={[0, 0.003, 0]} />
    </group>
  );
};

const HouseOrbitPreview: React.FC<HouseOrbitPreviewProps> = ({ rotation, tilt, zoom, viewType }) => {
  const isInterior = viewType === "interior";
  const target = useMemo(() => new THREE.Vector3(0, isInterior ? 0.55 : 0.85, 0), [isInterior]);
  const baseRadius = isInterior ? 2.9 : 5.2;

  return (
    <Canvas
      gl={{ alpha: true, antialias: true }}
      dpr={[1, 2]}
      style={{ background: "transparent" }}
      shadows
    >
      <OrbitCamera rotation={rotation} tilt={tilt} zoom={zoom} target={target} baseRadius={baseRadius} />
      <ambientLight intensity={0.65} />
      <directionalLight position={[3, 4, 2]} intensity={1.1} castShadow />
      <directionalLight position={[-3, 2, -2]} intensity={0.3} color="#818cf8" />
      {isInterior ? <InteriorRoom /> : <ExteriorHouse />}
    </Canvas>
  );
};

export default HouseOrbitPreview;
