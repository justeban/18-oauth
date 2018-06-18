![cf](http://i.imgur.com/7v5ASc8.png) OAuth
===

[![Build Status](https://travis-ci.com/justeban/18-oauth.svg?branch=master)](https://travis-ci.com/justeban/18-oauth)

**HEROKU CLIENT URL:** [https://lab-18-web-server.herokuapp.com/](https://lab-18-web-server.herokuapp.com/)

**HEROKU SERVER URL:** [https://salty-reef-53948.herokuapp.com/](https://salty-reef-53948.herokuapp.com/)

**TRAVIS BUILD URL:** [https://travis-ci.com/justeban/18-oauth](https://travis-ci.com/justeban/18-oauth)

**GITHUB REPO URL:** [https://github.com/justeban/18-oauth](https://github.com/justeban/18-oauth) 


# Overview

This app utilizes Auth0 in order to log in to the app and create a profile. From your profile, you can upload pics and display them on your wall. The API utilizes Bearer Authentication. 

# Configuration

Make sure that your MONGODB_URI config var is set in Heroku, or if running locally that you have a mongo instance running.

To be sure the app runs properly on Heroku, you can sign-up via Postman. Make a 'POST' request to 'https://salty-reef-53948.herokuapp.com/signup' to create your profile and you will recieve a token back. You can then manually set that token in your browser by going to the console typing `Document.cookie('Token=[Token]');`.You then should be able to interact with Heroku.

The Authentication piece as of now does not work on Heroku because you cannot set cookie through Heroku which is how our authentication functions.

So for the best experience please clone the repo and in one CLI cd into 'auth-server' and run 'npm run watch' and in another CLI cd into 'web-server' and run 'npm run watch'.

Make sure necessary dependencies are downloaded with 'npm i'. (*located in package.json*)

## Data Models

This api supports a mongoose 'user' model that is represented by the following:
```const userSchema = new mongoose.Schema({
  username: {type: String, required: true, unique: true},
  email: {type: String, required: true, unique: true},
  password: {type: String, required: true},
  profile: [{ type: mongoose.Schema.Types.ObjectId, ref: 'profiles' }],

```
This api also supports a mongoose 'profiles' model that is represented by the following: 
```
userId: {type: mongoose.Schema.Types.ObjectId, ref: 'users'},
  name: { type: String, required: true},
  username: { type: mongoose.Schema.Types.String, ref: 'users'},
  bio: {type:String},
  email: { type: String, required: true, unique: true },
  pics: [{type:mongoose.Schema.Types.ObjectId, ref: 'pics'}]
```

This api also supports a mongoose 'pics' model that is represented by the following:
```
  url: { type: String, required: true },
  description: {type: String},
  profileID: { type: mongoose.Schema.Types.ObjectId, ref: 'profiles' },
```

## Server Endpoints

**POST** `signup`

### https://salty-reef-53948.herokuapp.com/api/signup
* `POST` request - when a user signs up with name, username, email and password, it sends back a token for Beareer authorization

- Example
 
 ```
 {"name": "Justin", "username": "justeban", "email": "goat@sheep.com", "password": "foo"}
 ```

- Example for token

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjViMTg0ZDhmOGRkOWYwZDhlOTk2MmVjMSIsImlhdCI6MTUyODMxOTM3NX0.Pzg_k06Z7wGMi83g4QCM4Nr4AAYy8pinQqlfwj-mFEg
```


**GET** `signin`

### https://salty-reef-53948.herokuapp.com/signin

* `GET` request, if hit with Bearer token, user is signed in, otherwise throws error 'bummer'


- Example for error
```
{
    "error": "bummer"
}
```

**GET** `/login`

### https://salty-reef-53948.herokuapp.com/login

- Unique to this app, we are using Auth0 to create a Profile and log a user in.
- The initiation begins on the hompage with a 'Login with Auth0' button with the following path.


**POST** `/upload`

### https://salty-reef-53948.herokuapp.com/upload

- Once the user is logged in they will be able to interact with their profile by uploading images.
- This uploader utilizes Amazon S3 to store the images.
- The image is uploaded and then saved to the users profile.

**GET** `/api/v1/profiles/:id`

### https://salty-reef-53948.herokuapp.com/api/v1/profiles

- You can also retreive all the profiles that exist within the database and you can retreive the profiles by profileid
- This is a protected route and requires a bearer token.

**GET** `/api/v1/pics`
### https://salty-reef-53948.herokuapp.com/api/v1/pics

- You can also retreive all of the pics that have been uploaded to the database.
- This is a protected route and requires a bearer token.
