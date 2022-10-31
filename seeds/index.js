// moongoose
const mongoose = require('mongoose');
const dbName = 'bonanza';

// mongoose connect
mongoose.connect(`mongodb://localhost:27017/${dbName}`)
    .then(() => { console.log('MongoDB connections open.') })
    .catch((err) => { console.log(err) });

// Artist Model
const ArtistModel = require('../models/artist');

// Song Model
const SongModel = require('../models/song');

// song seeds
const songSeeds = require('./songseeds');

// Random Artist name
const randomArtistName = [
    ['Carlo', 'Adams', 'male'],
    ['Antone', 'Lind', 'male'],
    ['Karina', 'Volkman', 'female']
];

// Random Genre
const genreList = ['Pop', 'Rock', 'Jazz'];

// function getRandom
function getRandom(arr, isUnique = false) {
    const randomIndex = Math.floor(Math.random() * arr.length);

    const result = arr[randomIndex];

    if (isUnique) {
        arr.splice(randomIndex, 1);
    }

    return result;
}

// function getRandomMinMax
function getRandomMinMax(min, max) {
    if (min > max) {
        [min, max] = [max, min];
    }
    return Math.floor(Math.random() * (max - min)) + (min + 1);
}

// function deleteAll
async function deleteAll() {
    await ArtistModel.deleteMany({});
    await SongModel.deleteMany({});
    console.log('All data has been deleted')
}

// function insertArtistDummies
async function insertArtistDummies() {
    for (let artist of randomArtistName) {
        const newArtist = new ArtistModel({
            "first-name": artist[0],
            'last-name': artist[1],
            'gender': artist[2]
        })
        await newArtist.save();
    }
    console.log(`${randomArtistName.length} dummies artist has been inserted`);
}

// function insertSongDummies
async function insertSongDummies() {
    const artists = await ArtistModel.find({});
    for (let song of songSeeds) {
        const duration = getRandomMinMax(3, 8);
        const artist = getRandom(artists);
        const genre = getRandom(genreList);
        const newSong = new SongModel({
            title: song,
            artist: artist,
            duration: duration,
            genre: genre
        })
        await newSong.save()
    }
}

// function deleteArtist
async function deleteArtistById(_id) {
    await ArtistModel.findByIdAndDelete(_id);
    console.log(`Artist with id ${_id} has been deleted.`);
}

// function seeds
async function seeds() {
    await deleteAll();
    await insertArtistDummies();
    await insertSongDummies();
    mongoose.connection.close();
    console.log('Seeds has been inserted');
}

seeds()