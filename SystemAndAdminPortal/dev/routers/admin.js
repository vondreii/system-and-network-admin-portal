/**
 * admin.js
 *
 * Project:   INFT2031 Network and Admin Portal 
 * Author:    UoN Major Project, 2016
 * Modified:  Sharlene Von Drehnen
 * Date:      10/12/2016 - 31/01/2017    
 *
 * Description:
 * Includes all the routes and admin functionalities such as adding users, creating a course, adding and deleting a lab, or adding 
 * and deleting weekly content. 
 * Redirects to the necessary pages.
 *
 */ 

// Variables using modules or server paths
var azure = require('azure-storage');
var crypto = require('crypto');
var fs = require('fs');
var jsonfile = require('jsonfile');
var multiparty = require('multiparty');
var path = require('path');
var progress = require('progress-stream');
var User = require('../lib/passport/usermodel');
var util = require('util');

var labinfolink = CONFIG.SERVER_PATH + '/www/labinfo.json';
var labinfo = CONFIG.SERVER_PATH + '/www/labinfo.json';
var indexLabInfo = CONFIG.SERVER_PATH + '/www/indexLabInfo.json';

var blobSvc = azure.createBlobService();
var router = Express.Router();
var containerName = 'vhd';


// -------- Routers made to render files or config other info -------- //


// ----- Main Admin Page ----- //

// Directs to views/adminDashboard.pug
router.get('/', isAdmin, function(req, res) {

    // Render main admin dashboard
    res.render('dashboards/adminDashboard', {
        user: req.user,
        userType: JSON.stringify(req.user.userType)
    });
})



// --------------------- Uploading Weekly content -------------------- //

// Directs to views/admin/labupload.pug
router.get('/labupload', isAdmin, function(req, res) {

    // Render page to upload a weekly exercise
    res.render('weeklyContent/uploadContent', {
        user: req.user,
        userType: JSON.stringify(req.user.userType),
    });
});


// Directs to views/WeeklyExercises.pug 
router.post('/lab/req', function(req, res) {
    var size = '';
    var fileName = '';
    var form = new multiparty.Form();

    // Weekly content Object
    var obj = {
        "labname": "",
        "vmrequired1": "false",
        "vmrequired2": "false",
        "vmrequired3": "false",
        "filename": ""
    };

    form.on('field', function(name, value) {
        obj[name] = value;
        console.log(obj);
    });

    // starts stream
    form.on('part', function(part) {
        if (!part.filename) {
            return;
        }
        var size = part.byteCount;
        var name = part.filename;
    });

    // transfers file from temp location to an actual useful location
    form.on('file', function(name, file) {
        fileName = file.originalFilename;
        var tmp_path = file.path
        var target_path = CONFIG.SERVER_PATH + '/www/labsheet/' + fileName;

        // When the user enters a name for the content, checks to see if the name already exists. If it does: 
        if (fs.existsSync(target_path)) {

            // generates a 20 byte string to change the pdf name, could be better ways of coming up with names i know
            fileName = crypto.randomBytes(20).toString('hex') + '.pdf'
            target_path = CONFIG.SERVER_PATH + '/www/labsheet/' + fileName;
        }

        // sets up the stream from the temp path to the actual target path required for cross-device transfers
        var is = fs.createReadStream(tmp_path);
        var os = fs.createWriteStream(target_path);
        is.pipe(os);
        is.on('end', function() {
            fs.unlinkSync(tmp_path);
        });

        console.log('Upload completed!');

        // Lab Uploaded, Save object in labinfo.json and overwrite current info to include new weekly content
        obj["filename"] = fileName;
        var currentLabs = jsonfile.readFileSync(labinfo);
        currentLabs["availableLabs"].push(obj)

        jsonfile.writeFile(labinfo, currentLabs, function(err) {
            console.error(err)
        })

        // Redirect to the WeeklyExercises.pug
        res.redirect('/weeklyExercises');
    });

    form.parse(req);
});



// ---------------------- Delete Weekly content --------------------- //

