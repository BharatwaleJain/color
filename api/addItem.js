import pool from './db.js';
export default async function addItem(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }
  const { title, category } = req.body;
  
  if (!title || !category) {
    return res.status(400).json({ 
      success: false, 
      message: 'Title and category are required' 
    });
  }
  try {
    const result = await pool.query(
      'INSERT INTO list (title, category) VALUES ($1, $2) RETURNING id',
      [title.trim(), category]
    );
    
    res.status(201).json({
      success: true,
      message: 'Item added successfully',
      id: result.rows[0].id
    });
  } catch (error) {
    console.error('Add item error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal Server Error'
    });
  }
}