'use strict';

import express from 'express';

const usersRouter = express.Router();

import User from '../auth/model.js';
import auth from '../auth/middleware.js';

usersRouter.get('/api/v1/users', auth, (req, res, next) => {
  User.find({})
    .then(data => sendJSON(res, data))
    .catch(next);
});

usersRouter.get('/api/v1/users/:id', auth, (req, res, next) => {
  User.findOne({ _id: req.params.id })
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

export default usersRouter;