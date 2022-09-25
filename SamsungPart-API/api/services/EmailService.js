"use strict";
const nodemailer = require("nodemailer");
const fs = require("fs");
const path = require("path");
let replacer = function(tpl, data) {
  for(let i in data) {
    tpl = tpl.replace("{{"+i+"}}", data[i])
  }
  //console.log(data);
  return tpl;
}
async function sendResetToken(email, resetToken, replacementObj){
  let testAccount = await nodemailer.createTestAccount();

  let transporter = nodemailer.createTransport({
    host:  process.env.EMAIL_SERVICE_HOST,
    port: process.env.EMAIL_SERVICE_PORT,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_SERVICE_USER, // generated ethereal user
      pass: process.env.EMAIL_SERVICE_PASSWORD, // generated ethereal password
    },
  });
    let template_path = path.join(__dirname, "../", "templates/")
    let html = fs.readFileSync(template_path + "forgotPassword.html", "utf8");
   // var template = handlebars.compile(html);
    replacementObj = replacementObj || {};
    let current_year = (new Date()).getFullYear();
    replacementObj.copy_right = `${current_year}`;
    var htmlToSend = replacer(html, replacementObj);
//console.log(htmlToSend);
// return true;
  let info = await transporter.sendMail({
    from: process.env.MAIL_FROM, // sender address
    to: email, // list of receivers
    subject: "Password Reset", // Subject line
    text: "", // plain text body
    html: htmlToSend, // html body
  });
  

  console.log("Message sent: %s", info);

  console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
}



module.exports = {
  sendResetToken
}

