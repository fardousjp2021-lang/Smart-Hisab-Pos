import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig(() => {
  return {
    base: './',
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        'react-dom/client',
        'lucide-react',
        'firebase/app',
        'firebase/auth',
        'firebase/firestore',
        'recharts',
        'date-fns',
        'xlsx',
        'jspdf',
        'jspdf-autotable',
        'framer-motion',
        'html5-qrcode',
      ],
    },
    server: {
      host: '0.0.0.0',
      port: 3000,
      strictPort: true,
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {
        ignored: [
          '**/.desktop_data/**',
          '**/SmartHisab_POS_Desktop_Portable/**',
          '**/dist/**',
          '**/.git/**',
          '**/*.vbs',
        ],
      },
    },
  };
});
