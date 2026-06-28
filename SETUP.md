# FAST Multan OS - Quick Setup Guide

## Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- A Firebase account

## Step-by-Step Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Firebase

#### Create a Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Enter "FAST Multan OS" as project name
4. Follow the setup wizard

#### Enable Authentication
1. In Firebase Console, go to **Authentication** > **Sign-in method**
2. Enable **Email/Password** authentication
3. Click **Save**

#### Create Firestore Database
1. In Firebase Console, go to **Firestore Database**
2. Click **Create database**
3. Choose **Start in test mode** (for development)
4. Select your preferred location
5. Click **Enable**

#### Get Firebase Configuration
1. In Firebase Console, go to **Project Settings** (gear icon)
2. Scroll down to "Your apps" section
3. Click the **Web** icon (`</>`)
4. Register your app with name "FAST Multan OS"
5. Copy the configuration object

#### Update config.js
1. Open `src/firebase/config.js`
2. Replace placeholder values with your Firebase config:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSy...",                    // Your API key
  authDomain: "fast-multan-os.firebaseapp.com",
  projectId: "fast-multan-os",
  storageBucket: "fast-multan-os.firebasestorage.app",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
```

### 3. Run Development Server
```bash
npm run dev
```

The application will open at `http://localhost:5173`

### 4. Test the Application

#### Create an Account
1. Click **Sign Up**
2. Enter your email (e.g., `student@nu.edu.pk`)
3. Create a password (minimum 6 characters)
4. Click **Sign Up**

#### Explore Features
After signing in, you'll have access to:
- ✅ **Dashboard** - Overview and statistics
- ✅ **Events** - Browse university events
- ✅ **Study Groups** - Join or create study groups
- ✅ **Alumni** - Connect with alumni
- ✅ **Faculty** - View faculty directory
- ✅ **Complaint** - Submit complaints
- ✅ **Campus Map** - Navigate the campus

## Available Scripts

### Development
```bash
npm run dev
```
Starts the development server at `http://localhost:5173`

### Build
```bash
npm run build
```
Creates an optimized production build in the `dist` folder

### Preview
```bash
npm run preview
```
Preview the production build locally

### Lint
```bash
npm run lint
```
Run ESLint to check for code quality issues

## Project Structure
```
fast-multan-os/
├── src/
│   ├── components/        # Reusable components
│   │   ├── Navbar.jsx
│   │   ├── Sidebar.jsx
│   │   └── ProtectedRoute.jsx
│   ├── pages/            # Page components
│   │   ├── SignIn.jsx
│   │   ├── SignUp.jsx
│   │   ├── Dashboard.jsx
│   │   ├── Events.jsx
│   │   ├── StudyGroups.jsx
│   │   ├── Alumni.jsx
│   │   ├── Faculty.jsx
│   │   ├── Complaint.jsx
│   │   └── CampusMap.jsx
│   ├── firebase/         # Firebase configuration
│   │   └── config.js
│   ├── context/          # React context providers
│   │   └── AuthContext.jsx
│   ├── App.jsx           # Main app component with routing
│   ├── main.jsx          # App entry point
│   └── index.css         # Global styles with Tailwind
├── public/               # Static assets
├── tailwind.config.js    # Tailwind configuration
├── postcss.config.js     # PostCSS configuration
├── vite.config.js        # Vite configuration
└── package.json          # Dependencies

```

## Troubleshooting

### Firebase Authentication Error
If you get authentication errors:
1. Verify Firebase config in `src/firebase/config.js`
2. Ensure Email/Password authentication is enabled in Firebase Console
3. Check browser console for specific error messages

### Build Errors
If build fails:
1. Delete `node_modules` folder
2. Delete `package-lock.json`
3. Run `npm install` again
4. Run `npm run build`

### Port Already in Use
If port 5173 is already in use:
1. Close other Vite applications
2. Or change the port in `vite.config.js`

## Next Steps

### Add Real Data
- Connect to Firestore for Events, Study Groups, Alumni, and Faculty data
- Implement CRUD operations for each feature

### Enhance Features
- Add file upload for complaints
- Implement real-time chat in study groups
- Add Google Maps integration for Campus Map
- Create admin dashboard for managing content

### Deploy
Consider deploying to:
- Firebase Hosting
- Vercel
- Netlify

## Support
For issues or questions, please contact the development team.

---
**FAST University Multan** | Built with ❤️ using React + Vite
