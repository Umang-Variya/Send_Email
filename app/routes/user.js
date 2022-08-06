const express = require('express')
const router = express.Router();
const {
    jwt
} = require('../utils/jwt');
const upload = require('../utils/multer')
const {
    getAllUsers,
    registerUser,
    verifyMail,
    aggregation,
    lookUp,
    forgotPassword,
    sign_in,
    verifyToken,
    postUpload
} = require('../controller/user');


router.post('/login', sign_in)
router.post('/register', registerUser)
router.post('/forgot', forgotPassword)
router.get("/verify/:id/:token", verifyMail)

router.get('/jwt', jwt, verifyToken)
router.get('/', jwt, getAllUsers)
router.get('/test', jwt, aggregation)
router.get('/lookup', jwt, lookUp)
router.post('/post', upload.single('image'), jwt, postUpload)

module.exports = router;