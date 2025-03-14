import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import MurmurationScene from './components/MurmurationScene';
import ControlPanel from './components/ControlPanel';
import Header from './components/Header';
import { useStore } from './store';
import * as THREE from 'three';

interface BackgroundProps {
  backgroundType: 'color' | 'image';
  backgroundImage: string | null;
}

const AppContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
`;

const MainContent = styled.main`
  display: flex;
  flex: 1;
  position: relative;
  overflow: hidden;
`;

const CanvasContainer = styled.div<BackgroundProps>`
  flex: 1;
  position: relative;
  background-color: ${({ backgroundType }) => backgroundType === 'color' ? '#87CEEB' : 'transparent'};
  
  ${({ backgroundType, backgroundImage }) => 
    backgroundType === 'image' && backgroundImage ? `
      &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-image: url(${backgroundImage});
        background-size: cover;
        background-position: center;
        background-repeat: no-repeat;
        z-index: 0;
        filter: brightness(1.05);
      }
    ` : ''}
`;

// Stabilized camera controls component to prevent zoom jumps
const StabilizedControls = () => {
  const controlsRef = useRef<any>(null);
  const { camera } = useThree();
  const cameraPositionRef = useRef(new THREE.Vector3(0, 0, 100));
  
  // Save camera position after user interactions
  useEffect(() => {
    const savePosition = () => {
      if (camera) {
        cameraPositionRef.current.copy(camera.position);
      }
    };
    
    window.addEventListener('mouseup', savePosition);
    window.addEventListener('touchend', savePosition);
    
    return () => {
      window.removeEventListener('mouseup', savePosition);
      window.removeEventListener('touchend', savePosition);
    };
  }, [camera]);
  
  // This restores the camera position if it's accidentally reset
  useEffect(() => {
    if (camera && controlsRef.current) {
      // If the camera has moved significantly from its last known position, restore it
      if (camera.position.distanceTo(cameraPositionRef.current) > 10) {
        camera.position.copy(cameraPositionRef.current);
        controlsRef.current.update();
      }
    }
  });
  
  return (
    <OrbitControls 
      ref={controlsRef}
      enablePan={false}
      enableZoom={true}
      maxDistance={200}
      minDistance={30}
      dampingFactor={0.2}
      enableDamping={true}
      zoomToCursor={false}
    />
  );
};

// Horizon line indicator component
const HorizonLine = () => {
  const { params } = useStore();
  const { viewport } = useThree();
  
  // Position the line at the horizon height
  const y = params.horizonHeight;
  
  // Calculate the width to make it wide enough to span the view
  const width = viewport.width * 2;
  
  return (
    <mesh position={[0, y, 0]} rotation={[0, 0, 0]}>
      <planeGeometry args={[width, 0.5]} />
      <meshBasicMaterial color="#ffffff" opacity={0.2} transparent={true} />
    </mesh>
  );
};

const App: React.FC = () => {
  const [isPanelOpen, setIsPanelOpen] = useState(true);
  const { backgroundType, backgroundImage } = useStore();

  const togglePanel = () => {
    setIsPanelOpen(!isPanelOpen);
  };

  return (
    <AppContainer>
      <Header togglePanel={togglePanel} isPanelOpen={isPanelOpen} />
      <MainContent>
        <CanvasContainer backgroundType={backgroundType} backgroundImage={backgroundImage}>
          <Canvas
            camera={{ position: [0, 0, 100], fov: 75 }}
            dpr={[1, 2]}
            style={{ position: 'relative', zIndex: 1 }}
            gl={{ alpha: true, antialias: true }}
          >
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} intensity={1} />
            <HorizonLine />
            <MurmurationScene />
            <StabilizedControls />
          </Canvas>
        </CanvasContainer>
        {isPanelOpen && <ControlPanel />}
      </MainContent>
    </AppContainer>
  );
};

export default App; 