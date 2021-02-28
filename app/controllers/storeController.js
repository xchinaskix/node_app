const mongoose = require('mongoose');
const Store = mongoose.model('Store');
const multer = require('multer');
const jimp = require('jimp');
const uuid = require('uuid');
const multerOptions = {
    storage: multer.memoryStorage(),
    fileFilter(req, file, next) {
        const isPhoto = file.mimetype.startsWith('image/');
        isPhoto ? next(null, true) : next({message: 'Wrong file format'}, false);
    }
}

exports.homePage = (req, res) => {
    res.render('index');   
}

exports.upload = multer(multerOptions).single('photo');

exports.resize = async (req, res, next) => {
    if (!req.file) {
        next();
        return;
    }

    const extensions = req.file.mimetype.split('/')[1];
    req.body.photo = `${uuid.v4()}.${extensions}`;
    // resize
    const photo = await jimp.read(req.file.buffer);
    await photo.resize(200, jimp.AUTO);
    await photo.write(`app/public/uploads/${req.body.photo}`);
    next();
}

exports.addPage = (req, res) => {
    res.render('add', {title: 'Add'});   
}

exports.createStore = async (req, res) => {
    req.body.author = req.user._id;
    const store = await(new Store(req.body)).save();
    // req.flash('success', `${store.name} store successfully created. do you want to leave a review?`)
    res.redirect(`/store/${store.slug}`);
}

exports.getStore = async (req, res) => {
    const stores = await Store.find();
    res.render('store', {title: 'Store', stores});
}

const confirmOwner = (store, user) => {
    if (!store.author.equals(user._id)) {
        throw Error('You must own store in order to edit it');
    }
}

exports.editStore = async (req, res) => {
    const store = await Store.findOne({_id: req.params.id});
    confirmOwner(store, req.user);
    res.render('add', {title: `Store ${store.name}`, store});
}

exports.updateStore = async (req, res) => {
    console.log(req.body);
    req.body.location.type = 'Point';
    const store = await Store.findOneAndUpdate({_id: req.params.id}, req.body, {
        new: true,
        runValidators: true
    });
    res.redirect(`/store/${store.slug}`)
}

exports.getStoreBySlug = async (req, res, next) => {
    const store = await Store.findOne({slug: req.params.slug}).populate('author');
    if (!store) return next();
    res.render('single-store', {title: `Store ${store.name}`, store});
}

exports.getStoreByTags = async (req, res) => {
    const tag = req.params.tag;
    const queryTag = tag || {$exists: true};
    const [tags, stores] = await Promise.all([Store.getTagList(), Store.find({tags: queryTag})])
    res.render('tags', {title: 'Tags', stores, tags, tag});
}

exports.search = async (req, res) => {
    const stores = await Store.find({$text: {$search: req.query.q}}, {score: {$meta: 'textScore'}})
    .sort({score: {$meta: 'textScore'}})
    .limit(5);
    res.json(stores)
}

exports.mapStores = async (req, res) => {
    const coordinates = [req.query.lng, req.query.lat].map(parseFloat);
    const q = {
        location: {
            $near: {
                $geometry: {
                    type: 'Point',
                    coordinates
                },
                $maxDistance: 10000 // 10km
            }
        }
    }
    const stores = await Store.find(q).select('name slug description location photo').limit(10);
    res.json(stores);
}

exports.mapPage = (req, res) => {
    res.render('map', {title: 'Map page'})
}
