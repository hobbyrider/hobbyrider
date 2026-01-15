/**
 * Email template for Magic Link authentication
 */
export function getEmailHtml(params: { url: string; host: string }) {
  const { url, host } = params

  return `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sign in to Hobbyrider</title>
  </head>
  <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: #000; color: #fff; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
      <h1 style="margin: 0; font-size: 24px;">hobbyrider</h1>
    </div>
    <div style="background: #fff; border: 1px solid #e5e7eb; border-top: none; padding: 30px; border-radius: 0 0 8px 8px;">
      <h2 style="margin-top: 0; color: #111;">Sign in to Hobbyrider</h2>
      <p style="color: #666;">Click the button below to sign in to your account. This link will expire in 24 hours.</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${url}" style="display: inline-block; background: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600;">Sign in</a>
      </div>
      <p style="color: #666; font-size: 14px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
        If the button doesn't work, copy and paste this link into your browser:<br>
        <a href="${url}" style="color: #2563eb; word-break: break-all;">${url}</a>
      </p>
      <p style="color: #999; font-size: 12px; margin-top: 20px;">
        If you didn't request this email, you can safely ignore it.
      </p>
    </div>
  </body>
</html>
  `.trim()
}

export function getEmailText(params: { url: string; host: string }) {
  const { url } = params
  return `Sign in to Hobbyrider\n\nClick this link to sign in:\n${url}\n\nThis link will expire in 24 hours.\n\nIf you didn't request this email, you can safely ignore it.`
}
