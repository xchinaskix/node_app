const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const reviewShema = new mongoose.Schema({
    date: {
        type: Date,
        default: Date.now
    },
    text: {
        type: String,
        required: 'You must apply a text of the review'
    },
    rating: {
        type: Number,
        min: 1,
        max: 5
    },
    author: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: 'You must supply the author',
    },
    store: {
        type: mongoose.Schema.ObjectId,
        ref: 'Store',
        required: 'You must supply the store',
    }
});

function autopopulate(next) {
    this.populate('author');
    next();
}

reviewShema.pre('find', autopopulate);
reviewShema.pre('findOne', autopopulate);


module.exports = mongoose.model('Review', reviewShema);