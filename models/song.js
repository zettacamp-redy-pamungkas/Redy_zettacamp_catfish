// mongoose
const mongoose = require('mongoose');
const { Schema } = mongoose;

// Artist Model
const ArtistModel = require('./artist');

// Song Schema
const songSchema = new Schema({
    'title': String,
    'artist': {
        type: Schema.Types.ObjectId,
        ref: 'Artist'
    },
    'genre': {
        type: String,
        enum: ['Pop', 'Rock', 'Jazz']
    },
    'duration': Number
});

songSchema
.post('save', async(song) => {
    const artist = await ArtistModel.findById(song.artist);
    artist.songs.push(song);
    await artist.save();
})
.pre('find', function(next) {
    this.populate({
        path: 'artist',
        select: 'first-name last-name'
    })
    next()
})
// on delete cascade
    .post('deleteOne', async(song) => {
        const artist = await ArtistModel.findById(song.artist);
        artist.update({
            songs: {
                $pull: song.id
            }
        })
    })

// Song Model
const SongModel = mongoose.model('Song', songSchema);

module.exports = SongModel;