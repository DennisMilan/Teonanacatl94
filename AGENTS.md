# Custom Agent Skills & Configurations

This file defines custom capabilities and instructions that are automatically loaded and understood by the AI Coding Agent.

## Custom Capabilities

### `@godaddy-nodejs-hosting`
When this capability is requested, referenced, or triggered, the agent must adhere to the following guidelines to prepare the Node.js project for cPanel and GoDaddy shared/virtual private hosting:

1. **Entry Point Integration**:
   - Always maintain a root-level `app.js` file that acts as the application's entry point for Phusion Passenger.
   - The root `app.js` should serve as a lightweight wrapper that imports and executes the compiled production server (e.g., `import './dist/server.cjs';`).

2. **Full-Stack Bundling & Compiling**:
   - The production build must produce a single, self-contained backend file at `dist/server.cjs` and compile the React frontend static assets into `dist/`.
   - The Express backend server must be configured to statically serve the `dist/` directory and handle SPA route fallback to `dist/index.html`.

3. **Dynamic Port Binding**:
   - The Node.js application must dynamically listen on the port provided by the hosting environment via `process.env.PORT`.

4. **Environment Variables**:
   - Never hardcode sensitive API keys (such as `GEMINI_API_KEY`). Ensure they are loaded from `process.env` so that they can be easily configured in the cPanel Node.js Application manager under "Environment variables".

5. **Deployment Documentation**:
   - Always provide clear, step-by-step instructions for cPanel setup when requested.
