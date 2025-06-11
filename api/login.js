import pool from './db.js';
import crypto from 'crypto';
export default async function login(req, res) {
  const { username, password } = req.body;
  try {
    const result = await pool.query(
      'SELECT * FROM users WHERE username = $1 AND password = $2',
      [username, password]
    );
    console.log("Logging in attempt for user:", username);
    if (result.rows.length > 0) {
      const token = crypto.randomBytes(32).toString('base64').replace(/\//g, '_').replace(/\+/g, '-');
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
    res.status(500).json({
      success: false,
      message: 'Internal Server Error'
    });
  }
}