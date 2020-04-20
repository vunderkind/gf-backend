const morx = require('morxv2');
const q = require('q');
const Beneficiary = require('../../mongo_models/beneficiary');
const DEFAULT_COUNT = process.env.DEFAULT_COUNT || 10;

const spec = morx
  .spec({})
  .build('count', 'eg:gtb')
  .end();

function service(data, is_admin) {
  const d = q.defer();
  let params = {};

  q.fcall(async () => {
    const result = morx.validate(data, spec, { throwError: true });
    params = result.params;
    params.count = params.count || DEFAULT_COUNT;
    params.count = params.count * 1;
    //If count is not a valid num, or -ve or greater than the max alowed, default to 10
    if (isNaN(params.count) || params.count < 0 || params.count > 10) {
      params.count = DEFAULT_COUNT;
    }

    const totalBeneficiaries = await Beneficiary.countDocuments({
      isVerified: true
    });

    //Todo: consider using $sample and handling edge cases
    // skip option is not so effective

    let randomUpperBound = params.count;
    if (totalBeneficiaries > params.count) {
      randomUpperBound = totalBeneficiaries - params.count;
    }

    const randomSkipFrom = Math.floor(Math.random() * randomUpperBound);
    const beneficiaries = Beneficiary.find({
      isVerified: true,
      subaccount: { $exists: true }
    }, {
      id: 1,
      firstName: 1,
      lastName :1,
      bankName :1,
      context:1, 
      location:1,
      accountNumber :1,
      accountName :1,
      paymentLink :1,
      subaccount: 1
    }, {
      limit: params.count,
      skip: randomSkipFrom
    });


    d.resolve(beneficiaries);

  })
    .catch((e) => {
      d.reject(e);
    });

  return d.promise;
}

service.morxspc = spec;
module.exports = service;
