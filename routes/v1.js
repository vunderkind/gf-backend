const express = require('express');
const router = express.Router();

const beneficiaryService = require('../services/beneficiaries');
const userService = require('../services/users');

const authVerifClosure = require('../middlewares/authverifclosure');

router.post('/admin/login', async (req, res) => {
  try {
    const loginResponse = await userService.login(req.body);
    res.json(loginResponse);
  } catch (e) {
    res.status(401).json({
      message: e.message
    });
  }
});

router.post('/admin/users', async (req, res) => {
  try {
    const newUser = await userService.create(req.body);
    res.json(newUser);
  } catch (e) {
    res.status(401).json({
      message: e.message
    });
  }
});


router.get('/admin/people', authVerifClosure({superadmin: 1, admin: 1}), async (req, res) => {

  try {
    const beneficiaries = await beneficiaryService.list(req.query, 1);
    res.json(beneficiaries);
  } catch (e) {
    res.status(500).json({
      message: 'Failed to get Beneficiaries'
    });
  }

});

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

router.put('/people/:id', authVerifClosure({superadmin: 1, admin: 1}), async (req, res) => {

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