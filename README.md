# FAST Multan OS - University Portal

A comprehensive university portal for FAST University Multan built with React, Vite, Tailwind CSS, and Firebase.

## 🚀 Features

- **Authentication**: Secure sign-in and sign-up with Firebase Authentication
- **Dashboard**: Overview of university activities and statistics
- **Events**: Browse and register for university events
- **Study Groups**: Join or create study groups with peers
- **Alumni Network**: Connect with alumni from different batches
- **Faculty Directory**: Access faculty information and contact details
- **Complaint System**: Submit complaints and feedback
- **Campus Map**: Navigate the campus with interactive map

## 🎨 Color Scheme

- Primary Dark Blue: `#003366`
- Secondary Blue: `#0055A5`
- Accent Blue: `#0077CC`
- White: `#FFFFFF`
- Light Background: `#F5F7FA`

## 📁 Project Structure

```
src/
├── components/
│   ├── Navbar.jsx
│   ├── Sidebar.jsx
│   └── ProtectedRoute.jsx
├── pages/
│   ├── SignIn.jsx
│   ├── SignUp.jsx
│   ├── Dashboard.jsx
│   ├── Events.jsx
│   ├── StudyGroups.jsx
│   ├── Alumni.jsx
│   ├── Faculty.jsx
│   ├── Complaint.jsx
│   └── CampusMap.jsx
├── firebase/
│   └── config.js
├── context/
│   └── AuthContext.jsx
└── App.jsx
```

## 🛠️ Tech Stack

- **React** - UI library
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **React Router DOM** - Routing
- **Firebase SDK** - Authentication and database

## 📦 Installation

1. Clone the repository:
```bash
cd fast-multan-os
```

2. Install dependencies:
```bash
npm install
```

3. Configure Firebase:
   - Go to `src/firebase/config.js`
   - Replace placeholder values with your Firebase project credentials:
   ```javascript
   const firebaseConfig = {
     apiKey: "YOUR_API_KEY",
     authDomain: "YOUR_AUTH_DOMAIN",
     projectId: "YOUR_PROJECT_ID",
     storageBucket: "YOUR_STORAGE_BUCKET",
     messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
     appId: "YOUR_APP_ID"
   };
   ```

4. Start the development server:
```bash
npm run dev
```

5. Open your browser and navigate to `http://localhost:5173`

## 🔒 Protected Routes

All pages except Sign In and Sign Up are protected. Users must be authenticated to access:
- Dashboard
- Events
- Study Groups
- Alumni
- Faculty
- Complaint
- Campus Map

If a user tries to access a protected route without being logged in, they will be redirected to the Sign In page.

## 🔥 Firebase Setup

1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Email/Password authentication in Firebase Authentication
3. Create a Firestore database
4. Copy your Firebase config and paste it in `src/firebase/config.js`

## 📱 Mobile Responsive

The entire application is mobile responsive and works seamlessly on all device sizes.

## 🚧 Build for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## 📄 License

This project is created for FAST University Multan.

## 👥 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
