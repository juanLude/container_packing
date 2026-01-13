Container Packing Optimizer
An advanced web-based tool for optimizing container loading with 3D visualization.
🚀 Features
✅ Implemented

Smart Packing Algorithms

Heuristic First-Fit algorithm with bottom-left strategy
Volume-optimized sorting
Weight and stability calculations

Physical Constraints

Weight limits per container
Stackability rules
Fragile item protection
Center of gravity calculation
Stability checking

3D Visualization

Interactive Three.js rendering
Orbit controls (rotate, zoom, pan)
Click to select boxes
Color-coded boxes (fragile, non-stackable)
Center of gravity marker

Data Management

Manual box input with full validation
CSV import/export
Downloadable results (JSON)
CSV template generator

Analytics Dashboard

Volume utilization percentage
Weight utilization percentage
Packing efficiency metrics
Stability indicators
Performance timing

🔜 Coming Soon

EB-AFIT algorithm implementation
Brute force algorithm (for small sets)
Multiple container optimization
Animation of loading sequence
PDF export with detailed reports
Constraint optimization (LIFO/FIFO)

📦 Installation
bash# Install dependencies
npm install

# Run development server

npm run dev

# Build for production

npm run build

# Preview production build

npm run preview
🎯 Usage
Adding Boxes Manually

Fill in the box dimensions (length, width, height in cm)
Enter the weight (in kg)
Mark as fragile if needed
Set stackability
Click "Add Box"

Importing from CSV

Click "Choose CSV File"
Select a CSV file with the following format:

name,length,width,height,weight,fragile,stackable
Box 1,100,80,60,50,false,true
Box 2,120,100,80,75,true,false

Or download the template to see the exact format

Running the Packing Algorithm

Add boxes (manually or via CSV)
Select the algorithm (currently only Heuristic is available)
Click "Pack Container"
View results in 3D visualization and statistics panel

Interacting with 3D View

Rotate: Left-click and drag
Pan: Right-click and drag
Zoom: Scroll wheel
Select Box: Click on any box to see details

🏗️ Project Structure
src/
├── algorithms/
│ ├── types.ts # TypeScript interfaces
│ ├── heuristic.ts # Heuristic packing algorithm
│ ├── ebAfit.ts # EB-AFIT algorithm (coming soon)
│ └── bruteForce.ts # Brute force algorithm (coming soon)
├── components/
│ ├── BoxInput.tsx # Manual box input form
│ ├── ContainerViewer.tsx # 3D visualization with Three.js
│ ├── Controls.tsx # Algorithm selection and actions
│ ├── Statistics.tsx # Results dashboard
│ └── CSVImport.tsx # CSV import functionality
├── App.tsx # Main application component
├── main.tsx # Entry point
└── index.css # Global styles
🛠️ Technology Stack

React 18 - UI framework
TypeScript - Type safety
Vite - Build tool
Three.js - 3D rendering
@react-three/fiber - React renderer for Three.js
@react-three/drei - Three.js helpers
Tailwind CSS - Styling
Papa Parse - CSV parsing

📊 Algorithm Details
Heuristic Algorithm
The current implementation uses a First-Fit Decreasing strategy:

Sorting: Boxes are sorted by volume (largest first)
Space Management: Maintains a list of available spaces
Placement: Places each box in the first available space
Space Splitting: When a box is placed, the remaining space is split into new available spaces
Constraints: Respects weight limits, stackability, and fragility rules

Time Complexity: O(n²) where n is the number of boxes
Space Complexity: O(n)
Future Algorithms
EB-AFIT (Erhan Baltacıoğlu Air Force Institute of Technology):

More sophisticated space selection
Better handling of irregular spaces
Improved volume utilization (typically 5-10% better)

Brute Force:

Exhaustive search of all possibilities
Best for small sets (< 10 boxes)
Guaranteed optimal solution

🎨 Design Decisions

Bottom-Left Strategy: Ensures stability by placing boxes as low and as far back as possible
Space Splitting: Creates three new spaces (above, right, back) for efficient space utilization
Fragility Protection: Fragile boxes cannot have heavy items placed on top
Center of Gravity: Calculated and displayed to ensure safe transport
Color Coding: Visual feedback for box properties (red = fragile, amber = non-stackable)

🤝 Contributing
This project is open for improvements! Areas that need work:

Implement EB-AFIT algorithm
Add rotation optimization (6 possible orientations)
Implement multi-container optimization
Add loading sequence animation
Improve performance for large datasets
Add unit tests

📝 CSV Format
Required fields:

length (cm)
width (cm)
height (cm)
weight (kg)

Optional fields:

name (string)
fragile (true/false)
stackable (true/false)

🐛 Known Issues

EB-AFIT and Brute Force algorithms not yet implemented
No rotation optimization yet
Limited to single container (multi-container coming soon)

📄 License
MIT License - feel free to use this project for any purpose.
👤 Author
Improved version based on the original container_packing project.
