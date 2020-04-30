const morx = require('morxv2');
const q = require('q');
const Donation = require('../../mongo_models/donation');

const spec = morx
  .spec({})
  .build('hookData', 'required:1')
  .end();

function service(data) {
  const d = q.defer();
  let params = {};

  q.fcall(async () => {
    const result = morx.validate(data, spec, { throwError: true });
    params = result.params;
    let res = 1;
    const hookData = params.hookData;
    if (hookData && hookData.txRef) {
      const donation = await Donation.findOne({
        reference: hookData.txRef
      }, null, { lean: true });
      if (!donation) throw new Error('Donation not found');
      if (donation.status == "SUCCESS") throw new Error('Donation already updated');

      await validateDonation({
        reference: hookData.txRef
      });

    }


    d.resolve(res);

  })
    .catch((e) => {
      d.reject(e);
    });

  return d.promise;
}

service.morxspc = spec;
module.exports = service;