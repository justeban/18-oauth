'use strict';

import express from 'express';
import passport from 'passport';

const authRouter = express.Router();

import auth from '../auth/middleware.js';

import User from './model.js';
import Profile from '../models/profiles.js';



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
    console.log(req.user.id);
    let user = {
      name: req.user._json.name,
      username: req.user._json.email,
      email: req.user._json.email,
      picture: req.user._json.picture,
      password: req.user.id,
    };
    User.createFromAuth0(user)
      .then(userData => {
        let profile = {
          userId: userData._id,
          name: user.name,
          username: userData.username,
          email: user.email,
        };
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