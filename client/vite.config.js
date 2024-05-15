import { defineConfig } from 'vite'
import graphqlLoader from "vite-plugin-graphql-loader";

import react from '@vitejs/plugin-react'
//import svgr from 'vite-plugin-svgr'
import svgr from '@svgr/rollup';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(),  svgr(), graphqlLoader()],
  base:'/dsensors',

server: {
    watch: {
      usePolling: true
    }
  }

})
