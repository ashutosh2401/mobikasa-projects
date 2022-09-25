/**
 * UploadController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

const csvParser = require('csv-parser');
const fs = require('fs');
const filepath = './assets/files/test_csv.csv';
const filePathRepeatRecords = './assets/files/test_text.txt';
let i = 0;
let duplicates = new Array();

module.exports = {

    normal: function(req,res) {
        sails.log('normal route');
        // console.log(req.file);
        return res.json(req.body);
    },

    newUpload: async function(req, res) {
        req.file('csv').upload({
            maxBytes: 10000000,
            dirname: require('path').resolve(sails.config.appPath, 'assets/files'),
            saveAs: 'test_csv.csv'
        }, function whenDone(err, uploadedFiles) {
            if (err) {
                return res.serverError(err);
            }
            if (uploadedFiles.length === 0){
                return res.badRequest('No file was uploaded');
            }
            fs.createReadStream(filepath)
            .on('error', () => {
                res.negotiate(err);
            })
            .pipe(csvParser())
            .on('data', async (row) =>  {
                // let dbRecord = await Upload.find({or: [{date: row['Date']}, {price: row['Price']}]});
                let dbRecord = await Upload.find({where: {date: row['Date']}});
                if(dbRecord){
                    let str = `Record ${i} is duplicate, where date is ${dbRecord[dbRecord.length-1]['date']} and price is ${dbRecord[dbRecord.length-1]['price']} \n`;
                    duplicates.push(str);
                    fs.appendFile(filePathRepeatRecords,str, (err) => {if(err) {return res.negotiate(err);} else {sails.log('str added to file:',str);}});
                    i++;
                }
                else{
                    await Upload.create({date:row['Date'],price:row['Price']})
                    .exec(async(err, resultRecord) => {
                        if(err){
                            return res.serverError(err);
                        }
                        if(resultRecord){
                            sails.log("Created a new record:" + resultRecord.date);
                        }
                    });
                }
            })
            .on('end', () => {
                sails.log("end");
            })
            sails.log("duplicate values",duplicates);
            sails.log("file after run");
            return res.ok();
        })
    }
}