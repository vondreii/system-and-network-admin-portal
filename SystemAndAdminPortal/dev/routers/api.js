/**
 * api.js
 *
 * Project:   INFT2031 Network and Admin Portal 
 * Author:    UoN Major Project, 2016
 * Modified:  Sharlene Von Drehnen
 * Date:      10/12/2016 - 31/01/2017    
 *
 * Description:
 * Includes all the routes and functionalities regarding VM Management
 * Stopping, starting, connecting, deallocating VMs etc
 * Redirects to the necessary pages.
 *
 */ 

// Variables using modules 
var router = Express.Router();
var User = require('../lib/passport/usermodel');

// Server paths
global.Calls = {
    IP: require(CONFIG.SERVER_PATH + '/dev/calls/IP'),
    Local: require(CONFIG.SERVER_PATH + '/dev/calls/Local'),
    NIC: require(CONFIG.SERVER_PATH + '/dev/calls/NIC'),
    VM: require(CONFIG.SERVER_PATH + '/dev/calls/VM'),
    Storage: require(CONFIG.SERVER_PATH + '/dev/calls/Storage'),
    Resource: require(CONFIG.SERVER_PATH + '/dev/calls/Resource')
};


// -------- Routers made to render files or config other info -------- //

router.use((req, res, next) => {
    console.log('Serving API request...');
    next();
});


// ----- Default API Page ----- //
router.get('/', (req, res) => {
    res.json({
        message: 'Default API page'
    });
});



// --------------------------- Create VM -------------------------- //

router.get('/vm/create', (req, res) => {
    console.log('Called /vm/create...');

    // Calls method to create the student VM (in dev/calls/local.js)
    Calls.Local.createMachine(req.query.name, 'AdminUsername', 'Password1234!');
    res.sendFile(path.join(CONFIG.SERVER_PATH + '/www/testing/index.html'));
});



// ---------------------------- Start VM -------------------------- //

router.post('/vm/start', (req, res) => {
    var vmName = req.body["data"];

    console.log(vmName);

    // Calls method to start VM using its name (in dev/calls/local.js)
    Calls.Local.startStudentVM(vmName);
});



// ---------------------------- Stop VM --------------------------- //

router.post('/vm/stop', (req, res) => {
    var vmName = req.body["data"];
    console.log(vmName);

    // Calls method to stop VM using its name (in dev/calls/VM.js)
    Calls.VM.stopVM(vmName);
});



// -------------------------- Connect VM --------------------------- //

router.post('/vm/connect', (req, res) => {
    var ip;

    // Gets name of VM from request
    var vmName = req.body["data"];

    // Calls method to get the IP of VM (in dev/calls/IP.js)
    Calls.IP.getPublicIPStatus(vmName).then((req) => {

        // Requests IP address
        var ipAddress = req.body.properties.ipAddress;
        console.log(ipAddress);
    })
});

router.get('/vm/connectpage', (req, res) => {
    res.redirect('/client');
});



// -------------------------- Delete VM ---------------------------- //

router.post('/vm/delete', (req, res) => {

    // Gets name of VM using request
    var vmName = req.body["vmname"];

    // Calls method to delete the VM AND the VM's resources (in dev/calls/VM.js)
    Calls.VM.deleteVmResourses(vmName)
    res.redirect('back');

})


// ------------------------ Deallocate all VMs ----------------------- //

router.get('/deallocateall', (req, res) => {

    // Method in dev/calls/vm.js that gets all the VM objects
    Calls.VM.getAllVms().then((vmres) => {
		var vmJson = vmres.body.value;

        // For each Virtual Machine
		for(var i in vmJson){

			console.log("Deallocating "+vmJson[i].name);

            // Calls a method that stops the virtual machine, using its name (in dev/calls/vm.js) 
			Calls.VM.stopVM(vmJson[i].name);
		}
	});
});



// ----------------- Provisionals and Statuses of VM ----------------- //

router.post('/vm/list/win', (req, res) => {

    // Variables and requests for data
    var status;
    var vmName = req.body["vmname"];

    console.log('/vm/list/win: ' + vmName);
    var jsonbody = JSON.stringify(req.body);
    var username = req.body["data"];
    var machine = req.body["machine"];

    // Calls a method that gets the virtual machine instanceview (in dev/calls/vm.js) 
    Calls.VM.getVMInstanceView(username + machine).then(
        (req) => {
            
            var responseBody = req.body;

            // Provisional and status
            provisional = responseBody.statuses[0]['displayStatus'];
            status = responseBody.statuses[1]['displayStatus'];
            console.log(status);

            // Frequently outputted in views/virtualMachines.pug page
            res.send("VM Provisional Status:" + provisional + " VM Status:" + status);
        
        }

    ).catch((errors) => {

        // If there are errors (example, no VMs exist, then "Status: Off" is displayed)
        console.log(errors);
        res.send("Status: Off");
    })
});


module.exports = router;
