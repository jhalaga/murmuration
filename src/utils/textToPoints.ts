import { Vector3D } from './vector';
import { TextModeParams } from '../store';

// Generate points along the path of text
export const textToPoints = (
  text: string,
  params: TextModeParams,
  maxPoints: number
): Vector3D[] => {
  // Create a canvas to draw the text
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  if (!context) return [];

  // Set canvas size
  const width = 1024;
  const height = 512;
  canvas.width = width;
  canvas.height = height;

  // Clear canvas
  context.fillStyle = 'black';
  context.fillRect(0, 0, width, height);

  // Draw text
  context.fillStyle = 'white';
  const fontSize = params.fontSize * 10;
  context.font = `${params.fontWeight} ${fontSize}px Arial`;
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.fillText(text, width / 2, height / 2);

  // Get image data
  const imageData = context.getImageData(0, 0, width, height);
  const data = imageData.data;

  // Find text boundaries
  let minX = width;
  let maxX = 0;
  let minY = height;
  let maxY = 0;

  // First pass: find the boundaries of the text
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const index = (y * width + x) * 4;
      if (data[index] > 200) {
        minX = Math.min(minX, x);
        maxX = Math.max(maxX, x);
        minY = Math.min(minY, y);
        maxY = Math.max(maxY, y);
      }
    }
  }

  // Add padding
  const padding = 10;
  minX = Math.max(0, minX - padding);
  maxX = Math.min(width, maxX + padding);
  minY = Math.max(0, minY - padding);
  maxY = Math.min(height, maxY + padding);

  // Calculate text dimensions
  const textWidth = maxX - minX;
  const textHeight = maxY - minY;

  // Sample points from the text
  const points: Vector3D[] = [];
  const step = Math.max(1, Math.floor(4 / params.formationDensity));
  
  // Create a more even distribution of points
  // First, collect all valid white pixel points
  const allTextPoints: Array<[number, number]> = [];

  for (let y = minY; y <= maxY; y += step) {
    for (let x = minX; x <= maxX; x += step) {
      const index = (y * width + x) * 4;
      // Check if pixel is white (part of the text)
      if (data[index] > 200) {
        allTextPoints.push([x, y]);
      }
    }
  }
  
  // If we have more points than needed, sample them evenly
  if (allTextPoints.length > maxPoints) {
    // Ensure we get a balanced representation by taking evenly spaced samples
    const samplingInterval = allTextPoints.length / maxPoints;
    for (let i = 0; i < maxPoints && i < allTextPoints.length; i++) {
      const pointIndex = Math.min(Math.floor(i * samplingInterval), allTextPoints.length - 1);
      const [x, y] = allTextPoints[pointIndex];
      
      // Convert to normalized coordinates
      const xPos = ((x - minX) / textWidth) * 2 - 1;
      const yPos = -((y - minY) / textHeight) * 2 + 1; // Flip Y axis
      
      // Scale to fit within the boundary
      // Adjust base scale factor based on font size
      const baseFactor = 0.8;
      // Scale factor adjustment for larger fonts
      const fontSizeAdjustment = Math.max(1, 5 / params.fontSize);
      // Apply the adjusted scale factor
      const scaleFactor = baseFactor * fontSizeAdjustment;
      
      const aspectRatio = textWidth / textHeight;
      
      // Adjust scale based on aspect ratio to maintain proportions
      let xScale = 100 * scaleFactor;
      let yScale = 50 * scaleFactor * 1.2; // Increase vertical scale by 20%
      
      if (aspectRatio > 1) {
        // Wide text
        yScale = yScale * (1 / Math.sqrt(aspectRatio));
      } else {
        // Tall text
        xScale = xScale * Math.sqrt(aspectRatio);
      }
      
      points.push([xPos * xScale, yPos * yScale, 0]);
    }
  } else {
    // Not enough points, use all of them
    for (const [x, y] of allTextPoints) {
      // Convert to normalized coordinates
      const xPos = ((x - minX) / textWidth) * 2 - 1;
      const yPos = -((y - minY) / textHeight) * 2 + 1; // Flip Y axis
      
      // Scale to fit within the boundary
      // Adjust base scale factor based on font size
      const baseFactor = 0.8;
      // Scale factor adjustment for larger fonts
      const fontSizeAdjustment = Math.max(1, 5 / params.fontSize);
      // Apply the adjusted scale factor
      const scaleFactor = baseFactor * fontSizeAdjustment;
      
      const aspectRatio = textWidth / textHeight;
      
      // Adjust scale based on aspect ratio to maintain proportions
      let xScale = 100 * scaleFactor;
      let yScale = 50 * scaleFactor * 1.2; // Increase vertical scale by 20%
      
      if (aspectRatio > 1) {
        // Wide text
        yScale = yScale * (1 / Math.sqrt(aspectRatio));
      } else {
        // Tall text
        xScale = xScale * Math.sqrt(aspectRatio);
      }
      
      points.push([xPos * xScale, yPos * yScale, 0]);
    }
  }

  // If we don't have enough points, try with a smaller step
  if (points.length < maxPoints / 2 && step > 1) {
    // Make sure we preserve all parameters, including position values
    const adjustedParams = { 
      ...params,
      formationDensity: params.formationDensity * 1.5
    };
    return textToPoints(text, adjustedParams, maxPoints);
  }

  // Apply position offsets to all points
  const offsetPoints = points.map(point => {
    return [
      point[0] + params.positionX, 
      point[1] + params.positionY, 
      point[2]
    ] as Vector3D;
  });

  return offsetPoints;
};

