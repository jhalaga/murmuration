import { Vector3D, add, subtract, multiply, divide, normalize, limit, distance, magnitude, randomVectorInSphere } from '../utils/vector';
import { SimulationParams, TextModeParams } from '../store';

export interface BirdOptions {
  position?: Vector3D;
  velocity?: Vector3D;
  acceleration?: Vector3D;
  size?: number;
  id: number;
}

export interface TargetPoint {
  position: Vector3D;
  assigned: boolean;
}

export class Bird {
  position: Vector3D;
  velocity: Vector3D;
  acceleration: Vector3D;
  size: number;
  id: number;
  trail: Vector3D[];
  targetPoint: Vector3D | null = null;
  formationWeight: number = 0;
  lastParams: SimulationParams | null = null;
  trailUpdateCounter: number = 0;

  constructor(options: BirdOptions) {
    this.position = options.position || [0, 0, 0];
    this.velocity = options.velocity || randomVectorInSphere(1);
    this.acceleration = options.acceleration || [0, 0, 0];
    this.size = options.size || 1;
    this.id = options.id;
    this.trail = [];
    this.lastParams = null;
    this.trailUpdateCounter = 0;
  }

  // Apply a force to the bird
  applyForce(force: Vector3D): void {
    this.acceleration = add(this.acceleration, force);
  }

  // Calculate separation force (avoid crowding neighbors)
  separate(birds: Bird[], params: SimulationParams): Vector3D {
    const desiredSeparation = params.perceptionRadius * 0.5;
    let steer: Vector3D = [0, 0, 0];
    let count = 0;

    // Check for birds that are too close
    for (const other of birds) {
      if (other.id === this.id) continue;

      const d = distance(this.position, other.position);
      // If the distance is greater than 0 and less than the desired separation
      if (d > 0 && d < desiredSeparation) {
        // Calculate vector pointing away from neighbor
        let diff = subtract(this.position, other.position);
        diff = normalize(diff);
        // Weight by distance (closer birds have more influence)
        diff = divide(diff, d);
        steer = add(steer, diff);
        count++;
      }
    }

    // Average the forces
    if (count > 0) {
      steer = divide(steer, count);
    }

    // If we have a resulting force
    if (magnitude(steer) > 0) {
      // Implement Reynolds: Steering = Desired - Velocity
      steer = normalize(steer);
      steer = multiply(steer, params.maxSpeed);
      steer = subtract(steer, this.velocity);
      steer = limit(steer, params.maxForce);
    }

    return multiply(steer, params.separationFactor);
  }

  // Calculate alignment force (steer towards average heading of neighbors)
  align(birds: Bird[], params: SimulationParams): Vector3D {
    const neighborDist = params.perceptionRadius;
    let sum: Vector3D = [0, 0, 0];
    let count = 0;

    for (const other of birds) {
      if (other.id === this.id) continue;

      const d = distance(this.position, other.position);
      if (d > 0 && d < neighborDist) {
        sum = add(sum, other.velocity);
        count++;
      }
    }

    if (count > 0) {
      sum = divide(sum, count);
      sum = normalize(sum);
      sum = multiply(sum, params.maxSpeed);
      let steer = subtract(sum, this.velocity);
      steer = limit(steer, params.maxForce);
      return multiply(steer, params.alignmentFactor);
    }
    return [0, 0, 0];
  }

  // Calculate cohesion force (steer towards center of neighbors)
  cohesion(birds: Bird[], params: SimulationParams): Vector3D {
    const neighborDist = params.perceptionRadius;
    let sum: Vector3D = [0, 0, 0];
    let count = 0;

    for (const other of birds) {
      if (other.id === this.id) continue;

      const d = distance(this.position, other.position);
      if (d > 0 && d < neighborDist) {
        sum = add(sum, other.position);
        count++;
      }
    }

    if (count > 0) {
      sum = divide(sum, count);
      return this.seek(sum, params);
    }
    return [0, 0, 0];
  }

