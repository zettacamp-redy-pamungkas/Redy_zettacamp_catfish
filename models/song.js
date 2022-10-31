// mongoose
const mongoose = require('mongoose');
const { Schema } = mongoose;

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
    'duration': String
});

// Song Model
const SongModel = mongoose.model('Song', songSchema);

module.exports = SongModel;