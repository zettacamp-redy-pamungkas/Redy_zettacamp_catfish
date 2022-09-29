// Express
const express = require('express');
const app = express();
const port = 3000;

// Path
const path = require('path');

// Mongoose
const mongoose = require('mongoose');
const dbName = 'zetta_1'
// Product
const Product = require('./models/product');
const categories = ['fruit', 'vegetable', 'dairy'];

// FileSynch
const fs = require('fs');

// Multer
const multer = require('multer');
// SET STORAGE
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads')
    },
    filename: (req, file, cb) => {
        cb(null, file.filename + '-' + Date.now())
    }
});
const upload = multer({
    storage: storage
});

// MongoDB connect
mongoose.connect(`mongodb://localhost:27017/${dbName}`)
    .then(() => {
        console.log(`MongoDB opee`);
    })
    .catch((err) => {
        console.log(err);
    });

// Express Setup views and ejs
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Express Listen
app.listen(port, () => {
    console.log(`Express Listen on port: ${port}`);
});

// Express Middleware
app.use(express.urlencoded({extended: true}));
app.use(express.json());

// GET index route
app.get('/', (req, res) => {
    res.render('index');
});

// GET wish list route
app.get('/wishlist', (req, res) => {
    res.render('shopping_list.ejs');
});

// GET contact route
app.get('/contact', (req, res) => {
    res.render('contact');
});

// POST contact route
app.post('/contact', (req, res) => {
    const message = req.body;
    console.log(message);
    res.redirect('/contact');
});

// GET All Product Route
app.get('/products', async (req, res) => {
    const { category } = req.query;
    if (category) {
        const allProducts = await Product.find({category});  
        res.render('products', {
            allProducts
        })
    } else {
        const allProducts = await Product.find({});
        res.render('products', {
            allProducts
        })
    }
});

// POST new product route
app.post('/products', upload.single('img') ,async (req, res) => {
    const body = req.body;
    const obj = {
        name: req.body.name,
        description: req.body.description,
        img: {
            data: fs.readFileSync(path.join(__dirname + '/uploads/' + req.file.filename)),
            contentType: 'iamge/png'
        },
        category: req.body.category,
        price: req.body.price,
        from: req.body.from,
        owner: req.body.owner,
        onSale: req.body.onSale
    }
    const newProduct = await Product.create(obj);
    res.redirect('/products/' + newProduct.id);
});

// GET new Product Route
app.get('/products/new', async (req, res) => {
    res.render('new_product', {
        categories
    });
});

// GET Detail Products
app.get('/products/:id', async (req, res) => {
    const { id } = req.params;
    const product = await Product.findById(id);
    res.render('detail_product', {
        product
    });
})