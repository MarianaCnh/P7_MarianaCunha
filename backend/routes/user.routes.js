//Besoin de express pour créer un router 
const express = require('express');
const router = express.Router();
const userCtrl = require('../controllers/user');
const auth = require('../middleware/auth');
const multer = require('../middleware/multer-config');

//routes inscription, connexion, éditer le profil, afficher tout les users, suppression
router.post('/signup', userCtrl.singup);
router.post('/login', userCtrl.login);
router.put('/:id', auth, userCtrl.updateUser);
router.delete('/:id', auth,userCtrl.deleteUser);

module.exports = router;