
/**
 * This file provides a patch for the flowbite-react library
 * which tries to import tailwindcss/version.js
 */

// Mock the tailwindcss version for flowbite-react
// This will be used with import alias in vite.config.ts
export default '3.4.0'; // Current tailwindcss version
