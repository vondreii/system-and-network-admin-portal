/**
 * web.js
 *
 * Project:   INFT2031 Network and Admin Portal 
 * Author:    UoN Major Project, 2016
 * Modified:  Sharlene Von Drehnen
 * Date:      10/12/2016 - 31/01/2017    
 *
 * Description:
 * Includes all the routes and functionalities of both a normal user (student) and Admin.
 * Redirects to the necessary pages.
 *
 */ 

// Variables using modules or server paths

var multiparty = require('multiparty');
var shell = require('node-powershell');
var async = require('async');
var crypto = require('crypto');
var passport = require('passport');
var util = require('util');
var fs = require('fs');
var User = require('../lib/passport/usermodel');
var nodemailer = require('nodemailer');
var smtpTransport = require("nodemailer-smtp-transport");

var labinfolink = CONFIG.SERVER_PATH + '/www/labinfo.json';
var labinfo = CONFIG.SERVER_PATH + '/www/labinfo.json';
var indexLabInfo = CONFIG.SERVER_PATH + '/www/indexLabInfo.json';

// New Powershell that enable ps commands to be used 
var ps = new shell();



// -------- Routers made to render files or config other info -------- //

var router = Express.Router();
router.use((req, res, next) => {
    console.log('Serving web content...');
    next();
});



// ----- Student Root Page ----- //

router.get('/', function(req, res, next) {

    // If user login is authenticated 
    if (req.user) {

        // Redirects to main student dashboard
        res.redirect('/main');
    }

    // Redirects to login-in page
    res.render('index', {
        user: req.user

    });
});

// --------------------------------------------------------------- LOGIN ------------------------------------------------------------ //

// --------------------------- Login Page ---------------------------- //

// Redirects to views/login.pug
router.get('/login',
    function(req, res) {

        // Renders login.pug
        res.render('login', {
            env: process.env
        });
    });



// Redirects to views/login.pug and authenticates password
router.post('/login',

    // Authenticates password with passport
    passport.authenticate('local', {

        // If authentification fails, redirect back to login.pug
        failureRedirect: '/login'
    }),

    // Redirects to either index.pug or main.pug depending of success of authentification 
    function(req, res) {
        res.redirect('/');
    });



// Perform session logout and redirect to homepage
router.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/');
});



// --------------------------------------------------------------- VIEWS ------------------------------------------------------------ //


// ------------------------- Main Dashboard ------------------------ //

// Directs to views/main.pug
router.get('/main', loggedIn, function(req, res) {

    // Renders the main Dashboard
    res.render('dashboards/main', {
        user: req.user,
        labinfo: labinfo,
        userType: JSON.stringify(req.user.userType)
    });
});


// Directs to views/studentDashboard.pug
router.get('/studentDashboard', loggedIn, function(req, res) {

    // Renders the main Dashboard
    res.render('dashboards/studentDashboard', {
        user: req.user,
        labinfo: labinfo,
        userType: JSON.stringify(req.user.userType)
    });
});



// ------------------------ Course Management ----------------------- //

// Directs to views/courseManagement.pug
router.get('/courseManagement', isAdmin, function(req, res) {

    // reads labInfo.json
    fs.readFile(labinfolink, 'utf8', function(err, contents) {
        console.log('after calling readFile');

        // parse contents of file to variable
        templabinfo = JSON.parse(contents);

        // Renders courseManagement page with contents of file ready to be used if necessary
        res.render('courseManagement/courseManagement', {
            user: req.user,
            labinfo: JSON.stringify(templabinfo),
            userType: JSON.stringify(req.user.userType)
        });
    })
});



// -------------------------- Lab Management ------------------------ //

