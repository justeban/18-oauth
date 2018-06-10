'use strict';

import express from 'express';
import multer from 'multer';

import auth from '../auth/middleware.js';
import s3 from '../lib/s3.js';

const upload = multer({ dest: `${__dirname}/../tmp` });

const uploadRouter = express.Router();

uploadRouter.post('/upload', upload.any(), (req, res, next) => {
  
  if ( !req.files.length >= 1 ) {
    return next('title or sample was not provided');
  }

  let file = req.files[0];
  let key = `${file.filename}.${file.originalname}`;

  return s3.upload(file.path, key)
    .then(url => {
      let output = {
        
        url: url,
      };
      res.send(output);
    })
    .catch(next);


});

export default uploadRouter;