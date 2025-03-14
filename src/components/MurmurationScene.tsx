import React, { useRef, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Bird } from '../models/Bird';
import { useStore } from '../store';
import { randomVectorInSphere } from '../utils/vector';
import { textToPoints, assignTargetPoints } from '../utils/textToPoints';
import BirdMesh from './BirdMesh';
import TrailEffect from './TrailEffect';

const MurmurationScene: React.FC = () => {
  const { 
    params, 
    textParams, 
    isTextMode, 
    isPaused 
  } = useStore();
  
  // State to store birds
  const [birds, setBirds] = useState<Bird[]>([]);
  
  // Ref to store the birds for animation frame updates
  const birdsRef = useRef<Bird[]>([]);
  
  // Ref to track parameter changes
  const paramsRef = useRef(params);
  
  // State to force re-rendering trails when needed
  const [trailKey, setTrailKey] = useState(0);
  
  // Generate birds when count changes
  useEffect(() => {
    const newBirds: Bird[] = [];
    
    // Keep existing birds if we're just adding more
    if (birds.length < params.birdCount) {
      newBirds.push(...birds);
      
      // Add new birds
      for (let i = birds.length; i < params.birdCount; i++) {
        newBirds.push(
          new Bird({
            position: randomVectorInSphere(params.boundaryRadius * 0.8),
            size: params.birdSize,
            id: i,
          })
        );
      }
    } else {
      // If reducing birds, keep only the first n birds
      for (let i = 0; i < params.birdCount; i++) {
        if (i < birds.length) {
          newBirds.push(birds[i]);
        } else {
          newBirds.push(
            new Bird({
              position: randomVectorInSphere(params.boundaryRadius * 0.8),
              size: params.birdSize,
              id: i,
            })
          );
        }
      }
    }
    
    // Clear trails when bird count changes
    newBirds.forEach(bird => {
      bird.trail = [];
    });
    
    setBirds(newBirds);
    birdsRef.current = newBirds;
    
    // Force trail re-rendering
    setTrailKey(prev => prev + 1);
  }, [params.birdCount]);
  
  // Handle text mode changes
  useEffect(() => {
    if (!birdsRef.current.length) return;
    
    if (isTextMode) {
      // Generate points from text
      const points = textToPoints(textParams.text, textParams, birdsRef.current.length);
      
      // Assign points to birds
      assignTargetPoints(birdsRef.current, points);
    } else {
      // Clear target points when exiting text mode
      birdsRef.current.forEach(bird => {
        bird.targetPoint = null;
        bird.formationWeight = 0;
      });
    }
    
    // Clear trails when switching modes
    birdsRef.current.forEach(bird => {
      bird.trail = [];
    });
    
    // Force trail re-rendering
    setTrailKey(prev => prev + 1);
  }, [isTextMode]);
  
  // Update text formation parameters
  useEffect(() => {
    if (isTextMode && birdsRef.current.length > 0) {
      // Regenerate points when text parameters change
      const points = textToPoints(textParams.text, textParams, birdsRef.current.length);
      assignTargetPoints(birdsRef.current, points);
      
      // Clear trails when text parameters change
      birdsRef.current.forEach(bird => {
        bird.trail = [];
      });
      
      // Force trail re-rendering
      setTrailKey(prev => prev + 1);
    }
  }, [
    textParams.text, 
    textParams.fontSize, 
    textParams.formationDensity, 
    textParams.positionX, 
    textParams.positionY,
    isTextMode
  ]);
  
  // Update when simulation parameters change
  useEffect(() => {
    // Store current parameters for comparison
    paramsRef.current = params;
    
    // If in text mode, regenerate points when boundary radius changes
    if (isTextMode && birdsRef.current.length > 0) {
      const points = textToPoints(textParams.text, textParams, birdsRef.current.length);
      assignTargetPoints(birdsRef.current, points);
    }
    
    // Clear trails when parameters change
    birdsRef.current.forEach(bird => {
      bird.trail = [];
    });
    
    // Force trail re-rendering
    setTrailKey(prev => prev + 1);
  }, [
    params.speed, 
    params.cohesionFactor, 
    params.alignmentFactor, 
    params.separationFactor, 
    params.perceptionRadius, 
    params.boundaryRadius,
    params.windFactor,
    params.windDirection
  ]);
  
  // Handle bird size changes separately - this is critical for trail rendering
  useEffect(() => {
    // Clear trails when bird size changes
    birdsRef.current.forEach(bird => {
      bird.trail = [];
    });
    
    // Force trail re-rendering with a new key
    setTrailKey(Date.now()); // Use timestamp for guaranteed uniqueness
  }, [params.birdSize]);
  
  // Handle trail visibility changes
  useEffect(() => {
    if (!params.showTrails) {
      // Clear trails when turning off trails
      birdsRef.current.forEach(bird => {
        bird.trail = [];
      });
    }
    
    // Force trail re-rendering
    setTrailKey(prev => prev + 1);
  }, [params.showTrails, params.trailLength]);
  
  // Update the paramsRef when params change to avoid visual glitches
  useEffect(() => {
    paramsRef.current = params;
  }, [params]);
  
  // Animation loop
  useFrame(() => {
    if (isPaused || !birdsRef.current.length) return;
    
    // Update each bird with the immutable referenced params to avoid
    // visual glitches when params change during a frame update
    birdsRef.current.forEach(bird => {
      bird.update(birdsRef.current, paramsRef.current, isTextMode, textParams);
    });
  });
  
  if (birds.length === 0) return null;
  
  return (
    <>
      {/* Render each bird */}
      {birds.map((bird) => (
        <React.Fragment key={`bird-${bird.id}-${trailKey}`}>
          <BirdMesh bird={bird} />
          {params.showTrails && bird.trail.length > 2 && (
            <TrailEffect 
              points={bird.trail} 
              birdId={bird.id} 
            />
          )}
        </React.Fragment>
      ))}
    </>
  );
};

export default MurmurationScene; 