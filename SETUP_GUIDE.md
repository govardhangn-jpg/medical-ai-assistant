# Medical AI Assistant - Complete Setup Guide

## Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **MongoDB** (v5 or higher) - [Download](https://www.mongodb.com/try/download/community) or use [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- **npm** (comes with Node.js)
- **Anthropic API Key** - [Get one here](https://console.anthropic.com/)

## Quick Start

### 1. Clone/Extract the Project

```bash
cd medical-ai-assistant
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create .env file from example
cp .env.example .env

# Edit .env file with your credentials
nano .env  # or use any text editor
```

**Update the .env file with:**
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/medical-ai
ANTHROPIC_API_KEY=your_actual_api_key_here
JWT_SECRET=generate_a_random_secret_string_here
FRONTEND_URL=http://localhost:3000
```

**To generate a secure JWT_SECRET:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 3. MongoDB Setup

**Option A: Local MongoDB**
```bash
# Start MongoDB service
# On macOS:
brew services start mongodb-community

# On Ubuntu/Linux:
sudo systemctl start mongod

# On Windows:
# Start MongoDB from Services or run mongod.exe
```

**Option B: MongoDB Atlas (Cloud)**
1. Go to https://www.mongodb.com/cloud/atlas
2. Create a free cluster
3. Get your connection string
4. Update MONGODB_URI in .env with the Atlas connection string

### 4. Start the Backend Server

```bash
# From the backend directory
npm run dev
```

You should see:
```
✅ MongoDB Connected
🚀 Server running on port 5000
```

### 5. Frontend Setup

Open a new terminal window:

```bash
# Navigate to frontend directory (from project root)
cd frontend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# The default values should work, but verify:
# REACT_APP_API_URL=http://localhost:5000/api

# Start the development server
npm start
```

The application should automatically open in your browser at http://localhost:3000

## First Time Usage

### 1. Register a Doctor Account

1. Open http://localhost:3000/register
2. Fill in the registration form:
   - Name: Your full name
   - Email: Your email address
   - Password: At least 8 characters with uppercase, lowercase, and number
   - Specialty: Select your medical specialty
   - License Number: Your medical license number
   - Hospital/Clinic: Optional

3. Click "Create Account"

### 2. Create Your First Case

1. Click "New Case" from the dashboard
2. Fill in patient information
3. Enter clinical data
4. Click "Analyze Case"
5. View AI-generated analysis with:
   - Clinical Assessment
   - Differential Diagnosis
   - Treatment Recommendations
   - Patient Counseling Points
   - Red Flags

## Project Structure

```
medical-ai-assistant/
├── backend/
│   ├── models/              # MongoDB schemas
│   │   ├── User.js
│   │   └── Case.js
│   ├── routes/              # API endpoints
│   │   ├── authRoutes.js
│   │   └── caseRoutes.js
│   ├── services/            # Business logic
│   │   └── aiService.js
│   ├── middleware/          # Auth & validation
│   │   └── auth.js
│   ├── server.js            # Express server
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/      # React components
│   │   │   └── Layout.js
│   │   ├── pages/           # Page components
│   │   │   ├── Login.js
│   │   │   ├── Register.js
│   │   │   ├── Dashboard.js
│   │   │   ├── NewCase.js
│   │   │   ├── CaseView.js
│   │   │   └── CaseList.js
│   │   ├── services/        # API calls
│   │   │   └── api.js
│   │   ├── utils/           # Utilities
│   │   │   └── AuthContext.js
│   │   ├── styles/          # CSS files
│   │   │   └── index.css
│   │   ├── App.js           # Main app component
│   │   └── index.js         # Entry point
│   ├── public/
│   │   └── index.html
│   └── package.json
│
└── README.md
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new doctor
- `POST /api/auth/login` - Login
- `GET /api/auth/profile` - Get user profile (requires auth)
- `PUT /api/auth/profile` - Update profile (requires auth)

### Cases
- `POST /api/cases/analyze` - Analyze new case (requires auth)
- `GET /api/cases` - Get all cases with pagination (requires auth)
- `GET /api/cases/:id` - Get specific case (requires auth)
- `PUT /api/cases/:id` - Update case (requires auth)
- `DELETE /api/cases/:id` - Delete case (requires auth)
- `GET /api/cases/patient/:patientId` - Get patient history (requires auth)

## Troubleshooting

### MongoDB Connection Issues

**Error: "MongooseServerSelectionError: connect ECONNREFUSED"**

Solution:
```bash
# Check if MongoDB is running
# On macOS:
brew services list

# On Linux:
sudo systemctl status mongod

# Start MongoDB if not running
brew services start mongodb-community  # macOS
sudo systemctl start mongod            # Linux
```

### Port Already in Use

**Error: "Port 5000 is already in use"**

Solution:
```bash
# Find process using port 5000
lsof -ti:5000  # macOS/Linux
netstat -ano | findstr :5000  # Windows

# Kill the process or change PORT in .env
```

### Anthropic API Issues

**Error: "Invalid API Key"**

Solution:
1. Verify your API key at https://console.anthropic.com/
2. Ensure no extra spaces in .env file
3. Restart the backend server after changing .env

### Frontend Not Connecting to Backend

**Error: "Network Error" or 401 Unauthorized**

Solutions:
1. Verify backend is running on port 5000
2. Check REACT_APP_API_URL in frontend/.env
3. Clear browser cache and localStorage
4. Check browser console for CORS errors

## Production Deployment

### Backend Deployment (Example: Heroku)

```bash
# Install Heroku CLI
# Add Procfile:
echo "web: node server.js" > backend/Procfile

# Deploy
cd backend
heroku create your-app-name
heroku config:set MONGODB_URI=your_atlas_uri
heroku config:set ANTHROPIC_API_KEY=your_key
heroku config:set JWT_SECRET=your_secret
heroku config:set NODE_ENV=production
git push heroku main
```

### Frontend Deployment (Example: Netlify)

```bash
cd frontend
npm run build

# Deploy build folder to Netlify
# Update REACT_APP_API_URL to your backend URL
```

## Security Considerations

1. **Never commit .env files** to version control
2. **Use strong JWT secrets** in production
3. **Enable HTTPS** in production
4. **Implement rate limiting** for API endpoints
5. **Regular security audits** of dependencies
6. **HIPAA compliance** considerations for patient data

## Getting Help

- Check the [README.md](README.md) for general information
- Review API documentation in code comments
- Check browser console for frontend errors
- Check backend logs for server errors

## License

This project is for educational and development purposes.

---

**Important Medical Disclaimer**: This tool provides clinical decision support and should not replace professional medical judgment. Always consult with qualified healthcare professionals for medical decisions.
