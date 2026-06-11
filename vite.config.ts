// import { defineConfig } from 'vite'
// import react from '@vitejs/plugin-react'

// // https://vite.dev/config/
// export default defineConfig(({ command, mode }) => ({
//   plugins: [react()],
//   // Use the GitHub Pages subpath in production, but serve from root during local dev
//   base: mode === 'production' ? '/SmartTrip/' : '/',
// }))
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ command, mode }) => ({
  plugins: [react()],
  // Use the GitHub Pages subpath in production, but serve from root during local dev
  base: mode === 'production' ? '/SmartTrip/' : '/',
}))