// Generate points for a simple symbol
export const symbolToPoints = (
  symbol: string,
  maxPoints: number
): Vector3D[] => {
  let points: Vector3D[] = [];
  
  switch (symbol) {
    case 'circle':
      points = generateCirclePoints(maxPoints);
      break;
    case 'heart':
      points = generateHeartPoints(maxPoints);
      break;
    case 'star':
      points = generateStarPoints(maxPoints);
      break;
    default:
      // Default to a simple shape if symbol not recognized
      points = generateCirclePoints(maxPoints);
  }
  
  return points;
};

// Generate points for a circle
const generateCirclePoints = (numPoints: number): Vector3D[] => {
  const points: Vector3D[] = [];
  const radius = 80;
  
  for (let i = 0; i < numPoints; i++) {
    const angle = (i / numPoints) * Math.PI * 2;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;
    points.push([x, y, 0]);
  }
  
  return points;
};

// Generate points for a heart shape
const generateHeartPoints = (numPoints: number): Vector3D[] => {
  const points: Vector3D[] = [];
  const scale = 8;
  
  for (let i = 0; i < numPoints; i++) {
    const t = (i / numPoints) * Math.PI * 2;
    // Heart curve formula
    const x = 16 * Math.pow(Math.sin(t), 3);
    const y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
    points.push([x * scale, y * scale, 0]);
  }
  
  return points;
};

// Generate points for a star
const generateStarPoints = (numPoints: number): Vector3D[] => {
  const points: Vector3D[] = [];
  const outerRadius = 80;
  const innerRadius = 40;
  const spikes = 5;
  const pointsPerSpike = Math.floor(numPoints / (spikes * 2));
  
  for (let i = 0; i < spikes * 2; i++) {
    const radius = i % 2 === 0 ? outerRadius : innerRadius;
    const angle = (i / (spikes * 2)) * Math.PI * 2;
    
    // Create points along the line from the previous point to this one
    const prevRadius = i === 0 ? innerRadius : (i % 2 === 0 ? outerRadius : innerRadius);
    const prevAngle = ((i - 1) / (spikes * 2)) * Math.PI * 2;
    
    const startX = Math.cos(prevAngle) * prevRadius;
    const startY = Math.sin(prevAngle) * prevRadius;
    const endX = Math.cos(angle) * radius;
    const endY = Math.sin(angle) * radius;
    
    for (let j = 0; j < pointsPerSpike; j++) {
      const t = j / pointsPerSpike;
      const x = startX + (endX - startX) * t;
      const y = startY + (endY - startY) * t;
      points.push([x, y, 0]);
    }
  }
  
  return points;
};

// Assign target points to birds
export const assignTargetPoints = (
  birds: any[],
  points: Vector3D[]
): void => {
  // If we have more birds than points, some birds won't get a target
  const numAssignments = Math.min(birds.length, points.length);
  
  // Create a copy of the points array to shuffle
  const shuffledPoints = [...points];
  
  // Fisher-Yates shuffle algorithm
  for (let i = shuffledPoints.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffledPoints[i], shuffledPoints[j]] = [shuffledPoints[j], shuffledPoints[i]];
  }
  
  // Assign points to birds
  for (let i = 0; i < numAssignments; i++) {
    birds[i].targetPoint = shuffledPoints[i];
  }
  
  // Clear target points for remaining birds
  for (let i = numAssignments; i < birds.length; i++) {
    birds[i].targetPoint = null;
  }
}; 