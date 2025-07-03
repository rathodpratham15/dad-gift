# 🏡 Dad's Gift - Premium Real Estate Platform

> A beautiful, modern real estate platform built with love as a gift for Dad ❤️

## ✨ Features

### 🏠 **Core Real Estate Features**
- **Property Listings** - Browse warehouses, shops, and apartments
- **Advanced Search** - Filter by location, price, type, and facilities
- **Interactive Maps** - Leaflet integration with property coordinates
- **Property Details** - High-quality image galleries with carousel
- **Favorites System** - Save and manage favorite properties
- **WhatsApp Integration** - Direct contact with property details

### 👤 **User Experience**
- **User Dashboard** - Track views, favorites, and search history
- **Admin Dashboard** - Complete property management system
- **Onboarding** - Smooth introduction for new users
- **Dark/Light Theme** - Toggle between themes
- **PWA Support** - Install as mobile app
- **Google OAuth** - Easy login with Google

### 🤖 **Smart Features**
- **AI Chatbot** - Intelligent property assistance
- **Analytics** - Property view tracking and insights
- **Responsive Design** - Perfect on all devices
- **Real-time Updates** - Live data synchronization

### 🔒 **Security & Performance**
- JWT Authentication
- Password encryption
- Input validation
- Rate limiting ready
- Image optimization
- Fast loading with Vite

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- MongoDB database
- Modern web browser

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd dad-gift
```

2. **Setup Frontend**
```bash
cd app
npm install
npm run dev
```

3. **Setup Backend**
```bash
cd service
npm install
npm start
```

4. **Environment Variables**
Create `.env` files in both `app/` and `service/` directories:

**Frontend (.env):**
```env
VITE_API_URL=http://localhost:3002
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

**Backend (.env):**
```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
SENDGRID_API_KEY=your_sendgrid_key
PORT=3002
```

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **Leaflet** for maps
- **PWA** capabilities

### Backend
- **Node.js** with Express
- **MongoDB** with Mongoose
- **JWT** authentication
- **SendGrid** for emails
- **Multer** for file uploads

## 📱 PWA Features

Dad's Gift can be installed as a mobile app:
- Offline functionality
- Push notifications ready
- App-like experience
- Fast loading

## 🎨 UI/UX Highlights

- **Modern Design** - Clean, professional interface
- **Smooth Animations** - Framer Motion powered
- **Mobile First** - Responsive on all devices
- **Accessibility** - ARIA labels and keyboard navigation
- **Loading States** - Beautiful loading indicators
- **Error Handling** - Graceful error messages

## 📊 Analytics

Track important metrics:
- Property views
- User engagement
- Search patterns
- Popular locations

## 🔧 Development

### Scripts
```bash
# Frontend
npm run dev          # Development server
npm run build        # Production build
npm run lint         # Code linting

# Backend
npm start            # Start server
npm run dev          # Development with nodemon
```

### Project Structure
```
dad-gift/
├── app/                 # Frontend React app
│   ├── src/
│   │   ├── components/  # Reusable components
│   │   ├── pages/       # Page components
│   │   ├── styles/      # CSS files
│   │   └── utils/       # Utility functions
├── service/             # Backend API
│   ├── service/
│   │   ├── controllers/ # Route handlers
│   │   ├── models/      # Database models
│   │   ├── routers/     # API routes
│   │   └── middleware/  # Custom middleware
└── docs/                # API documentation
```

## 🚀 Deployment

Ready for deployment on:
- **Vercel** (Frontend)
- **Railway/Render** (Backend)
- **MongoDB Atlas** (Database)
- **Cloudinary** (Images)

## 🎁 Made with Love

This project was created as a special gift for Dad, combining modern web technologies with thoughtful user experience design. Every feature was carefully crafted to provide the best real estate browsing experience.

---

*Built with ❤️ for Dad*
