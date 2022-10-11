const buku = {
    title: 'Untitled Book',
    author: 'Unfamous Author',
    price: 10000,
    onSale: false,
    discount: 20,
    tax: 11,
    stock: 5
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