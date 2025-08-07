const express = require('express');
const nodemailer = require('nodemailer');
require('dotenv').config();

const router = express.Router();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

router.post('/', async (req, res) => {
  const { name, email, category, subject, message } = req.body;
  console.log('Contact form submission received:', { name, email, category, subject, message });

  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.error('Email credentials are not set in .env file');
    return res.status(500).send({ message: 'Email service is not configured.' });
  }

  const mailOptions = {
    from: email,
    to: 'suparuthong@gmail.com',
    subject: `[${category}] ${subject}`,
    text: `Name: ${name}\nEmail: ${email}\n\n${message}`
  };

  try {
    console.log('Sending email with options:', mailOptions);
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info);
    res.status(200).send({ message: 'Message sent successfully' });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).send({ message: 'Failed to send message' });
  }
});

module.exports = router;