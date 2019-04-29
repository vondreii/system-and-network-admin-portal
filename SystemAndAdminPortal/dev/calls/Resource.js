/**
 * Resource.js
 *
 * Project:   INFT2031 Network and Admin Portal 
 * Author:    UoN Major Project, 2016
 * Modified:  Sharlene Von Drehnen
 * Date:      10/12/2016 - 31/01/2017    
 *
 */ 

module.exports = {
	  apiVersion: '2015-01-01',

	  // The devTestLab resource group in my Azure subscription 
	  baseURI: `/resourceGroups/`,


	  // -------- Create Resource Group -------- //

	  createResourceGroup:function(resourceGroupName){

		    var payload = {
		      "location":"Australia East"
		    }

		    // Azure request to put the payload (location) onto the Azure server 
		    return makeAzureRequest('put', `${this.baseURI}/resourceGroupName`, this.apiVersion, null, payload);
	  }
  }
