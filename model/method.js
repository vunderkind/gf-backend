const jwt = require('jsonwebtoken');
const secrets = require('./secrets');

module.exports = (req, res, next) => {
    const tokenBear = req.headers.authorization;
    if(!tokenBear) {
        res.status(401).json({message: 'no token, so you cannot pass!'})
    }
    const token = tokenBear.substring(7, tokenBear.length);
    
    if(token){
        const secret = secrets.jwtsecret;

        jwt.verify(token, secret, (error, decodedToken) => {
            if(error){
                res.status(401).json({message: `tampered token. invalid creds.`})
            }
            else{
                res.decodeJwt = decodedToken;
                next();
            }
        })
    }
    else{
        res.status(400).json({ message: 'No credentials provided' });
    }
}