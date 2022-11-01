// mongoose
const mongoose = require('mongoose');
const { Schema } = mongoose;

// Artist Schema
const artistSchema = new Schema({
    'first-name': {
        type: String,
        minLength: 3,
        maxLength: 25,
        required: true
    },
    'last-name': {
        type: String,
        minLength: 3,
        maxLength: 25,
        required: true
    },
    'gender': {
        type: String,
        minLength: 3,
        maxLength: 25,
        required: true
    },
    'songs': [
        {
            type: Schema.Types.ObjectId,
            ref: 'Song'
        }
    ]
});

// on delete cascade
// artistSchema.post('findOneAndDelete', async (artist) => {
//     await SongModel.deleteMany({
//         _id: {
//             $in: artist.songs
//         }
//     })
// })

// Artist Model
const ArtistModel = mongoose.model('Artist', artistSchema);

module.exports = ArtistModel;