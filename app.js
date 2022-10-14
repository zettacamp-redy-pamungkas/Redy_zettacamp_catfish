// express
const express = require('express');
const app = express();
const port = 3000;

// buku object
const buku = {
    title: 'Untitled Book',
    author: 'Unfamous Author',
    price: 10000,
    onSale: true,
    discount: 20,
    tax: 11,
    stock: 5,
    purchased: 0
};

// arr buku object
const arrBukus = [
    {
        id: 1,
        title: 'Untitled Book 1',
        author: 'Unfamous Author',
        price: 10000,
        onSale: false,
        discount: 20,
        tax: 11,
        stock: 5,
        purchased: 0
    },
    {
        title: 'Untitled Book 2',
        author: 'Unfamous Author',
        price: 12000,
        onSale: false,
        discount: 20,
        tax: 11,
        stock: 5,
        purchased: 0
    },
    {
        title: 'Untitled Book 3',
        author: 'Unfamous Author',
        price: 7000,
        onSale: false,
        discount: 20,
        tax: 11,
        stock: 5,
        purchased: 0
    },
    {
        title: 'Titled Book 1',
        author: 'Famous Author',
        price: 50000,
        onSale: false,
        discount: 20,
        tax: 11,
        stock: 5,
        purchased: 0
    },
    {
        title: 'Titled Book 2',
        author: 'Famous Author',
        price: 75000,
        onSale: false,
        discount: 20,
        tax: 11,
        stock: 5,
        purchased: 0
    },
];

// Add id property to arrBuku
arrBukus.forEach((buku, index) => {
    buku.id = index + 1;
});

// Harga buku setelah di diskon
function bookPriceAfterDiscount(book) {
    let bookPriceAfterDiscount;
    if (book.onSale) {
        console.log(`Book '${book.title}' is on Sale`);
        bookPriceAfterDiscount = book.price * (book.discount / 100);
        book.priceAfterDiscount = book.price - bookPriceAfterDiscount;
        console.log(`Your Saving: ${bookPriceAfterDiscount}`);
    } else {
        console.log(`Sorry, there no sale on this '${book.title}' book`)
    }
};

// Harga buku setelah di pajakin
function bookPriceAfterTax(book) {
    let price = book.priceAfterDiscount || book.price;
    book.taxPrice = price * book.tax / 100;
    book.finalPrice = price + book.taxPrice;
};

// function bookSold
function bookSold(book, purchase) {
    let totalPrice = 0;
    for (let i = 0; i < purchase; i++) {
        if (book.stock > 0) {
            let price = book.finalPrice || book.price;
            totalPrice += price;
            book.stock -= 1;
            book.purchased += 1;
        } else {
            console.log('Book out of stock');
            console.log(`Can Only Sold: ${i}`)
            break;
        }
    }
    console.log(`Total Price: ${totalPrice}`);
    console.log(`Stock book: ${book.stock}`);
    if (book.stock > 0) {
        console.log('You can purchase this book again.')
    }
}

// function credit
function creditBook(book, term = 5) {
    // bookPriceAfterTax(buku);
    let { price, finalPrice } = book;
    price = finalPrice || price;
    let priceCredit = Math.ceil(price / term);
    const instalment = {}
    instalment.priceCredit = priceCredit;
    instalment.debt = priceCredit * term;
    instalment.totalInstalment = 0;
    let arrInstalment = [];
    // Date
    let today = new Date();
    for (let i = 0; i < term; i++) {
        const monthYear = today.toLocaleString('default', {month: 'long', year: "numeric"})
        instalment.dueDate = `${monthYear}`;
        instalment.debt -= priceCredit;
        instalment.totalInstalment += priceCredit;
        arrInstalment.push({...instalment});
        today = new Date(today.setMonth(today.getMonth() + 1));
    }
    // console.log(arrInstalment);
    book.instalment = arrInstalment;
    return true;
}

// Middleware
app.use(express.urlencoded({extended:true}));
app.use(express.json());

