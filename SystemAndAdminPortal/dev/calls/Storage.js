/**
 * Storage.js
 *
 * Project:   INFT2031 Network and Admin Portal 
 * Author:    UoN Major Project, 2016
 * Modified:  Sharlene Von Drehnen
 * Date:      10/12/2016 - 31/01/2017    
 *
 */ 

// Azure-Storage module in order to do storage account things on Azure
var azure = require('azure-storage');
var blobService = azure.createBlobService();
//https://github.com/Azure/azure-storage-node

module.exports = {
    apiVersion: '2016-01-01',

    // Base URI: Storage in devTestLab Resource Group
    baseURI: `/resourceGroups/${AZURECONFIG.RESOURCE_GROUP}/providers/Microsoft.Storage/`,


    // -------- Create Storage Group -------- //

    createStorageGroup: function(storageGroupName) {

        // Payload with properties for a new storage account
        var payload = {
            "location": "australiaeast",
            "properties": {
                "accessTier": "Hot"
            },
            "sku": {
                "name": "Standard_LRS"
            },
            "kind": "BlobStorage"
        }

        // Make Azure request to put new storage group on Azure server
        return makeAzureRequest('put', `${this.baseURI}/storageAccounts/${storageGroupName}`, this.apiVersion, null, payload);
    },


    // ------ Check Storage Account name ------ //

    checkStorageAccountName: function(storageGroupName) {

        // Payload with a new name for a storage group
        var payload = {  
            "name": storageGroupName,
             "type": "Microsoft.Storage/storageAccounts"
        }

        // Make post request to check availibility of name in the payload
        return makeAzureRequest('post', 'https://management.azure.com/subscriptions/${AZURECONFIG.SUBSCRIPTION_ID}/providers/Microsoft.Storage/checkNameAvailability', this.apiVersion, null, payload);
    },


    // ------------ Create container ---------- //

    createContainer: function(containerName) {

        // If container does not exist, then create a blob container
        blobService.createContainerIfNotExists(containerName, {
            publicAccessLevel: 'blob'
        }, function(error, result, response) {
            if (!error) {
                return result;
            }
        });
    },


    // ------------ Delete Blob ---------- //

    deleteBlob: function(vmName) {

        // Delete a blob container on the subscription 
        blobService.deleteBlob('vhd', vmName + '.vhd', function(error, response) {
            if (!error) {
                // Blob has been deleted
            }
        });
    },


    // ------ Get storage Access Key ------ //

	getStorageAccessKey:function(storageGroupName){

        // Makes a request to Azure server to list keys
		return makeAzureRequest('post', `${this.baseURI}/storageAccounts/${storageGroupName}/listKeys`, this.apiVersion);
	}

}
