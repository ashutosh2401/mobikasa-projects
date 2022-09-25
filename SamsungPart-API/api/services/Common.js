const fs = require('fs');

const imageUpload = function(req, name) {
     return new Promise((resolve, reject)=>{
     		 req.file(name).upload({
           			 dirname: require('path').resolve(sails.config.appPath, 'assets/images')
      		  }, async function(err, uploadedFiles) {
      		  	if(err){
      		  		reject(err);
      		  	}
      		  	let finalImage = [];
		        var baseUrl = sails.config.custom.baseUrl;
		        for (let frow of uploadedFiles) {
		                  if (fs.existsSync(frow["fd"])) {
					let fileBuffer = fs.readFileSync(frow["fd"]);
					let uploaded_payload = frow["fd"].split("/").pop().replace(/\s/g, '_');
					let user_created_timespan = "diagramImages";
					let uploadResponse  = await AwsS3.uploadS3(user_created_timespan, fileBuffer, uploaded_payload);
					finalImage.push(uploadResponse["key"]);
				        fs.unlinkSync(frow["fd"]);
		                  }
		           // let url = frow["fd"].replace('/var/www/testpeoject/testsails/assets/', baseUrl)
		            //finalImage.push(url);
		        }
      		  	resolve(finalImage);
      		  });
     })
};
const imageUploadTemp = function(req, name) {
	return new Promise((resolve, reject)=>{
			 req.file(name).upload({
					   dirname: require('path').resolve(sails.config.appPath, 'assets/temp')
			   }, async function(err, uploadedFiles) {
				   if(err){
					   reject(err);
				   }
				   let finalImage = [];
			   	   var baseUrl = sails.config.custom.baseUrl;
					for (let frow of uploadedFiles) {
		                                               if (fs.existsSync(frow["fd"])) {
		                                                        let fimage=frow["fd"].split("/").pop()
									resolve(fimage);
									break;
								}
					}
				reject("invalid image");
			   });
	})
};
const imageUploadTempToS3 = async function(req, name, key) {
	     let dirname= require('path').resolve(sails.config.appPath, 'assets/temp');   
	     let imgPath = dirname+"/"+name; 
	     console.log(imgPath)
		if (fs.existsSync(imgPath)) {
		    let finalImage=[]
			let fileBuffer = fs.readFileSync(imgPath);
			let user_created_timespan = "diagramImages";
			let uploaded_payload = name.replace(/\s/g, '_');
			let uploadResponse  = await AwsS3.uploadS3(user_created_timespan, fileBuffer, uploaded_payload);
			finalImage.push(uploadResponse["key"]);
			fs.unlinkSync(imgPath);
			return finalImage
		  }else{
                         throw {"error":"Please upload image first","key":key};
		  }  
		  
	
};

const csvUpload = function(req, name) {
	const csv=require('csvtojson');    
	return new Promise((resolve, reject)=>{
			 req.file(name).upload({
			   }, async function(err, uploadedFiles) {
				   if(err){
					   return reject(err);
				   }
			   if(!uploadedFiles){
				  return reject("Invalid csv file");
			   }
			   const frow = uploadedFiles[0];
			   const jsonArray=await csv().fromFile(frow["fd"]);
		       fs.unlinkSync(frow["fd"]);
			   resolve(jsonArray);
			 });
	})
};

module.exports ={
   imageUpload,
   csvUpload,
   imageUploadTemp,
   imageUploadTempToS3
}

