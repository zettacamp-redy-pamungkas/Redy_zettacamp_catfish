const buku = {
    title: 'Untitled Book',
    author: 'Unfamous Author',
    price: 10000,
    onSale: false,
    discount: 20,
    tax: 11,
    stock: 5,
    purchased: 0
};

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