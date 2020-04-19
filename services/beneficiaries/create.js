const morx = require('morxv2');
const q = require('q');
const Beneficiary = require('../../mongo_models/beneficiary');
const createSubaccount = require('./createsubaccount');

const spec = morx
  .spec({})
  .build('firstName', 'required:1')
  .build('lastName', 'required:1')
  .build('phone', 'required:1')
  .build('isWhatsApp', 'eg:false')
  .build('isVerified', 'eg:false')
  .build('email', 'validators:isEmail')
  .build('context', 'required:1')
  .build('bankName', 'required:1')
  .build('bankCode', 'required:1')
  .build('bvn', 'required:1')
  .build('verificationImage', 'eg:abab')
  .build('accountNumber', 'required:1')
  .build('accountName', 'eg:abab')
  .build('paymentLink', 'eg:wallets')
  .build('location', 'required:1')
  .build('socialMedia', 'eg:twitter')
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
    params.donationAmount = 0;
    params.donationCount = 0;
    params.isVerified = false;
    params.email = params.email || 'N/A';

    const newBeneficiary = await new Beneficiary(params).save();
    createSubaccount({
      beneficiary_id: newBeneficiary._id
    });

    d.resolve({
      firstName: newBeneficiary.firstName,
      lastName: newBeneficiary.lastName,
      created_at: newBeneficiary.created_at
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