/**
 * Email Service using Resend
 * 
 * Handles sending transactional emails for the application.
 */

import { Resend } from "resend"
import { getBaseUrl } from "./metadata"

// Initialize Resend client
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

const FROM_EMAIL = process.env.SMTP_FROM || "onboarding@resend.dev"

/**
 * Send an email using Resend
 */
export async function sendEmail({
  to,
  subject,
  html,
  text,
}: {
  to: string | string[]
  subject: string
  html: string
  text?: string
}) {
  if (!resend) {
    console.warn("Resend API key not configured. Email not sent.")
    return { success: false, error: "Email service not configured" }
  }

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
      text: text || stripHtml(html),
    })

    if (error) {
      console.error("Resend email error:", error)
      return { success: false, error }
    }

    return { success: true, data }
  } catch (error: any) {
    console.error("Failed to send email:", error)
    return { success: false, error: error.message }
  }
}

/**
 * Strip HTML tags to create plain text version
 */
function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim()
}

/**
 * Send notification email when someone comments on a product
 */
export async function sendCommentNotification({
  productOwnerEmail,
  productOwnerName,
  productOwnerId,
  productOwnerUsername,
  productName,
  productId,
  commenterName,
  commentContent,
  commentUrl,
  profileSettingsUrl,
}: {
  productOwnerEmail: string
  productOwnerName: string
  productOwnerId: string
  productOwnerUsername: string | null
  productName: string
  productId: string
  commenterName: string
  commentContent: string
  commentUrl: string
  profileSettingsUrl: string
}) {
  const subject = `${commenterName} commented on "${productName}"`
  
  const html = `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${subject}</title>
  </head>
  <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: #171717; color: #fff; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
      <h1 style="margin: 0; font-size: 24px;">hobbyrider</h1>
    </div>
    <div style="background: #fff; border: 1px solid #e5e7eb; border-top: none; padding: 30px; border-radius: 0 0 8px 8px;">
      <h2 style="margin-top: 0; color: #111;">New Comment on Your Product</h2>
      <p style="color: #666;">Hi ${productOwnerName},</p>
      <p style="color: #666;"><strong>${commenterName}</strong> commented on your product <strong>"${productName}"</strong>:</p>
      <div style="background: #f9fafb; border-left: 3px solid #171717; padding: 15px; margin: 20px 0; border-radius: 4px;">
        <p style="margin: 0; color: #333; font-style: italic;">"${commentContent}"</p>
      </div>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${commentUrl}" style="display: inline-block; background: #171717; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600;">View Comment</a>
      </div>
      <p style="color: #999; font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
        You're receiving this because someone commented on your product. 
        <a href="${profileSettingsUrl}" style="color: #2563eb;">Manage notifications</a>
      </p>
    </div>
  </body>
</html>
  `.trim()

  const text = `${commenterName} commented on your product "${productName}":\n\n"${commentContent}"\n\nView comment: ${commentUrl}`

  return sendEmail({
    to: productOwnerEmail,
    subject,
    html,
    text,
  })
}

/**
 * Send notification email when someone upvotes a product
 */
export async function sendUpvoteNotification({
  productOwnerEmail,
  productOwnerName,
  productOwnerId,
  productOwnerUsername,
  productName,
  productId,
  upvoterName,
  productUrl,
  profileSettingsUrl,
}: {
  productOwnerEmail: string
  productOwnerName: string
  productOwnerId: string
  productOwnerUsername: string | null
  productName: string
  productId: string
  upvoterName: string
  productUrl: string
  profileSettingsUrl: string
}) {
  const subject = `${upvoterName} upvoted "${productName}"`
  
  const html = `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${subject}</title>
  </head>
  <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: #171717; color: #fff; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
      <h1 style="margin: 0; font-size: 24px;">hobbyrider</h1>
    </div>
    <div style="background: #fff; border: 1px solid #e5e7eb; border-top: none; padding: 30px; border-radius: 0 0 8px 8px;">
      <h2 style="margin-top: 0; color: #111;">New Upvote on Your Product</h2>
      <p style="color: #666;">Hi ${productOwnerName},</p>
      <p style="color: #666;"><strong>${upvoterName}</strong> upvoted your product <strong>"${productName}"</strong>!</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${productUrl}" style="display: inline-block; background: #171717; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600;">View Product</a>
      </div>
      <p style="color: #999; font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
        You're receiving this because someone upvoted your product. 
        <a href="${profileSettingsUrl}" style="color: #2563eb;">Manage notifications</a>
      </p>
    </div>
  </body>
</html>
  `.trim()

  const text = `${upvoterName} upvoted your product "${productName}"!\n\nView product: ${productUrl}`

  return sendEmail({
    to: productOwnerEmail,
    subject,
    html,
    text,
  })
}

/**
 * Send welcome email to new users
 */
export async function sendWelcomeEmail({
  userEmail,
  userName,
}: {
  userEmail: string
  userName: string
}) {
  const subject = "Welcome to hobbyrider!"
  
  const html = `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${subject}</title>
  </head>
  <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: #171717; color: #fff; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
      <h1 style="margin: 0; font-size: 24px;">hobbyrider</h1>
    </div>
    <div style="background: #fff; border: 1px solid #e5e7eb; border-top: none; padding: 30px; border-radius: 0 0 8px 8px;">
      <h2 style="margin-top: 0; color: #111;">Welcome to hobbyrider!</h2>
      <p style="color: #666;">Hi ${userName},</p>
      <p style="color: #666;">Thanks for joining hobbyrider! We're excited to have you here.</p>
      <p style="color: #666;">Get started by:</p>
      <ul style="color: #666;">
        <li>Discovering amazing software products</li>
        <li>Submitting your own products</li>
        <li>Engaging with the community through comments and upvotes</li>
      </ul>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${getBaseUrl()}" style="display: inline-block; background: #171717; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600;">Get Started</a>
      </div>
      <p style="color: #999; font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
        Happy riding! 🚀
      </p>
    </div>
  </body>
</html>
  `.trim()

  const text = `Welcome to hobbyrider!\n\nHi ${userName},\n\nThanks for joining hobbyrider! We're excited to have you here.\n\nGet started by discovering amazing software products, submitting your own, and engaging with the community.\n\nVisit: ${getBaseUrl()}`

  return sendEmail({
    to: userEmail,
    subject,
    html,
    text,
  })
}
