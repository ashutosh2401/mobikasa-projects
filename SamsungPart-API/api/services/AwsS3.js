var AWS = require('aws-sdk');
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});
const fs = require("fs");
const path = require("path");
let bucketName = process.env.BUCKET_NAME;
var bucketParams = {
  Bucket: bucketName,
  ACL: "public-read"
};

module.exports = {
  uploadS3: (createdTimeSpan, fileBuffer, fileName) => {

    let contentType = {};

    return new Promise((resolve, reject) => {
      let fileType = fileName.split('.').pop();
      let upload_type_allowed = ['.png', '.jpeg', '.jpg', '.bmp'];
      if (fileType == "pdf") {
        contentType = {
          ContentType: 'application/pdf'
        };
      } else if (upload_type_allowed.includes("." + fileType)) {
        contentType = {
          ContentType: 'image/jpeg'
        };
      }

      try {

        let params = {
          ...bucketParams,
          ...contentType,
          Body: fileBuffer,
          Key: `${createdTimeSpan}/${fileName}`
        };

        s3.upload(params, (err, data) => {
          if (err) {
            reject(err);
          } else {
            console.log(data)
            console.log("resolved");
            resolve(data);
          }
        });
      } catch (err) {
        reject(err);
      }
    });
  },
  makeFolder: async(createdTimeSpan) => {
    return new Promise((resolve, reject) => {
      try {
        let readmeText = "Patient Folder Generated";
        let fileData = readmeText.toString("binary");
        let params = {
          ...bucketParams,
          Body: fileData,
          Key: `${createdTimeSpan}/readme.txt`
        };
        let response = s3.upload(params, (err, data) => {
          if (err) {
            return reject(err);
          } else {
            return resolve(data);
          }
        });
      } catch (err) {
        return reject(err);
      }
    });
  },
  getFolders: async() => {
    let response = await s3.listObjects(bucketParams);
  },
  getBucket: async() => {
    try {
      let response = await s3.listBuckets();
    } catch (err) {
      console.log(err)
    }
  },
  deleteFile : async(createdTimeSpan,fileName) => {
    return new Promise((resolve,reject)=>{
      try{
        let params = {
          Bucket: bucketName,
          Key: `${createdTimeSpan}/${fileName}`
        }
        s3.deleteObject(params, (err,data) => {
          if(err){
            reject(err);
          }else{
            resolve(true);
          }
        })
      }catch(err){
        reject(err)
      }
    })

  },
  fetchFileFromOneDrive: async() =>{
    return new Promise((resolve, reject) => {
      try{
        var AWS = require('aws-sdk');
        const s3 = new AWS.S3({
          accessKeyId: process.env.AWS_ACCESS_KEY,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
        });
        var params = {
          Bucket:bucketName
          };
          let fileData = []
          s3.listObjects(params, function(err, data) {
            //console.log(err,data)
            if (err) {
                return 'There was an error viewing your album: ' + err.message
            }else{
               console.log("in aws function",data.Contents)
              return resolve(data.Contents)
            }
          });
          
      }catch(err){
        return reject(err);
      }
    })
  },
  downloadFile : async(sourcePath,targetPath)=>{
    return new Promise((resolve, reject) => {
      try{
        var AWS = require('aws-sdk');
        const s3 = new AWS.S3({
          accessKeyId: process.env.AWS_ACCESS_KEY,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
        });
        let params = {Bucket: process.env.LAB_RESULTS_BUCKET_NAME, Key: sourcePath};
        console.log(params)
        var file = fs.createWriteStream(path.join(__dirname,`${targetPath}`));
        // file.on('end', (err,data) => {
        //   if(err){
        //     reject(err)
        //   }else{
        //     resolve(data)
        //   }
        //   console.log('Done');
        // });
        // s3.getObject(params).createReadStream().pipe(file);
        let readable = s3.getObject(params).createReadStream();
        readable.on('data', (chunk) => {
          file.write(chunk);
        });
        
        readable.on('end', () => {
          file.end();
          resolve (true)
        });
        
          
      }catch(err){
        return reject(err);
      }
    })
  }
};
