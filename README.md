# Medical AI Clinical Decision Support System

A comprehensive web application designed to assist allopathic physicians with case examination, differential diagnosis, treatment planning, and patient counseling.

## Features

- **Case Examination Assistant**: Systematically review patient cases and identify missing information
- **Differential Diagnosis**: Generate ranked differential diagnoses with reasoning
- **Treatment Planning**: Evidence-based treatment recommendations with dosing and precautions
- **Patient Counseling**: Generate patient-friendly explanations and counseling points
- **Case History**: Track and review previous consultations
- **Export Reports**: Generate PDF reports of clinical assessments

## Technology Stack

### Backend
- Node.js & Express.js
- Anthropic Claude AI API
- MongoDB (for case storage)
- JWT Authentication

### Frontend
- React 18
- Tailwind CSS
- Axios for API calls
- React Router for navigation
- Lucide React for icons

## Project Structure

```
medical-ai-assistant/
├── backend/
│   ├── server.js              # Express server setup
│   ├── routes/                # API routes
│   ├── controllers/           # Business logic
│   ├── models/                # Database models
│   ├── middleware/            # Authentication & validation
│   └── config/                # Configuration files
├── frontend/
│   ├── src/
│   │   ├── components/        # React components
│   │   ├── pages/             # Page components
│   │   ├── services/          # API services
│   │   ├── utils/             # Utility functions
│   │   └── styles/            # CSS files
│   └── public/                # Static files
└── database/
    └── schemas/               # Database schemas
```

## Setup Instructions

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local or Atlas)
- Anthropic API key

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
npm install
```

2. Create `.env` file:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/medical-ai
ANTHROPIC_API_KEY=your_api_key_here
JWT_SECRET=your_jwt_secret_here
NODE_ENV=development
```

3. Start the backend:
```bash
npm run dev
```

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
npm install
```

2. Create `.env` file:
```
REACT_APP_API_URL=http://localhost:5000/api
```

3. Start the frontend:
```bash
npm start
```

## API Endpoints

### Cases
- `POST /api/cases/analyze` - Analyze a new case
- `GET /api/cases` - Get all cases
- `GET /api/cases/:id` - Get specific case
- `DELETE /api/cases/:id` - Delete a case

### User Management
- `POST /api/auth/register` - Register new doctor
- `POST /api/auth/login` - Login
- `GET /api/auth/profile` - Get user profile

## Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Input validation and sanitization
- Rate limiting on API endpoints
- CORS configuration
- Helmet.js for security headers

## Medical Disclaimer

⚠️ **IMPORTANT**: This tool provides clinical decision support based on the information provided. It is designed to assist qualified healthcare professionals and should not replace clinical judgment, physical examination, or consultation with specialists when indicated. Always verify recommendations against current local guidelines, consider individual patient factors, and use your professional judgment. The treating physician bears ultimate responsibility for all clinical decisions.

## License

This project is licensed for educational and development purposes.

## Support

For issues and questions, please create an issue in the repository.
