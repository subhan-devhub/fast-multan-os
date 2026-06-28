# 🚀 Quick Start - Mock Mode Testing

## 3 Simple Steps to Start Testing

### 1️⃣ Open Browser
```
http://localhost:5174/test
```

### 2️⃣ Sign In
Click **"Sign In Mock"** and enter:
- **Email:** `test@student.nu.edu.pk`
- **Password:** `password123`

### 3️⃣ Explore Everything!
Navigate using the sidebar to test all pages.

---

## 📍 Direct URLs (Copy & Paste)

### Start Here
```
http://localhost:5174/test
```

### Authentication
```
http://localhost:5174/signin-mock
http://localhost:5174/signup-mock
```

### After Login (All Protected Pages Work)
```
http://localhost:5174/dashboard-mock
http://localhost:5174/events-mock
http://localhost:5174/study-groups-mock
http://localhost:5174/alumni-mock
http://localhost:5174/faculty-mock
http://localhost:5174/complaint-mock
http://localhost:5174/campus-map-mock
```

---

## ✅ What Works

- ✅ Full authentication (Sign In/Sign Up/Logout)
- ✅ Protected routes (redirects if not logged in)
- ✅ All pages accessible after login
- ✅ Sidebar navigation
- ✅ Session persistence (stays logged in on refresh)
- ✅ Form validation
- ✅ No Firebase required!

---

## 🎯 Test This

1. **Sign Up** with any @student.nu.edu.pk email
2. **Navigate** through all pages using sidebar
3. **Logout** using button in navbar
4. **Refresh** page - should stay logged in
5. **Try protected page** while logged out - should redirect

---

## 💡 Remember

- All URLs must end with **`-mock`**
- Use emails ending with **`@student.nu.edu.pk`** or **`@nu.edu.pk`**
- Password must be **6+ characters**
- Look for **yellow "MOCK" badge** in navbar to confirm mock mode

---

**Ready? Go to: http://localhost:5174/test**
