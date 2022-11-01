// Express
const express = require('express');
const app = express();
const port = 3000;

// Mongoose
const mongoose = require('mongoose');
const dbName = 'bonanza';

// Artist, Song, Playlist model
const SongModel = require('./models/song');
const ArtistModel = require('./models/artist');
const PlaylistModel = require('./models/playlist');

// Custom Error Handler
const CustomErrorHandler = require('./utils/CustomErrorHandler');

// function convertDuration
function convertDuration(duration) {
    const durArr = duration.split(':').map(el => parseInt(el));
    duration = 0
    durArr.forEach((el, index) => {
        if (index === 0) {
            el *= 60
        }
        duration += el
    })
    return duration;
}

// function convertDurationToString
function convertDurationToString(duration) {
    let sec = duration % 60;
    if (sec < 10) {
        sec = `0${sec}`;
    }
    return `0${Math.floor(duration / 60)}:${sec}`;
}

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
        let { title, artist, genre, page, limit = 5, convertdur } = req.query;
        let facetAggregate = {
            $facet: {
                count: [
                    {
                        $group: {
                            _id: null,
                            totalDocs: { $sum: 1 }
                        }
                    },
                    {
                        $project: {
                            _id: 0
                        }
                    }
                ],
                data: []
            }
        }
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
            query.$and.push({ title });
        }

        if (artist) {
            query.$and.push({ artist });
        }

        if (genre) {
            query.$and.push({ genre });
        }

        if (query.$and.length) {
            queryAggregateSongs.push({
                $match: query
            })
        }

        if (page) {
            page = parseInt(page) - 1;
            if (Number.isNaN(page) || page < 0) {
                page = 0;
            }

            limit = parseInt(limit);
            if (Number.isNaN(limit) || limit < 0) {
                limit = 5
            }

            queryAggregateSongs.push(
                {
                    $skip: page * limit
                },
                {
                    $limit: limit
                }
            );
        }

        facetAggregate.$facet.data = queryAggregateSongs

        const songs = await SongModel.aggregate([facetAggregate])

        if (convertdur) {
            songs[0].data.map((el) => {
                el.duration = convertDurationToString(el.duration);
                return el
            })
        }

        res.json({
            status: songs[0].data.length > 0 ? 200 : 404,
            message: songs[0].data.length > 0 ? songs : 'Songs not found'
        })
    } catch (err) {
        next(err)
    }
});

// POST '/songs' route
app.post('/songs', bodyParse, async (req, res, next) => {
    try {
        const { song } = req.body;
        song.duration = convertDuration(song.duration);
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
app.put('/songs/detail/:id', bodyParse, async (req, res, next) => {
    try {
        const { id } = req.params;
        const { song } = req.body;
        const oldSong = await SongModel.findById(id);
        const updatedSong = await SongModel.findByIdAndUpdate(id, song, { new: true, runValidators: true });

        if (song.artist !== oldSong.artist.toString()) {
            const oldArtist = await ArtistModel.findById(oldSong.artist);
            await oldArtist.updateOne({
                $pull: {
                    songs: updatedSong.id
                }
            })
            const artist = await ArtistModel.findById(song.artist);
            await artist.updateOne({
                $push: {
                    songs: updatedSong.id
                }
            })
        }

        res.json(
            {
                status: 201,
                message: updatedSong
            }
        )
    } catch (err) {
        next(err)
    }
});

// DELETE '/songs/detail/:id' route
app.delete('/songs/detail/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        const deletedSong = await SongModel.findByIdAndDelete(id);
        res.json({
            status: deletedSong ? 200 : 404,
            message: deletedSong ?`Song with ID: ${id} has been deleted` : `ID: ${id} not found`
        })
    } catch (err) {
        next(err)
    }
});

// GET '/playlist' route
app.get('/playlist', async (req, res, next) => {
    try {
        const playlist = await PlaylistModel.find({});
        res.json({
            status: 200,
            message: playlist
        })
    }
    catch (err) {
        next(err);
    }
})

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