  // Calculate boundary force (keep birds within a sphere)
  boundaries(params: SimulationParams): Vector3D {
    const radius = params.boundaryRadius;
    const dist = magnitude(this.position);
    
    if (dist > radius * 0.8) {
      // Calculate force to steer back towards center
      const desired = multiply(normalize(this.position), -params.maxSpeed);
      let steer = subtract(desired, this.velocity);
      steer = limit(steer, params.maxForce);
      
      // Scale force based on how close to boundary
      const scale = Math.min(1.0, (dist - radius * 0.8) / (radius * 0.2));
      return multiply(steer, scale * 2.0);
    }
    
    return [0, 0, 0];
  }

  // Calculate horizon force (prevent birds from flying below horizon)
  horizonConstraint(params: SimulationParams): Vector3D {
    // If bird is below horizon height
    if (this.position[1] < params.horizonHeight) {
      // Calculate force to push upward proportionally to how far below horizon
      const depth = params.horizonHeight - this.position[1];
      const strength = Math.min(1.0, depth / 20) * params.maxForce * 2.0;
      return [0, strength, 0];
    }
    return [0, 0, 0];
  }

  // Calculate camera distance constraint force
  cameraDistanceConstraint(params: SimulationParams): Vector3D {
    // The camera is assumed to be at [0,0,0] looking toward +z
    // Calculate vector from bird to camera origin (0,0,0)
    const birdToCameraVector: Vector3D = [
      -this.position[0],
      -this.position[1], 
      -this.position[2]
    ];
    
    // Calculate distance to camera
    const distanceToCamera = magnitude(birdToCameraVector);
    
    // If bird is too close to camera
    if (distanceToCamera < params.minCameraDistance) {
      // Calculate force to push away from camera proportionally
      const normalized = normalize(birdToCameraVector);
      // Invert the direction to push away from camera
      const invertedDir: Vector3D = [-normalized[0], -normalized[1], -normalized[2]];
      
      // Force strength is proportional to how much closer than the min distance
      const depthFactor = (params.minCameraDistance - distanceToCamera) / params.minCameraDistance;
      // Reduce the camera constraint force when in formation based on formationWeight
      const formationReduction = Math.max(0, 1.0 - this.formationWeight * 0.8);
      const strength = Math.min(1.0, depthFactor) * params.maxForce * 2.0 * formationReduction;
      
      return multiply(invertedDir, strength);
    }
    return [0, 0, 0];
  }

  // Calculate wind force
  wind(params: SimulationParams): Vector3D {
    if (params.windFactor === 0) return [0, 0, 0];
    
    // Apply wind direction with the wind factor
    return multiply(params.windDirection, params.windFactor);
  }

  // Calculate seeking force towards a target
  seek(target: Vector3D, params: SimulationParams): Vector3D {
    // Calculate desired velocity (from current position to target)
    let desired = subtract(target, this.position);
    
    // If we're close to the target, slow down (arrival behavior)
    const d = magnitude(desired);
    if (d < 10) {
      // Scale with distance
      const m = (d / 10) * params.maxSpeed;
      desired = multiply(normalize(desired), m);
    } else {
      desired = multiply(normalize(desired), params.maxSpeed);
    }
    
    // Reynolds steering formula: steering = desired - velocity
    let steer = subtract(desired, this.velocity);
    steer = limit(steer, params.maxForce);
    
    return multiply(steer, params.cohesionFactor);
  }

  // Calculate force towards text formation target point
  formationSeek(params: SimulationParams): Vector3D {
    if (!this.targetPoint) return [0, 0, 0];
    
    // Calculate desired velocity (from current position to target)
    let desired = subtract(this.targetPoint, this.position);
    
    // Calculate distance to target
    const d = magnitude(desired);
    let speed = params.maxSpeed;
    
    // Increase force when further from target
    if (d > 10) {
      // Apply stronger force when far away
      speed = params.maxSpeed * 1.5;
    } else if (d < 5) {
      // Apply gentler force when close to target
      speed = (d / 5) * params.maxSpeed;
    }
    
    // Is the target near the center? If so, increase the force for stability
    const distanceToCenter = magnitude(this.targetPoint);
    const centerFactor = distanceToCenter < 30 ? 1.5 : 1.0;
    
    desired = multiply(normalize(desired), speed);
    
    // Reynolds steering formula: steering = desired - velocity
    let steer = subtract(desired, this.velocity);
    // Increase force multiplier for better formation
    steer = limit(steer, params.maxForce * 2.0 * centerFactor);
    
    // Apply the formation weight (gradually increases during transition)
    return multiply(steer, this.formationWeight);
  }

