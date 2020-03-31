const express = require('express');
const cors = require('cors')

const beneficiaryRouter = require('./model/beneficiary-router');

const server = express();


server.use(cors())
server.use(express.json());
server.use('/api/', beneficiaryRouter);

// handle not found errors
server.use((req, res, next) => {
    const err = new Error('Route Not Found');
    err.status = 404;
    err.name = 'NotFoundError'
    next(err);
});

server.use((err, req, res, next) => {
    res.status(err.status || 500).json({
        error: {
            name: err.name,
            message: err.message,
        }
    });
});

module.exports = server;