// Directs to views/admin/deleteWeeklyExercises.pug 
router.get('/deleteWeeklyExercises', isAdmin, function(req, res) {

    // Information in labinfo.json is saved into a variable
    labinfo = JSON.parse(fs.readFileSync(CONFIG.SERVER_PATH + '/www/labinfo.json'));

    // Render page to delete a weekly exercise
    res.render('weeklyContent/DeleteWeeklyExercises', {
        user: req.user,
        labinfo: JSON.stringify(labinfo),
        userType: JSON.stringify(req.user.userType),
    });
});


// Directs to views/admin/deleteWeeklyExercises.pug
router.post('/weeklyContent/del', function(req, res) {

    // Information in labinfo.json is saved into a variable
    labinfo = CONFIG.SERVER_PATH + '/www/labinfo.json';
    var currentLabs = jsonfile.readFileSync(labinfo);
    var labfile = currentLabs["availableLabs"][req.body.labindex].filename;

    //using the async version here because async is better in general and it doesnt really matter when the file gets deleted
    fs.unlink(CONFIG.SERVER_PATH + '/www/labsheet/' + labfile, function(err) {
        if (err) return console.log(err);
        console.log('file deleted successfully');
    });

    // Removes the Weekly Content from the labinfo.json file
    currentLabs["availableLabs"].splice(req.body.labindex, 1);
    console.log(currentLabs);
    jsonfile.writeFile(labinfo, currentLabs, function(err) {
        console.error(err)
    });

    // Redirect to admin/deleteWeeklyExercises.pug
    res.redirect('/admin/deleteWeeklyExercises');
});



// ---------------------- Create a New Lab --------------------- //

// A lab is a folder that is created weekly (or whenever necessary) that stores weekly content.  

// Directs to views/admin/createNewLab.pug
router.get('/createNewLab', isAdmin, function(req, res) {
    fs.readFile(labinfolink, 'utf8', function(err, contents) {
        console.log('after calling readFile');
        templabinfo = JSON.parse(contents);

        // Renders admin/createNewLab.pug page
        res.render('labManagement/createNewLab', {
            user: req.user,
            labinfo: JSON.stringify(templabinfo),
            userType: JSON.stringify(req.user.userType)
        });
    })
});


// Directs to views/lab.pug
router.post('/createLab/req', function(req, res) {
    var newlabname = "";
    var assignedCourse = "";
    var form = new multiparty.Form();

    // Lab object
    var obj = {
        "newlabname": "",
        "assignedCourse1": "",
        "assignedCourse2": "",
        "assignedCourse3": "",
        "assignedCourse4": "",
        "assignedCourse5": ""
    };

    form.on('field', function(name, value) {
        obj[name] = value;
        console.log("New File name object:");
        console.log(obj);

        var currentLabs = jsonfile.readFileSync(labinfo);

        currentLabs["LabsIndex"].push(obj)

        // Overwrite labinfo.json to include new lab
        jsonfile.writeFile(labinfo, currentLabs, function(err) {
            console.error(err)
        })
        
    });

    // Redirects to views/lab.pug
    res.redirect('/lab');

    form.parse(req); 
});



// ------------------------- Delete Lab ------------------------ //

// Directs to views/deleteLabs.pug
router.get('/deleteLabs', isAdmin, function(req, res) {

    // Information in labinfo.json is saved into a variable
    labinfo = JSON.parse(fs.readFileSync(CONFIG.SERVER_PATH + '/www/labinfo.json'));

    // Renders deleteLabs.pug page
    res.render('labManagement/deleteLabs', {
        user: req.user,
        labinfo: JSON.stringify(labinfo),
        userType: JSON.stringify(req.user.userType),
    });
});


// Does not work (Cannot currently delete a Lab):

// Directs to lab.pug 
router.post('/lab/del', function(req, res) {
        
        // Information in labinfo.json is saved into a variable
        labinfo = CONFIG.SERVER_PATH + '/www/labinfo.json';

        var currentLabs = jsonfile.readFileSync(labinfo);
        var labfile = currentLabs["LabsIndex"][req.body.labindex].filename;

        // using the async version 
        fs.unlink(CONFIG.SERVER_PATH + '/www/labsheet/' + labfile, function(err) {
            if (err) return console.log(err);
            console.log('file deleted successfully');
        });

        // Removes the lab from the labinfo.json file
        currentLabs["LabsIndex"].splice(req.body.labindex, 1);
        console.log(currentLabs);
        jsonfile.writeFile(labinfo, currentLabs, function(err) {
            console.error(err)
        });

        // Redirects to lab.pug
        res.redirect('/lab');
    }

);


