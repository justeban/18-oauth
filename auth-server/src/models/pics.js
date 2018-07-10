import mongoose from 'mongoose';
require('mongoose-schema-jsonschema')(mongoose);

import Profiles from '../models/profiles.js';

const picsSchema = mongoose.Schema({
  url: { type: String, required: true },
  description: {type: String},
  profileID: { type: mongoose.Schema.Types.ObjectId, ref: 'profiles' },
});

picsSchema.pre('findOne', function (next) {
  this.populate('profileID');
  next();
});

picsSchema.pre('save', function (next) {
  let imgID = this._id;
  let profileID = this.profileID;

  Profiles.findById(profileID)
    .then(user => {
      if (!user) {
        return Promise.reject('Invalid Team Specified');
      } else {
        Profiles.findOneAndUpdate(
          { _id: profileID },
          { $addToSet: { pics: imgID } }
        )
          .then(Promise.resolve())
          .catch(err => Promise.reject(err));
      }
    })
    .then(next())
    .catch(next);
});

export default mongoose.model('pics', picsSchema);