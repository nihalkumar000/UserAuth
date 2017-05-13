var nodemailer = require('nodemailer');

transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'nodemailernihal@gmail.com',
        pass: '1asdfghjkl'
    }
});