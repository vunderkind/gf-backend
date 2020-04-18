const morx = require('morxv2');
const q = require('q');
const axios = require('axios');
const mongoose = require('mongoose');
const Donation = require('../../mongo_models/donation');
const Beneficiary = require('../../mongo_models/beneficiary');

const spec = morx
  .spec({})
  .build('reference', 'required:1')
  .end();

function service(data) {
  const d = q.defer();
  let params = {};

  q.fcall(async () => {
    const result = morx.validate(data, spec, { throwError: true });
    params = result.params;

    // get donation with reference
    const method = 'findOne';

    params.isDeleted = {
      $ne: 1
    };

    let donation = await Donation[ method ]( params, null, {
      lean: false
    });

    if( donation === null ) {
      throw new Error( "Donation not found" );
    }

    // if payment is in initiated state, attempt to update else return
    if( donation.status !== "INITIATED" ) {
      d.resolve( clientDonationRecord(donation) );
    } else {
      // validate payment from provider & update records
      const donation_res = await validate_payment(donation);

      if( donation_res.code !== 400 && donation_res.code !== 500 ) {
        // 400 - will usually occur when the user never completed payment
        // we don't want to mark initiations as failed
        donation.status = donation_res.status;
      }
      donation.memo = donation_res.gw_response;
      await donation.save();

      d.resolve( clientDonationRecord(donation) );
    }
  })
  .catch((e) => {
    d.reject(e);
  });

  return d.promise;
}

/**
 * Verifies a given donation payment and returns it's status
 * 
 * @param {Donation} donation 
 * 
 * Returns a JSON in the format:
 *   {
 *     "code": "Response code from server": e.g 200,400,500
 *     "status": "SUCCESS"/"FAILED",
 *     "message": "Readable message to user",
 *     "gw_response": "metadata from gateway"
 *   }
 */
async function validate_payment(donation) {
  // prepare request
  let config = {
    headers: { "Content-Type": "application/json" }
  }
  let body = {
    "SECKEY": process.env.FLUTTERWAVE_SEC_KEY,
    "txref": donation.reference
  }

  let result = {};

  try {
    const flwResponse = await axios.post(process.env.FLW_VERIFY_ENDPOINT, body, config);

    const payment_info = flwResponse.data.data;

    result = {
      "code": flwResponse.status
    };

    if (payment_info.status === "successful" && payment_info.chargecode == 00) {
        //check if the amount is same as amount you wanted to charge just to be very sure
        if (parseInt(payment_info.amount) === donation.amount ) {
          result['status'] = "SUCCESS"
          result['message'] = "Payment Successful"
        } else {
          result['status'] = "FAILED"
          result['message'] = "Payment failed";
        }

        // this is to provide records on our side incase of disputes/fraud
        result['gw_response'] = JSON.stringify({
          "chargedamount": payment_info.chargedamount,
          "ip": payment_info.ip,
          "fraudstatus": payment_info.fraudstatus,
          "paymenttype": payment_info.paymenttype
        })
    }
  } catch (error) {
    if( error.isAxiosError == true ) {
      result = {
        "code": error.response.status,
        "status": "FAILED",
        "message": error.response.data.message,
        "gw_response": JSON.stringify(error.response.data.data)
      }
    } else {
      console.log("Donation validation error");
      console.log( error );
      result = {
        "code": 500,
        "gw_response": "Unable to make/handle payment validation request"
      }
    }
  };

  return result;
}

/**
 * Formats donation record before sending to client
 * 
 * @param {*} donation 
 */
async function clientDonationRecord( donation ) {

  // conv. ben ids to mongoose objects
  let beneficiary_ids = donation.beneficiary_ids;
  beneficiary_ids = beneficiary_ids.map(id => {
    return mongoose.Types.ObjectId(id)
  });

  // get beneficiary names
  let beneficiaries = await Beneficiary.find({
    '_id': {
      $in: beneficiary_ids
    }
  })

  beneficiaries = beneficiaries.map(b => {
    return {
      firstName: b.firstName,
      lastName: b.lastName
    }
  });

  const formatted_response = {
    'donor': donation.donor,
    'status': donation.status,
    'reference': donation.reference,
    'amount': donation.amount,
    'beneficiaries': beneficiaries
  }

  return formatted_response;
}

service.morxspc = spec;
module.exports = service;