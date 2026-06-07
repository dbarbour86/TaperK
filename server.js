import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
// Hostinger uses process.env.PORT to assign dynamic ports to Node instances
const PORT = process.env.PORT || 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Logging request middleware for diagnostics
app.use((req, res, next) => {
  console.log(`[TaperK Server] ${req.method} ${req.url}`);
  next();
});

// Serve static assets from the 'dist' directory with cache control
app.use(express.static(path.join(__dirname, 'dist'), {
  maxAge: '1y',
  etag: true
}));

// Fallback all other requests to index.html for React SPA router
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`[TaperK] Express server serving 'dist' folder running on port ${PORT}`);
});
