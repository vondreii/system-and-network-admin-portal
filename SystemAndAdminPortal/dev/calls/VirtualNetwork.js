/**
 * VirtualNetwork.js
 *
 * Project:   INFT2031 Network and Admin Portal 
 * Author:    UoN Major Project, 2016
 * Modified:  Sharlene Von Drehnen
 * Date:      10/12/2016 - 31/01/2017    
 *
 */ 

module.exports = {
  	apiVersion: '2016-03-30',

    // Virtual Machines on the devtestlab resource group
  	baseURI: `/resourceGroups/${AZURECONFIG.RESOURCE_GROUP}/providers/Microsoft.Compute/virtualMachines`,


    // -------- Create Virtual Network -------- //

  	createVirtualNetwork: function (virtualNetworkName,subnetName) {

        // Payload with propties for a Virtual Network
    		var payload = [
           {
              "location":"Australia East",
              "properties":{
                 "addressSpace":{
                    "addressPrefixes":[
                       "10.1.0.0/16",
                       "10.2.0.0/16"
                    ]
                 },
                 "subnets":[
                    {
                       "name": subnetName,
                       "properties":{
                          "provisioningState":"Succeeded",
                          "addressPrefix":"10.1.0.0/24",
                       }
                    }
                 ]
              }
           }
        ];

        // Make Azure request to put Virtual Network property info on the Azure server
    		return makeAzureRequest('put', `${this.baseURI}/${virtualNetworkName}`, this.apiVersion, null, payload);
  	},


    // --------- Get Public IP Status --------- //

  	getPublicIPStatus: function (publicIPAddressName) {

        // Make Request to Azure Server to get status of IP using the VN name
  		  return makeAzureRequest('get', `${this.baseURI}/${virtualNetworkName}`, this.apiVersion);
  	}
};
