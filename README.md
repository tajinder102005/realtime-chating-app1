# 💬 Real-Time Chat Application

A modern real-time chat application built with React, Node.js, and Supabase authentication.

## ✨ Features

- 🔐 **Secure Authentication** with Supabase
- 💬 **Real-time Messaging** with Socket.IO
- 👥 **Multiple Chat Rooms** 
- 📱 **Responsive Design**
- 🔍 **User Search & Discovery**
- 📖 **Read Receipts**
- 🌐 **Production Ready**

## 🛠️ Tech Stack

### Frontend
- React 19
- Vite
- React Router
- Axios
- Socket.IO Client
- Tailwind CSS (for styling)

### Backend
- Node.js
- Express
- Socket.IO
- Supabase Client
- JWT Authentication

### Database & Auth
- Supabase (PostgreSQL)
- Supabase Auth
- Row Level Security (RLS)

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Supabase Account

### 1. Clone the Repository
```bash
git clone <repository-url>
cd chat_app2.0
```

### 2. Set Up Supabase
1. Create a new Supabase project at https://supabase.com
2. Run the SQL script from `database/schema.sql` in your Supabase SQL Editor
3. Get your Supabase URL and keys from project settings

### 3. Backend Setup
```bash
cd backend
npm install
```

Create a `.env` file:
```env
PORT=5000
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
JWT_SECRET=your_jwt_secret_key
```

Start the backend:
```bash
npm run dev
```

### 4. Frontend Setup
```bash
cd frontend
npm install
```

Create a `.env` file:
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_API_URL=http://localhost:5000
```

Start the frontend:
```bash
npm run dev
```

### 5. Access the Application
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

## 📁 Project Structure

```
chat_app2.0/
├── backend/
│   ├── config/
│   │   ├── db.js
│   │   └── supabase.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── messageController.js
│   │   └── userController.js
│   ├── middleware/
│   │   └── authMiddlerware.js
│   ├── models/
│   ├── routes/
│   ├── socket/
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   ├── config/
│   │   └── App.jsx
│   └── public/
├── database/
│   └── schema.sql
└── README.md
```

## 🔗 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Users
- `GET /api/users/profile` - Get current user profile
- `GET /api/users/all` - Get all users
- `GET /api/users/search?q=query` - Search users
- `PUT /api/users/profile` - Update profile

### Messages
- `POST /api/messages` - Send message
- `GET /api/messages/:conversationId` - Get conversation messages
- `PUT /api/messages/:conversationId/read` - Mark messages as read
- `GET /api/messages/conversations` - Get all conversations
- `GET /api/messages/conversation/:userId` - Get/create conversation

## 🚀 Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

### Quick Deploy Options
- **Backend**: Railway or Render
- **Frontend**: Vercel or Netlify
- **Database**: Supabase (included)

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Troubleshooting

### Common Issues

1. **CORS Errors**: Make sure your frontend URL is added to Supabase CORS settings
2. **Database Connection**: Verify Supabase URL and keys are correct
3. **Socket.IO Issues**: Check that WebSocket connections are allowed
4. **Environment Variables**: Ensure all required environment variables are set

### Getting Help

- Check the [DEPLOYMENT.md](./DEPLOYMENT.md) for deployment issues
- Review the Supabase documentation for database questions
- Open an issue for bug reports or feature requests

## 📞 Support

For support, please open an issue in the GitHub repository or contact the development team.
