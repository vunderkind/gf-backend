const express = require('express');
const method = require('../model/method')
let jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const secrets = require('../model/secrets')

const Beneficiaries = require('./beneficiary-model.js');
const {
  updateNumberColumn
} = require('../helpers/utils')

const router = express.Router();

let user = {}
user.username = 'justin'
user.password = 12345




router.get('/people', (req, res) => {
  Beneficiaries.find()
    .then(Beneficiaries => {
      res.json(Beneficiaries);
    })
    .catch(err => {
      res.status(500).json({
        message: 'Failed to get Beneficiaries'
      });
    });
});

router.get('/people/:id', (req, res) => {
  const {
    id
  } = req.params;

  Beneficiaries.findById(id)
    .then(info => {
      if (info) {
        res.json(info);
      } else {
        res.status(404).json({
          message: `This person with id ${id} does not exist in the database. They could be walking down the street and we wouldn't recognize them. Sorry to this man.`
        })
      }
    })
    .catch(err => {
      res.status(500).json({
        message: 'Failed to get Beneficiary :('
      });
    });
});

router.post('/login', (req, res) => {
  let { username, password } = req.body;
      if (user.username==username && user.password==password) {
        const token = generateToken(user); // new line
 
        // the server needs to return the token to the client
        // this doesn't happen automatically like it happens with cookies
        res.status(200).json({
          message: `Welcome ${user.username}!, have a token...`,
          token, // attach the token as part of the response
        });
      } else {
        res.status(401).json({ message: 'Invalid Credentials' });
      }
    })

function generateToken(user) {
  const payload = {
    subject: user.id, // sub in payload is what the token is about
    username: user.username,
    // ...otherData
  };

  const options = {
    expiresIn: '1d', // show other available options in the library's documentation
  };

  // extract the secret away so it can be required and used where needed
  return jwt.sign(payload, secrets.jwtsecret, options); // this method is synchronous
}


router.post('/people', method, (req, res) => {
  const infoData = req.body;

  Beneficiaries.add(infoData)
    .then(info => {
      res.status(201).json({
        Success: "New info updated!"
      });
    })
    .catch(err => {
      res.status(500).json({
        message: err.message
      });
    });
});

router.put('/people/:id', method, (req, res) => {
  const {
    id
  } = req.params;
  const changes = req.body;
  changes.donationCount = 1
  //Adding a comment because I think the donation count should happen automatically
  // if (changes.donationCount && changes.donationCount > 1) {
  //   throw new Error('Invalid Donation Count')
  // }

  Beneficiaries.findById(id)
    .then(info => {
      if (info) {
        amount = changes.donationAmount
        const updates = {
          ...changes,
          donationCount: updateNumberColumn(changes, info, 'donationCount'),
          donationAmount: updateNumberColumn(changes, info, 'donationAmount')
        }

        Beneficiaries.update(updates, id)
          .then(updatedinfo => {
            res.json({
              message: `Successfully updated!`
            });
          });
      } else {
        res.status(404).json({
          message: 'Could not find info with given id'
        });
      }
    })
    .catch(err => {
      res.status(500).json({
        message: 'Failed to update info'
      });
    });
});

router.put('/people/bulk', method, (req, res) => {
  const {
    ids,
    changes
  } = req.body;

  if (!changes.donationCount) {
    throw new Error('Missing donation count')
  }

  if (changes.donationCount > 1) {
    throw new Error('Invalid donation count')
  }

  Beneficiaries.bulkUpdate({
      donationCount: changes.donationCount
    }, ids)
    .then(updatedinfo => {
      res.json({
        message: `Successfully updated!`
      });
    })
    .catch(err => {
      res.status(500).json({
        message: 'Failed to update info'
      });
    });
});

router.delete('/people/:id', method, (req, res) => {
  const {
    id
  } = req.params;

  Beneficiaries.remove(id)
    .then(deleted => {
      if (deleted) {
        res.json({
          removed: deleted
        });
      } else {
        res.status(404).json({
          message: 'Could not find info with given id'
        });
      }
    })
    .catch(err => {
      res.status(500).json({
        message: 'Failed to delete info'
      });
    });
});

module.exports = router;