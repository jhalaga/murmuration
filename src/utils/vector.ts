import * as THREE from 'three';

export type Vector3D = [number, number, number];

// Create a random 3D vector with components in the range [-1, 1]
export const randomVector = (): Vector3D => {
  return [
    Math.random() * 2 - 1,
    Math.random() * 2 - 1,
    Math.random() * 2 - 1
  ];
};

// Create a random 3D vector within a sphere of given radius
export const randomVectorInSphere = (radius: number): Vector3D => {
  const vec = randomVector();
  const mag = Math.sqrt(vec[0] * vec[0] + vec[1] * vec[1] + vec[2] * vec[2]);
  const scale = radius * Math.random() / Math.max(mag, 0.0001);
  return [vec[0] * scale, vec[1] * scale, vec[2] * scale];
};

// Calculate the magnitude (length) of a vector
export const magnitude = (v: Vector3D): number => {
  return Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
};

// Normalize a vector (make it unit length)
export const normalize = (v: Vector3D): Vector3D => {
  const mag = magnitude(v);
  if (mag === 0) return [0, 0, 0];
  return [v[0] / mag, v[1] / mag, v[2] / mag];
};

// Limit the magnitude of a vector to a maximum value
export const limit = (v: Vector3D, max: number): Vector3D => {
  const mag = magnitude(v);
  if (mag > max) {
    const scale = max / mag;
    return [v[0] * scale, v[1] * scale, v[2] * scale];
  }
  return [...v];
};

// Add two vectors
export const add = (v1: Vector3D, v2: Vector3D): Vector3D => {
  return [v1[0] + v2[0], v1[1] + v2[1], v1[2] + v2[2]];
};

// Subtract v2 from v1
export const subtract = (v1: Vector3D, v2: Vector3D): Vector3D => {
  return [v1[0] - v2[0], v1[1] - v2[1], v1[2] - v2[2]];
};

// Multiply a vector by a scalar
export const multiply = (v: Vector3D, scalar: number): Vector3D => {
  return [v[0] * scalar, v[1] * scalar, v[2] * scalar];
};

// Divide a vector by a scalar
export const divide = (v: Vector3D, scalar: number): Vector3D => {
  if (scalar === 0) return [...v];
  return [v[0] / scalar, v[1] / scalar, v[2] / scalar];
};

// Calculate the distance between two vectors
export const distance = (v1: Vector3D, v2: Vector3D): number => {
  const dx = v1[0] - v2[0];
  const dy = v1[1] - v2[1];
  const dz = v1[2] - v2[2];
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
};

// Calculate the dot product of two vectors
export const dot = (v1: Vector3D, v2: Vector3D): number => {
  return v1[0] * v2[0] + v1[1] * v2[1] + v1[2] * v2[2];
};

// Calculate the cross product of two vectors
export const cross = (v1: Vector3D, v2: Vector3D): Vector3D => {
  return [
    v1[1] * v2[2] - v1[2] * v2[1],
    v1[2] * v2[0] - v1[0] * v2[2],
    v1[0] * v2[1] - v1[1] * v2[0]
  ];
};

// Convert a THREE.Vector3 to our Vector3D type
export const fromThreeVector = (v: THREE.Vector3): Vector3D => {
  return [v.x, v.y, v.z];
};

// Convert our Vector3D type to a THREE.Vector3
export const toThreeVector = (v: Vector3D): THREE.Vector3 => {
  return new THREE.Vector3(v[0], v[1], v[2]);
};

// Linear interpolation between two vectors
export const lerp = (v1: Vector3D, v2: Vector3D, t: number): Vector3D => {
  return [
    v1[0] + (v2[0] - v1[0]) * t,
    v1[1] + (v2[1] - v1[1]) * t,
    v1[2] + (v2[2] - v1[2]) * t
  ];
}; 