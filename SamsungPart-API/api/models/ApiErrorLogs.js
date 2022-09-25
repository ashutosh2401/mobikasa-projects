module.exports = {
    attributes: {
	apiName: {
		type: 'string',
		required: true
	},
	apiUrl: {
		type: 'string',
		required: true
	},
	userId:  {
	    type: 'string',
	    required: false
	  },
	requestBody:  {
	    type: 'json',
	    columnType: 'array'      
	  },
	responseBody:  {
	    type: 'json',
	    columnType: 'array'      
	}
    }
}
