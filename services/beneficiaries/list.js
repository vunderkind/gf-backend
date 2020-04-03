const morx = require('morxv2');
const q = require('q');
const Beneficiary = require('../../mongo_models/beneficiary');

const spec = morx
  .spec({})
  .build('id', 'map:_id, eg:53928anabdna')
  .build('bankName', 'eg:gtb')
  .build('isVerified', 'eg:false')
  .end();

function service(data, is_admin) {
  const d = q.defer();
  let params = {};

  q.fcall(async () => {
    const result = morx.validate(data, spec, { throwError: true });
    params = result.params;
    
    let method = 'find';

    //If an id is passed. Change mongoose search method
    //No two bens can have the same id
    if(params._id) {
      method = 'findOne'
    }

    params.isDeleted = {
      $ne: 1
    };

    //Todo: Add other filters and pagination here
    let beneficiaries = await Beneficiary[method](params, null, {
      lean: true,
      sort: {
        created_ts: -1
      }
    });

    if(method === 'find' && !is_admin) {
      //Return only data needed for render
      beneficiaries = beneficiaries.map(b => {
        return {
          id: b._id,
          firstName: b.firstName,
          lastName: b.lastName,
          bankName: b.bankName,
          accountNumber: b.accountNumber,
          accountName: b.accountName,
          paymentLink: b.paymentLink
        }
      });
    }

    d.resolve(beneficiaries)

  })
    .catch((e) => {
      d.reject(e);
    });

  return d.promise;
}

service.morxspc = spec;
module.exports = service;
