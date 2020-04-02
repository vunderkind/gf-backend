const User = require('../../mongo_models/user');
const morx = require('morxv2');
const q = require('q');
const jwt = require('jsonwebtoken');

const spec = morx
  .spec({})
  .build('token', 'required:1, eg:15')
  .build('allowed_roles', 'eg:43')
  .end();
function service(data) {
  const d = q.defer();
  let params = {};

  q.fcall(async () => {
    const result = morx.validate(data, spec, { throwError: true });
    params = result.params;
    const decoded_jwt = jwt.verify(params.token, process.env.JWTKEY);
    const user = await User.findById(decoded_jwt.id);
    if (decoded_jwt.lh !== user.login_hash) {
      throw new Error('Token has been invalidated.');
    }

    if (params.allowed_roles && !params.allowed_roles[user.role]) {
      throw new Error('Unauthorized access');
    }

    if (user.status !== 'approved') {
      throw new Error('Approval needed. Please contact support');
    }

    d.resolve(user);
  })
    .catch((e) => {
      d.reject(e);
    })

  return d.promise;
}

service.morxspc = spec;
module.exports = service;
