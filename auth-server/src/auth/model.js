'use strict';

import mongoose from 'mongoose';
require('mongoose-schema-jsonschema')(mongoose);
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

const userSchema = new mongoose.Schema({
  username: { type: String, required: true},
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  profile: { type: mongoose.Schema.Types.ObjectId, ref: 'profiles' },
});

userSchema.pre('save', function (next) {
  bcrypt.hash(this.password, 10)
    .then(hashedPassword => {
      this.password = hashedPassword;
      next();
    })
    .catch(err => {
      throw err;
    });
});

userSchema.statics.createFromAuth0 = function(incoming) {
  if (!incoming || !incoming.email) {
    return Promise.reject('VALIDATION ERROR: missing username/email or password ');
  }

  return this.findOne({ email: incoming.email })
    .then(user => {
      if (!user) { throw new Error('User Not Found'); }
      console.log('Welcome Back', user.username);
      return user;
    })
    .catch(error => {
      return this.create({
        username: incoming.username,
        password: incoming.password,
        email: incoming.email,
      });
    });
};

userSchema.statics.authenticate = function (auth) {
  let query = { username: auth.username };
  return this.findOne(query)
    .then(user => user && user.comparePassword(auth.password))
    .catch(err => err);
};

userSchema.statics.authorize = function (token) {
  let parsedToken = jwt.verify(token, process.env.SECRET || 'changethis');
  let query = { _id: parsedToken.id };
  return this.findOne(query)
    .then(user => {
      return user;
    })
    .catch(err => err);
};

userSchema.methods.comparePassword = function (password) {
  return bcrypt.compare(password, this.password)
    .then(valid => valid ? this : null);
};

userSchema.methods.generateToken = function () {
  return jwt.sign({ id: this._id }, process.env.SECRET || 'changethis');
};

export default mongoose.model('users', userSchema);