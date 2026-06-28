# 👥 Multiple Mock Users Guide

## 🎉 Multiple Mock Sessions Now Available!

You can now create and manage multiple mock user accounts to test different user scenarios!

---

## 🚀 Quick Start - User Manager

### Access the Mock User Manager
```
http://localhost:5174/mock-users
```

This page lets you:
- ✅ Create multiple test users
- ✅ Switch between user sessions
- ✅ View all registered mock users
- ✅ Delete individual users
- ✅ Clear all users

---

## 📋 Pre-Configured Test Users

Click **"Create Test Users"** in the User Manager to instantly create 3 test accounts:

### Student Account 1
- **Email:** `student1@student.nu.edu.pk`
- **Password:** `password123`
- **Use for:** Regular student testing

### Student Account 2
- **Email:** `student2@student.nu.edu.pk`
- **Password:** `password123`
- **Use for:** Multi-user interactions

### Teacher Account
- **Email:** `teacher@nu.edu.pk`
- **Password:** `password123`
- **Use for:** Faculty perspective testing

---

## 🎯 How to Use Multiple Sessions

### Method 1: User Manager (Easiest)

1. Go to `http://localhost:5174/mock-users`
2. Click **"Create Test Users"** button
3. Click **"Switch"** on any user to sign in as them
4. Automatically redirects to dashboard

### Method 2: Sign Up/Sign In Flow

1. Go to `http://localhost:5174/signup-mock`
2. Create a new account with unique email
3. Logout from navbar
4. Sign in as different user
5. Go to User Manager to see all accounts

---

## 🔄 Switching Between Users

### Quick Switch (User Manager)
1. Go to `/mock-users`
2. Find the user you want
3. Click **"Switch"** button
4. Redirects to dashboard as that user

### Manual Switch (Sign In)
1. Logout from current session (navbar)
2. Go to `/signin-mock`
3. Enter credentials of different user
4. Sign in

---

## ✨ New Features

### 1. Persistent User Storage
- All users stored in `localStorage` under `allMockUsers`
- Users persist across browser sessions
- Each user has unique credentials

### 2. User Tracking
- Created timestamp
- Last login timestamp
- Display name
- Unique ID

### 3. Password Validation
- Each user has their own password
- Sign in validates correct password
- Error shown if password incorrect

### 4. Duplicate Prevention
- Can't create two users with same email
- Sign up shows error if email exists
- Sign in checks existing users first

---

## 📊 Testing Scenarios

### Scenario 1: Multiple Students Joining Study Group
1. Create 3 student accounts
2. Sign in as Student 1
3. Go to Study Groups
4. Switch to Student 2 (via User Manager)
5. Join same study group
6. Compare experiences

### Scenario 2: Student vs Faculty View
1. Create student account and teacher account
2. Sign in as student
3. Explore Events, Faculty pages
4. Switch to teacher account
5. See if UI should differ

### Scenario 3: Testing Session Persistence
1. Sign in as User 1
2. Navigate to different pages
3. Switch to User 2
4. Do some actions
5. Switch back to User 1
6. Verify session restored

### Scenario 4: Testing Logout/Login Flow
1. Create multiple users
2. Sign in as each one
3. Test logout functionality
4. Verify correct redirects
5. Sign back in with correct passwords

---

## 🛠️ User Manager Features

### Create Test Users
- Instantly creates 3 pre-configured accounts
- All use same password: `password123`
- Only creates if they don't exist

### View All Users
- See complete list of registered users
- Shows creation date and last login
- Highlights currently active user

### Switch User
- One-click user switching
- Automatically updates session
- Redirects to dashboard

### Delete User
- Remove individual users
- Confirmation prompt
- Logs out if deleting active user

### Clear All Users
- Remove all mock users at once
- Confirmation prompt
- Complete reset

---

## 💾 Data Storage

### localStorage Keys

```javascript
// Current logged-in user
localStorage.getItem('mockUser')

// All registered users
localStorage.getItem('allMockUsers')
```

### User Object Structure

```javascript
{
  email: "student1@student.nu.edu.pk",
  password: "password123",
  displayName: "student1",
  uid: "mock-1234567890",
  createdAt: "2026-06-22T14:30:00.000Z",
  lastLogin: "2026-06-22T15:45:00.000Z"
}
```

---

## 🧪 Testing Checklist

### Basic Multi-User Testing
- [ ] Create multiple users via User Manager
- [ ] Switch between users
- [ ] Each user maintains separate session
- [ ] Logout works for each user
- [ ] Sign in validates correct password

### User Management Testing
- [ ] Create test users button works
- [ ] Can't create duplicate emails
- [ ] Switch button updates session
- [ ] Delete removes user from list
- [ ] Clear all removes everything

### Session Persistence Testing
- [ ] User 1 signs in
- [ ] Close tab and reopen
- [ ] Still signed in as User 1
- [ ] Switch to User 2
- [ ] Refresh page
- [ ] Still signed in as User 2

### Password Validation Testing
- [ ] Sign up with password
- [ ] Logout
- [ ] Try signing in with wrong password
- [ ] Should show error
- [ ] Sign in with correct password
- [ ] Should succeed

---

## 🎯 Quick Test Workflow

### 5-Minute Quick Test

1. **Setup (1 min)**
   - Go to `/mock-users`
   - Click "Create Test Users"

2. **Test User 1 (1 min)**
   - Switch to `student1@student.nu.edu.pk`
   - Navigate to Events page
   - Go to Study Groups

3. **Test User 2 (1 min)**
   - Go back to `/mock-users`
   - Switch to `student2@student.nu.edu.pk`
   - Navigate to same pages
   - Verify different session

4. **Test Teacher (1 min)**
   - Switch to `teacher@nu.edu.pk`
   - Explore Faculty page
   - Check all features

5. **Cleanup (1 min)**
   - Test logout
   - Verify redirects
   - Done!

---

## 📝 Custom User Creation

### Via Sign Up Page

1. Go to `/signup-mock`
2. Enter custom email (must end with @student.nu.edu.pk or @nu.edu.pk)
3. Enter password (6+ characters)
4. Confirm password
5. Submit
6. User automatically created and logged in
7. Appears in User Manager

### Example Custom Users

```
admin@nu.edu.pk
john.doe@student.nu.edu.pk
jane.smith@student.nu.edu.pk
project.team@nu.edu.pk
```

---

## 🔗 Quick Links

### Essential URLs

| Page | URL |
|------|-----|
| Test Landing | `http://localhost:5174/test` |
| User Manager | `http://localhost:5174/mock-users` |
| Sign Up | `http://localhost:5174/signup-mock` |
| Sign In | `http://localhost:5174/signin-mock` |
| Dashboard | `http://localhost:5174/dashboard-mock` |

---

## 💡 Pro Tips

1. **Use User Manager for Quick Testing**
   - Faster than signing in/out repeatedly
   - One-click switching
   - See all users at once

2. **Create Test Users First**
   - Click "Create Test Users" button
   - Gets you 3 accounts instantly
   - All use same password

3. **Check Console Logs**
   - See which user signed in
   - View total user count
   - Debug any issues

4. **Keep Browser DevTools Open**
   - Monitor localStorage changes
   - See console messages
   - Check user data

5. **Bookmark User Manager**
   - Quick access to switch users
   - Easy user management
   - Central testing hub

---

## 🎉 Ready to Test!

Start here: **http://localhost:5174/mock-users**

Create your test users and start testing multiple sessions! 🚀
