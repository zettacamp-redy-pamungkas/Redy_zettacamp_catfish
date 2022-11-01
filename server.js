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

// Custom Error Handler
const CustomErrorHandler = require('./utils/CustomErrorHandler');

// mongoose connect
mongoose.connect(`mongodb://localhost:27017/${dbName}`)
    .then(() => { console.log('MongoDB connections open.') })
    .catch((err) => { console.log(err) });

const bodyParse = express.urlencoded({ extended: true });

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
        const { title, artist, genre } = req.query;
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

        const query = { $and: [] };

        if (title) {
            query.$and.push({title});
        }

        if (artist) {
            query.$and.push({artist});
        }

        if (genre) {
            query.$and.push({genre});
        }

        if(query.$and.length) {
            queryAggregateSongs.push({
                $match: query
            })
        }

        const songs = await SongModel.aggregate(queryAggregateSongs)
        res.json({
            status: songs.length > 0 ? 200 : 404,
            message: songs.length > 0 ? songs : 'Songs not found'
        })
    } catch (err) {
        next(err)
    }
});

// POST '/songs' route
app.post('/songs', bodyParse, async (req, res, next) => {
    try {
        const { song } = req.body;
        const newSong = new SongModel(song);
        const artist = await ArtistModel.findById(song.artist);
        if (!artist) {
            return next(new CustomErrorHandler(404, 'Artist not found'))
        }
        await newSong.save();
        res.status(201).json({
            status: 201,
            message: newSong
        });
    } catch (err) {
        next(err);
    }
});

// PUT 'songs/detail/:id' route

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
    res.status(status).json({
        status,
        message
    })
})

// Express Listen
app.listen(port, () => {
    console.log(`Express Listening on port: ${port}`);
});