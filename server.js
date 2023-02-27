const PORT = process.env.PORT ?? 8000;
const express = require('express');
const pool = require('./db');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('hello world');
});

//get all
app.get('/todos/:userEmail', async (req, res) => {
    const { userEmail } = req.params;

    try {
        const todos = await pool.query('SELECT * FROM todos WHERE user_email = $1', [userEmail]);
        res.json(todos.rows);
    } catch (err) {
        console.error(err);
    }
});

//create a new
app.post('/todos', async (req, res) => {
    const { user_email, title, progres, date } = req.body;
    const id = uuidv4();

    try {
        const newToDo = await pool.query(`INSERT INTO todos(id, user_email, title, progres, date) VALUES($1, $2, $3, $4, $5)`,
            [id, user_email, title, progres, date]);
        res.json(newToDo);
    } catch (err) {
        console.error(err);
    }
});

//edit a todo
app.put('/todos/:id', async (req, res) => {
    const { id } = req.params;
    const { user_email, title, progres, date } = req.body;

    try {
        const updatedToDo = await pool.query(`UPDATE todos SET user_email = $1, title = $2, progres = $3, date = $4 WHERE id = $5`,
            [user_email, title, progres, date, id]);
        res.json(updatedToDo);
    } catch (err) {
        console.error(err);
    }
});

//edit listName
app.put('/todos/:email', async (req, res) => {
    const { listName } = req.body;
    const { email } = req.params;

    try {
        const updatedListName = await pool.query(`UPDATE users SET list_name = $1 WHERE email = $2`,
        [listName, email]);
        res.json(updatedListName);
    } catch (err) {
        console.error(err);
    }
})

//delete a todo
app.delete('/todos/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const deletedToDo = await pool.query(`DELETE FROM todos WHERE id = $1`, [id]);
        res.json(deletedToDo);
    } catch (err) {
        console.error(err);
    }
});

//signup
app.post('/signup', async (req, res) => {
    const { email, password } = req.body;
    const salt = bcrypt.genSaltSync(5);
    const hashedPassword = bcrypt.hashSync(password, salt);

    try {
        const signUp = await pool.query(`INSERT INTO users (email, hashed_password) VALUES($1, $2)`, [email, hashedPassword]);
        const token = jwt.sign({ email }, 'secret', { expiresIn: '1hr' });
        res.json({ email,token });
    } catch (err) {
        console.error(err);
        if (err) {
            res.json({ detail: err.detail });
        }
    }
});

//login
app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const users = await pool.query(`SELECT * FROM users WHERE email = $1`, [email]);

        if (!users.rows.length) return res.json({ detail: 'User not found' });

        const success = await bcrypt.compare(password, users.rows[0].hashed_password);
        const token = jwt.sign({ email }, 'secret', { expiresIn: '1hr' });

        if (success) {
            res.json({ 'email' : users.rows[0].email, token });
        } else {
            res.json({ detail: 'Wrong password' });
        }
    } catch (err) {
        console.error(err);
    }
});

app.listen(PORT, () => {
    console.log('Server runing in PORT ' + PORT);
});
