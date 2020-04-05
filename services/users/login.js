const User = require('../../mongo_models/user');
const sha512 = require('crypto').createHash;
const morx = require('morxv2');
const q = require('q');
const jwt = require('jsonwebtoken');


//
const spec = morx
  .spec({})
  .build('email', 'required:1, eg:15')
  .build('password', 'required:1, eg:15')
  .end();
function service(data) {
  const d = q.defer();
  let params = {};
  const locals = {};

  q.fcall(async () => {
    const result = morx.validate(data, spec, { throwError: true });
    params = result.params;
    const user = await User.findOne({
      email: params.email,
      password: sha512('sha512').update(params.password).digest('hex')
    })
    if (!user) {
     throw new Error('Invalid email / password passed')
    }
    if (user.status !== 'approved') {
      throw new Error('Approval needed. Please contact support');
    }
    
    user.login_hash = `${Date.now()}_${user._id}`;
    const JWTExpiry = process.env.JWTExpiryV;
    const token = jwt.sign({
      id: user._id,
      lh: user.login_hash,
    }, process.env.JWTKEY, { expiresIn: JWTExpiry });

    await user.save();
    user.token = token;
    d.resolve({
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      token
    });
  })
    .catch((e) => {
      d.reject(e);
    });

  return d.promise;
}

service.morxspc = spec;
module.exports = service;
