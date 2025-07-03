# 🚀 Deployment Guide for Dad's Gift

This guide will help you deploy Dad's Gift using **FREE** cloud services!

## 🏗️ Architecture Overview

```
Frontend (Vercel) → Backend (Railway) → Database (MongoDB Atlas)
                                    ↓
                            File Storage (Cloudinary)
```

## 📋 Prerequisites

- GitHub account
- Vercel account (free)
- Railway account (free)
- MongoDB Atlas account (free)
- Cloudinary account (free)
- SendGrid account (free)

## 🔧 1. Environment Setup

### Frontend (.env.local in app/)
```env
VITE_API_URL=https://your-app-name.railway.app
VITE_GOOGLE_CLIENT_ID=your_google_oauth_client_id
```

### Backend (.env in service/)
```env
NODE_ENV=production
PORT=3002
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/dad-gift
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters
SENDGRID_API_KEY=your-sendgrid-api-key
FRONTEND_URL=https://your-app.vercel.app
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

## 🌐 2. MongoDB Atlas Setup (FREE)

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Create a database user
4. Whitelist IP addresses (0.0.0.0/0 for development)
5. Get your connection string
6. Replace `<password>` with your actual password

## 📧 3. SendGrid Setup (FREE)

1. Sign up at [SendGrid](https://sendgrid.com/)
2. Verify your sender identity
3. Create an API key
4. Add to your environment variables

## 🖼️ 4. Cloudinary Setup (FREE)

1. Sign up at [Cloudinary](https://cloudinary.com/)
2. Get your cloud name, API key, and secret
3. Add to your environment variables

## 🔑 5. Google OAuth Setup (FREE)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs:
   - `http://localhost:5173` (development)
   - `https://your-app.vercel.app` (production)

## 🚂 6. Backend Deployment (Railway - FREE)

1. Push your code to GitHub
2. Go to [Railway](https://railway.app/)
3. Create new project → Deploy from GitHub
4. Select your repository
5. Choose the `service` folder as root
6. Add environment variables:
   ```
   NODE_ENV=production
   PORT=3002
   MONGO_URI=your-mongodb-connection-string
   JWT_SECRET=your-jwt-secret
   SENDGRID_API_KEY=your-sendgrid-key
   FRONTEND_URL=https://your-app.vercel.app
   ```
7. Deploy! 🎉

### Railway Configuration
- Root directory: `service/`
- Build command: `npm install`
- Start command: `npm start`

## ⚡ 7. Frontend Deployment (Vercel - FREE)

1. Go to [Vercel](https://vercel.com/)
2. Import your GitHub repository
3. Set framework preset to `Vite`
4. Set root directory to `app/`
5. Add environment variables:
   ```
   VITE_API_URL=https://your-backend.railway.app
   VITE_GOOGLE_CLIENT_ID=your-google-client-id
   ```
6. Deploy! 🎉

### Vercel Configuration
- Framework: `Vite`
- Root directory: `app/`
- Build command: `npm run build`
- Output directory: `dist/`

## 🐳 8. Docker Deployment (Alternative)

### Quick Start
```bash
# Clone repository
git clone <your-repo>
cd dad-gift

# Set up environment variables
cp .env.example .env
# Edit .env with your values

# Start with Docker Compose
docker-compose up -d
```

### Individual Services
```bash
# Backend only
docker build -t dad-gift-backend ./service
docker run -p 3002:3002 --env-file ./service/.env dad-gift-backend

# Frontend only  
docker build -t dad-gift-frontend ./app
docker run -p 3000:80 dad-gift-frontend
```

## 🔐 9. Security Checklist

- [ ] Use strong JWT secret (minimum 32 characters)
- [ ] Enable HTTPS in production
- [ ] Set up CORS correctly
- [ ] Use environment variables for all secrets
- [ ] Enable rate limiting
- [ ] Set up proper error handling
- [ ] Use secure headers (already configured)

## 📊 10. Monitoring & Analytics

### Health Checks
- Backend health: `https://your-backend.railway.app/api/health`
- Readiness: `https://your-backend.railway.app/api/health/ready`
- Liveness: `https://your-backend.railway.app/api/health/live`

### Performance Monitoring
- Built-in analytics tracking
- Performance metrics collection
- Error tracking and reporting

## 🎯 11. Custom Domain (Optional)

### Vercel Custom Domain
1. Go to your project settings
2. Add your domain
3. Configure DNS records as instructed

### Railway Custom Domain
1. Go to your service settings
2. Add custom domain
3. Configure DNS records

## 🚀 12. Deployment Commands

### Quick Deploy Script
```bash
#!/bin/bash
# Deploy Dad's Gift

echo "🏗️ Building and deploying Dad's Gift..."

# Backend deployment
echo "📦 Deploying backend to Railway..."
cd service
git add .
git commit -m "Deploy backend updates"
git push

# Frontend deployment  
echo "⚡ Deploying frontend to Vercel..."
cd ../app
vercel --prod

echo "✅ Deployment complete!"
echo "🌐 Frontend: https://your-app.vercel.app"
echo "🔧 Backend: https://your-app.railway.app"
```

## 🎁 13. Post-Deployment

1. **Test all functionality**:
   - User registration/login
   - Property browsing
   - Search functionality
   - Favorites system
   - Admin dashboard
   - Chatbot integration

2. **Performance optimization**:
   - Monitor loading times
   - Check mobile responsiveness
   - Test PWA installation

3. **SEO setup**:
   - Submit sitemap to Google
   - Set up Google Analytics (optional)
   - Configure social media previews

## 🆘 Troubleshooting

### Common Issues

**CORS Errors**
```bash
# Add your frontend URL to CORS whitelist in backend
FRONTEND_URL=https://your-app.vercel.app
```

**Database Connection Failed**
- Check MongoDB Atlas IP whitelist
- Verify connection string format
- Ensure database user has proper permissions

**Build Failures**
- Check Node.js version compatibility
- Verify all environment variables are set
- Review build logs for specific errors

**Environment Variables Not Loading**
- Ensure .env files are properly formatted
- Check variable names match exactly
- Restart services after updating variables

## 🎉 Success!

Your Dad's Gift real estate platform is now live! 🏡

- **Frontend**: https://your-app.vercel.app
- **Backend API**: https://your-app.railway.app
- **Admin Dashboard**: https://your-app.vercel.app/admin

---

*Made with ❤️ for Dad using 100% free cloud services!* 