// Directs to views/lab.pug
router.get('/lab', loggedIn, function(req, res) {

    // Reads file labinfo.json and stores contents in variable
    fs.readFile(labinfolink, 'utf8', function(err, contents) {
        console.log('after calling readFile');
        templabinfo = JSON.parse(contents);

        // Renders lab.pug page with contents of labinfo.json ready to be used
        res.render('labManagement/lab', {
            user: req.user,
            labinfo: JSON.stringify(templabinfo),
            userType: JSON.stringify(req.user.userType)
        });
    })
});



// Directs to views/weeklyExercises.pug
router.get('/weeklyExercises', loggedIn, function(req, res) {

    // Reads file labinfo.json and stores contents in variable
    fs.readFile(labinfolink, 'utf8', function(err, contents) {
        console.log('after calling readFile');
        templabinfo = JSON.parse(contents);

        // Renders WeeklyExercises.pug page with contents of labinfo.json ready to be used
        res.render('weeklyContent/WeeklyExercises', {
            user: req.user,
            labinfo: JSON.stringify(templabinfo),
            userType: JSON.stringify(req.user.userType)
        });
    })
});



// Directs to labpage.pug (Opens the weekly content to view) [get]
router.get('/labpage', loggedIn, function(req, res) {
    res.render('labManagement/labview', {
        user: JSON.stringify(req.user.username),
        pdf: JSON.stringify(req.body.filename),
        link: '/labsheet/',
        userType: JSON.stringify(req.user.userType)
    })
});



// Directs to labpage.pug (Opens the weekly content to view) [post]
router.post('/labpage', loggedIn, function(req, res) {
    console.log(req.body);
    labinfo = JSON.parse(fs.readFileSync(CONFIG.SERVER_PATH + '/www/labinfo.json'));
    var vmList;
    Calls.VM.getAllVms().then((vmResponse) => {
        vmList = vmResponse.body;
        res.render('labManagement/labview', {
            vms: JSON.stringify(vmList),
            user: req.user,
            userId: req.user,
            userType: JSON.stringify(req.user.userType),
            user: JSON.stringify(req.user.username),
            pdf: JSON.stringify(req.body.filename),
            link: '/labsheet/',
        })
    });
});



// ------------------- Virtual Machines Management ------------------- //

// Virtual Machines - Student View


// Directs to views/virtualMachines.pug page
router.get('/virtualMachines', loggedIn, function(req, res) {
    console.log(req.body);

    // Reads file labinfo.json and stores contents in variable
    labinfo = JSON.parse(fs.readFileSync(CONFIG.SERVER_PATH + '/www/labinfo.json'));

    // Calls a method in dev/calls/VM.js that gets all VM objects
    var vmList;
    Calls.VM.getAllVms().then((vmResponse) => {

        // VM objects inside variable
        vmList = vmResponse.body;

        // Renders labPageTest.pug page with the info in the VM objects ready to be displayed
        res.render('virtualMachines/virtualMachinesStudentView', {
            userId: req.user,
            userType: JSON.stringify(req.user.userType),
            user: JSON.stringify(req.user.username),
            vms: JSON.stringify(vmList),
            labinfo: labinfo,
        });
    });
});



// Directs to the RDP Client to open the Virtual Machine
router.post('/rdpClient', loggedIn, function(req, res) {
    var vmName = req.body.vmName;
    var username="AdminUsername";
    var password="Password1234!"

    // If the VM is a desktop machine
    if(vmName.includes("Desk")){
        username = "Admin";
        password = "Password";
    }

    console.log(vmName + ", " + username + ", " + password);

    // Calls mathod in dev/calls/ip.js that gets status of IP
    Calls.IP.getPublicIPStatus(vmName).then((req) => {

        // Saves the IP address
        var ipAddress = req.body.properties.ipAddress;

        // Opens client with the IP address and other user unfo
        res.render('client', {
            user: req.user,
            ip: JSON.stringify(ipAddress),
            username:JSON.stringify(username),
            password:JSON.stringify(password)

        })

    })
});



// Virtual Machines - Admin View

