const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const slug = require('slugs');

const storeShema = new mongoose.Schema({
    name: {
        type: String,
        trim: true,
        required: 'Name is required'
    },
    slug: String,
    description: {
        type: String,
        slug: true
    },
    location: {
        type: {
            type: String,
            default: 'Point'
        },
        coordinates: [{
            type: Number,
            required: 'You must supply coordinates'
        }],
        address: {
            type: String,
            required: 'You must supply addres',
        }
    },
    date: {
        type: Date,
        default: Date.now
    },
    photo: String,
    tags: [String],
    author: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: 'You must supply the author',
    }
});

storeShema.index({
    name: 'text',
    description: 'text'
});

storeShema.index({
    location: '2dsphere'
});

storeShema.pre('save', async function(next) {
    if(!this.isModified('name')) {
        next();
        return;
    }
    this.slug = slug(this.name);
    const slugRegExp = new RegExp(`^(${this.slug})((-[0-9]*$)?)$`, 'i');
    const storeWithSlug = await this.constructor.find({slug: slugRegExp});
    if (storeWithSlug.length) {
        this.slug = `${this.slug}-${storeWithSlug.length + 1}`
    }
    next();
})

storeShema.statics.getTagList = function() {
    return this.aggregate([
        { $unwind: '$tags'},
        { $group: {_id: '$tags', amount: {$sum: 1} }},
        { $sort : {amount: -1} }
    ]);
}

storeShema.virtual('reviews', {
    ref: 'Review',
    localField: '_id',
    foreignField: 'store'
});

module.exports = mongoose.model('Store', storeShema);