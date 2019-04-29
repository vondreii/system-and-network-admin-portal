/**
 * NIC.js
 *
 * Project:   INFT2031 Network and Admin Portal 
 * Author:    UoN Major Project, 2016
 * Modified:  Sharlene Von Drehnen
 * Date:      10/12/2016 - 31/01/2017    
 *
 */ 

module.exports = {
  	apiVersion: '2016-03-30',

    // Base URI is the network Interface found in the resource group devTestLab in my Azure subscription 
  	baseURI: `/resourceGroups/${AZURECONFIG.RESOURCE_GROUP}/providers/Microsoft.Network/networkInterfaces`,

    
    // --------- Create an NIC --------- //

  	createNIC: function (NICName,publicIP) {
        var base = "/subscriptions/"+AZURECONFIG.SUBSCRIPTION_ID+"/resourceGroups/"+AZURECONFIG.RESOURCE_GROUP+"/providers/Microsoft.Network/";

        // Payload with NIC config/properties
    		var payload =
        {
           "location":"australiaeast",
           "properties":{
              "ipConfigurations":[
                 {
                    "name":"default",
                    "properties":{
                       "subnet":{
                          "id":AZURECONFIG.SUBNET
                       },
                       "privateIPAllocationMethod":"Dynamic",
                       "privateIPAddressVersion":"IPv4",
                       "publicIPAddress":{
                        "id":base +"publicIPAddresses/"+publicIP
                     }
                    }
                 }
              ],
              "dnsSettings":{
                 "internalDnsNameLabel": NICName
              },
              "enableIPForwarding": false
           }
        }

        // Make request to the Azure server, put new NIC properties on server using the payload with NIC properties
    		return makeAzureRequest('put', `${this.baseURI}/${NICName}`, this.apiVersion, null, payload);
  	},


    // -------- Get NIC status --------- //

  	getNICStatus: function (NICName) {

        // Make request to Azure server to get NIC status
    		return makeAzureRequest('get', `${this.baseURI}/${NICName}`, this.apiVersion);
  	},


    // ---------- Delete NIC ----------- //

  	deleteNIC:function(NICName){

        // Make request to Azure server and deletes the NIC
    		return makeAzureRequest('del', `${this.baseURI}/${NICName}`, this.apiVersion);
  	}

};
