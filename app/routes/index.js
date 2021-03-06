const express = require('express');
const router = express.Router();
const storeController = require('../controllers/storeController');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');
const reviewController = require('../controllers/reviewController');
const { catchErrors } = require('../handlers/errorHandlers');

// Do work here
router.get('/', catchErrors(storeController.getStore));

router.get('/add', authController.isLoggedIn, storeController.addPage);
router.post('/add', 
storeController.upload,
catchErrors(storeController.resize),
catchErrors(storeController.createStore));
router.post('/add/:id', 
storeController.upload,
catchErrors(storeController.resize),
catchErrors(storeController.updateStore));

router.get('/store/:slug', catchErrors(storeController.getStoreBySlug));
router.get('/stores', catchErrors(storeController.getStore));
router.get('/stores/page/:page', catchErrors(storeController.getStore));
router.get('/stores/:id/edit', catchErrors(storeController.editStore));

router.get('/tags', catchErrors(storeController.getStoreByTags));
router.get('/tags/:tag', catchErrors(storeController.getStoreByTags));

router.get('/login', userController.login);
router.post('/login', authController.login);

router.get('/register', userController.register);
router.post('/register', userController.validateRegister,
userController.registration, authController.login);

router.get('/logout', authController.logout);

router.get('/account', authController.isLoggedIn, userController.account);
router.post('/account', catchErrors(userController.updateAccount));
router.post('/account/forgot', catchErrors(authController.forgot));
router.get('/account/reset/:token', catchErrors(authController.reset));
router.post('/account/reset/:token', authController.confirmedPasswords, catchErrors(authController.update));
router.get('/map', storeController.mapPage);

router.get('/liked/:id', catchErrors(userController.addLikeStore));
// user way to get hearts
// router.get('/hearts', authController.isLoggedIn, catchErrors(userController.getHearts));
// store way to get hearts
router.get('/hearts', authController.isLoggedIn, catchErrors(storeController.getHearts));
router.post('/review/:id', authController.isLoggedIn, catchErrors(reviewController.addReview))

// api
router.get('/api/search', catchErrors(storeController.search));
router.get('/api/stores/near', catchErrors(storeController.mapStores));

router.get('/top', catchErrors(storeController.getTopStores));




module.exports = router;
