import React, { useState } from 'react';
import styled from 'styled-components';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import MurmurationScene from './components/MurmurationScene';
import ControlPanel from './components/ControlPanel';
import Header from './components/Header';
import { useStore } from './store';

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
`;

const CanvasContainer = styled.div`
  flex: 1;
  position: relative;
`;

const App: React.FC = () => {
  const [isPanelOpen, setIsPanelOpen] = useState(true);
  const { isTextMode } = useStore();

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
            <color attach="background" args={['#121212']} />
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} intensity={1} />
            <MurmurationScene />
            <OrbitControls 
              enablePan={false}
              enableZoom={true}
              maxDistance={200}
              minDistance={30}
            />
          </Canvas>
        </CanvasContainer>
        {isPanelOpen && <ControlPanel />}
      </MainContent>
    </AppContainer>
  );
};

export default App; 