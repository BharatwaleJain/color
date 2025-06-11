import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import login from './login.js';
import logout from './logout.js';
import check from './check.js';
import getList from './list.js';
import addItem from './addItem.js';
import updateItem from './updateItem.js';
import deleteItem from './deleteItem.js';

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

app.post('/api/login', login);
app.post('/api/logout', logout);
app.post('/api/check', check);
app.get('/api/list', getList);
app.post('/api/list', addItem);
app.put('/api/list', updateItem);
app.delete('/api/list', deleteItem);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));