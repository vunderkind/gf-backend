const express = require('express');
// const bcrypt = require('bcryptjs');

const Beneficiaries = require('./beneficiary-model.js');

const router = express.Router();

// const credentials = req.body;

// const hash = bcrypt.hashSync(credentials.password, 14);

// credentials.password = hash;

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

// router.post('/login', (req,res) => {
//   let {username, password} = req.body;


// })


router.post('/people', (req, res) => {
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


router.put('/people/:id', (req, res) => {
  const {
    id
  } = req.params;
  const changes = req.body;

  if (changes.donationCount && changes.donationCount > 1) {
    throw new Error('Invalid Donation Count')
  }

  Beneficiaries.findById(id)
    .then(info => {
      if (info) {
        Beneficiaries.update(changes, id)
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

router.put('/people/bulk', (req, res) => {
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

router.delete('/people/:id', (req, res) => {
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