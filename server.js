// Express
const express = require('express');
const app = express();
const port = 3000;

// Mongoose
const mongoose = require('mongoose');
const dbName = 'bonanza';

// Artist and Song model
const SongModel = require('./models/song');
const ArtistModel = require('./models/artist');

// mongoose connect
mongoose.connect(`mongodb://localhost:27017/${dbName}`)
    .then(() => { console.log('MongoDB connections open.') })
    .catch((err) => { console.log(err) });

// GET '/' route
app.get('/', (req, res) => {
    res.json({
        status: 200,
        message: 'Hello World'
    });
});

// GET '/songs' route
app.get('/songs', async (req, res, next) => {
    try {
        const queryAggregateSongs = [
            {
                $lookup: {
                    from: 'artists',
                    localField: 'artist',
                    foreignField: '_id',
                    as: 'artist-populate'
                }
            },
            {
                $set: {
                    'artist-populate': {
                        $arrayElemAt: ['$artist-populate', 0]
                    }
                }
            },
            {
                $set: {
                    'artist': {
                        $concat: ['$artist-populate.first-name', ' ', '$artist-populate.last-name']
                    }
                }
            },
            {
                $project: {
                    'artist-populate': 0
                }
            },
        ];

        const songs = await SongModel.aggregate(queryAggregateSongs)
        res.json({
            status: 200,
            message: songs
        })
    } catch (err) {
        next(err)
    }
});

// GET '/artist' route
app.get('/artists', async (req, res, next) => {
    try {
        const queryAggregateArtist = [
            {
                $lookup: {
                    from: 'songs',
                    localField: 'songs',
                    foreignField: '_id',
                    as: 'songs'
                }
            },
            {
                $project: {
                    'songs.artist': 0
                }
            }
        ];

        const artists = await ArtistModel.aggregate(queryAggregateArtist);

        res.json({
            status: 200,
            message: artists
        })
    } catch (err) {
        next(err)
    }
})

// Error Handler
app.use((err, req, res, next) => {
    const { status = 500, message } = err;
    res.json({
        status,
        message
    })
})

// Express Listen
app.listen(port, () => {
    console.log(`Express Listening on port: ${port}`);
});