import pool from './db.js';
export default async function logout(req, res) {
  const { token } = req.body;
  try {
    await pool.query('UPDATE users SET token = NULL WHERE token = $1', [token]);
    res.status(200).json({
        success: true,
        message: 'Logged Out Successfully!'
    });
  } catch (error) {
    res.status(500).json({
        success: false,
        message: 'Internal Server Error'
    });
  }
}