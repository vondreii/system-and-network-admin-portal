/**
 * Local.js
 *
 * Project:   INFT2031 Network and Admin Portal 
 * Author:    UoN Major Project, 2016
 * Modified:  Sharlene Von Drehnen
 * Date:      10/12/2016 - 31/01/2017    
 *
 */ 

//Methods relating to creating/starting Virtual Machines for students

 module.exports = {

 	// ------- Starts a Student VM ------- //

	startStudentVM: function(vmName){
		console.log("Starting Virtual Machine");

		// Calls a Method in VM.js that creates VM instance 
		Calls.VM.getVMInstanceView(vmName).then(

			// Calls a method in VM.js that starts an already existing Virtual machine, located in the devtest lab resource group
			Calls.VM.startVM(vmName).catch((error)=> {

					console.log("Error Starting");
				})
	
		).catch((error)=>{ // If the Virtual Machine does not exist then an instance cannot be created

			console.log('Virtual Machine does not exist');

			// If this is uncommented, and a student VM does not exist, a student VM will be created at take its place: 
			// this.createMachine(vmName,"AdminUsername","Password1234!"); 
		})

	},


	// ------- Creates a Student VM ------- // 

	// *Only creates a student VM if the student VM exists

	createMachine: function (name, username, password) {

		// Properties of the new VM
		var machineModel = {
			name: name,
			ip: '',
			username: username,
			password: password,
			state: 'added'
		};

		this.createMachineIP(machineModel); // Start this chain of machine creation
	},


	// ------ Creates a Student VM IP  ----- // 

	createMachineIP: function (machine) {

		// This VM does not have an IP, so create an IPv4 for our virtual machine to use
		// Create an IP address using the Machines's name
		Calls.IP.createPublicIPAddress(machine.name)
			.then((res) => {

			  	var ensureIPCreation = (res) => {

			  		// If the IP creation is successful
					if (res.body.properties.provisioningState === 'Succeeded') {

						// Machine state changed, create NIC for machine
						machine.state = 'ip:created';
						this.createMachineNIC(machine);

					} else {  // If the IP creation is not succesful 

						machine.state = 'ip:pending';

						// Set timeout and try again
						global.setTimeout(() => {
							Calls.IP.getPublicIPStatus(machine.name)

								// then go back to ensure IP creation and create NIC.
								.then(ensureIPCreation)
								.catch((errors) => console.log(errors));

						}, CONFIG.REFRESH_RATE);;
					}
				};

				Calls.IP.getPublicIPStatus(machine.name)
					.then(ensureIPCreation)
					.catch((errors) => console.log(errors));
			})
			.catch((errors) => {
				console.log(errors);
			});
	},


	// ----------- Creates a VM NIC  ---------- // 

	createMachineNIC: function (machine) {

		// For the new VM that has been created (with an IP address), an NIC is created
		Calls.NIC.createNIC(machine.name, machine.name)
			.then((res) => {

				var ensureNICCreation = (res) => {

					// If the NIC creation is successful 
					if(res.body.properties.provisioningState === "Succeeded"){

						// The machine will be created
						machine.state = 'nic:created';
						this.createMachineVM(machine);

					}else{ // If the NIC creation is not succesful 

						machine.state = 'nic:pending';

						// Set timeout and try again
						global.setTimeout(() => {
							Calls.NIC.getNICStatus(machine.name)

								// then go back to ensure NIC creation and create Virtual Machine.
								.then(ensureNICCreation)
								.catch((errors) => console.log(errors));

						},CONFIG.REFRESH_RATE);
					}
				};

				Calls.NIC.getNICStatus(machine.name)
					.then(ensureNICCreation)
					.catch((errors) => console.log(errors));

			})
			.catch((errors) => {
				console.log(errors);
			});
	},


	// -------- Creates a student VM  -------- // 

	createMachineVM: function (machine) {

		// A method in VM.js that creates a Virtual Machine using the student's username and password
		Calls.VM.createVM(machine.name, machine.username,
						  machine.password, machine.name)
		.then((res)=>{
			var ensureVMCreation = (res) =>{

				// If VM creation is successful: 
				if(res.body.properties.provisioningState === "Succeeded"){

					// Get status of IP using it's Ip address
					Calls.IP.getPublicIPStatus(machine.name)
						.then((res) => {

							// Machine is ready to start and connect with it's own IP address
							machine.ip = res.body.properties.ipAddress;
							machine.state = 'ready';
						})
						.catch((errors) => console.log(errors));

				}else{ // If VM cannot be created:

					machine.state = 'vm:pending';

					// Set timeout and try again
					global.setTimeout(() => {

						// keep getting status 
						Calls.VM.getVMStatus(machine.name)
							.then(ensureVMCreation)
							.catch((errors) => console.log(errors));
					},CONFIG.REFRESH_RATE);
				}
			}

			Calls.VM.getVMStatus(machine.name)
				.then(ensureVMCreation)
				.catch((errors) => console.log(errors));

		}).catch((errors) => {
			console.log(errors);
		});
	}
};
