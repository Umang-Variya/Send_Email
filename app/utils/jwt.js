const jwt1 = require('jsonwebtoken');

function jwt(req, res, next) {
    const authHeader = req.headers.authorization;
    if (authHeader) {
        const token = authHeader.split(' ')[1];
        if (token) {
            jwt1.verify(token, 'tokeeeeeennn', (err, user) => {
                if (err) {
                    let error1 = [];
                    error1.push('Invalid Token');
                    return res.status(401).send("Token is Expired!!");
                }
                req.user_id = user.user_id;
                console.log("Token Called!!!!");
                next();
            })
        } else {
            return res.status(401).send('Token must be provided!');
        }
    } else {
        return res.status(401).send('You are not authorized!');
    }
}

module.exports = {
    jwt
}