const express = require("express");
const upload = require('../imageUpload');

const router = express.Router();

const singleUpload = upload.single('image')

router.post('/', function (req, res) {
  singleUpload(req, res, function (err, some) {
    console.log(err);
    if (err) {
      return res.status(422).send({
        errors: [{ title: 'Image Upload Error', detail: err.message }]
      });
    }
    return res.json({
      'imageUrl': req.file.location
    });
  });
})

module.exports = router;