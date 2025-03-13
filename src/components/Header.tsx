import React from 'react';
import styled from 'styled-components';
import { useStore } from '../store';

interface HeaderProps {
  togglePanel: () => void;
  isPanelOpen: boolean;
}

const HeaderContainer = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 2rem;
  background-color: ${({ theme }) => theme.colors.backgroundLight};
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  z-index: ${({ theme }) => theme.zIndices.docked};
`;

const Logo = styled.h1`
  font-size: ${({ theme }) => theme.fontSizes.xl};
  font-weight: bold;
  color: ${({ theme }) => theme.colors.primary};
  margin: 0;
`;

const Controls = styled.div`
  display: flex;
  gap: 1rem;
`;

const Button = styled.button<{ active?: boolean }>`
  padding: 0.5rem 1rem;
  background-color: ${({ theme, active }) => 
    active ? theme.colors.primary : theme.colors.secondary};
  color: ${({ theme }) => theme.colors.text};
  border-radius: ${({ theme }) => theme.radii.md};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: 500;
  transition: ${({ theme }) => theme.transitions.normal};
  
  &:hover {
    background-color: ${({ theme, active }) => 
      active ? theme.colors.primary : theme.colors.accent};
  }
`;

const Header: React.FC<HeaderProps> = ({ togglePanel, isPanelOpen }) => {
  const { isTextMode, toggleTextMode, isPaused, togglePause } = useStore();
  
  return (
    <HeaderContainer>
      <Logo>Murmuration</Logo>
      
      <Controls>
        <Button onClick={toggleTextMode} active={isTextMode}>
          {isTextMode ? 'Text Mode: ON' : 'Text Mode: OFF'}
        </Button>
        
        <Button onClick={togglePause}>
          {isPaused ? 'Resume' : 'Pause'}
        </Button>
        
        <Button onClick={togglePanel}>
          {isPanelOpen ? 'Hide Controls' : 'Show Controls'}
        </Button>
      </Controls>
    </HeaderContainer>
  );
};

export default Header; 