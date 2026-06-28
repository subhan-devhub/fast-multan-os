# 🚀 Getting Started with FAST Multan OS

Welcome to FAST Multan OS! This guide will help you get the project up and running in minutes.

## 📋 What You'll Need

- **Node.js** (version 16 or higher) - [Download here](https://nodejs.org/)
- **A code editor** - VS Code recommended
- **A Firebase account** - [Sign up free](https://firebase.google.com/)
- **15 minutes** of your time ⏰

## 🏃‍♂️ Quick Start (5 Steps)

### Step 1: Install Dependencies
Open your terminal in the project folder and run:
```bash
cd fast-multan-os
npm install
```
⏱️ This takes about 2-3 minutes.

### Step 2: Set Up Firebase

1. **Go to** [Firebase Console](https://console.firebase.google.com/)
2. **Click** "Add project"
3. **Name it** "FAST Multan OS"
4. **Disable** Google Analytics (optional for now)
5. **Click** "Create project"

### Step 3: Enable Authentication

1. In your Firebase project, click **"Authentication"** in the left menu
2. Click **"Get started"**
3. Click **"Email/Password"**
4. **Toggle** the first switch to enable
5. Click **"Save"**

### Step 4: Get Your Firebase Config

1. Click the **⚙️ gear icon** (Project Settings) in the left menu
2. Scroll down to **"Your apps"**
3. Click the **`</>`** (Web) icon
4. Enter app name: **"FAST Multan OS"**
5. Click **"Register app"**
6. **Copy** the config object that looks like this:

```javascript
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "fast-multan-os.firebaseapp.com",
  projectId: "fast-multan-os",
  storageBucket: "fast-multan-os.firebasestorage.app",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
```

7. **Open** `src/firebase/config.js` in your code editor
8. **Replace** the placeholder values with your copied config
9. **Save** the file

### Step 5: Start the Development Server

In your terminal, run:
```bash
npm run dev
```

🎉 **Success!** Your browser should open to `http://localhost:5173`

## 🎯 Test Your App

### Create Your First Account

1. Click **"Sign Up"**
2. Enter any email (e.g., `test@student.nu.edu.pk`)
3. Create a password (minimum 6 characters)
4. Click **"Sign Up"**

You should be redirected to the Dashboard! 🎊

### Explore the Features

Click through the sidebar to explore:

- **📊 Dashboard** - Overview and statistics
- **📅 Events** - University events (sample data)
- **📚 Study Groups** - Join study groups (sample data)
- **🎓 Alumni** - Alumni network (sample data)
- **👨‍🏫 Faculty** - Faculty directory (sample data)
- **📝 Complaint** - Submit a complaint (try it!)
- **🗺️ Campus Map** - Campus locations (sample data)

## 📚 Documentation Files

We've created several helpful guides for you:

| File | Purpose |
|------|---------|
| `README.md` | Project overview and features |
| `SETUP.md` | Detailed setup instructions |
| `PROJECT_OVERVIEW.md` | Complete technical documentation |
| `DEPLOYMENT_CHECKLIST.md` | Deploy to production |
| `GETTING_STARTED.md` | This file! Quick start guide |

## 🎨 Customization Tips

### Change Colors
Edit `tailwind.config.js`:
```javascript
colors: {
  primary: {
    DEFAULT: '#003366',  // Change this
    dark: '#003366',     // And this
  },
  // ... more colors
}
```

### Add a New Page

1. **Create** a new file in `src/pages/` (e.g., `NewPage.jsx`)
2. **Copy** the structure from `Dashboard.jsx`
3. **Add** the route in `src/App.jsx`:
```javascript
<Route
  path="/new-page"
  element={
    <ProtectedRoute>
      <NewPage />
    </ProtectedRoute>
  }
/>
```
4. **Add** to sidebar in `src/components/Sidebar.jsx`

### Connect Real Data (Later)

When ready to use real data:
1. Create Firestore database in Firebase Console
2. Add collections: `events`, `studyGroups`, `alumni`, `faculty`
3. Use Firebase SDK to fetch data in your components
4. Replace sample data with real data from Firestore

## 🐛 Troubleshooting

### "Firebase: Error (auth/...)"
- Check your Firebase config in `src/firebase/config.js`
- Ensure Email/Password auth is enabled in Firebase Console

### "npm: command not found"
- Install Node.js from [nodejs.org](https://nodejs.org/)
- Restart your terminal after installation

### Port 5173 already in use
- Close other Vite apps
- Or kill the process using that port

### Build errors
```bash
# Delete and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

## 🆘 Need Help?

1. **Check the docs** - Read `SETUP.md` for detailed instructions
2. **Check console** - Look for error messages in browser console
3. **Google the error** - Most React/Firebase errors are well documented
4. **Ask your team** - Share the error message with your development team

## 🎓 Learning Resources

### New to React?
- [React Official Tutorial](https://react.dev/learn)
- [React Router Docs](https://reactrouter.com/)

### New to Firebase?
- [Firebase Getting Started](https://firebase.google.com/docs/web/setup)
- [Firebase Authentication](https://firebase.google.com/docs/auth/web/start)

### New to Tailwind CSS?
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Tailwind CSS Tutorial](https://www.youtube.com/watch?v=UBOj6rqRUME)

## ✅ Next Steps

Now that you're up and running:

### For Development
- [ ] Read through `PROJECT_OVERVIEW.md`
- [ ] Explore the code in `src/` folder
- [ ] Try modifying a component
- [ ] Add some sample data to Firebase

### For Production
- [ ] Read `DEPLOYMENT_CHECKLIST.md`
- [ ] Set up Firestore database
- [ ] Add real data
- [ ] Deploy to Firebase Hosting/Vercel/Netlify

### For Learning
- [ ] Understand the authentication flow
- [ ] Learn how protected routes work
- [ ] Study the Tailwind classes used
- [ ] Explore React Context (AuthContext)

## 🎉 You're Ready!

You now have a fully functional university portal! The app includes:

✅ Complete authentication system  
✅ 9 different pages  
✅ Mobile responsive design  
✅ Modern UI with Tailwind CSS  
✅ Protected routes  
✅ Firebase integration  
✅ Production-ready structure  

**Happy coding!** 🚀

---

**Questions?** Check out the other documentation files or contact your development team.

**FAST University Multan** | Built with ❤️
