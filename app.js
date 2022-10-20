const arrSongs = [
    {
        name: 'Song 1',
        artist: 'Artist 1',
        genre: 'Genre A',
        duration: 4
    },
    {
        name: 'Song 2',
        artist: 'Artist 1',
        genre: 'Genre A',
        duration: 5
    },
    {
        name: 'Song 3',
        artist: 'Artist 1',
        genre: 'Genre B',
        duration: 3
    },
    {
        name: 'Song 4',
        artist: 'Artist 2',
        genre: 'Genre A',
        duration: 2
    },
    {
        name: 'Song 5',
        artist: 'Artist 2',
        genre: 'Genre B',
        duration: 6
    },
    {
        name: 'Song 6',
        artist: 'Artist 2',
        genre: 'Genre B',
        duration: 3
    },
    {
        name: 'Song 7',
        artist: 'Artist 3',
        genre: 'Genre C',
        duration: 5
    },
    {
        name: 'Song 8',
        artist: 'Artist 3',
        genre: 'Genre A',
        duration: 5
    },
    {
        name: 'Song 9',
        artist: 'Artist 3',
        genre: 'Genre A',
        duration: 5
    },
    {
        name: 'Song 10',
        artist: 'Artist 3',
        genre: 'Genre B',
        duration: 6
    },
    {
        name: 'Song 11',
        artist: 'Artist 3',
        genre: 'Genre A',
        duration: 4
    },
    {
        name: 'Song 12',
        artist: 'Artist 4',
        genre: 'Genre A',
        duration: 5
    },
    {
        name: 'Song 13',
        artist: 'Artist 4',
        genre: 'Genre C',
        duration: 3
    },
    {
        name: 'Song 14',
        artist: 'Artist 2',
        genre: 'Genre C',
        duration: 2
    },
    {
        name: 'Song 15',
        artist: 'Artist 2',
        genre: 'Genre C',
        duration: 6
    },
    {
        name: 'Song 16',
        artist: 'Artist 2',
        genre: 'Genre B',
        duration: 3
    },
    {
        name: 'Song 17',
        artist: 'Artist 3',
        genre: 'Genre A',
        duration: 5
    },
    {
        name: 'Song 18',
        artist: 'Artist 3',
        genre: 'Genre B',
        duration: 5
    },
    {
        name: 'Song 19',
        artist: 'Artist 5',
        genre: 'Genre A',
        duration: 5
    },
    {
        name: 'Song 20',
        artist: 'Artist 5',
        genre: 'Genre C',
        duration: 6
    },
];

function filterSongBasedArtist(songs, artistName) {
    return songs.filter((song) => {
        return song.artist.toLowerCase() === artistName.toLowerCase()
    });
}

function filterSongBasedGenre(songs, genre) {
    return songs.filter((song) => {
        return song.genre === genre
    });
}

function getAllSongDuration(songs) {
    let duration = 0
    if (songs.length === 0) {
        return duration;
    }
    for (let song of songs) {
        duration += song.duration;
    }

    return duration;
}

function getRandomSongListUnder(songs, min = 60) {
    const copySong = [...songs];
    const songList = [];

    while(copySong.length > 0) {
        // Get Random Song From copySong
        const randomIndex = Math.floor(Math.random() * copySong.length)
        const song = copySong[randomIndex];
        // Remove song from copySong
        copySong.splice(randomIndex, 1);
        // check songList duration
        const songListDuration = getAllSongDuration(songList);
        if (songListDuration + song.duration >= min) {
            break;
        }
        if (songListDuration < min) {
            // push song
            songList.push(song);
        } else {
            break;
        }
    }

    // return song
    return songList;
}

// Express
const express = require('express');
const app = express();
const port = 3000;

// jwt
const jwt = require('jsonwebtoken');

// bcrypt
const bcrypt = require('bcrypt');

// Class Error
class CustomError extends Error {
    constructor(statusCode, message) {
        super();
        this.statusCode = statusCode;
        this.message = message;
    }
}

// Express Middleware
// getToken jwt
function getToken(req, res, next) {
    const { username, password } = req.body;
    jwt.sign({username, password}, 'secret-zetta', {expiresIn: '600s'}, (err, token) => {
        if(err) {
            return next(new CustomError(400, err.message))
        }
        res.json({token})
    })
}

// verify token jwt
function authenticate (req, res, next) {
    const bearerToken = req.headers.authorization
    if(!bearerToken) {
        return next(new CustomError(400, 'Token not provided'))
    }
    const tokenJWT = bearerToken.split(' ')[1]
    // console.log(bearerToken)
    jwt.verify(tokenJWT, 'secret-zetta', (err, decode) => {
        if (err) {
            return next(new CustomError(400, err.message))
        }
        next()
    })
}

// POST '/auth/login' route
app.post('/auth/login', express.urlencoded({extended:true}), getToken)

// GET 'songlist'
app.get('/songlist', authenticate, (req, res, next) => {
    const {artist, genre} = req.query;
    let songList = arrSongs;
    if (artist) {
        songList = filterSongBasedArtist(songList, artist);
    }
    if (genre) {
        songList = filterSongBasedGenre(songList, genre);
    }
    if (songList.length === 0) {
        return next(new CustomError(404, 'Song list tidak ditemukan.'))
    }
    res.json(songList);
});

// GET 'randomsonglist' route
app.get('/randomsonglist', authenticate, (req, res, next) => {
    const { min = 60 } = req.query;
    const randomSong = getRandomSongListUnder(arrSongs, min)
    res.json(
        [...randomSong, {"Total Duration": getAllSongDuration(randomSong)}]
    )
})

// Express Error Handler
app.use((err, req, res, next) => {
    const { statusCode = 500, message } = err;
    res.status(statusCode).json({
        status: statusCode,
        message
    })
})

// Express Listen
app.listen(port, () => {
    console.log(`Express listening on port: ${port}`);
})