// Directs to admin/vmmain.pug
router.get('/vms', isAdmin, function(req, res) {
    var vmList;

    // A Method in dev/calls/vm.js that gets information about all VMs stored in the DevTestLab Resource group
    Calls.VM.getAllVms().then((vmResponse) => {
        vmList = vmResponse.body;

        // Renders admin/vmmain.pug with info (example, VM name) ready to be displayed
        res.render('virtualMachines/adminvmManagement', {
            vms: JSON.stringify(vmList),
            user: req.user,
            userType: JSON.stringify(req.user.userType)
        });
    });
});


// ------------------------ User Management -------------------------- //

// ------- User Management ------- //

// Directs to views/admin/userManagement.pug
router.get('/userManagement', isAdmin, function(req, res) {

    // Renders userManagement.pug page
    res.render('userManagement/userManagement', {
        user: req.user,
        userType: JSON.stringify(req.user.userType)
    });
});



// -------------------------- User Profile --------------------------- //

// Directs to views/userProfile.pug
router.get('/userProfile', loggedIn, function(req, res) {

    // Renders user profile page with user info
    res.render('userManagement/user', {
        user: req.user,
        labinfo: labinfo,
        userType: JSON.stringify(req.user.userType)
    });
});



// Directs to views/changePassword.pug
router.get('/changepassword', loggedIn, function(req, res) {

    // Renders change password page
    res.render('resetpassword/changepassword', {
        user: req.user,
        userType: JSON.stringify(req.user.userType)
    });
});

// Responsible for changing the user password and directs to views/user.pug 
router.post('/changepassword/req', loggedIn, function(req,res){

    // Find the user using their usernamme
	User.findOne({username:req.user.username},function(err,user){

        // ERRORS: CURRENTLY DOES NOT NOTIFY STUDENT IF THERE IS AN ERROR IN CHANGING PASSWORD
        // If user is not found:
		if(!user){

			req.flash('error','Error with username');
			return res.redirect('/changepassword'); // Redirect to same page (Do nothing)
		}

        // If the user enters the wrong already existing 'old' password:
        else if(req.body.oldPassword!= user.password){

			req.flash('error','Old password was incorrect');
			return res.redirect('/changepassword'); // Redirect to same page (Do nothing)
		}

        // For the two inputs that confirm the new password, if the passwords do not match:
        else if(req.body.newPassword!=req.body.confirm){

			req.flash('error','New passwords do not match');
			return res.redirect('/changepassword'); // Redirect to same page (Do nothing)
		}

        // If successful:
        else{

            // Assign the student's password as the 'new' password that was entered
			user.password=req.body.newPassword
			user.save();
			req.flash('info','Your password has been changed successfully');

            // Redirect to the user's profile page
			return res.redirect('/userProfile');
		}
	});
});



// ----------------------------------------------------- PASSWORDS --------------------------------------------------------- //

// Directs to views/resetPassword/forgot
router.get('/forgetpassword', function(req, res) {

    // Renders 'forgot password' page
    res.render('resetpassword/forgot');
});



// Administers a way for student to get a new password
router.post('/forgetpassword', function(req, res, next) {
    async.waterfall([
		//Generates random token string
		function(done){
			crypto.randomBytes(20,function(err,buf){
				var token = buf.toString('hex');
				console.log(token);
				done(err,token)
			})
		},
		function(token,done){
			User.findOne({email:req.body.email},function(err,user){
				if(!user){
					req.flash('error','No Account with that email address exists');
					return res.redirect('/forgetpassword');
				}
				user.resetPasswordToken = token;
				//Set token expiry to 15 minutes after this request
				user.resetPasswordExpires=Date.now()+900000;
				user.save(function(err){
					done(err,token,user)
				});
			})

		},
		function(token,user,done){
			var transport = nodemailer.createTransport(smtpTransport(
				{
					service:'gmail',
					auth:{
						user:'azureprojectpwordreset@gmail.com',
						pass:'turkeysub'
					}
				}
			));

			var mailOptions = {
				to:user.email,
				from:AZURECONFIG.RESET_EMAIL_ADDRRESS,
				subject: 'A request for a new password has been made for your account',
				text: 'Hi '+user.displayName+'.\n\n A request has been made to create a new password'+
				'for your account. If you have made this request please click the following link to'+
				'complete this process \n'+
				'http://'+req.headers.host+'/reset/'+token +'\n\n'+
				'Please ignore this if you did not make this request'
			};
			transport.sendMail(mailOptions,function(err){
				req.flash('info','An email has been sent to '+user.email);
				done(err,'done');
			})
		}

    ], function(err) {
        if (err) return next(err);
        res.redirect('/forgetpassword');
    });
});



