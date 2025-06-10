import express from 'express';
import cors from 'cors';
import pkg from 'pg';
import dotenv from 'dotenv';
import crypto from 'crypto';

dotenv.config();
const { Pool } = pkg;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

const app = express();
app.use(cors());
app.use(express.json());

app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const result = await pool.query(
      'SELECT * FROM users WHERE username = $1 AND password = $2',
      [username, password]
    );
    console.log("Logging ");
    if (result.rows.length > 0) {
      const token = crypto.randomBytes(32).toString('base64').replace(/\//g, '_').replace(/\+/g, '-');
      console.log(token);
      await pool.query(
        'UPDATE users SET token = $1 WHERE username = $2',
        [token, username]
      );
      res.status(200).json({
        success: true, 
        message: 'Login Successful!',
        token: token
      });
    } else {
      res.status(401).json({
        success: false,
        message: 'Incorrect Credentials!'
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Internal Server Error'
    });
  }
});

app.post('/api/logout', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Logged Out Successfully!'
  });
});

app.post('/api/check', async (req, res) => {
  const { token } = req.body;
  if (!token) {
    return res.status(400).json({ success: false, message: 'No Token Provided' });
  }
  try {
    const result = await pool.query(
      'SELECT * FROM users WHERE token = $1',
      [token]
    );
    if (result.rows.length > 0) {
      res.json({ success: true, message: 'Session Valid!' });
    } else {
      res.status(401).json({ success: false, message: 'Session Expired!' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));