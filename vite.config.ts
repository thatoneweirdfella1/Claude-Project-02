import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Electron loads the production renderer through file://. Relative asset
// paths keep the bundled JavaScript, CSS, and images beside index.html
// instead of incorrectly looking for them at C:\\assets on Windows.
export default defineConfig({
  base: './',
  plugins: [react()],
})
