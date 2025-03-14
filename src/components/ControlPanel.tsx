import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useStore } from '../store';

const PanelContainer = styled.div`
  width: 320px;
  min-width: 320px;
  height: 100%;
  max-height: 100vh;
  background-color: ${({ theme }) => theme.colors.backgroundLight};
  border-left: 1px solid ${({ theme }) => theme.colors.accent};
  padding: 1.5rem;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  z-index: 20;
  
  /* Ensure proper scrolling on different browsers */
  scrollbar-width: thin;
  scrollbar-color: ${({ theme }) => theme.colors.accent} ${({ theme }) => theme.colors.secondary};
  
  &::-webkit-scrollbar {
    width: 8px;
  }
  
  &::-webkit-scrollbar-track {
    background: ${({ theme }) => theme.colors.secondary};
  }
  
  &::-webkit-scrollbar-thumb {
    background-color: ${({ theme }) => theme.colors.accent};
    border-radius: 4px;
  }
`;

const Section = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const SectionTitle = styled.h2`
  font-size: ${({ theme }) => theme.fontSizes.lg};
  color: ${({ theme }) => theme.colors.primary};
  margin: 0;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.accent};
`;

const ControlGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.textSecondary};
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Value = styled.span`
  color: ${({ theme }) => theme.colors.text};
  font-family: ${({ theme }) => theme.fonts.monospace};
`;

const Slider = styled.input`
  width: 100%;
  -webkit-appearance: none;
  height: 6px;
  border-radius: 3px;
  background: ${({ theme }) => theme.colors.secondary};
  outline: none;
  
  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: ${({ theme }) => theme.colors.primary};
    cursor: pointer;
  }
  
  &::-moz-range-thumb {
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: ${({ theme }) => theme.colors.primary};
    cursor: pointer;
  }
`;

const Input = styled.input`
  padding: 0.5rem;
  background-color: ${({ theme }) => theme.colors.secondary};
  color: ${({ theme }) => theme.colors.text};
  border: 1px solid ${({ theme }) => theme.colors.accent};
  border-radius: ${({ theme }) => theme.radii.md};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  width: 100%;
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const Checkbox = styled.input`
  margin-right: 0.5rem;
`;

const Button = styled.button`
  padding: 0.5rem 1rem;
  background-color: ${({ theme }) => theme.colors.secondary};
  color: ${({ theme }) => theme.colors.text};
  border-radius: ${({ theme }) => theme.radii.md};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: 500;
  transition: ${({ theme }) => theme.transitions.normal};
  width: 100%;
  
  &:hover {
    background-color: ${({ theme }) => theme.colors.accent};
  }
`;

const PresetSelect = styled.select`
  padding: 0.5rem;
  background-color: ${({ theme }) => theme.colors.secondary};
  color: ${({ theme }) => theme.colors.text};
  border: 1px solid ${({ theme }) => theme.colors.accent};
  border-radius: ${({ theme }) => theme.radii.md};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  width: 100%;
`;

const TabContainer = styled.div`
  display: flex;
  border-bottom: 1px solid ${({ theme }) => theme.colors.accent};
  margin-bottom: 1rem;
`;

const Tab = styled.button<{ active: boolean }>`
  padding: 0.5rem 1rem;
  background-color: ${({ theme, active }) => 
    active ? theme.colors.primary : 'transparent'};
  color: ${({ theme }) => theme.colors.text};
  border: none;
  border-radius: ${({ theme }) => `${theme.radii.md} ${theme.radii.md} 0 0`};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: 500;
  transition: ${({ theme }) => theme.transitions.normal};
  
  &:hover {
    background-color: ${({ theme, active }) => 
      active ? theme.colors.primary : theme.colors.accent};
  }
`;

const RadioGroup = styled.div`
  display: flex;
  gap: 1rem;
