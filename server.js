const express = require('express');
const cors = require('cors')
const helmet = require('helmet')
const {
  basicAuth
} = require('./helpers/auth')

const beneficiaryRouter = require('./model/beneficiary-router');

const server = express();


server.use(cors())
server.use(helmet())
server.use(express.json());
// server.use(basicAuth)
server.use('/api/', beneficiaryRouter);

module.exports = server;