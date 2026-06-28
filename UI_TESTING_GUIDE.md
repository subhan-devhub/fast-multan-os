# UI Testing Guide - Mock Sign In & Sign Up

This guide will help you test the Sign In and Sign Up pages without requiring Firebase authentication.

## 🚀 Getting Started

### Start the Development Server

```bash
cd fast-multan-os
npm run dev
```

The app will run on `http://localhost:5173` (or the port shown in your terminal).

## 🧪 Mock Testing Routes

### Sign In Mock
**URL:** `http://localhost:5173/signin-mock`

### Sign Up Mock
**URL:** `http://localhost:5173/signup-mock`

## ✅ Test Scenarios

### **Sign In Page Tests**

1. **Valid Login**
   - Email: `test.user@student.nu.edu.pk`
   - Password: `password123`
   - ✅ Expected: Successfully navigates to dashboard after 1 second

2. **Invalid Email Domain**
   - Email: `test@gmail.com`
   - Password: `password123`
   - ❌ Expected: Error message "Please use your FAST-NUCES email address"

3. **Short Password**
   - Email: `test@student.nu.edu.pk`
   - Password: `12345` (less than 6 characters)
   - ❌ Expected: Error message "Password must be at least 6 characters"

4. **Empty Fields**
   - Leave fields empty and submit
   - ❌ Expected: Browser validation (required field message)

5. **Loading State**
   - Submit valid credentials
   - ✅ Expected: Button shows "Signing in..." and is disabled for 1 second

### **Sign Up Page Tests**

1. **Valid Registration**
   - Email: `new.user@student.nu.edu.pk`
   - Password: `password123`
   - Confirm Password: `password123`
   - ✅ Expected: Successfully navigates to dashboard after 1 second

2. **Password Mismatch**
   - Email: `test@student.nu.edu.pk`
   - Password: `password123`
   - Confirm Password: `password456`
   - ❌ Expected: Error message "Passwords do not match"

3. **Short Password**
   - Email: `test@student.nu.edu.pk`
   - Password: `12345`
   - Confirm Password: `12345`
   - ❌ Expected: Error message "Password must be at least 6 characters"

4. **Invalid Email Domain**
   - Email: `test@gmail.com`
   - Password: `password123`
   - Confirm Password: `password123`
   - ❌ Expected: Error message "Please use your FAST-NUCES email address"

5. **Loading State**
   - Submit valid credentials
   - ✅ Expected: Button shows "Creating Account..." and is disabled for 1 second

## 🎨 UI Elements to Test

### Both Pages
- [ ] Page layout is centered and responsive
- [ ] Forms have proper spacing and alignment
- [ ] Input fields have focus states (blue ring on focus)
- [ ] Buttons change color on hover
- [ ] Error messages display in red alert boxes
- [ ] Mock mode banner is visible (yellow box)
- [ ] Test credentials/instructions box is visible (blue box)
- [ ] Links between Sign In and Sign Up work correctly

### Sign In Page
- [ ] Email input has placeholder "your.email@student.nu.edu.pk"
- [ ] Password input is masked
- [ ] "Sign In" button is prominent
- [ ] Link to Sign Up page works

### Sign Up Page
- [ ] All three input fields render correctly
- [ ] Confirm password field matches password field styling
- [ ] "Sign Up" button is prominent
- [ ] Link to Sign In page works

## 📱 Responsive Testing

Test on different screen sizes:
1. Desktop (1920px+)
2. Laptop (1024px - 1920px)
3. Tablet (768px - 1024px)
4. Mobile (< 768px)

## 🐛 Things to Check

1. **Form Validation**
   - Required field validation
   - Email format validation
   - Password length validation
   - Password matching validation

2. **User Feedback**
   - Loading states during submission
   - Error messages are clear and visible
   - Success indication (navigation to dashboard)

3. **Navigation**
   - Links between Sign In and Sign Up work
   - Navigation after successful submission works

4. **Accessibility**
   - Labels are associated with inputs
   - Inputs have proper `id` and `htmlFor` attributes
   - Form can be submitted with Enter key
   - Tab navigation works properly

## 📝 Test Credentials

### Valid Email Formats
- `anything@student.nu.edu.pk`
- `anything@nu.edu.pk`

### Valid Password
- Any password with 6 or more characters

## 🔄 Switching Between Mock and Real Auth

### Mock Pages (Testing)
- `/signin-mock` - No Firebase required
- `/signup-mock` - No Firebase required

### Real Pages (Production)
- `/` - Real Firebase authentication
- `/signup` - Real Firebase authentication

## 💡 Tips

1. Open browser DevTools Console to see mock sign in/up logs
2. Check localStorage for `mockUser` entry after successful mock login
3. The 1-second delay simulates real API calls
4. Mock pages won't affect your Firebase data

## 🎯 Next Steps

After UI testing is complete:
1. Test real authentication with Firebase (ensure Firebase is configured)
2. Test protected routes functionality
3. Test logout functionality
4. Test session persistence

---

Happy Testing! 🚀
