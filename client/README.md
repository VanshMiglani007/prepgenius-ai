# PrepGenius AI — Frontend Client

This directory contains the React.js + Vite frontend for **PrepGenius AI**.

## Tech Stack & Libraries
- **Framework**: React 18 with Vite
- **Styling**: Tailwind CSS, Custom CSS Variables, Animations
- **Icons**: Lucide React Icons (`lucide-react`)
- **State & Context**: Custom React Context API (`AuthContext`, `ThemeContext`, `ToastContext`)
- **Animations**: Canvas Particle Engines, Smooth Transitions & Micro-interactions

## Available Scripts

In the `client` directory, you can run:

```bash
# Install frontend dependencies
npm install

# Run Vite development server (HMR enabled)
npm run dev

# Build for production distribution
npm run build

# Preview production build locally
npm run preview
```

## Environment Setup

Copy `.env.example` to `.env` in this directory:

```env
VITE_GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
```

For full documentation, please refer to the [Root README](../README.md).
