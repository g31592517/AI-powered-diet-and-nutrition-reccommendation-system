// NutriEmpower Backend Server with Ollama Integration
// Main application file with Express configuration and WebSocket support

const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const expressWs = require('express-ws');
require('dotenv').config();

// Import database connection
const connectDB = require('./config/db');

// Import routes
const homeRoutes = require('./routes/homeRoutes');
const apiRoutes = require('./routes/apiRoutes');

// Minimal AI chat dependencies
const csv = require('csv-parser');
const fs = require('fs');
const { Ollama } = require('ollama');

// Initialize Express app
const app = express();

// Initialize WebSocket support (not used in minimal flow)
const expressWsInstance = expressWs(app);

// Connect to MongoDB
connectDB();

// Security middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://cdnjs.cloudflare.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com", "https://cdnjs.cloudflare.com"],
            scriptSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com"],
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: ["'self'", "ws://localhost:3000", "ws://localhost:11434"]
        }
    }
}));

// CORS configuration
app.use(cors({
    origin: process.env.NODE_ENV === 'production' ? ['https://yourdomain.com'] : ['http://localhost:3000', 'http://localhost:5000'],
    credentials: true
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files middleware
app.use(express.static(path.join(__dirname, 'public')));

// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Routes
app.use('/', homeRoutes);
app.use('/api', apiRoutes);

// Minimal USDA dataset load with preprocessing + persisted compact JSON
let foods = [];
const dataDir = path.join(__dirname, 'data');
const dataPath = path.join(dataDir, 'usda-foods.csv');
const processedPath = path.join(dataDir, 'processed-usda.json');

function pickUsefulFields(row) {
    // Keep only compact, commonly used columns when present
    return {
        fdc_id: row.fdc_id || row.FDC_ID || row.fdcid || null,
        description: row.description || row.food_description || row.SNDescription || row.food || row.name || null,
        food_category: row.food_category || row.food_category_id || row.category || null,
        nutrients: row.nutrient || row.nutrients || null
    };
}

function tokenize(text) {
    return String(text || '')
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, ' ')
        .split(/\s+/)
        .filter(Boolean);
}

function simpleScore(row, queryTokens) {
    const hay = `${row.description || ''} ${row.food_category || ''}`.toLowerCase();
    let score = 0;
    for (const t of queryTokens) {
        if (hay.includes(t)) score++;
    }
    return score;
}

function searchFoods(query, limit = 3) {
    if (!foods.length || !query) return [];
    const tokens = tokenize(query).slice(0, 8);
    const scored = foods.map(r => ({ r, s: simpleScore(r, tokens) }));
    scored.sort((a, b) => b.s - a.s);
    const top = scored.filter(x => x.s > 0).slice(0, limit).map(x => x.r);
    return top;
}

try {
    if (fs.existsSync(processedPath)) {
        const buf = fs.readFileSync(processedPath, 'utf8');
        foods = JSON.parse(buf);
        console.log(`Loaded processed USDA foods: ${foods.length}`);
    } else if (fs.existsSync(dataPath)) {
        const temp = [];
        fs.createReadStream(dataPath)
            .pipe(csv())
            .on('data', (row) => {
                if (temp.length < 1000) temp.push(pickUsefulFields(row));
            })
            .on('end', () => {
                // Keep only rows with descriptions and dedupe by description
                const seen = new Set();
                const compact = [];
                for (const r of temp) {
                    const key = (r.description || '').toLowerCase();
                    if (!key) continue;
                    if (seen.has(key)) continue;
                    seen.add(key);
                    compact.push(r);
                    if (compact.length >= 300) break; // keep small
                }
                foods = compact;
                try {
                    if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
                    fs.writeFileSync(processedPath, JSON.stringify(compact));
                    console.log(`Processed USDA foods saved: ${compact.length}`);
                } catch (e) {
                    console.warn('Failed to persist processed USDA JSON:', e.message);
                }
            })
            .on('error', (e) => console.error('CSV load error:', e.message));
    } else {
        console.warn('USDA CSV not found at', dataPath, '- run: node download-dataset.js');
    }
} catch (e) {
    console.warn('USDA preprocessing skipped due to error:', e.message);
}

// Minimal chat endpoint using Ollama
const ollama = new Ollama({ host: process.env.OLLAMA_HOST || 'http://localhost:11434' });

// Simple concurrency limiter (no external deps)
function createLimiter(maxConcurrent = 1) {
    let active = 0;
    const queue = [];
    const runNext = () => {
        if (active >= maxConcurrent) return;
        const next = queue.shift();
        if (!next) return;
        active++;
        Promise.resolve()
            .then(next.fn)
            .then((res) => { active--; runNext(); next.resolve(res); })
            .catch((err) => { active--; runNext(); next.reject(err); });
    };
    return (fn) => new Promise((resolve, reject) => { queue.push({ fn, resolve, reject }); runNext(); });
}
const limit = createLimiter(1);

// Tiny Map-based cache with max 100 items and TTL ~15m
const responseCache = new Map();
function cacheGet(key) { return responseCache.get(key); }
function cacheSet(key, value) {
    responseCache.set(key, value);
    if (responseCache.size > 100) {
        const firstKey = responseCache.keys().next().value;
        if (firstKey !== undefined) responseCache.delete(firstKey);
    }
    setTimeout(() => { responseCache.delete(key); }, 1000 * 60 * 15).unref?.();
}
app.post('/api/chat', async (req, res) => {
    try {
        const message = (req.body && req.body.message) ? String(req.body.message) : '';
        if (!message.trim()) return res.status(400).json({ success: false, error: 'Message is required' });

        // Tiny RAG: pick top-3 compact rows
        const t0 = Date.now();
        const ragRows = searchFoods(message, 3);
        const context = JSON.stringify(ragRows);

        // Cache key on message + context
        const cacheKey = `${message}\n${context}`;
        const cached = cacheGet(cacheKey);
        if (cached) {
            return res.json({ success: true, response: cached, cached: true, ms: Date.now() - t0 });
        }

        const system = 'You are NutriAI, a fun nutrition expert using USDA data. Answer briefly, practical, and on-topic for meal plans, allergies, budgets, weight tips, and myths. Use occasional emojis (e.g., 🍎, 💪). No disclaimers.';
        const userPrompt = `Context: ${context}\nQuery: ${message}`;

        const doChat = () => ollama.chat({
            model: process.env.OLLAMA_MODEL || 'llama3.2:3b',
            messages: [
                { role: 'system', content: system },
                { role: 'user', content: userPrompt }
            ],
            options: { num_predict: 150 }
        });

        // Run under concurrency limit
        const response = await limit(doChat);

        const content = (response && response.message && response.message.content) ? response.message.content : 'Sorry, I could not generate a response right now.';
        cacheSet(cacheKey, content);
        return res.json({ success: true, response: content, ms: Date.now() - t0 });
    } catch (err) {
        console.error('Chat endpoint error:', err && err.message ? err.message : err);
        const msg = (err && err.message && err.message.includes('ECONNREFUSED')) ? 'Ollama is not running. Start it with: ollama serve' : (err && err.message) || 'Failed to get AI response';
        return res.status(500).json({ success: false, error: msg });
    }
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).render('error', {
        message: 'Page Not Found',
        error: { status: 404 }
    });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('Global error handler:', err);
    
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';
    
    res.status(statusCode).render('error', {
        message: message,
        error: process.env.NODE_ENV === 'development' ? err : {}
    });
});

// Server configuration
const PORT = process.env.PORT || 3000;

// Start server
app.listen(PORT, () => {
    console.log(`🚀 NutriEmpower server running on port ${PORT}`);
    console.log(`📱 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🌐 Access your app at: http://localhost:${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/health`);
    console.log(`🔧 API test: http://localhost:${PORT}/api/test`);
    console.log(`💬 Chat API: http://localhost:${PORT}/api/chat`);
    console.log(`🤖 Ollama minimal integration: Ready`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received. Shutting down gracefully...');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('SIGINT received. Shutting down gracefully...');
    process.exit(0);
});

module.exports = app;
