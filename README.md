# NutriSolve – Diet & Nutrition Website

Minimal Express.js app that serves the NutriSolve website (EJS views + static assets), integrates a lightweight local AI chat via Ollama, and uses MongoDB via Mongoose. Start with a single command: `npm start`.

## 🚀 Quick Start

### Prerequisites
- Node.js (v16+)
- MongoDB (local or Atlas)
- Ollama (installed once: `curl -fsSL https://ollama.com/install.sh | sh`)
- npm or yarn

### Installation

1. **Clone and navigate to the project:**
   ```bash
   cd "diet design copy"
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` file with your configuration:
   ```env
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/nutriempower
   NODE_ENV=development
   ```

4. **Start MongoDB:**
   - **Local MongoDB:** Make sure MongoDB is running on your system
   - **MongoDB Atlas:** Use your cloud connection string in `.env`

5. **Run the application:**
   ```bash
   # Development mode (with auto-restart)
   npm run dev
   
   # Production mode
   npm start
   ```

6. **Access the application:**
   - Main site: http://localhost:5000
   - Health check: http://localhost:5000/health
   - API test: http://localhost:5000/api/test

## 📁 Project Structure

```
├── app.js                 # Main server file
├── package.json           # Dependencies and scripts
├── .env                   # Environment variables (create from .env.example)
├── .gitignore            # Git ignore rules
├── config/
│   └── db.js             # MongoDB connection configuration
├── controllers/
│   ├── homeController.js # Home page and main routes
│   └── apiController.js  # API endpoints
├── models/
│   └── User.js           # Sample User model
├── routes/
│   ├── homeRoutes.js     # Home page routes
│   └── apiRoutes.js      # API routes
├── views/
│   ├── index.ejs         # Landing page
│   ├── community.ejs     # Community Support Hub
│   └── error.ejs         # Error page
└── public/
    ├── css/              # All CSS files
    ├── js/               # All JavaScript files
    └── images/           # Images and assets
```

## 🔧 Features

- **MVC Architecture:** Clean separation of concerns
- **EJS Templating:** Server-side rendering
- **MongoDB:** Ready for persistence
- **Local AI Chat:** Minimal Ollama chat endpoint with small context and capped tokens
- **Security:** Helmet, CORS, rate limiting
- **Error Handling:** Comprehensive error management
- **Static Assets:** Properly served from /public directory
- **Development Tools:** Nodemon for auto-restart

## 📝 API Endpoints

### Main Routes
- `GET /` - Landing page
- `GET /health` - Health check
- `POST /contact` - Contact form (placeholder)
- `POST /newsletter` - Newsletter subscription (placeholder)

### API Routes
- `GET /api/test` - API test endpoint
- `GET /api/nutrition` - Nutrition data (placeholder)
- `GET /api/recipes` - Recipe data (placeholder)
- `GET /api/specialists` - Specialist data (placeholder)

## 🗄️ Database

The app uses MongoDB with Mongoose. A sample `User` model is included.

### Sample Model Usage
```javascript
const User = require('./models/User');

// Create a new user
const user = new User({
    name: 'John Doe',
    email: 'john@example.com',
    preferences: {
        dietaryRestrictions: ['vegetarian'],
        budget: 'moderate'
    }
});
```

## 🛠️ Development

### Adding New Routes
1. Create controller in `/controllers/`
2. Create route file in `/routes/`
3. Import and use in `app.js`

### Adding New Models
1. Create model file in `/models/`
2. Import in controllers as needed

### Environment Variables
- `PORT` - Server port (default: 5000)
- `MONGO_URI` - MongoDB connection string
- `NODE_ENV` - Environment (development/production)
- `JWT_SECRET` - For future authentication

## 🚨 Troubleshooting

### Common Issues

1. **MongoDB Connection Error:**
   - Ensure MongoDB is running
   - Check connection string in `.env`
   - Verify network access for Atlas

2. **Port Already in Use:**
   - `PORT=5001 npm start` or kill: `lsof -ti:5000 | xargs kill -9`

3. **Static Files Not Loading:**
   - Check file paths in EJS templates
   - Ensure files are in `/public` directory
   - Verify Express static middleware

4. **EJS Rendering Errors:**
   - Check template syntax
   - Verify data passed to templates
   - Check view engine configuration

### Debug Mode
Set `NODE_ENV=development` in `.env` for detailed error messages.

## 📦 Tech Stack

Backend: Express, EJS, Mongoose, Helmet, CORS, express-rate-limit

AI: Ollama (local), minimal chat endpoint (model configurable via `OLLAMA_MODEL`)

Styling: CSS in `/public/css` with tokens in `variables.css`

## 📄 License

MIT
