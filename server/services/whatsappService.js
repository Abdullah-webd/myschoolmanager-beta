const twilio = require('twilio');

class WhatsAppService {
  constructor() {
    if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
      this.client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
      this.fromNumber = process.env.TWILIO_WHATSAPP_FROM || 'whatsapp:+14155238886';
    }
  }

  async sendMessage(toNumber, message) {
    if (!this.client) {
      console.log('WhatsApp service not configured');
      return false;
    }

    try {
      const result = await this.client.messages.create({
        from: this.fromNumber,
        to: `whatsapp:${toNumber}`,
        body: message
      });

      return result.sid;
    } catch (error) {
      console.error('WhatsApp send failed:', error);
      return false;
    }
  }

  async sendCredentials(phone, firstName, email, tempPassword) {
    const message = `Hello ${firstName}! Your school portal account has been created.\n\nEmail: ${email}\nTemporary Password: ${tempPassword}\n\nPlease change your password after first login.\n\nAccess portal: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`;
    
    return await this.sendMessage(phone, message);
  }

  async sendNotification(phone, firstName, title, message) {
    const whatsappMessage = `Hello ${firstName}!\n\n${title}\n\n${message}\n\n- School Administration`;
    
    return await this.sendMessage(phone, whatsappMessage);
  }

  async sendBulkMessage(phone, message) {
    const whatsappMessage = `${message}\n\n- School Administration`;
    
    return await this.sendMessage(phone, whatsappMessage);
  }
}

module.exports = new WhatsAppService();