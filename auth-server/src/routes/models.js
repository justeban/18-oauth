'use strict';

import express from 'express';
const modelRouter = express.Router();

import {finder, list} from '../middleware/models.js';
modelRouter.param('model', finder);

modelRouter.get('/api/v1/models', (req, res, next) => {
  res.send(list());
  res.end();
});

export default modelRouter;