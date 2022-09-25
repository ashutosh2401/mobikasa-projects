module.exports = {

	/**
	 * Returns an object with error field for response
	 * @param errorMessage {string}
	 * @returns {{err_msg: {string}}}
	 */
	jsonError(errorMessage, details="") {
	        if(errorMessage && errorMessage.details){
	            errorMessage = errorMessage.details[0]["message"]
	        }
		return {
			status:false, msg: errorMessage,errors:details
		};
	}
};

