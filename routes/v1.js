const express = require('express');
const router = express.Router();

const beneficiaryService = require('../services/beneficiaries');


router.get('/people', async (req, res) => {

  try {
    const beneficiaries = await beneficiaryService.list(req.query);
    res.json(beneficiaries);
  } catch (e) {
    res.status(500).json({
      message: 'Failed to get Beneficiaries'
    });
  }

});

router.get('/people/:id', async (req, res) => {

  try {
    const beneficiary = await beneficiaryService.list(req.params);
    if (beneficiary) {
      res.json(beneficiary);
    } else {
      res.status(404).json({
        message: `This person with id ${req.params.id} does not exist in the database. They could be walking down the street and we wouldn't recognize them. Sorry to this man.`
      })
    }
  } catch (e) {
    res.status(500).json({
      message: 'Failed to get Beneficiary :('
    });
  }

});


router.post('/people', async (req, res) => {

  try {
    await beneficiaryService.create(req.body);
    res.status(201).json({
      Success: "New info updated!"
    });
  } catch (e) {
    res.status(500).json({
      message: e.message
    });
  }

});

router.put('/people/:id', async (req, res) => {

  try {
    req.body.id = req.params.id;
    const beneficiary = await beneficiaryService.edit(req.body);
    if (beneficiary) {
      res.json(beneficiary);
    } else {
      res.status(404).json({
        message: `This person with id ${req.params.id} does not exist in the database. They could be walking down the street and we wouldn't recognize them. Sorry to this man.`
      })
    }
  } catch (e) {
    res.status(500).json({
      message: 'Failed to edit Beneficiary :('
    });
  }

});


module.exports = router;