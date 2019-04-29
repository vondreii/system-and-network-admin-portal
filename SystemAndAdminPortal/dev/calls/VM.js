/**
 * VM.js
 *
 * Project:   INFT2031 Network and Admin Portal 
 * Author:    UoN Major Project, 2016
 * Modified:  Sharlene Von Drehnen
 * Date:      10/12/2016 - 31/01/2017    
 *
 */ 

module.exports = {
    apiVersion: '2016-03-30',

    // Base URI.. Virtual Machines branch in DevTestLab in subscription
    baseURI: `/resourceGroups/${AZURECONFIG.RESOURCE_GROUP}/providers/Microsoft.Compute/virtualMachines/`,


    // ------------ Create VM ------------ //

    createVM: function(vmName, username, password, NICName) {
		var osLink = AZURECONFIG.WINDOWS_SERVER;

        // If the Virtual Machine is a Desktop
		if(vmName.includes("Desk")){

            // Desktop Configuration
			osLink = AZURECONFIG.WINDOWS_DESK; 

		}else{ // If the Virtual Machine is a Server

            // Server Configuration
			osLink = AZURECONFIG.WINDOWS_SERVER; 
		}

        // Payload with properties for the Virtual Machine
        var payload = {
            "id": this.baseURI + vmName,
            "name": vmName,
            "location": "australiaeast",
            "tags": {
                "studentNumber": "thisiswhatiswrong"
            },
            "properties": {
                "hardwareProfile": {
                    "vmSize": "Standard_A1"
                },
                "osProfile": {
                    "computerName": vmName,
                    "adminUsername": "AdminUsername",
                    "adminPassword": "Password1234!"
                },
                "storageProfile": {
                    "osDisk": {

                        // The VHD uploaded to the Azure storage Account which is used to create Virtual Machine Desktops
                        "name": "Windows10Desk.vhd",
                        "osType": "Windows",
                        "caching": "ReadWrite",
                        "image": {
                            "uri": osLink
                        },
                        "vhd": { 

                            // Location URI for the vhd
                            "uri": "https://dinft2031devtest9906.blob.core.windows.net/uploads/Windows10Desk.vhd",
                        },
                        "createOption": "FromImage"
                    },
                },
                "networkProfile": {
                    "networkInterfaces": [{

                        // URI for NIC in the devtestlab resource group in my subscription
                        "id": `subscriptions/${AZURECONFIG.SUBSCRIPTION_ID}/resourceGroups/${AZURECONFIG.RESOURCE_GROUP}/providers/Microsoft.Network/networkInterfaces/` + NICName
                    }]
                }
            }
        }

        // Make request to the Server to put Virtual Machine with payload onto the Azure Server
        return makeAzureRequest('put', `${this.baseURI}/${vmName}`, this.apiVersion, null, payload);
    },


    // ----------- Get VM Status ---------- //
        
    getVMStatus: function(vmName) {

        // Make request to the Server to get the status of the Virtual Machine
        return makeAzureRequest('get', `${this.baseURI}/${vmName}`, this.apiVersion);
    },


    // ------------ Get all VMs ----------- //

	getAllVms:function(){

        // Make request to the Server to get all VMS (properties for all VMs, such as name)
		return makeAzureRequest('get',`${this.baseURI}`,this.apiVersion);
	},


    // ------------- Start VM ------------- //

    startVM: function(vmName) {

        // Make request to the Server to start a Virtual Machine in the resource group specified in config
        return makeAzureRequest('post', `${this.baseURI}/${vmName}/start`, this.apiVersion);
    },


    // -------------- Stop VM ------------- //

    stopVM: function(vmName) {

        // Make request to the Server to Stop a VM in the resource group specified in config
        return makeAzureRequest('post', `${this.baseURI}/${vmName}/deallocate`, this.apiVersion);
    },
    

    // ------- Get VM Instance View ------- //

    getVMInstanceView: function(vmName) {

        // Make request to the Server to get a VM Instance View 
        return makeAzureRequest('get', `${this.baseURI}/${vmName}/InstanceView`, this.apiVersion);
    },


    // ------------- Delete VM ------------ //

    deleteVM: function(vmName) {

        // Make request to the Server to delete a VM in the resource group specified in config
        return makeAzureRequest('del', `${this.baseURI}/${vmName}`, this.apiVersion);
    },


    // -------- Delete VM Resources ------- //

	deleteVmResourses: function(vmName){
		console.log("dvr called");

        // Deletes the Virtual Machine first
		this.deleteVM(vmName).then((res)=>
		{
			console.log("waiting for vm deletion");

            // Set timeout for 15 seconds
			global.setTimeout(()=>{

                // Delete the NIC of the VM
				Calls.NIC.deleteNIC(vmName).then((res)=>{
					console.log("waiting for NIC deletion");

                        // set Timeout for 15 seconds
						global.setTimeout(()=>{

                            // Delete Public IP Address and the storage blob the VM is in
							Calls.IP.deletePublicIP(vmName);
							Calls.Storage.deleteBlob(vmName);

						},15000).then(()=>{
							return "sucess";
						})
					}).catch((err)=>this.deleteVmResourses(vmName));

			},15000)
            
		}).catch((err)=>this.deleteVmResourses(vmName))
	}
};
