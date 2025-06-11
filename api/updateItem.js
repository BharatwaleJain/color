import pool from './db.js';
export default async function updateItem(req, res) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }
  const { id, title, category } = req.body;
  if (!id || !title || !category) {
    return res.status(400).json({ 
      success: false, 
      message: 'ID, title and category are required' 
    });
  }
  try {
    const result = await pool.query(
      'UPDATE list SET title = $1 WHERE id = $2 AND category = $3 RETURNING id',
      [title.trim(), id, category]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Item not found'
      });
    }
    res.status(200).json({
      success: true,
      message: 'Item updated successfully'
    });
  } catch (error) {
    console.error('Update item error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal Server Error'
    });
  }
}