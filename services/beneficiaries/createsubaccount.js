//FLWSECK_TEST-946b52540e03b9de4e8b240c0c5a027c-x
const morx = require('morxv2');
const q = require('q');
const Beneficiary = require('../../mongo_models/beneficiary');
const axios = require('axios');

const spec = morx
  .spec({})
  .build('beneficiary_id', 'required:1, eg:gtb')
  .end();

function service(data, is_admin) {
  const d = q.defer();
  let params = {};

  q.fcall(async () => {
    const result = morx.validate(data, spec, { throwError: true });
    params = result.params;

    const beneficiary = await Beneficiary.findById(params.beneficiary_id);
    if(!beneficiary) throw new Error('Beneficiary not found');

    //If there's no bank code, return with an error
    if(!beneficiary.accountBank) throw new Error('Beneficiary bank required');

    //If a subaccount has already been added for the beneficiary, return with an error
    if(beneficiary.subaccount) throw new Error('Beneficiary already has a subaccount');

    //split type and value are default dummies. FE will pass actual values during a payment
    const subaccountPayload = {
      account_bank: beneficiary.accountBank,
      account_number: beneficiary.accountNumber,
      business_name: `${beneficiary.firstName} ${beneficiary.lastName}`,
      business_mobile: beneficiary.phone,
      business_email: beneficiary.email,
      country: 'NG',
      split_type: 'flat',
      split_value: 1,
      seckey: process.env.FLWSECRETKEY
    }

    const flutterwaveResponse = await axios.post(process.env.FLWSUBACCOUNTCREATEURL, subaccountPayload);
    if(flutterwaveResponse && flutterwaveResponse.data && flutterwaveResponse.data.data) {
      beneficiary.subaccount = flutterwaveResponse.data.data.subaccount_id;
      await beneficiary.save();
    }

    d.resolve(beneficiary.subaccount);

  })
    .catch((e) => {

      /**
       * If axios error, e.response should be truthy (and axios response instance)
       * get the response message from the actual failed API call and override
       * e.message
       */
      if(e.response && e.response.data && e.response.data.message) {
        e.message = e.response.data.message;
      }
      d.reject(e);
    });

  return d.promise;
}

service.morxspc = spec;
module.exports = service;
