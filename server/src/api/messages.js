const express = require('express');
const Joi = require('joi');

const db = require('../database');
const messages = db.get('messages');

const schema = Joi.object().keys({
  name: Joi.string().min(1).max(100).required(),
  message: Joi.string().min(1).max(100).required(),
  lat: Joi.number().min(-90).max(90).required(),
  lon: Joi.number().min(-180).max(180).required(),
  image: Joi.string().min(1).max(100),
});

const router = express.Router();

router.get('/', (req, res) => {
  messages
    .find()
    .then(all => {
      res.json(all);
    })
});

router.post('/', (req, res, next) => {
  const rez = Joi.validate(req.body, schema);
  if (rez.error === null) {
    const { name, message, lat, lon, image } = req.body;
    const userMes = {
      name, message, lat, lon, image, date: new Date()
    };
    messages.insert(userMes).then(inserted => {
      res.json(inserted);
    });

  } else {
    next(rez.error);
  }
});

module.exports = router;
