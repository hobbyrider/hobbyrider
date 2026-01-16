# OAuth & Magic Link Setup Guide

## Overview

The app now supports three authentication methods:
1. **Google OAuth** - One-click sign in with Google
2. **Magic Link (Email)** - Passwordless authentication via email
3. **Email/Password** - Traditional credentials (existing)

## Quick Setup

### Google OAuth

1. **Create Google OAuth Credentials:**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing
   - Navigate to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "OAuth 2.0 Client ID"
   - Application type: "Web application"
   - Authorized redirect URIs:
     - Local: `http://localhost:3000/api/auth/callback/google`
     - Production: `https://hobbyrider.vercel.app/api/auth/callback/google`
   - Copy the Client ID and Client Secret

2. **Add to Environment Variables:**
   ```bash
   GOOGLE_CLIENT_ID=your_client_id_here
   GOOGLE_CLIENT_SECRET=your_client_secret_here
   ```

### Magic Link (Email) - Resend (Recommended)

1. **Sign up for Resend:**
   - Go to [resend.com](https://resend.com)
   - Sign up for free account
   - Free tier: 3,000 emails/month

2. **Verify Domain (Production):**
   - Add your domain in Resend dashboard
   - Add DNS records as instructed
   - Or use test domain for development

3. **Get API Key:**
   - Go to API Keys section
   - Create new API key
   - Copy the key

4. **Add to Environment Variables:**
   ```bash
   RESEND_API_KEY=re_your_api_key_here
   SMTP_FROM=noreply@yourdomain.com
   ```

### Magic Link (Email) - SMTP Alternative

If you prefer SMTP instead of Resend:

1. **Gmail Setup:**
   - Enable 2-factor authentication
   - Generate App Password: [Google Account Settings](https://myaccount.google.com/apppasswords)
   - Use your email and app password

2. **Add to Environment Variables:**
   ```bash
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your_email@gmail.com
   SMTP_PASSWORD=your_app_password
   SMTP_FROM=noreply@yourdomain.com
   ```

## Local Development

Add to `.env.local`:
```bash
# Required
DATABASE_URL=your_database_url
NEXTAUTH_SECRET=your_secret
NEXTAUTH_URL=http://localhost:3000

# Google OAuth (optional)
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret

# Magic Link - Resend (recommended)
RESEND_API_KEY=re_your_key
SMTP_FROM=noreply@yourdomain.com

# OR Magic Link - SMTP (alternative)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_password
SMTP_FROM=noreply@yourdomain.com
```

## Production (Vercel)

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add all required variables (see above)
3. Redeploy after adding variables

## How It Works

### Google OAuth
- User clicks "Continue with Google"
- Redirects to Google sign-in
- Google redirects back with user info
- Account is created/linked automatically
- Username is auto-generated from email if needed

### Magic Link
- User enters email and clicks "Send Magic Link"
- Email is sent with sign-in link
- User clicks link in email
- Automatically signed in
- Account is created if it doesn't exist
- Username is auto-generated from email

### Email/Password
- Traditional sign up/login
- User creates account with username/password
- Works as before

## User Experience

**Sign Up:**
1. Click "Sign up"
2. Choose: Google OAuth, Magic Link, or Password
3. If Magic Link: Enter email → Check inbox → Click link
4. If Google: Click button → Authorize → Done
5. If Password: Fill form → Submit

**Sign In:**
1. Click "Login"
2. Choose: Google OAuth, Magic Link, or Password
3. Same flow as sign up

## Benefits

- **Faster:** No password to remember
- **Secure:** OAuth uses industry-standard security
- **Convenient:** Magic link works on any device
- **Flexible:** All three methods available

## Troubleshooting

**Google OAuth not working:**
- Check redirect URI matches exactly
- Verify Client ID and Secret are correct
- Check OAuth consent screen is configured

**Magic Link not sending:**
- Verify Resend API key is correct
- Check SMTP_FROM is a verified domain
- For SMTP: Verify credentials and port
- Check spam folder

**Username not generated:**
- OAuth/Magic Link users get auto-generated username
- Format: `emailprefix` or `emailprefix1` if taken
- Users can update username later (if you add that feature)
