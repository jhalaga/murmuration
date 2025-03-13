import React, { useMemo, useEffect, useState, useRef } from 'react';
import * as THREE from 'three';
import { Vector3D, toThreeVector } from '../utils/vector';
import { useStore } from '../store';

interface TrailEffectProps {
  points: Vector3D[];
  birdId: number;
}

const TrailEffect: React.FC<TrailEffectProps> = ({ points, birdId }) => {
  const { params } = useStore();
  const [key, setKey] = useState(0);
  const materialRef = useRef<THREE.Material | null>(null);
  const geometryRef = useRef<THREE.BufferGeometry | null>(null);
  
  // Force complete re-creation of the trail when parameters change
  useEffect(() => {
    // Cleanup previous resources
    if (geometryRef.current) {
      geometryRef.current.dispose();
      geometryRef.current = null;
    }
    
    if (materialRef.current) {
      materialRef.current.dispose();
      materialRef.current = null;
    }
    
    // Regenerate the key to force remounting the component
    setKey(prevKey => prevKey + 1);
  }, [
    params.birdSize, // Bird size is the most critical parameter for visual glitches
  ]);
  
  // Less aggressive updates for other parameters
  useEffect(() => {
    setKey(prevKey => prevKey + 1);
  }, [
    params.speed,
    params.trailLength,
    params.cohesionFactor,
    params.alignmentFactor,
    params.separationFactor
  ]);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (geometryRef.current) {
        geometryRef.current.dispose();
      }
      if (materialRef.current) {
        materialRef.current.dispose();
      }
    };
  }, []);
  
  // Create a curve from the trail points
  const curve = useMemo(() => {
    if (points.length < 2) return null;
    
    try {
      const threePoints = points.map(p => toThreeVector(p));
      return new THREE.CatmullRomCurve3(threePoints);
    } catch (error) {
      console.error("Error creating curve:", error);
      return null;
    }
  }, [points, key]);
  
  // Create geometry from the curve
  const geometry = useMemo(() => {
    if (!curve) return null;
    
    try {
      // Use fewer segments for better performance
      const segments = Math.min(points.length - 1, 20);
      const radius = Math.max(0.05, params.birdSize * 0.1);
      
      // Dispose of previous geometry if it exists
      if (geometryRef.current) {
        geometryRef.current.dispose();
      }
      
      const newGeometry = new THREE.TubeGeometry(curve, segments, radius, 6, false);
      geometryRef.current = newGeometry;
      return newGeometry;
    } catch (error) {
      console.error("Error creating tube geometry:", error);
      return null;
    }
  }, [curve, points.length, params.birdSize, key]);
  
  // Create a gradient material for the trail
  const material = useMemo(() => {
    // Dispose of previous material if it exists
    if (materialRef.current) {
      materialRef.current.dispose();
    }
    
    // Create a gradient texture
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 1;
    
    const context = canvas.getContext('2d');
    if (context) {
      // Create gradient
      const gradient = context.createLinearGradient(0, 0, 256, 0);
      gradient.addColorStop(0, 'rgba(233, 69, 96, 0)'); // Start transparent
      gradient.addColorStop(0.5, 'rgba(233, 69, 96, 0.3)'); // Middle semi-transparent
      gradient.addColorStop(1, 'rgba(233, 69, 96, 0.7)'); // End opaque
      
      context.fillStyle = gradient;
      context.fillRect(0, 0, 256, 1);
    }
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    
    const newMaterial = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      opacity: 0.5,
      side: THREE.DoubleSide,
      depthWrite: false, // Prevent z-fighting
    });
    
    materialRef.current = newMaterial;
    return newMaterial;
  }, [key]);
  
  if (!geometry || points.length < 2) return null;
  
  return (
    <mesh key={`trail-${birdId}-${key}`} geometry={geometry} material={material} />
  );
};

export default TrailEffect; 