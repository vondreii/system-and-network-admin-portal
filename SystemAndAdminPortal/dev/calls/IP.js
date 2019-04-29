/**
 * IP.js
 *
 * Project:   INFT2031 Network and Admin Portal 
 * Author:    UoN Major Project, 2016
 * Modified:  Sharlene Von Drehnen
 * Date:      10/12/2016 - 31/01/2017    
 *
 */ 

 module.exports = {
    apiVersion: '2016-03-30',

    // Base URI is the network Interface found in the resource group devTestLab in my subscription 
    baseURI: `/resourceGroups/${AZURECONFIG.RESOURCE_GROUP}/providers/Microsoft.Network/publicIPAddresses`,


    // -------- Creates a public IP -------- //

    createPublicIPAddress: function(publicIPAddressName) {

        // When a new student VM is created, an IPv4 is created for that new VM
        var payload = {

            // Payload with properties for IP address
            "location": CONFIG.LOCATION,
            "properties": {
                "publicIPAllocationMethod": "Dynamic",
                "publicIPAddressVersion": "IPv4",
                "idleTimeoutInMinutes": 4
            }
        };

        // Make request to the Azure server, puts the new IP address data on the server using the payload with new IP properties
        return makeAzureRequest('put', `${this.baseURI}/${publicIPAddressName}`, this.apiVersion, null, payload);
    },


    // ------- Get public IP Status ------- //

    getPublicIPStatus: function(publicIPAddressName) {

        // Make request to the Azure server to get the status of an IP using its IP address
        return makeAzureRequest('get', `${this.baseURI}/${publicIPAddressName}`, this.apiVersion);
    },


    // --------- Delete IP Address -------- //

    deletePublicIP: function(publicIPAddressName) {

        // Make request to the Azure server using del api, deleting the IP address data on the server
        return makeAzureRequest('del', `${this.baseURI}/${publicIPAddressName}`, this.apiVersion);
    }
};
