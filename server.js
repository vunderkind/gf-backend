const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const mg = require('mongoose');
const {
  basicAuth
} = require('./helpers/auth')

const beneficiaryRouter = require('./model/beneficiary-router');
const v1Routes = require('./routes/v1');

const server = express();

if (process.env.MONGODB_URI) {
  const mgConnectOptions = {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
  };
  mg.connect(process.env.MONGODB_URI, mgConnectOptions);
}

if (process.env.USE_CUSTOM_CORS) {
  server.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header(
      'Access-Control-Allow-Headers',
      'Origin, X-Requested-With, Content-Type, Accept, Authorization, requestId',
    );
    res.header('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS');
  });

} else {
  server.use(cors())
}

server.use(helmet())
server.use(express.json());
// server.use(basicAuth)
server.use('/api/', beneficiaryRouter);

//Mongo routes
//To be reviewed
server.use('/api/v1/', v1Routes);

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