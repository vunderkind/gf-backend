const config = require('../helpers/config')

const basicAuth = (req, res, next) => {
  // check for basic auth header
  if (!req.headers.authorization || req.headers.authorization.indexOf('Basic ') === -1) {
    return next(new Error('Missing Authorization Header'));
  }

  const base64Credentials = req.headers.authorization.split(' ')[1];
  const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');

  // verify auth credentials
  const [username, password] = credentials.split(':');
  console.log(username)
  console.log(password)
  console.log(config.auth)
  const authenticated = authenticate(
    username,
    password
  );

  if (!authenticated) {
    return next(new Error('Invalid Authentication Credentials'));
  }

  return next();
}

const authenticate = (username, password) => {
  return config.auth.username == username && config.auth.password == password
}

module.exports = {
  basicAuth
};