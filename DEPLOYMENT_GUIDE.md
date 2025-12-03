# Pub Crawler Backend - Deployment Guide

This is a **serverless backend** for your Historic Pub Crawler app that:
- ✅ Hides your Google Maps API key (secure)
- ✅ Requires user authentication
- ✅ Completely FREE hosting on Netlify
- ✅ No credit card required

---

## Part 1: Deploy to Netlify (5 Minutes)

### Step 1: Create Netlify Account

1. Go to: https://www.netlify.com/
2. Click **"Sign up"**
3. Sign up with **GitHub** (easiest option)
4. Authorize Netlify to access GitHub

### Step 2: Deploy Your Backend

**Option A: Drag & Drop (Easiest)**

1. Go to: https://app.netlify.com/drop
2. **Drag the entire `pub-crawler-backend` folder** onto the upload area
3. Wait for deployment (takes ~1 minute)
4. Netlify will give you a URL like: `https://random-name-12345.netlify.app`

**Option B: Connect to GitHub (Recommended for Updates)**

1. Push this folder to a new GitHub repository
2. In Netlify dashboard, click **"Add new site" → "Import an existing project"**
3. Choose **GitHub**
4. Select your `pub-crawler-backend` repository
5. Click **"Deploy site"**

### Step 3: Configure Your Google Maps API Key

**CRITICAL: This keeps your API key secret!**

1. In Netlify dashboard, go to your site
2. Click **"Site settings"**
3. In the left sidebar, click **"Environment variables"**
4. Click **"Add a variable"**
5. Add:
   - **Key:** `GOOGLE_MAPS_API_KEY`
   - **Value:** Your actual Google Maps API key
6. Click **"Create variable"**

### Step 4: Test Your Backend

1. Note your Netlify URL (e.g., `https://your-site.netlify.app`)
2. Visit: `https://your-site.netlify.app` in your browser
3. You should see the API documentation page

**Your backend is now live!** 🎉

---

## Part 2: Set Up Firebase Authentication

### Step 1: Create Firebase Project

1. Go to: https://console.firebase.google.com/
2. Click **"Add project"**
3. Name: **"pub-crawler"**
4. Disable Google Analytics (not needed)
5. Click **"Create project"**

### Step 2: Enable Email/Password Authentication

1. In Firebase Console, click **"Authentication"** in left sidebar
2. Click **"Get started"**
3. Click on **"Email/Password"** provider
4. Toggle **"Enable"** to ON
5. Click **"Save"**

### Step 3: Register Your Web App

1. In Firebase Console, click the **gear icon** (⚙️) → **"Project settings"**
2. Scroll down to **"Your apps"**
3. Click the **web icon** (`</>`)
4. App nickname: **"Pub Crawler Web"**
5. Check **"Also set up Firebase Hosting"** (optional)
6. Click **"Register app"**
7. **Copy the Firebase config** - you'll need this!

It looks like:
```javascript
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};
```

**Save this config somewhere safe!**

---

## Part 3: Update Your Web App

Now you need to modify your pub crawler web app to:
1. Add login/register functionality
2. Call your Netlify backend instead of Google Maps directly

### Files You Need to Modify:

**In your `pub-crawler` repository:**

1. **Add Firebase to your HTML** (`index.html`)
2. **Create login page** (new file: `login.html`)
3. **Update API calls** to use your Netlify backend

### Detailed Code Changes:

#### 1. Update `index.html` - Add Firebase SDK

Add this before the closing `</body>` tag:

```html
<!-- Firebase SDK -->
<script src="https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/10.7.0/firebase-auth-compat.js"></script>

<script>
// Your Firebase config (from Step 3 above)
const firebaseConfig = {
  apiKey: "YOUR_API_KEY_HERE",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Check if user is logged in
firebase.auth().onAuthStateChanged((user) => {
  if (user) {
    console.log('User logged in:', user.email);
    // User is signed in
  } else {
    // Redirect to login page
    window.location.href = 'login.html';
  }
});
</script>
```

#### 2. Create `login.html` - Login/Register Page

Create a new file `login.html` in your pub-crawler repository:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login - Pub Crawler</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            margin: 0;
        }
        .login-container {
            background: white;
            padding: 40px;
            border-radius: 10px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.2);
            width: 100%;
            max-width: 400px;
        }
        h1 {
            text-align: center;
            color: #333;
            margin-bottom: 30px;
        }
        input {
            width: 100%;
            padding: 12px;
            margin: 10px 0;
            border: 1px solid #ddd;
            border-radius: 5px;
            box-sizing: border-box;
            font-size: 16px;
        }
        button {
            width: 100%;
            padding: 12px;
            margin: 10px 0;
            border: none;
            border-radius: 5px;
            font-size: 16px;
            cursor: pointer;
            transition: background 0.3s;
        }
        .btn-login {
            background: #667eea;
            color: white;
        }
        .btn-login:hover {
            background: #5568d3;
        }
        .btn-register {
            background: #48bb78;
            color: white;
        }
        .btn-register:hover {
            background: #38a169;
        }
        .error {
            color: red;
            margin: 10px 0;
            display: none;
        }
        .success {
            color: green;
            margin: 10px 0;
            display: none;
        }
        .toggle-text {
            text-align: center;
            margin-top: 20px;
            color: #666;
        }
        .toggle-text a {
            color: #667eea;
            cursor: pointer;
            text-decoration: none;
        }
    </style>
