// mongoose
const mongoose = require('mongoose');
const { Schema } = mongoose;

// Artist Schema
const artistSchema = new Schema({
    'first-name': String,
    'last-name': String,
    'songs': [
        {
            type: Schema.Types.ObjectId,
            ref: 'Song'
        }
    ]
});

// Artist Model
const ArtistModel = mongoose.model('Artist', artistSchema);

module.exports = ArtistModel;