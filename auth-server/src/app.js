'use strict';

import express from 'express';
import morgan from 'morgan';
import cors from 'cors';

import authRouter from './auth/router.js';
import uploadRouter from './routes/upload.js';
import profilesRouter from './routes/profiles.js';
import usersRouter from './routes/users.js';
import picsRouter from './routes/pics.js';

import errorHandler from './middleware/error.js';
import notFound from './middleware/404.js';

// AUTH0 STUFF
import passport from 'passport';
import Auth0Strategy from 'passport-auth0';

// Configure Passport to use Auth0
const strategy = new Auth0Strategy(
  {
    domain: process.env.AUTH0_DOMAIN,
    clientID: process.env.AUTH0_CLIENT_ID,
    clientSecret: process.env.AUTH0_CLIENT_SECRET,
    callbackURL: process.env.AUTH0_CALLBACK_URL,
  },
  (accessToken, refreshToken, extraParams, profile, done) => {
    return done(null, profile);
  }
);

passport.use(strategy);

// This can be used to keep a smaller payload
passport.serializeUser(function (user, done) {
  done(null, user);
});

passport.deserializeUser(function (user, done) {
  done(null, user);
});

let app = express();

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: true}));

// AUTH0 STUFF
app.use(passport.initialize());
app.use(passport.session());

app.use(picsRouter);
app.use(usersRouter);
app.use(profilesRouter);
app.use(uploadRouter);
app.use(authRouter);

app.use(notFound);
app.use(errorHandler);

let server = false; 

module.exports = {
  start: (port) => {
    if (!server) {
      server = app.listen(port, (err) => {
        if (err) throw err;
        console.log(`Server Up And Running On Port ${port}`);
      });
    } else {
      console.log('Server Is Already Running');
    }
  }, 
  stop: () => {
    server.close( () => {
      console.log('Server Has Been Stopped');
    });
  },
};


