import React, { useState, useEffect, useRef, useCallback } from 'react';
import styled from 'styled-components';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, useTexture } from '@react-three/drei';
import MurmurationScene from './components/MurmurationScene';
import ControlPanel from './components/ControlPanel';
import Header from './components/Header';
import { useStore } from './store';
import * as THREE from 'three';

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

const CanvasContainer = styled.div`
  flex: 1;
  position: relative;
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

// Custom background component for when an image is selected
const BackgroundImage = ({ url }: { url: string }) => {
  const texture = useTexture(url);
  const { camera, viewport, size } = useThree();
  
  // Reference to track resize events
  const sizeRef = useRef({ width: size.width, height: size.height });
  
  // Function to adjust texture to maintain aspect ratio and fill viewport
  const adjustTextureToFitViewport = useCallback(() => {
    if (!texture.image) return;
    
    // Get image aspect ratio
    const imageAspect = texture.image.width / texture.image.height;
    const viewportAspect = viewport.width / viewport.height;
    
    // Set texture to repeat properly
    texture.wrapS = THREE.ClampToEdgeWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    
    // Scale texture based on aspect ratio comparison
    if (viewportAspect > imageAspect) {
      // Viewport is wider than image
      const scale = viewportAspect / imageAspect;
      texture.repeat.set(scale, 1);
      texture.offset.set((1 - scale) / 2, 0);
    } else {
      // Viewport is taller than image
      const scale = imageAspect / viewportAspect;
      texture.repeat.set(1, scale);
      texture.offset.set(0, (1 - scale) / 2);
    }
  }, [texture, viewport]);
  
  // Adjust texture when it loads
  useEffect(() => {
    if (texture && texture.image) {
      adjustTextureToFitViewport();
    }
  }, [texture, adjustTextureToFitViewport]);
  
  // Handle window resize
  useEffect(() => {
    // Check if there was an actual resize
    if (
      Math.abs(sizeRef.current.width - size.width) > 0.01 ||
      Math.abs(sizeRef.current.height - size.height) > 0.01
    ) {
      sizeRef.current = { width: size.width, height: size.height };
      adjustTextureToFitViewport();
    }
  }, [size, adjustTextureToFitViewport]);
  
  // Calculate the plane size to fully cover viewport
  const planeWidth = viewport.width * 1.5;
  const planeHeight = viewport.height * 1.5;
  
  // Position the plane behind everything but within view
  const distanceFromCamera = Math.abs(camera.position.z) * 0.9;
  
  return (
    <mesh position={[0, 0, -distanceFromCamera]}>
      <planeGeometry args={[planeWidth, planeHeight]} />
      <meshBasicMaterial map={texture} depthTest={false} />
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
        <CanvasContainer>
          <Canvas
            camera={{ position: [0, 0, 100], fov: 75 }}
            dpr={[1, 2]}
          >
            {backgroundType === 'color' ? (
              <color attach="background" args={['#87CEEB']} />
            ) : null}
            {backgroundType === 'image' && backgroundImage ? (
              <BackgroundImage url={backgroundImage} />
            ) : null}
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