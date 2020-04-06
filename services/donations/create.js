const morx = require('morxv2');
const uuid = require('uuid')
const q = require('q');
const Donation = require('../../mongo_models/donation');

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

    //TODO: Validate beneficiary_ids exist else throw error

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

service.morxspc = spec;
module.exports = service;