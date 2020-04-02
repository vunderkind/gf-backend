const morx = require('morxv2');
const q = require('q');
const User = require('../../mongo_models/user');
const sha512 = require('crypto').createHash;

const spec = morx
  .spec({})
  .build('firstName', 'required:1')
  .build('lastName', 'required:1')
  .build('phone', 'required:1')
  .build('bio', 'required:1')
  .build('email', 'required:1, validators:isEmail')
  .build('role', 'required:1')
  .build('password', 'required:1')
  .end();

function service(data) {
  const d = q.defer();
  let params = {};

  q.fcall(async () => {
    const result = morx.validate(data, spec, { throwError: true });
    params = result.params;

    //Init defaults
    params.created_at = new Date().toUTCString();
    params.created_ts = Date.now();
    params.status = "pending-approval";

    params.password = sha512('sha512').update(params.password).digest('hex');
    params.login_hash = Date.now();

    const newUser = await new User(params).save();

    d.resolve({
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      created_at: newUser.created_at
    });

  })
    .catch((e) => {
      if(e.message.indexOf('$email_1 dup') >= 0) {
        e.message = 'Email already in use by another beneficiary';
      }
      d.reject(e);
    });

  return d.promise;
}

service.morxspc = spec;
module.exports = service;