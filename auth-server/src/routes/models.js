'use strict';

import express from 'express';
const modelRouter = express.Router();

import {finder, list} from '../middleware/models.js';

modelRouter.param('model', finder);

modelRouter.get('/api/v1/models', (req, res, next) => {
  sendJSON(res, list());
});

modelRouter.get('/api/v1/:model', (req, res, next) => {
  req.model.find({})
    .then(data => sendJSON(res, data))
    .catch(next);
});
modelRouter.get('/api/v1/:model/schema', (req, res, next) => {
  let schema = (typeof req.model.jsonSchema === 'function') ? req.model.jsonSchema() : {};
  sendJSON(res, schema);
});

let sendJSON = (res, data) => {
  res.statusCode = 200;
  res.statusMessage = 'OK';
  res.setHeader('Content-Type', 'application/json');
  res.write(JSON.stringify(data));
  res.end();
};
export default modelRouter;