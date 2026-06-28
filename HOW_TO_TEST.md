# 🚀 HOW TO TEST THE MOCK UI

## ⚠️ IMPORTANT: You're Getting Firebase Errors!

If you see an error like:
```
Failed to create account: Firebase: Error (auth/api-key-not-valid.-please-pass-a-valid-api-key.)
```

**This means you're on the REAL authentication pages that require Firebase!**

## ✅ SOLUTION: Use the Mock Pages Instead

### Option 1: Test Landing Page (Recommended)
Go to: **`http://localhost:5174/test`**

This page has big buttons to easily navigate to the mock testing pages.

### Option 2: Direct URLs
Manually type these URLs in your browser:

**Sign In Mock:**
```
http://localhost:5174/signin-mock
```

**Sign Up Mock:**
```
http://localhost:5174/signup-mock
```

## 🎯 What's the Difference?

### Real Pages (❌ DON'T USE for UI testing)
- `/` - Real Sign In (needs Firebase)
- `/signup` - Real Sign Up (needs Firebase)
- **Will show Firebase errors if not configured**

### Mock Pages (✅ USE for UI testing)
- `/signin-mock` - Mock Sign In (no Firebase needed)
- `/signup-mock` - Mock Sign Up (no Firebase needed)
- **Perfect for testing UI without backend**

## 🔑 Test Credentials for Mock Pages

**Email:** `test@student.nu.edu.pk`
**Password:** `password123`

Or use any email ending with:
- `@student.nu.edu.pk`
- `@nu.edu.pk`

And any password with 6+ characters.

## 📝 Quick Steps

1. Open browser to: `http://localhost:5174/test`
2. Click "Sign In Mock" or "Sign Up Mock" button
3. Enter test credentials
4. Submit form
5. Should redirect to dashboard after 1 second

## 🐛 Still Having Issues?

Make sure:
- Dev server is running (`npm run dev`)
- You're using the `/signin-mock` or `/signup-mock` URLs
- NOT using `/` or `/signup` (those need Firebase)

---

**Remember:** The MOCK pages look identical but don't need Firebase! 🎨
