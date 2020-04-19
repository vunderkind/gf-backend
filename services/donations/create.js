const morx = require('morxv2');
const uuid = require('uuid')
const q = require('q');
const mongoose = require('mongoose');
const Donation = require('../../mongo_models/donation');
const Beneficiary = require('../../mongo_models/beneficiary');

const spec = morx
  .spec({})
  .build('donor', 'required:1, validators:isEmail')
  .build('amount', 'required:1')
  .build('beneficiary_ids', 'required:1')
  .build('source', 'required:1')
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
    params.status = "INITIATED";
    params.reference = uuid.v4();

    const bens_valid = await validate_beneficiaries(params.beneficiary_ids);
    if ( !bens_valid ) throw new Error("Invalid beneficiary_ids, please retry");

    const newDonation = await new Donation(params).save();

    d.resolve({
      reference: newDonation.reference,
      created_at: newDonation.created_at
    });

  })
    .catch((e) => {
      d.reject(e);
    });

  return d.promise;
}

async function validate_beneficiaries( beneficiary_ids ) {
  let isValid = false;

  try {
    beneficiary_ids = beneficiary_ids.map(id => {
      return mongoose.Types.ObjectId(id);
    });
  } catch (e) {
    return isValid;
  }

  let beneficiaries = await Beneficiary.find({
    '_id': {
      $in: beneficiary_ids
    }
  });
  
  if( beneficiaries.length === beneficiary_ids.length ) {
    isValid = true;
  }

  return isValid;
}  

service.morxspc = spec;
module.exports = service;