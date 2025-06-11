import pool from './db.js';
export default async function getList(req, res) {
  const { category } = req.query;
  if (!category) {
    return res.status(400).json({ 
      success: false, 
      message: 'Category is required' 
    });
  }
  try {
    const result = await pool.query(
      'SELECT id, title FROM list WHERE category = $1 ORDER BY id DESC',
      [category]
    );
    res.status(200).json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Get list error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal Server Error'
    });
  }
}