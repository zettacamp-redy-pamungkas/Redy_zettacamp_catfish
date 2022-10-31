// Express
const express = require('express');
const app = express();
const port = 3000;

// GET '/' route
app.get('/', (req, res) => {
    res.json({
        status: 200,
        message: 'Hello World'
    })
})

// Express Listen
app.listen(port, () => {
    console.log(`Express Listening on port: ${port}`);
});