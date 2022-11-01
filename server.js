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
    let min = Math.floor(duration / 60);
    if (min < 10) {
        min = `0${min}`
    }
    let sec = duration % 60;
    if (sec < 10) {
        sec = `0${sec}`;
    }
    return `${min}:${sec}`;
}

// mongoose connect
mongoose.connect(`mongodb://localhost:27017/${dbName}`)
    .then(() => { console.log('MongoDB connections open.') })
    .catch((err) => { console.log(err) });

// Body Parse
const bodyParse = express.urlencoded({ extended: true });

// facet aggregate
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
        let { title, artist, genre, page, limit = 5, convertdur, duration } = req.query;

        const allSongs = await SongModel.find({});

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

        if (duration) {
            queryAggregateSongs.push({
                $sort: {
                    duration: parseInt(duration)
                }
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
            queryAggregateSongs.push(
                {
                    $addFields: {
                        pages: `${page + 1} / ${Math.ceil(allSongs.length / limit)}`
                    }
                }
            )
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
        const updatedSong = await SongModel.findByIdAndUpdate(id, song, { new: true, runValidators: true });
        
        if (song.artist) {
            const oldSong = await SongModel.findById(id);
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
            message: deletedSong ? `Song with ID: ${id} has been deleted` : `ID: ${id} not found`
        })
    } catch (err) {
        next(err)
    }
});

// GET '/playlist' route
app.get('/playlist', async (req, res, next) => {
    try {
        let { convertdur, name, page, limit = 1, duration } = req.query;
        const query = { $and: [] }
        const querySongs = { songs: { $and: [] } }
        const queryAggregatePlaylist = [
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
            },
            {
                $addFields: {
                    'totalDuration': {
                        $sum: '$songs.duration'
                    }
                }
            }
        ]

        if (name) {
            query.$and.push({ name })
        }

        if (query.$and.length > 0) {
            queryAggregatePlaylist.push({
                $match: query
            })
        }

        if (duration) {
            queryAggregatePlaylist.push({
                $sort: {
                    totalDuration: parseInt(duration)
                }
            })
        }

        if (page) {
            console.log('Hello page')
            page = parseInt(page) - 1;
            if (Number.isNaN(page) || page < 0) {
                page = 0;
            }

            limit = parseInt(limit);
            if (Number.isNaN(limit) || limit < 0) {
                limit = 1
            }

            queryAggregatePlaylist.push(
                {
                    $skip: page * limit
                },
                {
                    $limit: limit
                }
            );
        }

        facetAggregate.$facet.data = queryAggregatePlaylist;
        const playlist = await PlaylistModel.aggregate([facetAggregate]);

        if (convertdur) {
            playlist[0].data.map((el) => {
                el.songs.map((arr) => {
                    arr.duration = convertDurationToString(arr.duration);
                    return arr;
                })
                el.totalDuration = convertDurationToString(el.totalDuration);
                return el;
            })
        }
        res.json({
            status: playlist[0].data.length > 0 ? 200 : 404,
            message: playlist[0].data.length > 0 ? playlist : 'Playlist empty'
        })
    }
    catch (err) {
        next(err);
    }
});

// POST '/playlist' route
app.post('/playlist', bodyParse, async (req, res, next) => {
    try {
        let { playlist } = req.body;
        playlist.songs = playlist.songs.split(' ').map(el => mongoose.Types.ObjectId(el));
        const newPlaylist = new PlaylistModel(playlist);
        await newPlaylist.save();
        res.json({
            status: 201,
            message: newPlaylist
        })
    } catch (err) {
        next(err);
    }

});

// PUT '/playlist/addsongs/:id' route
app.put('/playlist/addsongs/:id', bodyParse, async (req, res, next) => {
    try {
        const { id } = req.params;
        let { songs } = req.body;
        songs = songs.split(' ').map(el => mongoose.Types.ObjectId(el));

        const playlist = await PlaylistModel.findById(id);

        // duplicate validation
        songs = songs.filter((el) => {
            if (playlist.songs.indexOf(el) === -1) {
                return el
            }
            return false
        })

        await playlist.updateOne({
            $push: {
                songs: { $each: songs }
            }
        }, { new: true, runValidators: true });

        res.json({
            status: 201,
            message: playlist
        })
    } catch (err) {
        next(err)
    }
});

// PUT '/playlist/deletesongs/:id' route
app.put('/playlist/deletesongs/:id', bodyParse, async (req, res, next) => {
    try {
        const {id} = req.params;
        let { songs } = req.body;
        songs = songs.split(' ').map(el => mongoose.Types.ObjectId(el));

        const playlist = await PlaylistModel.findById(id);

        await playlist.updateOne({
            $pullAll: {
                songs: songs
            }
        });

        res.json({
            status: 201,
            message: `songs with ID: ${songs} has been deleted from ${playlist.name}`
        })

    } catch (err) {
        next(err);
    }
});

// DELETE '/playlist/delete/:id' route
app.delete('/playlist/delete/:id', async (req, res, next) => {
    const { id } = req.params;
    await PlaylistModel.findByIdAndDelete(id);
    res.json({
        status: 201,
        message: `Playlist with ID: ${id}, has been deleted.`
    })
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