let arrSongs = [
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

function convertArrSongIntDurationToString(intDuration) {
    let duration = intDuration * 60 + Math.ceil(Math.random() * 59);
    return `${Math.floor(duration / 60)}:${duration%60}`
}

function convertIntDurationToString(intDuration) {
    if (intDuration > 3600) {
        const hour = Math.floor(intDuration / 3600);

        const div_for_min = intDuration % (3600);
        const min = Math.floor(div_for_min / 60);

        const div_for_second = div_for_min % 60;
        const sec = div_for_second

        return `${hour}:${min}:${sec}`;


    }
    return `${Math.floor(intDuration / 60)}:${intDuration%60}`
}

function convertStringDurationToInt(stringDuration) {
    let duration = stringDuration.split(':').map((el) => {return parseInt(el)});
    return 60 * duration[0] + duration[1]
}

// Transform duration to string duration
arrSongs = arrSongs.map((el) => {
    el.duration = convertArrSongIntDurationToString(el.duration);
    return el;
})

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
        duration += convertStringDurationToInt(song.duration);
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
        if (songListDuration + convertStringDurationToInt(song.duration) >= min * 60) {
            continue;
        }
        if (songListDuration < min * 60) {
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

// usersMap object
const usersMap = new Map();
usersMap
    .set('admin', {
        username: 'admin',
        password: '$2b$10$3XECZ3kkMD9kOp1LMRUIOOb6x5MEpBtxUKMoDFfjOJMP1qnssh77q'
})
    .set('moderator', {
        username: 'moderator',
        password: '$2b$10$2ZwEYFeq1Ro0xFFKdy/HQOEI97NHvfBJBK/5ecIrOt7YR7jPkKHjq'
    });

// usersSet object
const usersSet = new Set(['admin', 'moderator'])

// Express Middleware
// getToken jwt
function getToken(req, res, next) {
    const { username, password } = req.body;
    if (usersSet.has(username)) {
        bcrypt.compare(password, usersMap.get(username).password)
            .then((result) => {
                if(result) {
                    // Create Token
                    jwt.sign({message: 'Welcome to my site', username}, 'secret-zetta', {expiresIn: '1h'}, (err, token) => {
                        if(err) {
                            return next(new CustomError(400, err.message))
                        }
                        res.json({token})
                    })
                } else {
                    next(new CustomError(401, 'Password wrong, please try again'))
                }
            })
    } else {
        return next(new CustomError(401, 'Username not found, please signup.'))
    }
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
        req.token = decode
        next()
    })
}

// checkAccount
function checkAccount(req, res, next) {
    const { username, password } = req.body;
    if (!username) {
        return next(new CustomError(400, 'Please provide username'));
    }
    if (!password) {
        return next(new CustomError(400, 'Password empty'));
    }
    next()
}

// registerAccount
function registerAccount(req, res, next) {
    const { username, password } = req.body;
    if (usersSet.has(username)) {
        return next(new CustomError(400, `Username: ${username} has been taken, please choose different username`));
    }
    usersSet.add(username);
    bcrypt.hash(password, 10)
        .then((result) => {
            usersMap.set(username, {
                username,
                password: result
            })
            next()
        })
}

// POST '/auth/login' route
app.post('/auth/login', express.urlencoded({extended:true}), checkAccount, getToken)

// POST '/auth/signup' route
app.post('/auth/signup', express.urlencoded({extended:true}), checkAccount, registerAccount, (req, res) => {
    res.json({
        status: 200,
        message: 'Successfully register, please login to access my service.'
    })
})

// GET 'songlist'
app.get('/songlist', authenticate, (req, res, next) => {
    const {artist, genre, min} = req.query;
    let songList = arrSongs;
    if (artist) {
        songList = filterSongBasedArtist(songList, artist);
    }
    if (genre) {
        songList = filterSongBasedGenre(songList, genre);
    }
    if (min) {
        songList = getRandomSongListUnder(songList, min);
        songList = [...songList, {"Total Duration":  convertIntDurationToString(getAllSongDuration(songList))}]
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

// GET '/users' route
app.get('/users', (req, res) => {
    res.json(
        [...usersMap].map((el) => {return el[1]})
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