  // Check if parameters have changed
  haveParamsChanged(params: SimulationParams): boolean {
    if (!this.lastParams) return true;
    
    // Bird size changes should always trigger a trail reset
    if (this.lastParams.birdSize !== params.birdSize) {
      return true;
    }
    
    return (
      this.lastParams.speed !== params.speed ||
      this.lastParams.cohesionFactor !== params.cohesionFactor ||
      this.lastParams.alignmentFactor !== params.alignmentFactor ||
      this.lastParams.separationFactor !== params.separationFactor ||
      this.lastParams.perceptionRadius !== params.perceptionRadius ||
      this.lastParams.boundaryRadius !== params.boundaryRadius ||
      this.lastParams.windFactor !== params.windFactor ||
      this.lastParams.trailLength !== params.trailLength ||
      this.lastParams.horizonHeight !== params.horizonHeight ||
      this.lastParams.minCameraDistance !== params.minCameraDistance
    );
  }

  // Update the bird's position and velocity
  update(birds: Bird[], params: SimulationParams, isTextMode: boolean, textParams: TextModeParams): void {
    // Check if parameters have changed
    const paramsChanged = this.haveParamsChanged(params);
    
    // Bird size changes should always clear trails
    const birdSizeChanged = this.lastParams && this.lastParams.birdSize !== params.birdSize;
    
    // Calculate flocking forces
    const separation = this.separate(birds, params);
    const alignment = this.align(birds, params);
    const cohesion = this.cohesion(birds, params);
    const boundary = this.boundaries(params);
    const horizonForce = this.horizonConstraint(params);
    const windForce = this.wind(params);
    const cameraForce = this.cameraDistanceConstraint(params);
    
    // Apply all forces
    this.applyForce(separation);
    this.applyForce(alignment);
    this.applyForce(cohesion);
    this.applyForce(boundary);
    this.applyForce(horizonForce);
    this.applyForce(windForce);
    this.applyForce(cameraForce);
    
    // Apply text formation force if in text mode
    if (isTextMode && this.targetPoint) {
      // Gradually increase the formation weight
      if (this.formationWeight < 1.0 && textParams.maintainFormation) {
        this.formationWeight += textParams.transitionSpeed;
      } else if (!textParams.maintainFormation && this.formationWeight > 0) {
        this.formationWeight -= textParams.transitionSpeed;
      }
      
      const formationForce = this.formationSeek(params);
      this.applyForce(formationForce);
    } else if (this.formationWeight > 0) {
      // Gradually decrease the formation weight when not in text mode
      this.formationWeight -= textParams.transitionSpeed;
      if (this.formationWeight < 0) this.formationWeight = 0;
    }
    
    // Update velocity by adding acceleration
    this.velocity = add(this.velocity, this.acceleration);
    
    // Limit speed
    this.velocity = limit(this.velocity, params.maxSpeed * params.speed);
    
    // Update position
    this.position = add(this.position, this.velocity);
    
    // Reset acceleration
    this.acceleration = [0, 0, 0];
    
    // Update trail
    if (params.showTrails) {
      // Clear trail if parameters changed or bird size specifically changed
      if (paramsChanged || birdSizeChanged) {
        this.trail = [];
        this.trailUpdateCounter = 0;
      }
      
      // Only update trail every few frames for better performance
      this.trailUpdateCounter++;
      if (this.trailUpdateCounter >= 2) {
        this.trail.push([...this.position]);
        this.trailUpdateCounter = 0;
        
        // Limit trail length
        while (this.trail.length > params.trailLength) {
          this.trail.shift();
        }
      }
    } else if (this.trail.length > 0) {
      this.trail = [];
    }
    
    // Store current parameters for next comparison
    this.lastParams = { ...params };
  }
} 