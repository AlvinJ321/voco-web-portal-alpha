const nodemailer = require('nodemailer');

require('dotenv').config();

// Create a reusable Transporter using nodemailer
function createTransporter() {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !port || !user || !pass) {
    throw new Error('Email SMTP configuration is not fully set in environment variables.');
  }

  return nodemailer.createTransport({
    host: host,
    port: port,
    secure: true, // Use SSL
    auth: {
      user: user,
      pass: pass
    }
  });
}

async function sendFeedbackEmails(feedbackData) {
  try {
    const transporter = createTransporter();
    
    // Email A: To the User (Confirmation)
    const userEmail = {
      from: process.env.SMTP_USER,
      to: feedbackData.contactEmail,
      subject: `[Voco] 我们已收到您的反馈 (工单 #${feedbackData.id})`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
          <h2 style="color: #333; text-align: center;">感谢您的反馈</h2>
          <p style="color: #666; line-height: 1.6;">亲爱的用户，您好：</p>
          <p style="color: #666; line-height: 1.6;">我们已经收到了您的反馈，工单ID为 <strong>#${feedbackData.id}</strong>。</p>
          <p style="color: #666; line-height: 1.6;">您的反馈内容：</p>
          <div style="background-color: #f9f9f9; padding: 15px; border-radius: 3px; margin: 10px 0;">
            <p style="color: #333; margin: 0;">${feedbackData.description}</p>
          </div>
          <p style="color: #666; line-height: 1.6;">我们将会尽快跟进。</p>
          <p style="color: #666; line-height: 1.6;">此致<br/>Voco 团队</p>
        </div>
      `
    };

    // Email B: To Admin (Support)
    const adminEmail = {
      from: process.env.SMTP_USER,
      to: process.env.ADMIN_EMAIL,
      subject: `[新工单] #${feedbackData.id} - ${feedbackData.issueType} - 用户ID:${feedbackData.userId}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
          <h2 style="color: #333;">[新工单] #${feedbackData.id}</h2>
          
          <h3 style="color: #555;">1. 用户信息</h3>
          <table style="border-collapse: collapse; width: 100%; margin: 10px 0;">
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd; background-color: #f9f9f9; width: 150px;"><strong>用户ID：</strong></td>
              <td style="padding: 8px; border: 1px solid #ddd;">${feedbackData.userId}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd; background-color: #f9f9f9;"><strong>联系邮箱：</strong></td>
              <td style="padding: 8px; border: 1px solid #ddd;">${feedbackData.contactEmail}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd; background-color: #f9f9f9;"><strong>问题类型：</strong></td>
              <td style="padding: 8px; border: 1px solid #ddd;">${feedbackData.issueType}</td>
            </tr>
          </table>
          
          <h3 style="color: #555;">2. 问题描述</h3>
          <div style="background-color: #f9f9f9; padding: 15px; border-radius: 3px; margin: 10px 0;">
            <p style="color: #333; margin: 0;">${feedbackData.description}</p>
          </div>
          
          <h3 style="color: #555;">3. 系统信息</h3>
          <table style="border-collapse: collapse; width: 100%; margin: 10px 0;">
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd; background-color: #f9f9f9; width: 200px;"><strong>应用版本：</strong></td>
              <td style="padding: 8px; border: 1px solid #ddd;">${feedbackData.appVersion || '-'}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd; background-color: #f9f9f9;"><strong>macOS版本：</strong></td>
              <td style="padding: 8px; border: 1px solid #ddd;">${feedbackData.osVersion || '-'}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd; background-color: #f9f9f9;"><strong>设备型号：</strong></td>
              <td style="padding: 8px; border: 1px solid #ddd;">${feedbackData.deviceModel || '-'}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd; background-color: #f9f9f9;"><strong>CPU架构：</strong></td>
              <td style="padding: 8px; border: 1px solid #ddd;">${feedbackData.cpuArch || '-'}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd; background-color: #f9f9f9;"><strong>系统内存：</strong></td>
              <td style="padding: 8px; border: 1px solid #ddd;">${feedbackData.systemMemory || '-'}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd; background-color: #f9f9f9;"><strong>输入设备：</strong></td>
              <td style="padding: 8px; border: 1px solid #ddd;">${feedbackData.inputDeviceName || '-'}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd; background-color: #f9f9f9;"><strong>采样率：</strong></td>
              <td style="padding: 8px; border: 1px solid #ddd;">${feedbackData.inputSampleRate || '-'}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd; background-color: #f9f9f9;"><strong>麦克风权限：</strong></td>
              <td style="padding: 8px; border: 1px solid #ddd;">${feedbackData.micPermissionStatus || '-'}</td>
            </tr>
          </table>
        </div>
      `
    };

    // Send both emails in parallel using Promise.all
    await Promise.all([
      transporter.sendMail(userEmail),
      transporter.sendMail(adminEmail)
    ]);

    console.log(`Successfully sent feedback emails for ticket #${feedbackData.id}`);
    return true;

  } catch (error) {
    console.error(`Failed to send feedback emails:`, error);
    throw error;
  }
}

module.exports = {
  sendFeedbackEmails
};