</head>
<body>
    <div class="login-container">
        <h1>🍺 Pub Crawler</h1>
        
        <div id="login-form">
            <h2>Login</h2>
            <input type="email" id="login-email" placeholder="Email" required>
            <input type="password" id="login-password" placeholder="Password" required>
            <button class="btn-login" onclick="login()">Login</button>
            <div class="error" id="login-error"></div>
            <div class="toggle-text">
                Don't have an account? <a onclick="showRegister()">Register</a>
            </div>
        </div>

        <div id="register-form" style="display: none;">
            <h2>Register</h2>
            <input type="email" id="register-email" placeholder="Email" required>
            <input type="password" id="register-password" placeholder="Password (min 6 characters)" required>
            <input type="password" id="register-confirm" placeholder="Confirm Password" required>
            <button class="btn-register" onclick="register()">Register</button>
            <div class="error" id="register-error"></div>
            <div class="success" id="register-success"></div>
            <div class="toggle-text">
                Already have an account? <a onclick="showLogin()">Login</a>
            </div>
        </div>
    </div>

    <!-- Firebase SDK -->
    <script src="https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js"></script>
    <script src="https://www.gstatic.com/firebasejs/10.7.0/firebase-auth-compat.js"></script>

    <script>
        // Your Firebase config (same as in index.html)
        const firebaseConfig = {
          apiKey: "YOUR_API_KEY_HERE",
          authDomain: "your-project.firebaseapp.com",
          projectId: "your-project",
          storageBucket: "your-project.appspot.com",
          messagingSenderId: "123456789",
          appId: "1:123456789:web:abcdef123456"
        };

        firebase.initializeApp(firebaseConfig);

        function showRegister() {
            document.getElementById('login-form').style.display = 'none';
            document.getElementById('register-form').style.display = 'block';
        }

        function showLogin() {
            document.getElementById('register-form').style.display = 'none';
            document.getElementById('login-form').style.display = 'block';
        }

        async function login() {
            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;
            const errorDiv = document.getElementById('login-error');

            try {
                await firebase.auth().signInWithEmailAndPassword(email, password);
                window.location.href = 'index.html';
            } catch (error) {
                errorDiv.style.display = 'block';
                errorDiv.textContent = error.message;
            }
        }

        async function register() {
            const email = document.getElementById('register-email').value;
            const password = document.getElementById('register-password').value;
            const confirm = document.getElementById('register-confirm').value;
            const errorDiv = document.getElementById('register-error');
            const successDiv = document.getElementById('register-success');

            errorDiv.style.display = 'none';
            successDiv.style.display = 'none';

            if (password !== confirm) {
                errorDiv.style.display = 'block';
                errorDiv.textContent = 'Passwords do not match';
                return;
            }

            if (password.length < 6) {
                errorDiv.style.display = 'block';
                errorDiv.textContent = 'Password must be at least 6 characters';
                return;
            }

            try {
                await firebase.auth().createUserWithEmailAndPassword(email, password);
                successDiv.style.display = 'block';
                successDiv.textContent = 'Account created! Redirecting...';
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 2000);
            } catch (error) {
                errorDiv.style.display = 'block';
                errorDiv.textContent = error.message;
            }
        }
    </script>
</body>
</html>
```

#### 3. Update API Calls to Use Your Backend

In your main app JavaScript, replace Google Maps API calls with your Netlify backend:

**OLD CODE (Direct to Google):**
```javascript
fetch(`https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=5000&type=bar&key=${apiKey}`)
```

**NEW CODE (Through your secure backend):**
```javascript
// Get user's Firebase token
const user = firebase.auth().currentUser;
const token = await user.getIdToken();

// Call your Netlify backend
fetch('https://your-site.netlify.app/.netlify/functions/search-places', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    location: `${lat},${lng}`,
    radius: 5000,
    type: 'bar'
  })
})
```

---

## Part 4: Testing

### Test Locally:

1. Open your updated `pub-crawler` web app
2. You should be redirected to `login.html`
3. Register a new account
4. Login
5. App should work normally, but now using your secure backend!

### Test on Phone:

1. Push your updated code to GitHub
2. GitHub Pages will update automatically
3. Open the Android app
4. It will load the updated web app with login

---

## Summary

You now have:
- ✅ **Secure backend** on Netlify (FREE)
- ✅ **User authentication** with Firebase (FREE)
- ✅ **Hidden API key** (secure)
- ✅ **No command line setup needed!**

## Your URLs:

- **Backend API:** `https://your-site.netlify.app`
- **Web App:** `https://markjsjewell.github.io/pub-crawler/`
- **Android App:** Loads the web app automatically

---

## Need Help?

If you get stuck:
1. Check Netlify function logs: Site → Functions → View logs
2. Check browser console for errors (F12)
3. Verify Firebase config is correct
4. Make sure environment variable is set in Netlify

---

## Next Steps:

1. Deploy this backend to Netlify
2. Set up Firebase authentication
3. Update your web app with login page
4. Update API calls to use your backend
5. Test everything!

Good luck! 🚀
