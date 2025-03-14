# Murmuration

![Murmuration Banner](./public/murmuration_1.jpg)

## Live Demo

🌟 **Try it now:** [Murmuration Live Demo](https://jhalaga.github.io/murmuration/) 🌟

## Overview

Murmuration is an interactive web application that simulates the mesmerizing flocking behavior of starlings in flight. The application offers a customizable, visually stunning representation of bird flocks, with physically accurate movement patterns based on the Boids algorithm.

### Key Features

- **Real-time Simulation**: Experience the beauty of starling murmurations with realistic flocking behaviors
- **Customizable Parameters**: Control flock size, speed, cohesion, alignment, and separation
- **Text & Symbol Formation**: Watch as birds transition from natural flocking to form text or symbols
- **High Performance**: Optimized rendering for smooth animation even with thousands of birds
- **Beautiful Visuals**: Stunning visual effects with customizable appearance
- **Mobile-Friendly**: Responsive design works across devices

## Project Structure

This repository contains:

- Technical specifications in [TECHNICAL_SPECIFICATIONS.md](./TECHNICAL_SPECIFICATIONS.md)
- Development plan in [DEVELOPMENT_PLAN.md](./DEVELOPMENT_PLAN.md)
- Detailed usage instructions in [USAGE_GUIDE.md](./USAGE_GUIDE.md)
- Source code

## Getting Started

### For Users

#### Access the Live Application
Visit [https://jhalaga.github.io/murmuration/](https://jhalaga.github.io/murmuration/) to interact with the application directly in your browser.

#### Usage Instructions
1. Use the control panel to adjust flocking parameters
2. Experiment with different text or symbol formations
3. Try different visual styles and colors
4. The simulation runs best on modern browsers and desktop devices

### For Developers

#### Prerequisites

- Modern web browser with WebGL support
- Node.js and npm

#### Installation

```bash
# Clone the repository
git clone https://github.com/jhalaga/murmuration.git

# Navigate to the project directory
cd murmuration

# Install dependencies
npm install

# Start the development server
npm run dev
```

#### Available Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build the application for production
- `npm run preview` - Preview the production build locally
- `npm run lint` - Run the linter
- `npm run format` - Format code with Prettier
- `npm run deploy` - Deploy the application to GitHub Pages

#### Deployment

The application is deployed to GitHub Pages. To update the deployed version:

1. Make your changes to the codebase
2. Commit and push to GitHub
3. Run `npm run deploy`
4. The application will be accessible at https://jhalaga.github.io/murmuration/

## How It Works

Murmuration uses the Boids algorithm (by Craig Reynolds) to simulate flocking behavior based on three simple rules:

1. **Separation**: Birds avoid crowding their neighbors
2. **Alignment**: Birds steer towards the average heading of their neighbors
3. **Cohesion**: Birds move toward the average position of their neighbors

For the text/symbol formation feature, we implement a force-based targeting system that gradually guides birds to form shapes while maintaining natural-looking movement.

## Technologies Used

- **React** - UI framework
- **Three.js** - 3D rendering library
- **React Three Fiber** - Three.js React renderer
- **TypeScript** - Type-safe JavaScript
- **Vite** - Fast, modern build tool
- **Zustand** - State management
- **Styled Components** - CSS-in-JS styling

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Craig Reynolds for the original Boids algorithm
- The natural world for inspiring this digital recreation