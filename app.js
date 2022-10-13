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
        return song.artist === artistName
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

    while(true) {
        // Get Random Song From copySong
        const index = Math.floor(Math.random() * copySong.length)
        const song = copySong[index];
        // Remove song from copySong
        copySong.splice(index, 1);
        // check songList duration
        const songListuration = getAllSongDuration(songList);
        if (songListuration + song.duration > min) {
            break;
        }
        if (songListuration < min) {
            // push song
            songList.push(song);
        } else {
            break;
        }
    }

    // return song
    return songList;
}