require('dotenv').config()
const server = require('./server.js');

const PORT = process.env.PORT || 5000;

server.get('/', (req, res) => {
  res.status(200).json({
    message: "Good faith is now online!"
  })
});

server.get('/api', (req, res) => {
  res.status(200).json({
    message: "Nothing to see here. Consider adding a '/people'"
  })
});

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

server.listen(PORT, () => {
  console.log(`\n*** Good Faith is Listening on port ${PORT} ***\n`);
})