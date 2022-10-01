// Add Dummy Data to table
const tableArr = [
    [
        'Lobak',
        './img/turnip_pexels.jpeg',
        1.56,
        'fruit'
    ],
    [
        'Anggur',
        './img/grape_pexels.jpeg',
        2.21,
        'fruit'
    ],
    [
        'Kopi',
        './img/coffee_pexels.jpeg',
        1.69,
        'dairy'
    ],
];

// get all product in localStorage
const productList = JSON.parse(localStorage.getItem('productList'));

if (!productList) {
    localStorage.setItem('productList', JSON.stringify(tableArr));
}