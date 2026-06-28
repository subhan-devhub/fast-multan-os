# 🧪 Mock UI Testing - Quick Access URLs

## Development Server
**Server is running at:** `http://localhost:5174/`

## 🎯 Mock Testing Pages

### Sign In Mock (Test Without Firebase)
```
http://localhost:5174/signin-mock
```

### Sign Up Mock (Test Without Firebase)
```
http://localhost:5174/signup-mock
```

## 🔑 Test Credentials

### Quick Test Account
- **Email:** `test@student.nu.edu.pk`
- **Password:** `password123`

### Valid Email Formats
- `anything@student.nu.edu.pk`
- `anything@nu.edu.pk`

### Password Requirements
- Minimum 6 characters
- For Sign Up: both passwords must match

## ✅ Quick Test Checklist

### Sign In Page (`/signin-mock`)
- [ ] Page loads with centered form
- [ ] Yellow "Mock Mode" banner visible
- [ ] Blue test credentials box visible
- [ ] Enter test credentials and submit
- [ ] Loading state shows ("Signing in...")
- [ ] Redirects to dashboard after 1 second
- [ ] Try invalid email (gmail.com) - should show error
- [ ] Try short password (12345) - should show error

### Sign Up Page (`/signup-mock`)
- [ ] Page loads with centered form
- [ ] All three input fields visible
- [ ] Yellow "Mock Mode" banner visible
- [ ] Blue test instructions box visible
- [ ] Enter valid credentials (matching passwords)
- [ ] Loading state shows ("Creating Account...")
- [ ] Redirects to dashboard after 1 second
- [ ] Try mismatched passwords - should show error
- [ ] Try short password - should show error

### Navigation Links
- [ ] "Sign Up" link on Sign In page → goes to `/signup-mock`
- [ ] "Sign In" link on Sign Up page → goes to `/signin-mock`

## 🎨 Visual Elements to Verify

- **Colors:**
  - Primary color (teal/green) on headings
  - White form background
  - Light background
  - Red error messages
  - Yellow mock mode banner
  - Blue test instructions box

- **Interactions:**
  - Input fields highlight on focus (blue ring)
  - Buttons change color on hover
  - Buttons disabled during loading
  - Link text underlines on hover

## 📱 Responsive Test

Open DevTools and test these widths:
- Mobile: 375px
- Tablet: 768px
- Desktop: 1024px+

Form should remain centered and readable at all sizes.

## 🔄 Real vs Mock Routes

### Production (Real Firebase Auth)
- `/` - Real Sign In
- `/signup` - Real Sign Up

### Testing (Mock Mode)
- `/signin-mock` - Mock Sign In ✅
- `/signup-mock` - Mock Sign Up ✅

---

**Pro Tip:** Open the browser console (F12) to see mock authentication logs!
