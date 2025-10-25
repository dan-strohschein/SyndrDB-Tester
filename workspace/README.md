# SyndrDB Tester

An Electron application built with TypeScript, Lit components, Bootstrap CSS, and FontAwesome icons.

## Features

- Full-screen Electron application
- TypeScript for type safety and better development experience
- Lit web components for modern reactive UI
- Bootstrap CSS for responsive styling
- FontAwesome icons for rich iconography

## Development

### Prerequisites

- Node.js (latest LTS version recommended)
- npm

### Installation

```bash
npm install
```

### Building the Application

```bash
npm run build
```

This compiles the TypeScript code to JavaScript in the `dist` folder.

### Running the Application

```bash
npm start
```

### Development Mode

```bash
npm run dev
```

This runs the app with debugging enabled on port 5858.

### Watch Mode

```bash
npm run watch
```

This watches for TypeScript changes and recompiles automatically.

### Cleaning Build Files

```bash
npm run clean
```

### Building for Distribution

```bash
npm run electron-build
```

## Project Structure

```
├── src/
│   ├── main.ts              # Main Electron process (TypeScript)
│   ├── preload.ts           # Preload script for security (TypeScript)
│   ├── index.html           # Main window HTML
│   ├── renderer.ts          # Renderer process script (TypeScript)
│   ├── components/          # Lit components (TypeScript)
│   │   └── welcome-component.ts
│   └── styles/              # CSS styles
│       └── main.css
├── dist/                    # Compiled JavaScript output
├── tsconfig.json           # Main TypeScript configuration
├── tsconfig.main.json      # Main process TypeScript config
├── tsconfig.renderer.json  # Renderer process TypeScript config
├── package.json            # Project configuration
└── README.md              # This file
```

## Technologies Used

- **TypeScript**: Type-safe JavaScript with modern features
- **Electron**: Cross-platform desktop app framework
- **Lit**: Lightweight web components library
- **Bootstrap**: CSS framework for responsive design
- **FontAwesome**: Icon library

## Development Notes

The project uses separate TypeScript configurations for main and renderer processes:
- Main process (`main.ts`, `preload.ts`): Compiled to CommonJS
- Renderer process (`renderer.ts`, components): Compiled to ES modules

## License

MIT