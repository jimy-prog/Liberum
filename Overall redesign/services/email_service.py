import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

# These are pulled from config.py or environment variables
SMTP_HOST = os.getenv("SMTP_HOST", "mail.liberum.uz")
SMTP_PORT = int(os.getenv("SMTP_PORT", "465"))
SMTP_USER = os.getenv("SMTP_USER", "main@liberum.uz")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "")

def send_otp_email(to_email: str, otp_code: str):
    """
    Sends an HTML formatted OTP email using the configured SMTP server.
    """
    if not SMTP_PASSWORD:
        print(f"⚠️ SMTP_PASSWORD not set! Mocking email to {to_email} with OTP: {otp_code}")
        return True

    msg = MIMEMultipart("alternative")
    msg["Subject"] = f"Your Liberum Studio Verification Code: {otp_code}"
    msg["From"] = f"Liberum Studio <{SMTP_USER}>"
    msg["To"] = to_email

    html_content = f"""
    <html>
      <body style="font-family: Arial, sans-serif; background-color: #f4f7f6; padding: 40px; margin: 0;">
        <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05);">
          <div style="background: linear-gradient(135deg, #6a11cb, #2575fc); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">Liberum Studio</h1>
          </div>
          <div style="padding: 40px 30px; text-align: center;">
            <h2 style="color: #333; margin-top: 0;">Verify Your Email</h2>
            <p style="color: #666; font-size: 16px; line-height: 1.5; margin-bottom: 30px;">
              Please use the following 6-digit code to complete your registration. This code will expire in 15 minutes.
            </p>
            <div style="background: #f8f9fa; border: 1px solid #e9ecef; border-radius: 8px; padding: 20px; font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #2575fc;">
              {otp_code}
            </div>
            <p style="color: #999; font-size: 14px; margin-top: 30px;">
              If you didn't request this code, you can safely ignore this email.
            </p>
          </div>
        </div>
      </body>
    </html>
    """
    
    part = MIMEText(html_content, "html")
    msg.attach(part)

    try:
        # Assuming SSL on port 465, which is standard for Plesk/cPanel
        if SMTP_PORT == 465:
            with smtplib.SMTP_SSL(SMTP_HOST, SMTP_PORT) as server:
                server.login(SMTP_USER, SMTP_PASSWORD)
                server.sendmail(SMTP_USER, to_email, msg.as_string())
        else:
            with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
                server.starttls()
                server.login(SMTP_USER, SMTP_PASSWORD)
                server.sendmail(SMTP_USER, to_email, msg.as_string())
        return True
    except Exception as e:
        print(f"❌ Failed to send email to {to_email}: {e}")
        return False
