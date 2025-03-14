# Murmuration - Usage Guide

## Accessing the Application

The Murmuration simulation is available online at: **[https://jhalaga.github.io/murmuration/](https://jhalaga.github.io/murmuration/)**

No installation or setup is required to use the online version - simply open the link in a modern web browser.

## Using the Application

### Basic Controls

- **Camera Movement**:
  - **Rotate View**: Click and drag with the mouse
  - **Zoom**: Use the scroll wheel
  - **Pan**: Hold Shift + click and drag

- **Control Panel**: Use the panel on the right side of the screen to adjust simulation parameters

### Simulation Controls

The control panel provides several adjustable parameters:

#### Flock Behavior

- **Flock Size**: Adjust the number of birds in the simulation
- **Speed**: Control how fast the birds move
- **Separation**: How strongly birds avoid colliding with each other
- **Alignment**: How strongly birds align their direction with neighbors
- **Cohesion**: How strongly birds are attracted to the center of their local flock
- **Perception Radius**: How far each bird can "see" other birds

#### Visual Settings

- **Bird Size**: Adjust the size of individual birds
- **Bird Color**: Change the color scheme of the birds
- **Background**: Change the background color or image
- **Visual Effects**: Toggle trails, glow effects, etc.

#### Text Mode

1. Enter text in the input field
2. Click "Form Text" to make the birds transition into forming the text
3. Click "Resume Natural Flocking" to return to normal flocking behavior

### Performance Tips

- If the simulation runs slowly, try:
  - Reducing the flock size
  - Simplifying visual effects
  - Using a more powerful device or browser
  - Closing other resource-intensive applications

### Known Issues and Workarounds

- On some mobile devices, performance may be limited
- Certain browsers may handle WebGL differently - Chrome and Firefox generally provide the best experience
- Text formation works best with simple, short phrases rather than complex text

## Developer Mode

For developers who want to experiment with the code:

1. Clone the repository: `git clone https://github.com/jhalaga/murmuration.git`
2. Install dependencies: `npm install`
3. Run locally: `npm run dev`
4. Make changes to code in the `src` directory
5. Deploy your changes: `npm run deploy`

## Troubleshooting

If you encounter issues:

1. Make sure your browser supports WebGL
2. Try a different browser (Chrome or Firefox recommended)
3. Clear your browser cache and refresh
4. Check for console errors (F12 in most browsers)
5. If problems persist, please report them in the GitHub repository issues section 