router.get('/reset/:token', function(req, res) {
  User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
    if (!user) {
      req.flash('error', 'Password reset token is invalid or has expired.');
      return res.redirect('/forgetpassword');
    }
    res.render('resetpassword/reset', {
      user: req.user
    });
  });
});



router.post('/reset/:token', function(req, res) {
  async.waterfall([
    function(done) {
      User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
        if (!user) {
          req.flash('error', 'Password reset token is invalid or has expired.');
          return res.redirect('back');
        }
		if(req.body.password==req.body.confirm){
			user.password = req.body.password;
	        user.resetPasswordToken = undefined;
	        user.resetPasswordExpires = undefined;
		}else{
			req.flash('error','Passwords did not match');
			return res.redirect('back');
		}
        user.save(function(err) {
          done(err,user);
        });
      });
    },
    function(user, done) {
		var transport = nodemailer.createTransport(smtpTransport(
			{
				service:'gmail',
				auth:{
					user:'azureprojectpwordreset@gmail.com',
					pass:'turkeysub'
				}
			}
		));
      var mailOptions = {
        to: user.email,
        from: AZURECONFIG.RESET_EMAIL_ADDRRESS,
        subject: 'Your password has been changed',
        text: 'Hello,\n\n' +
          'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n'
      };
      transport.sendMail(mailOptions, function(err) {
        req.flash('success', 'Success! Your password has been changed.');
        done(err);
      });
    }
  ], function(err) {
    res.redirect('/');
  });
});



// ----------------------------------------------------- POWERSHELL FUNCTIONS --------------------------------------------------------- //

// None of these are currently being used, starting/stopping and connecting to VMs are done vie API.
// However they are a powershell alternate to starting VMs that were attempted but I was unable to connect to VMs using 
// powershell commands

// Starts a Virtual Machine on the devTestLab resource group
router.get('/start', (req, res) => {

    // Links to files in ps1 that contain powershell scripts

    // Login to Azure is required (Pop Up to login is shown)
    ps.addCommand('../../ps1/LoginRM.ps1').then(function(){
            console.log('invoking...');
            return ps.invoke();
    })
    .then(function(output){
            console.log('stopped...');
            console.log(output);
            ps.dispose();
    })
    
    // startVM.ps1 contains scripts to start the Virtual Machine. Currently you can only start one VM called 'c3220929Desk1' has no paramteres and 
    // student's details cannot yet be passed as arguments.
    ps.addCommand('../../ps1/StartVM.ps1').then(function(){
        console.log('invoking...');
        return ps.invoke();
    })
    .then(function(output){
        console.log('stopped...');
        console.log(output);
        ps.dispose();
    })
});



// Stops a Virtual Machine on the devTestLab resource group (does not work)
router.get('/stop', (req, res) => {

    //contains powershell scripts to stop the VM
    ps.addCommand('../../ps1/StopVM.ps1').then(function(){
        console.log('invoking...');
        return ps.invoke();
    })
    .then(function(output){
        console.log('stopped...');
        console.log(output);
        ps.dispose();
    })
});



// -------------------------- Is logged in ------------------------ //

function loggedIn(req, res, next) {
    if (req.user) {
        next();
    } else {
        res.redirect('/');
    }
}

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
