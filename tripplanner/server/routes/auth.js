const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getPool } = require('../db/createdatabase');
const { jwt: jwtConfig } = require('../config');

const router = express.Router();

router.post('/register', async (req, res) => {
  console.log('[Register] Request received');
  const { email, username, password } = req.body;
  console.log(`[Register] Payload: email=${email}, username=${username}`);

  if (!email || !username || !password) {
    console.log('[Register] Validation failed: Missing fields');
    return res.status(400).send({ message: "Email, username, and password are required" });
  }

  let connection;
  try {
    console.log(`[Register] Processing request for email: ${email}, username: ${username}`);
    const pool = getPool();
    console.log('[Register] Database pool obtained');
    connection = await pool.getConnection();
    console.log('[Register] Database connection obtained from pool');

    const [emailRows] = await connection.query("SELECT email FROM users WHERE email = ?", [email]);
    console.log('[Register] Email check query executed');
    const [usernameRows] = await connection.query("SELECT username FROM users WHERE username = ?", [username]);
    console.log('[Register] Username check query executed');

    const validationErrors = {};
    if (emailRows.length > 0) {
      validationErrors.email = "Email already exists";
    }
    if (usernameRows.length > 0) {
      validationErrors.username = "Username already exists";
    }

    if (Object.keys(validationErrors).length > 0) {
      console.log('[Register] Conflict:', validationErrors);
      return res.status(409).send({ message: "User already exists", errors: validationErrors });
    }
    
    console.log('[Register] User does not exist, proceeding with registration');
    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await connection.query("INSERT INTO users (username, email, password) VALUES (?, ?, ?)", [username, email, hashedPassword]);
    console.log('[Register] User inserted into database');
    
    if (result.affectedRows === 1) {
      const newUser = { id: result.insertId, username, email };
      const token = jwt.sign(newUser, jwtConfig.secret, { expiresIn: '24h' });
      console.log('[Register] JWT token created');
      res.status(201).send({ token });
    } else {
      console.log('[Register] Error: Insert failed');
      res.status(500).send({ message: "Error registering user: Insert failed." });
    }
    
  } catch (err) {
    console.error("[Register] Critical error:", err);
    res.status(500).send({ message: "Error registering user", error: err.message });
  } finally {
    if (connection) {
      console.log('[Register] Releasing database connection');
      connection.release();
    }
  }
});

router.post('/login', async (req, res) => {
  console.log('[Login] Request received');
  const { email, username, password } = req.body;
  console.log(`[Login] Payload: email=${email}, username=${username}`);

  if (!password || (!email && !username)) {
    console.log('[Login] Validation failed: Missing fields');
    return res.status(400).send({ message: "Password and either email or username are required" });
  }

  try {
    console.log(`[Login] Processing request for email: ${email}, username: ${username}`);
    const pool = getPool();
    console.log('[Login] Database pool obtained');
    let identifier, column;
    if (email) {
      identifier = email;
      column = 'email';
    } else {
      identifier = username;
      column = 'username';
    }
    console.log(`[Login] Querying for user by ${column}...`);
    const [users] = await pool.query(`SELECT * FROM users WHERE ${column} = ?`, [identifier]);
    
    if (users.length === 0) {
      console.log(`[Login] User not found with ${column}: ${identifier}`);
      return res.status(404).send({ message: "User not found" });
    }
    
    const user = users[0];
    console.log(`[Login] User found: ${user.username}`);
    const passwordIsValid = await bcrypt.compare(password, user.password);
    
    if (!passwordIsValid) {
      console.log(`[Login] Invalid password for user: ${user.username}`);
      return res.status(401).send({ auth: false, token: null, message: "Invalid password" });
    }
    
    console.log(`[Login] Password is valid for user: ${user.username}`);
    const token = jwt.sign({ id: user.id, username: user.username, email: user.email }, jwtConfig.secret, {
      expiresIn: '24h'
    });
    console.log('[Login] JWT token created');
    
    res.status(200).send({ token });
  } catch (err) {
    console.error("[Login] Critical error:", err);
    res.status(500).send({ message: "Error logging in", error: err.message });
  }
});

router.get('/me', async (req, res) => {
  const token = req.headers['authorization']?.split(' ')[1];

  if (!token) {
    return res.status(401).send({ message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, jwtConfig.secret);
    const pool = getPool();
    const [users] = await pool.query('SELECT id, username, email FROM users WHERE id = ?', [decoded.id]);

    if (users.length === 0) {
      return res.status(404).send({ message: 'User not found' });
    }

    res.status(200).send(users[0]);
  } catch (error) {
    res.status(401).send({ message: 'Invalid token' });
  }
});

router.post('/change-password', async (req, res) => {
  const { username, currentPassword, newPassword } = req.body;

  if (!username || !currentPassword || !newPassword) {
    return res.status(400).send({ message: "Username, current password, and new password are required" });
  }

  try {
    const pool = getPool();
    const [users] = await pool.query("SELECT * FROM users WHERE username = ?", [username]);

    if (users.length === 0) {
      return res.status(404).send({ message: "User not found" });
    }

    const user = users[0];
    const passwordIsValid = await bcrypt.compare(currentPassword, user.password);

    if (!passwordIsValid) {
      return res.status(401).send({ message: "Invalid current password" });
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    await pool.query("UPDATE users SET password = ? WHERE username = ?", [hashedNewPassword, username]);
    
    res.status(200).send({ message: "Password updated successfully" });
  } catch (err) {
    console.error("Change password error:", err);
    res.status(500).send({ message: "Error updating password", error: err.message });
  }
});

module.exports = router;