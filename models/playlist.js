// mongoose
const mongoose = require('mongoose');
const { Schema } = mongoose;

// playlist schema
const playlistSchema = new Schema({
    name: String,
    songs: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Song'
        }
    ]
});

// playlist model
const PlaylistModel = mongoose.model('Playlist', playlistSchema);

module.exports = PlaylistModel