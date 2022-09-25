/**
 * UserController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */
const ERROR_TEXT = require('../constants').MESSAGE;
const { ObjectID } = require('mongodb'); 
const createAdmin = async function(req, res) {
     try {
                 const isValid = await Validations.UserSchema.createAdmin.validateAsync(req.body);
                 let result = await UserManager.doesUsernameExist(req.body.email);
                 if(result){
                     throw "Email already exists";
                 }
                 const userData = { email, firstName,  lastName, password} = req.body;
                 userData.isAdmin = 1;
                 let userResult = await User.create(userData).fetch();
                 userData.id = userResult.id;
                 return res.ok({
                     msg: 'User created successfulyy',
                     data: {
                         userData
                     },
                     status:true
                 });
     } catch (error) {
         return res.badRequest(Utils.jsonError(error));
     }
 }
 
 const updateAdmin = async function(req, res) {
     try {
                 let id = req.params.id;
                 if (!id) {
                     throw "Please provider user id";
                 }
                 if (!ObjectID.isValid(id)) {
            			throw 'Invalid identifier';
		         }
                 let result = await User.findOne({
                     _id: id
                 });
                 if (!result) {
                     throw "Invalid user id";
                 }
                 const userData = {firstName,  lastName, gender, password, dateOfBirth, address} = req.body;
                 let userResult = await User.update({
                     _id: id
                 },userData).fetch();
 
                 return res.ok({
                     msg: 'User update successfulyy',
                     data:userData,
                     status:true
                 });
         
     } catch (error) {
         return res.badRequest({error});
     }
 }
 
 const deleteAdmin = async function(req, res) {
     try {
         let id = req.params.id;
         if (!id) {
             throw "Please provide user id";
         }
         if (!ObjectID.isValid(id)) {
            throw 'Invalid identifier';
         }
         let result = await User.destroy(id).fetch();;
         if (!result) {
             throw "Invalid user id";
         }
         return res.ok({
             msg: 'User deleted successfully',
             status: true
         });
      } catch (error) {
         return res.badRequest({error});
     }
     
 }
 const getAllAdminUsers = async function(req, res) {
     try{
         let recordPerPage = 6;
         let currentPage = page = req.query.page || 1;
         let result = await User.find({select: ['firstName', 'lastName', 'email', 'isAdmin', 'createdAt']
     }).skip(recordPerPage * (page - 1)).limit(5);
         if (!result) {
            throw "No User Data";
         }
         return res.ok({
         data: {
             result,
             currentPage,
             recordPerPage,
             totalRecords: result.length
         },
         status: true,
         code: 200
         });
     } catch (error) {
         return res.badRequest({error});
     }
 }
  
 const login = async (req, res) => {
     try{
         const isValid = await Validations.UserSchema.login.validateAsync(req.body);	
         const email = req.body.email;
         const password = req.body.password;
         let data = await UserManager.authenticateUserByPassword(email, password);
         res.ok(data);
     } catch (error) {
         return res.badRequest(Utils.jsonError(error));
     }
 }
 
 const forgotPassword = function(req, res) {
     try{
         if (!req.body) {
         return res.badRequest(Utils.jsonError('Empty body'));
         }
         const email = req.body.email;
         UserManager
         .generateResetToken(email)
         .then(function(token) {
             res.ok({
                        msg: 'A link to reset your password has been sent to your email address',
                        data: {},
                        status:true         
                  });
         })
         .catch(error => {
            return res.badRequest(Utils.jsonError(error));

         });
     } catch (error) {
        return res.badRequest(Utils.jsonError(error));
    }
 }
 
 
 
 const resetPasswordByResetToken = function(req, res) {
    try{
         if (!req.body) {
         return res.badRequest(Utils.jsonError('Empty body'));
         }
         const resetToken = req.body.reset_token;
         const newPassword = req.body.new_password;
         const newPasswordConfirm = req.body.new_password_confirm;
         if (!resetToken) {
         return res.badRequest(Utils.jsonError('Reset token is required'));
         }
         if (!newPassword || newPassword !== newPasswordConfirm) {
         return res.badRequest(Utils.jsonError('Password does not match'));
         }
         UserManager
         .resetPasswordByResetToken(resetToken, newPassword)
         .then(() => {
             res.ok({
                msg: 'Your password has been updated successfully',
                data: {},
                status:true    
             });
         })
         .catch(error => {
            return res.badRequest(Utils.jsonError(error));

         });
    }catch(error){
          return res.badRequest(Utils.jsonError(error));
    }
 }
 
 const changePassword = function(req, res) {
    try{
        if (!req.body) {
        return res.badRequest(Utils.jsonError('Empty body'));
        }
        const currentPassword = req.body.password;
        const newPassword = req.body.new_password;
        const newPasswordConfirm = req.body.new_password_confirm;

        if (!currentPassword) {
        throw 'Current password is required';
        }

        if (!newPassword || newPassword !== newPasswordConfirm) {
        throw 'Password does not match';
        }
       

        UserManager
        .changePassword(req.decoded.userId, currentPassword, newPassword)
        .then(function(token) {
            return res.ok({
                token
            });
        })
        .catch(err => {
            switch (err) {
                case ERROR_TEXT.USER_NOT_FOUND:
                    return res.badRequest(Utils.jsonError('Email not found'));
                case ERROR_TEXT.INVALID_PASSWORD:
                    return res.badRequest(Utils.jsonError('Invalid password'));
                default:
                    return res.serverError(Utils.jsonError(err));
            }
         });
    }catch(error){
         return res.badRequest(Utils.jsonError(error));
    }
}

 const getUserDetails = async function(req, res) {
     try {
         let id = req.params.id;
         if (!id) {
             throw "Please provide user id";
         }
         let result = await User.findOne({
             id: id
         });
         if (!result) {
             throw "In valid user id";
         }
         delete result.password;
         delete result.accessToken;
         return res.send({
             data: result
         });
     } catch (err) {
         return res.badRequest(err);
     }
 }
 const logout = async function(req, res) {
    try {
        let id = req.decoded.userId;
        if (!id) {
            throw "Please login";
        }
        let result = await User.findOne({
            id: id
        });
        if (!result) {
            throw "In valid user id";
        }
        let updatedUser = await User.update({"id": id})
        .set({
            accessToken:""
        }).fetch();
        updatedUser = JSON.parse(JSON.stringify(updatedUser[0]))
        delete updatedUser.password;
        return res.send({
            data: updatedUser
        });
    } catch (err) {
        return res.badRequest(err);
    }
}
 
 module.exports = {
     createAdmin,
     updateAdmin,
     deleteAdmin,
     login,
     getAllAdminUsers,
     forgotPassword,
     changePassword,
     resetPasswordByResetToken,
     getUserDetails,
     logout
 }
