'use strict';

import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';

import Users from '../auth/model.js';

const profileSchema = new mongoose.Schema({
  userId: {type: mongoose.Schema.Types.ObjectId, ref: 'users'},
  name: { type: String, required: true},
  username: { type: mongoose.Schema.Types.String, ref: 'users'},
  bio: {type:String},
  email: { type: String, required: true, unique: true },
  pics: [{type:mongoose.Schema.Types.ObjectId, ref: 'pics'}],
});

profileSchema.pre('findOne', function (next) {
  this.populate('pics');
  next();
});

profileSchema.statics.createFromAuth0 = function (incoming) {
  if (!incoming || !incoming.userId) {
    return Promise.reject('VALIDATION ERROR: Not an existing user');
  }

  return this.findOne({ userId: incoming.userId })
    .then(profile => {
      if (!profile) { throw new Error('User Not Found'); }
      console.log('Welcome Back', profile.username);
      return profile;
    })
    .catch(error => {
      return this.create({
        userId: incoming.userId,
        name: incoming.name,
        username: incoming.username,
        email: incoming.email,
      });
    });
};

profileSchema.methods.generateToken = function () {
  return jwt.sign({ id: this.userId._id }, process.env.SECRET || 'changethis');
};


profileSchema.pre('save', function (next) {
  let profileId = this._id;
  let userId = this.userId;

  Users.findById(userId)
    .then(user => {
      if (!user) {
        return Promise.reject('Invalid Team Specified');
      } else {
        Users.findOneAndUpdate(
          { _id: userId },
          { $addToSet: { profile: profileId } }
        )
          .then(Promise.resolve())
          .catch(err => Promise.reject(err));
      }
    })
    .then(next())
    .catch(next);
});

export default mongoose.model('profiles', profileSchema);