'use strict';

import User from './model.js';

export default (req, res, next) => {

  let authorize = (token) => {
    User.authorize(token)
      .then(user => {
        if (!user) {
          getAuth();
        } else {
          req.user = user;
          next();
        }
      })
      .catch(next);
  };

  let authenticate = (auth) => {
    
    User.authenticate(auth)
      .then(user => {
        if (!user) {
          getAuth();
        }
        else {
          req.user = user;
          req.token = user.generateToken();
          next();
        }
      });
  };

  let getAuth = () => {
    next({message:'You don\'t have the credentials...bummer', status: 401});
  };

  try {
    
    let auth = {};
    let authHeader = req.headers.authorization;
    
    if (!authHeader) {
      try {
        authorize(req.headers.cookie.replace(/token\=/i, ''));
      }
      catch (error) {
        return getAuth();
        
      }
    }
    
    if (authHeader.match(/basic/i)) {
      let base64Header = authHeader.replace(/Basic\s+/i, '');
      let base64Buf = Buffer.from(base64Header, 'base64');
      let [username, password] = base64Buf.toString().split(':');
      auth = { username, password };
      authenticate(auth, next);
    }
    else if (authHeader.match(/bearer/i)) {
      let token = authHeader.replace(/Bearer\s+/i, '');
      authorize(token);
    }
    else {
      next();
    }
  } catch (e) {
    next(e);
  }
};