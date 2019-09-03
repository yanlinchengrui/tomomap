const express = require('express');

const messages = require('./messages');

const image = require('./image');

const router = express.Router();

router.get('/', (req, res) => {
  res.json({
    message: 'HELLO!'
  });
});

router.use('/messages', messages);

router.use('/image', image);

module.exports = router;
