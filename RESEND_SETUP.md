# Resend Email Setup Guide

This guide will help you set up Resend for email notifications in your hobbyrider application.

## Step 1: Get Your Resend API Key

1. **Go to Resend Dashboard**
   - Visit [resend.com](https://resend.com) and log in with your GitHub account
   - Navigate to **API Keys** in the sidebar

2. **Create an API Key**
   - Click **"Create API Key"**
   - Give it a name (e.g., "hobbyrider-production")
   - Copy the API key (it starts with `re_` and you'll only see it once!)

## Step 2: Verify Your Domain (Optional but Recommended)

For production, you should verify your own domain. For development/testing, you can use Resend's test domain.

### Option A: Use Resend Test Domain (Quick Start)
- Resend provides a test domain: `onboarding@resend.dev`
- You can use this for development without domain verification
- **Note:** Emails from test domain may go to spam

### Option B: Verify Your Own Domain (Production)
1. In Resend dashboard, go to **Domains**
2. Click **"Add Domain"**
3. Enter your domain (e.g., `yourdomain.com`)
4. Add the DNS records Resend provides to your domain's DNS settings
5. Wait for verification (usually a few minutes)

## Step 3: Set Environment Variables

### Local Development (.env.local)

Add these to your `.env.local` file:

```bash
# Resend Configuration
RESEND_API_KEY=re_your_api_key_here
SMTP_FROM=noreply@yourdomain.com  # or onboarding@resend.dev for testing
```

**For testing (using Resend test domain):**
```bash
RESEND_API_KEY=re_your_api_key_here
SMTP_FROM=onboarding@resend.dev
```

### Production (Vercel)

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add:
   - `RESEND_API_KEY` = `re_your_api_key_here`
   - `SMTP_FROM` = `noreply@yourdomain.com` (or `onboarding@resend.dev` for testing)

## Step 4: Test Email Sending

After setting up, you can test by:

1. **Testing Magic Link Authentication**
   - Try signing in with email on your app
   - Check your email for the magic link

2. **Testing Notifications** (once implemented)
   - Create a product and have someone comment on it
   - Check if you receive an email notification

## Step 5: Monitor Email Delivery

1. Go to Resend dashboard → **Logs**
2. You can see:
   - All sent emails
   - Delivery status
   - Bounce/spam reports
   - Open rates (if enabled)

## Troubleshooting

### Emails Not Sending
- ✅ Check `RESEND_API_KEY` is set correctly
- ✅ Check `SMTP_FROM` matches your verified domain (or use test domain)
- ✅ Check Resend dashboard logs for errors
- ✅ Verify API key has proper permissions

### Emails Going to Spam
- ✅ Verify your domain with Resend
- ✅ Set up SPF and DKIM records (Resend provides these)
- ✅ Use a proper "from" address (not test domain)
- ✅ Avoid spam trigger words in subject/content

### Rate Limits
- Resend free tier: 3,000 emails/month
- Resend paid tier: Higher limits
- Check your usage in Resend dashboard

## Next Steps

Once Resend is configured, the application will automatically:
- ✅ Send magic link emails for authentication
- ✅ Send email notifications for:
  - New comments on your products
  - New upvotes on your products
  - Welcome emails (optional)

## Support

- Resend Docs: https://resend.com/docs
- Resend Support: support@resend.com
