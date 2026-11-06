const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;
const distDir = path.join(__dirname, 'dist');

if (!fs.existsSync(distDir)) {
  console.error('[Error] dist/ directory not found. Run "npm run build" first.');
  process.exit(1);
}

// Serve static assets with caching
app.use(express.static(distDir, {
  maxAge: '1d',
  etag: true,
}));

// SPA fallback: send dist/index.html for all routes
app.get('*', (req, res) => {
  res.sendFile(path.join(distDir, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`====================================================`);
  console.log(`  SmartHisab POS High-Speed Engine Active!`);
  console.log(`  Local URL:   http://localhost:${PORT}/`);
  console.log(`  Network URL: http://127.0.0.1:${PORT}/`);
  console.log(`====================================================`);
});
