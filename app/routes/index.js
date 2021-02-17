const express = require('express');
const router = express.Router();
const storeController = require('../controllers/storeController');
const userController = require('../controllers/userController');
const { catchErrors } = require('../handlers/errorHandlers');

// Do work here
router.get('/', catchErrors(storeController.getStore));

router.get('/add', storeController.addPage);
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
router.get('/stores/:id/edit', catchErrors(storeController.editStore));

router.get('/tags', catchErrors(storeController.getStoreByTags));
router.get('/tags/:tag', catchErrors(storeController.getStoreByTags));

router.get('/login', userController.login);

router.get('/register', userController.register);
router.post('/register', userController.validateRegister,
userController.registration);


module.exports = router;
