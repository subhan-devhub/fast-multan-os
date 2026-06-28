# ⚡ Quick Reference Card

## 🚀 Common Commands

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linter
npm run lint
```

## 📁 Important Files

| File | Purpose |
|------|---------|
| `src/firebase/config.js` | **Add Firebase credentials here** |
| `src/App.jsx` | Main routing configuration |
| `src/context/AuthContext.jsx` | Authentication state management |
| `tailwind.config.js` | Colors and Tailwind settings |

## 🎨 Color Variables

Use these in your Tailwind classes:

```jsx
// Primary Dark Blue (#003366)
className="bg-primary text-primary border-primary"

// Secondary Blue (#0055A5)
className="bg-secondary text-secondary border-secondary"

// Accent Blue (#0077CC)
className="bg-accent text-accent border-accent"

// Light Background (#F5F7FA)
className="bg-light-bg"
```

## 🔐 Authentication Functions

Available from `useAuth()` hook:

```jsx
import { useAuth } from '../context/AuthContext';

const { currentUser, login, signup, logout } = useAuth();

// Sign up
await signup(email, password);

// Sign in
await login(email, password);

// Sign out
await logout();

// Get current user
console.log(currentUser.email);
```

## 🛣️ Routes

| Path | Component | Protected |
|------|-----------|-----------|
| `/` | SignIn | No |
| `/signup` | SignUp | No |
| `/dashboard` | Dashboard | Yes |
| `/events` | Events | Yes |
| `/study-groups` | StudyGroups | Yes |
| `/alumni` | Alumni | Yes |
| `/faculty` | Faculty | Yes |
| `/complaint` | Complaint | Yes |
| `/campus-map` | CampusMap | Yes |

## 🔧 How to Add a New Page

1. **Create page file** in `src/pages/`:
```jsx
// src/pages/MyNewPage.jsx
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';

const MyNewPage = () => {
  return (
    <div className="min-h-screen bg-light-bg">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-8">
          <h1 className="text-3xl font-bold text-primary">My New Page</h1>
          {/* Your content here */}
        </main>
      </div>
    </div>
  );
};

export default MyNewPage;
```

2. **Add route** in `src/App.jsx`:
```jsx
import MyNewPage from './pages/MyNewPage';

// Inside <Routes>
<Route
  path="/my-new-page"
  element={
    <ProtectedRoute>
      <MyNewPage />
    </ProtectedRoute>
  }
/>
```

3. **Add to sidebar** in `src/components/Sidebar.jsx`:
```jsx
const menuItems = [
  // ... existing items
  { path: '/my-new-page', label: 'My New Page', icon: '✨' },
];
```

## 🔥 Firebase Setup (Quick)

1. Go to [console.firebase.google.com](https://console.firebase.google.com)
2. Create project → Enable Email/Password auth
3. Copy config → Paste in `src/firebase/config.js`
4. Done!

## 📱 Responsive Design Breakpoints

```jsx
// Mobile first (default)
className="w-full"

// Tablet (768px+)
className="md:w-1/2"

// Desktop (1024px+)
className="lg:w-1/3"

// Large Desktop (1280px+)
className="xl:w-1/4"
```

## 🎯 Common Patterns

### Protected Page Template
```jsx
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';

const MyPage = () => {
  return (
    <div className="min-h-screen bg-light-bg">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-8">
          {/* Content */}
        </main>
      </div>
    </div>
  );
};
```

### Form with State
```jsx
const [formData, setFormData] = useState({
  field1: '',
  field2: '',
});

const handleChange = (e) => {
  setFormData({
    ...formData,
    [e.target.name]: e.target.value,
  });
};

const handleSubmit = async (e) => {
  e.preventDefault();
  // Handle submission
};
```

### Button Styles
```jsx
// Primary button
<button className="bg-primary hover:bg-secondary text-white px-4 py-2 rounded-md transition-colors">
  Click Me
</button>

// Secondary button
<button className="bg-secondary hover:bg-accent text-white px-4 py-2 rounded-md transition-colors">
  Click Me
</button>

// Accent button
<button className="bg-accent hover:bg-accent-blue text-white px-4 py-2 rounded-md transition-colors">
  Click Me
</button>
```

### Card Layout
```jsx
<div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
  <h3 className="text-xl font-bold text-primary mb-2">Card Title</h3>
  <p className="text-gray-600">Card content</p>
</div>
```

## 🐛 Quick Troubleshooting

| Problem | Solution |
|---------|----------|
| Firebase error | Check `src/firebase/config.js` credentials |
| Port in use | Use different port or close other Vite apps |
| Module not found | Run `npm install` |
| Build fails | Delete `node_modules`, run `npm install` |
| Not redirecting | Check `ProtectedRoute.jsx` logic |

## 📚 Documentation Files

| File | When to Read |
|------|--------------|
| `GETTING_STARTED.md` | **Start here!** First time setup |
| `SETUP.md` | Detailed instructions |
| `PROJECT_OVERVIEW.md` | Technical deep dive |
| `DEPLOYMENT_CHECKLIST.md` | Before deploying |
| `PROJECT_SUMMARY.txt` | Complete overview |
| `QUICK_REFERENCE.md` | This file! |

## 🌐 URLs

- **Dev Server**: `http://localhost:5173`
- **Firebase Console**: `https://console.firebase.google.com`
- **React Docs**: `https://react.dev`
- **Tailwind Docs**: `https://tailwindcss.com`
- **Vite Docs**: `https://vite.dev`

## 💡 Pro Tips

1. **Always** use `useAuth()` for authentication state
2. **Always** wrap protected pages with `<ProtectedRoute>`
3. **Always** include Navbar and Sidebar in protected pages
4. Use Tailwind classes instead of custom CSS
5. Keep components small and focused
6. Test on mobile devices early

## 🔑 Important Concepts

### Context API
Auth state is managed globally using React Context:
```jsx
const { currentUser } = useAuth();
```

### Protected Routes
Automatically redirect to login if not authenticated:
```jsx
<ProtectedRoute>
  <YourPage />
</ProtectedRoute>
```

### Firebase Auth
All auth handled by Firebase SDK:
- signup() → Create account
- login() → Sign in
- logout() → Sign out
- currentUser → Current user object

## ✅ Pre-Launch Checklist

- [ ] Firebase credentials configured
- [ ] Test signup/login/logout
- [ ] All pages accessible
- [ ] Test on mobile
- [ ] No console errors
- [ ] Forms work correctly
- [ ] Navigation works
- [ ] Build succeeds (`npm run build`)

## 🚢 Deploy Quick Commands

### Firebase Hosting
```bash
npm install -g firebase-tools
firebase login
firebase init hosting
npm run build
firebase deploy
```

### Vercel
```bash
npm install -g vercel
vercel
```

### Netlify
```bash
npm install -g netlify-cli
npm run build
netlify deploy --prod --dir=dist
```

---

**Keep this file handy for quick reference!** 📌

For detailed help, see the full documentation files.