`;

const RadioOption = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const ControlPanel: React.FC = () => {
  const { 
    params, 
    updateParams, 
    resetParams, 
    textParams, 
    updateTextParams, 
    presets, 
    loadPreset, 
    savePreset,
    backgroundType,
    backgroundImage,
    setBackgroundType,
    setBackgroundImage 
  } = useStore();
  
  const [activeTab, setActiveTab] = useState<'simulation' | 'text'>('simulation');
  const [presetName, setPresetName] = useState('');
  
  const handlePresetSave = () => {
    if (presetName.trim()) {
      savePreset(presetName);
      setPresetName('');
    }
  };
  
  const handleBackgroundImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const imageUrl = URL.createObjectURL(file);
      setBackgroundImage(imageUrl);
      setBackgroundType('image');
    }
  };
  
  const removeBackgroundImage = () => {
    if (backgroundImage) {
      URL.revokeObjectURL(backgroundImage);
    }
    setBackgroundImage(null);
    setBackgroundType('color');
  };

  // Cleanup background image URLs when component unmounts
  useEffect(() => {
    return () => {
      if (backgroundImage) {
        URL.revokeObjectURL(backgroundImage);
      }
    };
  }, [backgroundImage]);

  return (
    <PanelContainer>
      <TabContainer>
        <Tab 
          active={activeTab === 'simulation'} 
          onClick={() => setActiveTab('simulation')}
        >
          Simulation
        </Tab>
        <Tab 
          active={activeTab === 'text'} 
          onClick={() => setActiveTab('text')}
        >
          Text Mode
        </Tab>
      </TabContainer>
      
      {activeTab === 'simulation' ? (
        <>
          <Section>
            <SectionTitle>Presets</SectionTitle>
            <ControlGroup>
              <PresetSelect 
                onChange={(e) => loadPreset(e.target.value)}
                value=""
              >
                <option value="" disabled>Select a preset</option>
                {Object.keys(presets).map((name) => (
                  <option key={name} value={name}>{name}</option>
                ))}
              </PresetSelect>
            </ControlGroup>
            <ControlGroup>
              <Input 
                type="text" 
                placeholder="New preset name" 
                value={presetName}
                onChange={(e) => setPresetName(e.target.value)}
              />
              <Button onClick={handlePresetSave}>Save Current Settings</Button>
            </ControlGroup>
            <Button onClick={resetParams}>Reset to Default</Button>
          </Section>
          
          <Section>
            <SectionTitle>Background Settings</SectionTitle>
            <ControlGroup>
              <Label>Background Type</Label>
              <RadioGroup>
                <RadioOption>
                  <input
                    type="radio"
                    name="backgroundType"
                    checked={backgroundType === 'color'}
                    onChange={() => setBackgroundType('color')}
                  />
                  <span>Color (Sky Blue)</span>
                </RadioOption>
                <RadioOption>
                  <input
                    type="radio"
                    name="backgroundType"
                    checked={backgroundType === 'image'}
                    onChange={() => setBackgroundType('image')}
                  />
                  <span>Custom Image</span>
                </RadioOption>
              </RadioGroup>
            </ControlGroup>
            
            {backgroundType === 'image' && (
              <ControlGroup>
                <Label>Custom Background Image</Label>
                {backgroundImage ? (
                  <div style={{ marginBottom: '10px' }}>
                    <img 
                      src={backgroundImage} 
                      alt="Custom background" 
                      style={{ 
                        width: '100%', 
                        height: '80px', 
                        objectFit: 'cover', 
                        borderRadius: '4px' 
                      }} 
                    />
                    <Button onClick={removeBackgroundImage}>Remove Image</Button>
                  </div>
                ) : (
                  <div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleBackgroundImageUpload}
                      style={{ display: 'none' }}
                      id="background-image-upload"
                    />
                    <label htmlFor="background-image-upload">
                      <Button as="span">Upload Image</Button>
                    </label>
                  </div>
                )}
              </ControlGroup>
            )}
          </Section>
          
          <Section>
            <SectionTitle>Flock Settings</SectionTitle>
            <ControlGroup>
              <Label>
                Bird Count
                <Value>{params.birdCount}</Value>
              </Label>
              <Slider 
                type="range" 
                min="10" 
                max="2000" 
                step="10"
                value={params.birdCount}
                onChange={(e) => updateParams({ birdCount: parseInt(e.target.value) })}
              />
            </ControlGroup>
            
            <ControlGroup>
              <Label>
                Speed
                <Value>{params.speed.toFixed(1)}</Value>
              </Label>
              <Slider 
                type="range" 
                min="0.1" 
                max="3.0" 
                step="0.1"
                value={params.speed}
                onChange={(e) => updateParams({ speed: parseFloat(e.target.value) })}
              />
            </ControlGroup>
            
            <ControlGroup>
              <Label>
                Bird Size
                <Value>{params.birdSize.toFixed(1)}</Value>
              </Label>
              <Slider 
                type="range" 
                min="0.1" 
                max="2.0" 
                step="0.1"
                value={params.birdSize}
                onChange={(e) => updateParams({ birdSize: parseFloat(e.target.value) })}
              />
            </ControlGroup>
          </Section>
          
          <Section>
            <SectionTitle>Behavior</SectionTitle>
            <ControlGroup>
              <Label>
                Cohesion Factor
                <Value>{params.cohesionFactor.toFixed(1)}</Value>
              </Label>
              <Slider 
                type="range" 
                min="0" 
                max="3.0" 
                step="0.1"
                value={params.cohesionFactor}
                onChange={(e) => updateParams({ cohesionFactor: parseFloat(e.target.value) })}
              />
            </ControlGroup>
            
            <ControlGroup>
              <Label>
                Alignment Factor
                <Value>{params.alignmentFactor.toFixed(1)}</Value>
              </Label>
              <Slider 
                type="range" 
                min="0" 
                max="3.0" 
                step="0.1"
                value={params.alignmentFactor}
                onChange={(e) => updateParams({ alignmentFactor: parseFloat(e.target.value) })}
              />
            </ControlGroup>
            
            <ControlGroup>
              <Label>
                Separation Factor
                <Value>{params.separationFactor.toFixed(1)}</Value>
              </Label>
              <Slider 
                type="range" 
                min="0" 
                max="3.0" 
                step="0.1"
                value={params.separationFactor}
                onChange={(e) => updateParams({ separationFactor: parseFloat(e.target.value) })}
              />
            </ControlGroup>
            
            <ControlGroup>
              <Label>
                Perception Radius
                <Value>{params.perceptionRadius}</Value>
              </Label>
              <Slider 
                type="range" 
                min="5" 
                max="50" 
                step="1"
                value={params.perceptionRadius}
                onChange={(e) => updateParams({ perceptionRadius: parseInt(e.target.value) })}
              />
            </ControlGroup>
            
            <ControlGroup>
              <Label>
                Boundary Radius
                <Value>{params.boundaryRadius}</Value>
              </Label>
              <Slider 
                type="range" 
                min="50" 
                max="300" 
                step="10"
                value={params.boundaryRadius}
                onChange={(e) => updateParams({ boundaryRadius: parseInt(e.target.value) })}
              />
            </ControlGroup>
          </Section>
          
          <Section>
            <SectionTitle>Environment</SectionTitle>
            <ControlGroup>
              <Label>
                Horizon Height
                <Value>{params.horizonHeight}</Value>
              </Label>
              <Slider 
                type="range" 
                min="-100" 
                max="0" 
                step="5"
                value={params.horizonHeight}
                onChange={(e) => updateParams({ horizonHeight: parseInt(e.target.value) })}
              />
              <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)', marginTop: '-0.25rem' }}>
                Controls the minimum flying height (visual horizon line)
              </div>
            </ControlGroup>
            
            <ControlGroup>
              <Label>
                Camera Distance
                <Value>{params.minCameraDistance}</Value>
              </Label>
              <Slider 
                type="range" 
                min="20" 
                max="100" 
                step="5"
                value={params.minCameraDistance}
                onChange={(e) => updateParams({ minCameraDistance: parseInt(e.target.value) })}
              />
              <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)', marginTop: '-0.25rem' }}>
                Minimum distance birds should maintain from the camera
              </div>
            </ControlGroup>
            
            <ControlGroup>
              <Label>
                Wind Factor
                <Value>{params.windFactor.toFixed(1)}</Value>
              </Label>
              <Slider 
                type="range" 
                min="0" 
                max="1.0" 
                step="0.1"
                value={params.windFactor}
                onChange={(e) => updateParams({ windFactor: parseFloat(e.target.value) })}
              />
            </ControlGroup>
            
            {/* Always show wind direction, regardless of wind factor */}
            <ControlGroup>
              <Label>Wind Direction {params.windFactor <= 0 && <span style={{fontSize: '0.75rem'}}>(enable wind to use)</span>}</Label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <Input 
                  type="number" 
                  min="-1" 
                  max="1" 
                  step="0.1"
                  value={params.windDirection[0]}
                  onChange={(e) => updateParams({ 
                    windDirection: [
                      parseFloat(e.target.value), 
                      params.windDirection[1], 
                      params.windDirection[2]
                    ] 
                  })}
                  placeholder="X"
                  disabled={params.windFactor <= 0}
                />
                <Input 
                  type="number" 
                  min="-1" 
                  max="1" 
                  step="0.1"
                  value={params.windDirection[1]}
                  onChange={(e) => updateParams({ 
                    windDirection: [
                      params.windDirection[0], 
                      parseFloat(e.target.value), 
                      params.windDirection[2]
                    ] 
                  })}
                  placeholder="Y"
                  disabled={params.windFactor <= 0}
                />
                <Input 
                  type="number" 
                  min="-1" 
                  max="1" 
                  step="0.1"
                  value={params.windDirection[2]}
                  onChange={(e) => updateParams({ 
                    windDirection: [
                      params.windDirection[0], 
                      params.windDirection[1], 
                      parseFloat(e.target.value)
                    ] 
                  })}
                  placeholder="Z"
                  disabled={params.windFactor <= 0}
                />
              </div>
            </ControlGroup>
          </Section>
          
          <Section>
            <SectionTitle>Visual Effects</SectionTitle>
            <ControlGroup>
              <Label>
                <Checkbox 
                  type="checkbox" 
                  checked={params.showTrails}
                  onChange={(e) => updateParams({ showTrails: e.target.checked })}
                />
                Show Trails
              </Label>
            </ControlGroup>
            
            {params.showTrails && (
              <ControlGroup>
                <Label>
                  Trail Length
                  <Value>{params.trailLength}</Value>
                </Label>
                <Slider 
                  type="range" 
                  min="5" 
                  max="50" 
                  step="1"
                  value={params.trailLength}
                  onChange={(e) => updateParams({ trailLength: parseInt(e.target.value) })}
                />
              </ControlGroup>
            )}
          </Section>
        </>
      ) : (
        <Section>
          <SectionTitle>Text Formation</SectionTitle>
          <ControlGroup>
            <Label>Text</Label>
            <Input 
              type="text" 
              value={textParams.text}
              onChange={(e) => updateTextParams({ text: e.target.value })}
              placeholder="Enter text to form"
            />
          </ControlGroup>
          
          <ControlGroup>
            <Label>
              Font Size
              <Value>{textParams.fontSize}</Value>
            </Label>
            <Slider 
              type="range" 
              min="5" 
              max="30" 
              step="1"
              value={textParams.fontSize}
              onChange={(e) => updateTextParams({ fontSize: parseInt(e.target.value) })}
            />
          </ControlGroup>
          
          <ControlGroup>
            <Label>
              Transition Speed
              <Value>{textParams.transitionSpeed.toFixed(3)}</Value>
            </Label>
            <Slider 
              type="range" 
              min="0.001" 
              max="0.05" 
              step="0.001"
              value={textParams.transitionSpeed}
              onChange={(e) => updateTextParams({ transitionSpeed: parseFloat(e.target.value) })}
            />
          </ControlGroup>
          
          <ControlGroup>
            <Label>
              Formation Density
              <Value>{textParams.formationDensity.toFixed(1)}</Value>
            </Label>
            <Slider 
              type="range" 
              min="0.1" 
              max="2.0" 
              step="0.1"
              value={textParams.formationDensity}
              onChange={(e) => updateTextParams({ formationDensity: parseFloat(e.target.value) })}
            />
          </ControlGroup>
          
          <ControlGroup>
            <Label>
              <Checkbox 
                type="checkbox" 
                checked={textParams.maintainFormation}
                onChange={(e) => updateTextParams({ maintainFormation: e.target.checked })}
              />
              Maintain Formation
            </Label>
          </ControlGroup>
          
          <Button 
            onClick={() => updateTextParams({ 
              text: 'MURMURATION',
              fontSize: 15,
              fontWeight: 700,
              transitionSpeed: 0.02,
              formationDensity: 0.8,
              maintainFormation: true,
            })}
          >
            Reset Text Settings
          </Button>
        </Section>
      )}
    </PanelContainer>
  );
};

export default ControlPanel; 