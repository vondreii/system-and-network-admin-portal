/**
 * users.js
 *
 * Project:   INFT2031 Network and Admin Portal 
 * Author:    UoN Major Project, 2016
 * Modified:  Sharlene Von Drehnen
 * Date:      10/12/2016 - 31/01/2017    
 *
 */ 

// List of 'users' in records: 
var records = [{

    // User 1:

        id: 1,
        username: 'c3131950',
        password: 'turkeysub',
        displayName: 'Alan Nguyen',
        windowsDesktop1:'c3131950Desktop1',
        windowsDesktop2:'c3131950Desktop2',
        windowsServer: 'c3131950Server',
        emails: [{
            value: 'c3131950@uon.edu.au'
        }]}, 

    {  // User 2:

        id: 2,
        username: 'c3131951',
        password: 'birthday',
        displayName: 'Jill',
        windowsDesktop1:'c3131951Desktop1',
        windowsDesktop2:'c3131951Desktop2',
        windowsServer: 'c3131951Server',
        emails: [{
            value: 'jill@example.com'
        }]},

    { // User 3:

        id: 3,
        username: 'Admin',
        password: 'Admin',
        displayName: 'Admin',
        windowsDesktop1:'AdminDesktop1',
        windowsDesktop2:'c3131951Desktop2',
        windowsServer: 'c3131951Server',
        emails: [{
            value: 'admin@example.com'
        }]
}];


// Find User by ID
exports.findById = function(id, cb) {
    process.nextTick(function() {
        var idx = id - 1;
        if (records[idx]) {
            cb(null, records[idx]);
        } else {
            cb(new Error('User ' + id + ' does not exist'));
        }
    });
}

// Find User by Username
exports.findByUsername = function(username, cb) {
    process.nextTick(function() {
        for (var i = 0, len = records.length; i < len; i++) {
            var record = records[i];
            if (record.username === username) {
                return cb(null, record);
            }
        }
        return cb(null, null);
    });
}
