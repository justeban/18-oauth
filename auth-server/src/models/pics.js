import mongoose from 'mongoose';
import Users from '../auth/model.js';

const petrobotSchema = mongoose.Schema({
  imgURL: { type: String, required: true },
  userid: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
});

petrobotSchema.pre('findOne', function (next) {
  this.populate('userid');
  next();
});

petrobotSchema.pre('save', function (next) {
  let imgID = this._id;
  let userid = this.userid;

  Users.findById(userid)
    .then(user => {
      if (!user) {
        return Promise.reject('Invalid Team Specified');
      } else {
        Users.findOneAndUpdate(
          { _id: userid },
          { $addToSet: { pets: imgID } }
        )
          .then(Promise.resolve())
          .catch(err => Promise.reject(err));
      }
    })
    .then(next())
    .catch(next);
});

export default mongoose.model('petrobots', petrobotSchema);