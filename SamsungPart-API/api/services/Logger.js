const jwt = require('jsonwebtoken');
const nodemailer = require("nodemailer");
let path = require("path");
let fs = require("fs");
let is_debug = true;
let DEBUG_TYPE = "database";
let log = async(...args) => {
  try {
    //console.log("error",args[2])
    let reqBody = {...args[1].body, ...args[1].headers, ...args[1].query, ...args[1].params }
    if (is_debug) {
      let res = [];
      res.push(args[2])
      if (DEBUG_TYPE == "email") {

      } else if (DEBUG_TYPE == "database") {
        await ApiErrorLogs.create({
          apiName: args[0],
          apiUrl: args[1].url,
          userId: args[4],
          requestBody: reqBody,
          responseBody: res
        });      
    }
  }
  } catch (err) {
       console.log("err",err);
  }

}

module.exports = {
  log: async(...args) => {

    log(...args);

  }
}