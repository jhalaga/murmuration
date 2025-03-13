import React, { useMemo } from 'react';
import * as THREE from 'three';
import { Vector3D, toThreeVector } from '../utils/vector';

interface TrailEffectProps {
  points: Vector3D[];
}

const TrailEffect: React.FC<TrailEffectProps> = ({ points }) => {
  // Create a curve from the trail points
  const curve = useMemo(() => {
    const threePoints = points.map(p => toThreeVector(p));
    return new THREE.CatmullRomCurve3(threePoints);
  }, [points]);
  
  // Create geometry from the curve
  const geometry = useMemo(() => {
    return new THREE.TubeGeometry(curve, points.length, 0.1, 8, false);
  }, [curve, points.length]);
  
  // Create a gradient material for the trail
  const material = useMemo(() => {
    // Create a gradient texture
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 1;
    
    const context = canvas.getContext('2d');
    if (context) {
      // Create gradient
      const gradient = context.createLinearGradient(0, 0, 256, 0);
      gradient.addColorStop(0, 'rgba(233, 69, 96, 0)'); // Start transparent
      gradient.addColorStop(0.5, 'rgba(233, 69, 96, 0.5)'); // Middle semi-transparent
      gradient.addColorStop(1, 'rgba(233, 69, 96, 1)'); // End opaque
      
      context.fillStyle = gradient;
      context.fillRect(0, 0, 256, 1);
    }
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    
    return new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      opacity: 0.6,
      side: THREE.DoubleSide,
    });
  }, []);
  
  return (
    <mesh geometry={geometry} material={material} />
  );
};

export default TrailEffect; 