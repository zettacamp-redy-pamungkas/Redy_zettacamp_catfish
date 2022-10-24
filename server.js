// Express
const express = require('express');
const app = express();
const port = 3000;

// GET '/books/' route
app.get('/books', async (req, res) => {
    res.json({
        status: 'ok',
        message: 'Hello, World'
    });
});

// Express Listen
app.listen(port, () => {
    console.log(`Express Listen on port: ${port}`)
})