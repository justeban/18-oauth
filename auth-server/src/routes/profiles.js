'use strict';

import express from 'express';

const profilesRouter = express.Router();

import Profile from '../models/profiles.js';
import auth from '../auth/middleware.js';

profilesRouter.get('/api/v1/profiles/:id', (req, res, next) => {
  Profile.findOne({ _id: req.params.id })
    .then(profile => sendJSON(res, profile))
    .catch(next);
});

profilesRouter.post('/api/v1/pics/:profileID', auth, (req, res, next) => {
  let pic = new Pics(req.body);
  pic.save()
    .then(picData => sendJSON(res, picData))
    .catch(next);
});

profilesRouter.delete('/api/v1/profiles/:id', auth, (req, res, next) => {
  Profile.deleteOne({_id: req.params.id})
    .then(data => sendJSON(res, data))
    .catch(next);
});

let sendJSON = (res, data) => {
  res.statusCode = 200;
  res.statusMessage = 'OK';
  res.setHeader('Content-Type', 'application/json');
  res.write(JSON.stringify(data));
  res.end();
};

export default profilesRouter;