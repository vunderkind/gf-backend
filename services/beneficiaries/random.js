const morx = require('morxv2');
const q = require('q');
const mongoose = require('mongoose');
const Beneficiary = require('../../mongo_models/beneficiary');
const DEFAULT_COUNT = process.env.DEFAULT_COUNT || 10;

const spec = morx
  .spec({})
  .build('count', 'eg:5')
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

    const filters = {
      isVerified: true,
      subaccount: { $exists: true }
    }

    const result_schema = {
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
    }

    let beneficiaries = await getRandomUniqueBeneficiaries(
      filters,
      result_schema,
      params.count
    );

    d.resolve(beneficiaries);

  })
    .catch((e) => {
      d.reject(e);
    });

  return d.promise;
}

/**
 * This leverages the mongodb `$sample` operator.
 * 
 * We need to handle potential dupes per: 
 * https://docs.mongodb.com/manual/reference/operator/aggregation/sample/#behavior
 * 
 * To this, we incrementally re-seed the returned beneficiaries, keeping the
 * unique values at every step until we're sure we have full unique list of beneficiaries
 * 
 * @param {T} filters 
 * @param {T} result_schema
 * @param {*} count 
 */
async function getRandomUniqueBeneficiaries(filters, result_schema, count) {
  let beneficiaries = await Beneficiary.aggregate([
    { $match: filters },
    { $project: result_schema },
    { $sample: { size: count } }
  ]);

  let reseed_params = getReseedParams( beneficiaries );
  do {
    if( reseed_params.reseed_size != 0 ) {
      // this means we have duplicates and we need to get extra records
      // get a new sample with a twist...
      // update the filters to exclude unique ids then fetch
      filters['_id'] = { $nin: reseed_params.unique_ids }

      const reseed_bens = await Beneficiary.aggregate([
        { $match: filters },
        { $project: result_schema },
        { $sample: { size: reseed_params.count } }
      ]);

      // now that we have both, we need to merge them and only get unique entries
      beneficiaries = [... new Set( [].concat( beneficiaries, reseed_bens ) ) ];

      // update ressed params
      reseed_params = getReseedParams( beneficiaries );
    }
  } while ( reseed_params.reseed_size != 0 );

  return beneficiaries;
}

/**
 * Accepts an array of beneficiary ids and returns a json containing
 * 
 * {
 *  reseed_size - number of duplicates,
 *  unique_ids - array of unique ids
 * }
 * 
 * @param {*} beneficiaries 
 */
function getReseedParams (beneficiaries) {
  // get chosen ids from result set
  const chosen_ids = [];
  beneficiaries.forEach(function(beneficiary) {
    chosen_ids.push( mongoose.Types.ObjectId(beneficiary._id) );
  });

  // get unique beneficiaries returned
  const unique_ids = [... new Set(chosen_ids)];

  // check for duplicates
  const duplicate_count = chosen_ids.length - unique_ids.length;

  return { unique_ids: unique_ids, reseed_size: duplicate_count };
}

service.morxspc = spec;
module.exports = service;