// ------------------------ Create Course ------------------------ //

// Directs to views/createCourse.pug
router.get('/createCourse', isAdmin, function(req, res) {
    res.render('courseManagement/createCourse', {
        user: req.user,
        userType: JSON.stringify(req.user.userType)
    });
});


// Directs to views/courseManagement.pug
router.post('/createCourse/req', function(req, res) {
    var newCourseName = "";
    var form = new multiparty.Form();

    // Course Object
    var obj = {
        "newCourseName": "",
    };

    form.on('field', function(name, value) {
        obj[name] = value;
        console.log("New File name object:");
        console.log(obj);

        // Overwrite labinfo.json to include new lab:
        var currentCourse = jsonfile.readFileSync(labinfo);
        currentCourse["CourseIndex"].push(obj)
        jsonfile.writeFile(labinfo, currentCourse, function(err) {
            console.error(err)
        })  
    });

    // Redirects to courseManagment.pug
    res.redirect('/courseManagement');

    form.parse(req); 
});



// ------------------------ Delete Course ------------------------ //

// Directs to views/deleteCourse.pug
router.get('/deleteCourse', isAdmin, function(req, res) {
    labinfo = JSON.parse(fs.readFileSync(CONFIG.SERVER_PATH + '/www/labinfo.json'));

    // Render deleteCourse.pug
    res.render('courseManagement/deleteCourse', {
        user: req.user,
        labinfo: JSON.stringify(labinfo),
        userType: JSON.stringify(req.user.userType),
    });
});

// There is no functionality to Delete a Course as of yet 


// -------------------------- Add User ------------------------- //

// Directs to views/admin/addUser.pug
router.get('/adduser', isAdmin, function(req, res) {

    // Renders addUser.pug page
    res.render('userManagement/adduser', {
        user: req.user, 
        userType: JSON.stringify(req.user.userType)
    });
});


// Directs to views/admin/addUser.pug
router.post('/adduser', function(req, res) {

    // New User attributes
    var newuser = new User({
        username: req.body.username,
        password: req.body.username,
        email: req.body.email,
        displayName: req.body.displayName,
		userType:req.body.userType
    });

    // Tries to find a user of the same username
    User.findOne({
        'username': req.body.username
    }, function(err, user) {

        if (err) { 
            //do nothing
        }

        // If user does not exist
        if (!user) {

            // Save as new user
            newuser.save(function(err) {

                // Redirect to addUser.pug
                res.redirect('/addUser');
            });
        }

        // If user does exist
        if (user) {
            res.send("USER ALREADY EXISTS");
        }
    });


});



// ---------------------- Upload a VHD --------------------- //

// Directs to views/admin/uploadvhd.pug
router.get('/upload', isAdmin, function(req, res) {

    // Renders 'Upload VHD' page
    res.render('virtualMachines/uploadvhd', {
        user: req.user,
        userType: JSON.stringify(req.user.userType)
    });
});

// Directs to views/admin/addUser.pug
router.post('/upload/req', function(req, res) {
    var form = new multiparty.Form();

    form.on('part', function(part) {
        if (!part.filename)
            return;
        var size = part.byteCount;
        var name = part.filename;

        blobSvc.createPageBlobFromStream(containerName, name, part, size, function(err, result, response) {
            if (!err) {
                console.log(response);
            } else {
                console.log(err);
            }
        });
        res.send('File uploaded successfully');
    });

    form.on('progress', function(bytesReceived, bytesExpected) {
        console.log(bytesReceived / bytesExpected * 100);
    });

    // Redirects to admin/vms.pug
    res.redirect('/vms');

    form.parse(req);

});



// -------------------------- Is Admin ------------------------ //

function isAdmin(req, res, next) {

    //Checks in case someone tries to access admin pages without being logged in
    if (req.user === undefined) {
        res.redirect('/');
    }
    if (req.user.userType === 'admin') {
        next();
    } else {
        res.redirect('/');
    }
}

module.exports = router;
