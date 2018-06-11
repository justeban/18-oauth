'use strict';

import express from 'express';
import passport from 'passport';
import superagent from 'superagent';

const authRouter = express.Router();

import Petrobot from '../models/petrobots.js';
import User from './model.js';
import Profile from '../models/profiles.js';
import Pics from '../models/pics.js';

import auth from '../auth/middleware.js';

const ensureLoggedIn = require('connect-ensure-login').ensureLoggedIn();


authRouter.post('/signup', (req, res, next) => {
  let user = new User(req.body);
  user.save()
    .then(user => res.send(user.generateToken()))
    .catch(next);
});

authRouter.get('/signin', auth, (req, res, next) => { //eslint-disable-line 
  res.cookie('Token', req.token);
  res.send(req.user.profile);
});

authRouter.get('/api/v1/profiles/:id', (req, res, next) => {
  Profile.findOne({_id: req.params.id})
    .then(profile => sendJSON(res, profile))
    .catch(next);
});

authRouter.post('/api/v1/pics/:profileID', auth, (req, res, next) => {
  let pic = new Pics(req.body);
  pic.save()
    .then(picData => sendJSON(res, picData))
    .catch(next);
});

authRouter.get('/api/v1/users', auth, (req, res, next) => {
  User.find({})
    .then(data => sendJSON(res, data))
    .catch(next);
});

authRouter.get('/api/v1/users/:id', auth, (req, res, next) => {
  User.findOne({ _id: req.params.id })
    .then(data => sendJSON(res, data))
    .catch(next);
});

authRouter.post('/api/v1/petrobots', auth, (req, res, next) => { //eslint-disable-line
  let pet = new Petrobot(req.body);
  pet.save()
    .then(data => sendJSON(res, data))
    .catch(next);
});

authRouter.get('/api/v1/petrobots', auth, (req, res, next) => {
  Petrobot.find({})
    .then(data => sendJSON(res, data))
    .catch(next);
});

authRouter.get('/api/v1/petrobots/:id', auth, (req, res, next) => {
  Petrobot.findOne({ _id: req.params.id })
    .then(data => sendJSON(res, data))
    .catch(next);
});

// AUTH0 ROUTER INFO

authRouter.get(
  '/login',
  passport.authenticate('auth0', {
    clientID: process.env.AUTH0_CLIENT_ID,
    domain: process.env.AUTH0_DOMAIN,
    redirectUri: process.env.AUTH0_CALLBACK_URL,
    audience: 'https://' + process.env.AUTH0_DOMAIN + '/userinfo',
    responseType: 'code',
    scope: 'openid profile email',
  }),
  function (req, res) {
    res.redirect(process.env.CLIENT_URL);
  }
);

authRouter.get('/logout', (req, res) => {
  req.logout();
  res.cookie('Token', '');
  res.redirect(process.env.CLIENT_URL);
});

authRouter.get(
  '/callback',
  passport.authenticate('auth0', {
    failureRedirect: process.env.CLIENT_URL,
  }),
  function (req, res) {
    let user = {
      name: req.user._json.name,
      username: req.user._json.email,
      email: req.user._json.email,
      picture: req.user._json.picture,
      password: req.user.id,
    };
    console.log('user info', user);    
    User.createFromAuth0(user)
      .then(userData => {
        let profile = {
          userId: userData._id,
          name: user.name,
          username: userData.username,
          email: user.email,
        };
        console.log('profile info', profile);
        return Profile.createFromAuth0(profile);
      })
      .then(profile => {
        let token = profile.generateToken();
        res.cookie('Token', token);
        res.redirect(process.env.CLIENT_URL);
      })
      .catch(err => console.log(err));
  }
);

let sendJSON = (res, data) => {
  res.statusCode = 200;
  res.statusMessage = 'OK';
  res.setHeader('Content-Type', 'application/json');
  res.write(JSON.stringify(data));
  res.end();
};

export default authRouter;