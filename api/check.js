import pool from './db.js';

export default async function check(req, res) {
  const { token } = req.body;
  if (!token) {
    return res.status(400).json({
      success: false,
      message: 'No Token Provided'
    });
  }
  try {
    const result = await pool.query(
        'SELECT * FROM users WHERE token = $1',
        [token]
    );
    if (result.rows.length > 0) {
      res.json({
        success: true,
        message: 'Session Valid!'
    });
    } else {
      res.status(401).json({
        success: false,
        message: 'Session Expired!'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Internal Server Error'
    });
  }
}