function basicAuth(req, res, next) {
    const authorize = req.headers.authorization;
    
    if (!authorize) {
        res.status(401).send('Kamu gak berhak')
    } else{
        let basicEncode = authorize.split(' ')[1];
        let basicPlainText = new Buffer.from(basicEncode, 'base64').toString().split(':')
        const user = basicPlainText[0];
        const password = basicPlainText[1]
        console.log(basicEncode)
        if (user === 'zetta' && password === '123456') {
            console.log('Kamu berhak')
            next()
        } else {
            res.status(401).send('Username dan Password tidak sesuai');
        }
    }
}
// GET '/bookpricediscount'
app.get('/bookpriceafterdiscount', (req, res) => {
    bookPriceAfterDiscount(buku)
    res.send(buku);
});

// GET '/bookpriceaftertax'
app.get('/bookpriceaftertax', basicAuth, (req, res) => {
    bookPriceAfterDiscount(buku);
    res.send(buku);
});

// Get 'booksold/:pruchased
app.get('/booksold/:purchased', basicAuth, (req, res) => {
    let { purchased } = req.params;
    purchased = parseInt(purchased);
    if (Number.isNaN(purchased || purchased < 0)) {
        purchased = 1
    }
    bookSold(buku, purchased);
    res.send(buku);
});

// GET '/bookrestock/:stock' route
app.get('/bookrestock/:stock', basicAuth, (req, res) => {
    let { stock } = req.params;
    stock = parseInt(stock);
    if (Number.isNaN(stock) || stock < 0) {
        stock = 1
    }
    buku.stock += stock;
    res.send(buku);
})

// GET '/creditbook/:term' creditBook function
app.get('/creditbook/:term',basicAuth, (req, res) => {
    let { term } = req.params;
    term = parseInt(term);
    if (Number.isNaN(term) || term <= 0) {
        term = 6;
    }
    if (term > 36) {
        term = 36;
    }
    creditBook(buku, term);
    res.send(buku);
})

// GET '/' route, redirect to '/buku'
app.get('/', (req, res) => {
    // res.redirect('/buku');
    res.send(buku);
});

// GET '/buku' route
app.get('/buku', (req, res) => {
    res.send(arrBukus);
});


// POST 
app.post('/buku',basicAuth, (req, res) => {
    const buku = {...req.body,
        onSale: 'false',
        discount: 20,
        tax: 11,
        stock: 5,
        purchased: 0,
        id: arrBukus.length + 1
    };
    // Add Buku
    arrBukus.push(buku);
    res.redirect(`buku/detail/${buku.id}`);
})

// GET '/buku/detail/:id' route
app.get('/buku/detail/:id', (req, res) => {
    let { id } = req.params;
    id = parseInt(id);
    const book = arrBukus.find((book) => {
        return book.id === id;
    });

    if (book) {
        res.send(book);
    } else {
        res.status(404).send('Book not found');
    }
});

// PUT '/buku/detail/:id/edit
app.put('/buku/detail/:id', basicAuth, (req, res) => {
    let { id } = req.params;
    id = parseInt(id);
    let book = arrBukus.find((book) => {
        return book.id === id;
    });
    book = {...book,...req.body};
    // update arrBukus
    arrBukus.forEach((arr, index) => {
        if (arr.id === id) {
            console.log('Terupdate');
            arrBukus[index] = {...book};
        }
    });
    res.send(book);
});

// DELETE '/buku/detail/:id' route
app.delete('/buku/detail/:id',basicAuth, (req, res) => {
    let { id } = req.params;
    id = parseInt(id);
    if (Number.isNaN(id)) {
        res.status(404).send(`Cannot find Book with id: ${id}`);
        return true;
    } else {
        arrBukus.forEach((arr, index) => {
            if (arr.id === id) {
                arrBukus.splice(index, 1);
                res.send({...arr, status: 'Deleted'});
                console.log('Has Been Deleted');
                return true;
            }
        });
        res.status(404).send(`Book With id: ${id} not found`);
        return true;
    }
});

// cannot find route
app.use((req, res) => {
    res.send(`Cannot find ${req.method} "${req.path}" path`);
})

// express listen
app.listen(port, () => {
    console.log(`Express Listening on port: ${port}`);
});