import { useGLTF } from '@react-three/drei';
import { useEffect, useRef, Suspense } from 'react';
import { useFrame } from '@react-three/fiber';

import {
  Stars,
  Sparkles,
  OrbitControls,
} from '@react-three/drei';

function Jellyfish() {
  const { scene: homePlanet } = useGLTF('/home_planet.glb'); // 기본 행성
  const { scene: test } = useGLTF('/test3d.glb'); // 이웃 행성

  useEffect(() => {
    [homePlanet, test].forEach((scene) => {
      scene.traverse((child) => {
        if (child.isMesh) {
          child.material.transparent = true;
          child.material.opacity = 0.2;

        }
      });
    });
  }, [homePlanet, test]);

  return (
    <>
       {/* 카메라 컨트롤 */}
      <OrbitControls
        enableZoom={true}
        enablePan={true}
        zoomSpeed={0.005}
        dampingFactor={0.05}
      />
      {/* 별별 */}
       <Stars
        radius={100}
        depth={100}
        count={4000}
        factor={4}
        saturation={0}
        fade
        speed={0.2}
        />
      <Sparkles
        count={300}
        size={3}
        speed={0.02}
        opacity={1}
        scale={90}
        color="#fff3b0"
      />

      {/* 중심 행성 */}
      <primitive
        object={homePlanet}
        position={[0, -70, -30]}
        scale={[120,80,70]}
      />

      {/* 이웃행성 
        <primitive
        object={test}
        position={[0, 0, 0]}
        scale={[2, 2, 2]}
      />
      */}
      
    </>
  );
}

export default Jellyfish;
