const morx = require('morxv2');
const q = require('q');
const Beneficiary = require('../../mongo_models/beneficiary');

const spec = morx
  .spec({})
  .build('id', 'required:1, eg:abc')
  .build('firstName', 'eg:abc')
  .build('lastName', 'eg:abc')
  .build('phone', 'eg:abc')
  .build('isWhatsApp', 'eg:false')
  .build('email', 'eg:abc,validators:isEmail')
  .build('context', 'eg:abc')
  .build('bankName', 'eg:abc')
  .build('accountNumber', 'eg:abc')
  .build('accountName', 'eg:abc')
  .build('paymentLink', 'eg:wallets')
  .build('location', 'eg:abc')
  .build('isVerified', 'eg:abc')
  .build('isDeleted', 'eg:abc')
  .build('socialMedia', 'eg:twitter')
  .end();

function service(data) {
  const d = q.defer();
  let params = {};

  q.fcall(async () => {
    const result = morx.validate(data, spec, { throwError: true });
    params = result.params;
    const beneficiary = await Beneficiary.findById(params.id);
    if(!beneficiary) throw new Error('Invalid id passed');

    if(params.firstName) {
      // Do audit stuff here
      //
      beneficiary.firstName = params.firstName;
    }

    if(params.lastName) {
      // Do audit stuff here
      //
      beneficiary.lastName = params.lastName;
    }

    if(params.phone) {
      // Do audit stuff here
      //
      beneficiary.phone = params.phone;
    }

    if(params.isWhatsApp) {
      // Do audit stuff here
      //
      beneficiary.isWhatsApp = params.isWhatsApp;
    }

    if(params.bankName) {
      // Do audit stuff here
      //
      beneficiary.bankName = params.bankName;
    }

    if(params.accountNumber) {
      // Do audit stuff here
      //
      beneficiary.accountNumber = params.accountNumber;
    }

    if(params.accountName) {
      // Do audit stuff here
      //
      beneficiary.accountName = params.accountName;
    }

    if(params.paymentLink) {
      // Do audit stuff here
      //
      beneficiary.paymentLink = params.paymentLink;
    }

    if(params.location) {
      // Do audit stuff here
      //
      beneficiary.location = params.location;
    }

    if(params.isVerified) {
      // Do audit stuff here
      //
      beneficiary.isVerified = params.isVerified;
    }

    if(params.socialMedia) {
      // Do audit stuff here
      //
      beneficiary.socialMedia = params.socialMedia;
    }

    if(params.email) {
      // Do audit stuff here
      //
      beneficiary.email = params.email;
    }

    if(params.context) {
      // Do audit stuff here
      //
      beneficiary.context = params.context;
    }

    if(params.isDeleted) {
      beneficiary.isDeleted = 1;
      beneficiary.deleted_at = new Date().toUTCString();
    }

    await beneficiary.save();
    d.resolve(beneficiary);

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