const jwt = require('jsonwebtoken');
const moment = require('moment');
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const ERROR_TEXT = require('../constants').MESSAGE;
function doesUsernameExist(email) {
	return new Promise((resolve, reject) => {
		User
			.findOne({"email":email})
			.exec((err, user) => {
				if (err) return reject(err);
				return resolve(!!user);
			});
	});
}
function getUserByToken(accessToken) {
	return new Promise((resolve, reject) => {
		User
			.findOne({"accessToken":accessToken})
			.exec((err, user) => {
				if (err) return reject(err);
				return resolve(user);
			});
	});
}
const authenticateUserByPassword = (email, password)=> {
    return new Promise((resolve, reject) => {
        UserManager
            .validatePassword(email, password)
            .then(({isValid, user}) => {
                if (!isValid) {
                    return reject(ERROR_TEXT.INVALID_EMAIL_PASSWORD);
                }else {					       		       
                       generateUserToken(user, async (token) => {
                               
                                let updatedUser = await User.update({id: user.id})
                                .set({
                                    accessToken:token
                                }).fetch();
                                updatedUser = JSON.parse(JSON.stringify(updatedUser[0]))
                                delete updatedUser.password;
                                resolve({token, updatedUser});
                       });
                }
            })
            .catch((err)=>{
                reject(ERROR_TEXT.INVALID_EMAIL_PASSWORD)
            });
    });
}
const generateResetToken = (email)=> {
    return new Promise((resolve, reject) => {
        User
            .findOne({email})
            .exec(async (err, user) => {
                if (err) return reject(err);
                if (!user) return reject(ERROR_TEXT.USER_NOT_FOUND);
                const resetToken = crypto.randomBytes(32).toString('hex');
                user.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
                user.passwordResetTokenExpiresAt = Date.now() + 10 * 60 * 1000;
                
                     const updatedUser = await User.updateOne({ email:user.email })
                .set({
                  passwordResetToken:user.passwordResetToken,
                       passwordResetTokenExpiresAt:user.passwordResetTokenExpiresAt
                });
                if (updatedUser) {
                    await EmailService.sendResetToken(email, user.passwordResetToken,{resetLink:process.env.BASEURI+"/reset-password?token="+user.passwordResetToken, user:user.firstName});
                    resolve(user.passwordResetToken);
                }else {
                    reject('The database does not contain a user');
                }

            });
    });
}

const resetPasswordByResetToken = function (resetToken, newPassword) {
    return new Promise(async (resolve, reject) => {		
        var updatedUser = await User.updateOne({passwordResetToken:resetToken})
                .set({
                        password:newPassword,
                      passwordResetToken:"",
                          passwordResetTokenExpiresAt:0,
                 });
        if (updatedUser) {
            resolve();
        }else {
            reject('The database does not contain a user');
        }
    });
}
const changePassword = async (id, currentPassword, newPassword) =>{
    return new Promise((resolve, reject) => {
        UserManager
            .validatePasswordByUserId(id, currentPassword)
            .then(({isValid, user}) => {
                if (!isValid) {
                    return reject(ERROR_TEXT.INVALID_PASSWORD);
                }
                else {
                    user
                        .setPassword(newPassword)
                        .then(() => {
                            user.resetToken = null;
                            user.passwordFailures = 0;
                            user.lastPasswordFailure = null;
                            user.save();
                            generateUserToken(user, token => {
                                resolve(token);
                            });
                        })
                        .catch(reject);
                }
            })
            .catch(reject);
    });
}

const validatePassword = (email, password)=> {
    return new Promise((resolve, reject) => {
        User
            .findOne({email: email})
            .exec((err, user) => {
                if (err) return reject(err);
                if (!user) return reject(ERROR_TEXT.USER_NOT_FOUND);
                if (user.locked) return reject(ERROR_TEXT.USER_LOCKED);
                        const isMatched = bcrypt.compareSync(password, user.password);
                                    console.log("isMatched", isMatched)
                if(isMatched){
                    resolve({isValid:true, user});
                }else{
                    reject(false);
                }
                
            });
    });
}
const validatePasswordByUserId = (id, password)=> {
    return new Promise((resolve, reject) => {
        User
            .findOne({id: id})
            .exec((err, user) => {
                if (err) return reject(err);
                if (!user) return reject(ERROR_TEXT.USER_NOT_FOUND);
                if (user.locked) return reject(ERROR_TEXT.USER_LOCKED);
                        const isMatched = bcrypt.compareSync(password, user.password);
                                    console.log("isMatched", isMatched)
                if(isMatched){
                    resolve({isValid:true, user});
                }else{
                    reject(false);
                }
                
            });
    });
}
const generateUserToken = function (user, done) {

    //const passwordHash = farmhash.hash32(user.password);
    const payload = {
        id: user.id,
     //   pwh: passwordHash,
        firstName:user.firstName,
        isAdmin:user.isAdmin
    };

    const token = jwToken.issue(
        payload
    );
    return done(token);
}

module.exports = {
    doesUsernameExist,
    authenticateUserByPassword,
    generateResetToken,
    resetPasswordByResetToken,
    changePassword,
    validatePassword,
    generateUserToken,
    getUserByToken
}