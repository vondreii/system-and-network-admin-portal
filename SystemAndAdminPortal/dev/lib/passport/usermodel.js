/**
 * usermodel.js
 *
 * Project:   INFT2031 Network and Admin Portal 
 * Author:    UoN Major Project, 2016
 * Modified:  Sharlene Von Drehnen
 * Date:      10/12/2016 - 31/01/2017    
 *
 */ 

var mongoose = require('mongoose');

// Attributes that make up a user
module.exports = mongoose.model(
	'User',{

		// Basic Attributes
		username:String,
		userType:String,

    	firstName:String,
    	lastName:String,
    	displayName:String,

    	email:String,
    
    	// User lab enrollment 
    	labNo:String,
    	labTime:String,
    	labDay:String,
		
		// Password
		password:String,
		resetPasswordToken:String,
		resetPasswordExpires:Date,

		// Each user is assigned 3 Virtual Machines
		vmDesk1Status:String,
		vmDesk2Status:String,
		vmServStatus:String
	});
