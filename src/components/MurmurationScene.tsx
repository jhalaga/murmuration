import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Bird } from '../models/Bird';
import { useStore } from '../store';
import { randomVectorInSphere, toThreeVector } from '../utils/vector';
import { textToPoints, symbolToPoints, assignTargetPoints } from '../utils/textToPoints';
import BirdMesh from './BirdMesh';
import TrailEffect from './TrailEffect';

const MurmurationScene: React.FC = () => {
  const { 
    params, 
    textParams, 
    isTextMode, 
    isPaused 
  } = useStore();
  
  // Ref to store the birds
  const birdsRef = useRef<Bird[]>([]);
  
  // Ref to track if we need to regenerate birds
  const birdCountRef = useRef(params.birdCount);
  
  // Ref to track if we need to regenerate text points
  const textRef = useRef(textParams.text);
  const textModeRef = useRef(isTextMode);
  
  // Generate birds
  const birds = useMemo(() => {
    const newBirds: Bird[] = [];
    
    for (let i = 0; i < params.birdCount; i++) {
      newBirds.push(
        new Bird({
          position: randomVectorInSphere(params.boundaryRadius * 0.8),
          size: params.birdSize,
          id: i,
        })
      );
    }
    
    return newBirds;
  }, [params.birdCount]); // Regenerate when bird count changes
  
  // Update birds ref when birds array changes
  useEffect(() => {
    birdsRef.current = birds;
    birdCountRef.current = params.birdCount;
  }, [birds, params.birdCount]);
  
  // Handle text mode changes
  useEffect(() => {
    if (isTextMode && (textRef.current !== textParams.text || !textModeRef.current)) {
      // Generate points from text
      const points = textToPoints(textParams.text, textParams, params.birdCount);
      
      // Assign points to birds
      assignTargetPoints(birdsRef.current, points);
      
      textRef.current = textParams.text;
    } else if (!isTextMode && textModeRef.current) {
      // Clear target points when exiting text mode
      birdsRef.current.forEach(bird => {
        bird.targetPoint = null;
        bird.formationWeight = 0;
      });
    }
    
    textModeRef.current = isTextMode;
  }, [isTextMode, textParams, params.birdCount]);
  
  // Animation loop
  useFrame(() => {
    if (isPaused) return;
    
    // Update each bird
    birdsRef.current.forEach(bird => {
      bird.update(birdsRef.current, params, isTextMode, textParams);
    });
  });
  
  return (
    <>
      {/* Render each bird */}
      {birds.map((bird) => (
        <React.Fragment key={bird.id}>
          <BirdMesh bird={bird} />
          {params.showTrails && bird.trail.length > 0 && (
            <TrailEffect points={bird.trail} />
          )}
        </React.Fragment>
      ))}
    </>
  );
};

export default MurmurationScene; 