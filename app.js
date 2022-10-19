// express
const express = require('express');
const app = express();
const port = 3000;

// path
const path = require('path');

// fs
const fs = require('fs/promises');

// events
const Events = require('events');
const myEvent = new Events();

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
async function creditBook(book, term = 5, additionalPrice = 1000) {
    // bookPriceAfterTax(buku);
    let { price, finalPrice } = book;
    price = finalPrice || price;
    let priceCredit = Math.ceil(price / term);
    const instalment = {}
    instalment.priceCredit = priceCredit;
    instalment.debt = (priceCredit * term) + additionalPrice;
    instalment.totalInstalment = 0;
    let arrInstalment = [];
    // Date
    let today = new Date();
    let middleIndex = Math.ceil(term / 2);
    for (let i = 0; i < term; i++) {
        if (i === middleIndex - 1) {
            const newPriceCredit = priceCredit + additionalPrice;
            instalment.priceCredit = newPriceCredit;
            instalment.debt -= newPriceCredit ;
            instalment.totalInstalment += newPriceCredit;
        } else {
            instalment.priceCredit = priceCredit
            instalment.debt -= priceCredit;
            instalment.totalInstalment += priceCredit;
        }
        const monthYear = today.toLocaleString('default', {month: 'long', year: "numeric"})
        instalment.dueDate = `${monthYear}`;
        arrInstalment.push({...instalment});
        today = new Date(today.setMonth(today.getMonth() + 1));
    }
    // console.log(arrInstalment);
    // Arry of Object
    return arrInstalment;
}

// function getBook
// Simulate fetching data from DB
function getBook(book) {
    return new Promise((resolve, reject) => {
        const ms = Math.floor(Math.random() * 5000) + 1;
        console.log(ms)
        if (ms > 3500) {
            reject('Request too long')
        } else {
            setTimeout(() => {
                let data = readFileTextSync(path.join(__dirname, 'text.txt'));
                resolve(data)
            }, ms);
        }
    })
}

// function read text
async function readFileTextAsync(path) {
    return fs.readFile(path, {encoding:'utf-8'})
}

// function getText
async function readFileTextSync(path) {
    try {
        let data = await fs.readFile(path, {encoding: 'utf-8'})
        data = JSON.parse(data)
        return data
    } catch (err) {
        console.log(err)
    }
}

function wrapFunction(fn) {
    return function (req, res, next) {
        fn(req, res, next)
        const { filename } = req.params;
        fs.readFile(path.join(__dirname, filename), {encoding: 'utf-8'})
        .then((data) => {
            console.log(data);
            // res.send(JSON.parse(data));
            // return data
        })
        .catch((err) => {
            next(err)
        });
    }
}

function getBukuAsync(path) {
    fs.readFile(path, {encoding: 'utf-8'})
        .then((data) => {
            console.log(data);
            // res.send(JSON.parse(data));
            // return data
        })
        .catch((err) => {
            console.log(err)
        });
}

myEvent.on('bukuAsync', getBukuAsync)

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
    bookPriceAfterTax(buku);
    res.send(buku);
});

// Get 'booksold/:pruchased
app.get('/booksold/:purchased', basicAuth, (req, res) => {
    let { purchased } = req.params;
    purchased = parseInt(purchased);
    if (Number.isNaN(purchased) || purchased < 0) {
        res.status(400).send('purchase invalid');
        return true
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
app.get('/creditbook/:term',basicAuth, async (req, res) => {
    let { term } = req.params;
    term = parseInt(term);
    if (Number.isNaN(term) || term <= 0) {
        res.status(404).send('Parameter Failed');
        return;
    }
    if (term > 36) {
        res.status(403).send('Parameter failed, please insert between 1 until 36')
        return;
    }
    try {
        let books = await getBook(buku);
        const toatlInstalment =  await creditBook(buku, term);
        buku.instalment = toatlInstalment
        res.send(buku);
    } catch (err) {
        res.send(err)
    }
});
// GET '/' route, redirect to '/buku'
app.get('/', (req, res) => {
    res.send(buku);
});

// GET '/bukuasync' route
app.get('/bukuasync/:filename', (req, res, next) => {
    const { filename = 'text.txt' } = req.params;
    myEvent.emit('bukuAsync', path.join(__dirname, filename));
    res.send('Function bukuAsynch');
});

// GET '/bukusync' route
app.get('/bukusync/:filename', async (req, res, next) => {
    const { filename = 'text.txt' } = req.params
    try {
        let data = await fs.readFile(path.join(__dirname, filename), {encoding: 'utf-8'});
        console.log(data);
        res.send(JSON.parse(data));
    } catch(err) {
        next(err);
    }
})

// Object Map
const bookMap = new Map();
bookMap.set('Buku 1', {...buku, title: 'Buku 1'});
bookMap.set('Buku 2', {...buku, title: 'Buku 2'});
bookMap.set('Buku 3', {...buku, title: 'Buku 3'});
// Obejct Set
const bookTitle = new Set(['Buku 1', 'Buku 2', 'Buku 3']);

// GET '/bukusetmap' route
app.get('/bukusetmap', (req, res) => {
    const valueBookMap = [...bookMap].map((arr, index) => {return arr[1]})
    res.send(valueBookMap);
})

// GET '/bukusetmap/:title' route
app.get('/bukusetmap/:title', (req, res, next) => {
    const { title } = req.params;
    if (!bookTitle.has(title)) {
        return next(new Error(`Book with title: ${title} not found`));
    }
    res.send(bookMap.get(title));
})

// POST '/bukusetmap' route
app.post('/bukusetmap', (req, res, next) => {
    const { title } = req.body;
    if (!title) {
        return next(new Error('Title Empty'));
    }
    if( bookTitle.has(title)) {
        res.send(`You have duplicate book with title: ${title},
        ${bookMap.get(title).title}
        `);
    } else {
        bookMap.set(title, {
            ...buku,
            title
        });
        bookTitle.add(title);
        console.log(bookTitle)
        res.send(bookMap.get(title));
    }
})


// CRUD ROUTE

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
});

// Express Error Handler
app.use((err, req, res, next) => {
    res.status(404).send(err.message);
})

// express listen
app.listen(port, () => {
    console.log(`Express Listening on port: ${port}`);
});