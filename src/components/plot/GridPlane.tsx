/* eslint-disable react/no-unknown-property */
import React from "react";
import { useTexture } from "@react-three/drei";

interface GridPlaneProps {
  zPosition: number;
}

export function GridPlane({ zPosition }: GridPlaneProps) {
  const texture = useTexture("https://images.unsplash.com/photo-1502134249126-9f3755a50d78?auto=format&fit=crop&w=1024");

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, zPosition, 0]}>
      <planeGeometry args={[10, 10]} />
      <meshStandardMaterial 
        map={texture}
        transparent
        opacity={0.3}
      />
    </mesh>
  );
}
/* eslint-enable react/no-unknown-property */
