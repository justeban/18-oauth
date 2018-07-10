'use strict';

import express from 'express';

const picsRouter = express.Router();

import Pics from '../models/pics.js';
import auth from '../auth/middleware.js';

picsRouter.get('/api/v1/pics', (req, res, next) => {
  Pics.find({})
    .then(data => sendJSON(res, data))
    .catch(next);
});

picsRouter.post('/api/v1/pics', (req, res, next) => {
  let pic = new Pics(req.body);
  pic.save()
    .then(data => sendJSON(res, data))
    .catch(next);
});

picsRouter.delete('/api/v1/pics/:id', (req, res, next) => {
  Pics.deleteOne({_id: req.params.id})
    .then(data => sendJSON(res,data))
    .catch(next);
});

let sendJSON = (res, data) => {
  res.statusCode = 200;
  res.statusMessage = 'OK';
  res.setHeader('Content-Type', 'application/json');
  res.write(JSON.stringify(data));
  res.end();
};

export default picsRouter;