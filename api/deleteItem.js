import pool from './db.js';
export default async function deleteItem(req, res) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }
  const { id, category } = req.body;
  if (!id || !category) {
    return res.status(400).json({ 
      success: false, 
      message: 'ID and category are required' 
    });
  }
  try {
    const result = await pool.query(
      'DELETE FROM list WHERE id = $1 AND category = $2 RETURNING id',
      [id, category]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Item not found'
      });
    }
    res.status(200).json({
      success: true,
      message: 'Item deleted successfully'
    });
  } catch (error) {
    console.error('Delete item error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal Server Error'
    });
  }
}