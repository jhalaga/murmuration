import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Bird } from '../models/Bird';
import { toThreeVector, normalize } from '../utils/vector';
import { useStore } from '../store';

interface BirdMeshProps {
  bird: Bird;
}

const BirdMesh: React.FC<BirdMeshProps> = ({ bird }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const { params } = useStore();
  
  // Create a simple bird geometry
  const geometry = useMemo(() => {
    // Create a cone for the body
    const bodyGeometry = new THREE.ConeGeometry(1, 3, 8);
    
    // Create wings
    const wingGeometry = new THREE.BoxGeometry(3, 0.2, 1);
    wingGeometry.translate(0, 0, 0);
    
    // Merge geometries
    const mergedGeometry = new THREE.BufferGeometry();
    
    // Combine the geometries
    const bodyPositions = bodyGeometry.getAttribute('position').array;
    const wingPositions = wingGeometry.getAttribute('position').array;
    
    // Create a new array to hold all positions
    const positions = new Float32Array(
      bodyPositions.length + wingPositions.length
    );
    
    // Copy body positions
    positions.set(bodyPositions, 0);
    
    // Copy wing positions
    positions.set(wingPositions, bodyPositions.length);
    
    // Set the combined positions
    mergedGeometry.setAttribute(
      'position',
      new THREE.BufferAttribute(positions, 3)
    );
    
    return mergedGeometry;
  }, []);
  
  // Create a material with a color based on the bird's formation weight
  const material = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: new THREE.Color('#e94560'),
      emissive: new THREE.Color('#16213e'),
      metalness: 0.2,
      roughness: 0.8,
    });
  }, []);
  
  // Update the bird's position and rotation on each frame
  useFrame(() => {
    if (!meshRef.current) return;
    
    // Update position
    const position = toThreeVector(bird.position);
    meshRef.current.position.copy(position);
    
    // Update rotation to face the direction of movement
    if (bird.velocity[0] !== 0 || bird.velocity[1] !== 0 || bird.velocity[2] !== 0) {
      const direction = toThreeVector(normalize(bird.velocity));
      const lookAt = position.clone().add(direction);
      meshRef.current.lookAt(lookAt);
    }
    
    // Update scale based on bird size
    meshRef.current.scale.set(
      bird.size * params.birdSize,
      bird.size * params.birdSize,
      bird.size * params.birdSize
    );
    
    // Update color based on formation weight
    if (material.color instanceof THREE.Color) {
      // Interpolate between normal color and formation color
      const normalColor = new THREE.Color('#e94560');
      const formationColor = new THREE.Color('#4caf50');
      
      material.color.copy(normalColor).lerp(formationColor, bird.formationWeight);
      
      // Also adjust emissive intensity based on formation weight
      const baseEmissive = new THREE.Color('#16213e');
      const activeEmissive = new THREE.Color('#0f3460');
      
      material.emissive.copy(baseEmissive).lerp(activeEmissive, bird.formationWeight);
    }
  });
  
  return (
    <mesh ref={meshRef} geometry={geometry} material={material} />
  );
};

export default BirdMesh; 