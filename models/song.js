// mongoose
const mongoose = require('mongoose');
const { Schema } = mongoose;

// Artist Model
const ArtistModel = require('./artist');

// Song Schema
const songSchema = new Schema({
    'title': {
        type: String,
        minLength: 3,
        maxLength: 25,
        required: true
    },
    'artist': {
        type: Schema.Types.ObjectId,
        ref: 'Artist'
    },
    'genre': {
        type: String,
        required: true,
        enum: ['Pop', 'Rock', 'Jazz']
    },
    'duration': {
        type: Number,
        min: 0,
        required: true
    }
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
        await artist.update({
            $pull: {
                songs: song.id
            }
        })
    })

// Song Model
const SongModel = mongoose.model('Song', songSchema);

module.exports = SongModel;