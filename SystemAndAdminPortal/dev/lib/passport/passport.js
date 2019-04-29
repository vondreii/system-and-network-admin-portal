/**
 * passport.js
 *
 * Project:   INFT2031 Network and Admin Portal 
 * Author:    UoN Major Project, 2016
 * Modified:  Sharlene Von Drehnen
 * Date:      10/12/2016 - 31/01/2017    
 *
 */ 

var LocalStrategy = require('passport-local').Strategy;

module.exports = function(passport) {

    // Configure Passport authenticated session persistence.
    
    // In order to restore authentication state across HTTP requests, Passport needs to serialize users into and deserialize users 
    // out of the session. The typical implementation of this is as simple as supplying the user ID when serializing, and querying the 
    // user record by ID from the database when deserializing.

    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    passport.deserializeUser(function(id, done) {
        User.findById(id, function(err, user) {
            if (err) {
                return cb(err);
            }
            done(null, user);
        });
    });




}
