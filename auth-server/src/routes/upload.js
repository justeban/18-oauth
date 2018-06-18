'use strict';

import express from 'express';
import multer from 'multer';
import jwt from 'jsonwebtoken';

import auth from '../auth/middleware.js';
import s3 from '../lib/s3.js';

import Pics from '../models/pics.js';
import Profiles from '../models/profiles.js';

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
      let token = req.headers.cookie.replace(/token\=/i, '');
      let parsedToken = jwt.verify(token, process.env.SECRET || 'changethis').id;
      
      return Profiles.findOne({userId: parsedToken})
        .then(profile => {
          let picInfo = {
            url: url,
            profileID: profile._id,
          };
          let pic = new Pics(picInfo);
          return pic.save()
            .then(res.redirect(process.env.CLIENT_URL))
            .catch(error => console.log(error));
        });
    })
    .catch(next);
});

export default uploadRouter;