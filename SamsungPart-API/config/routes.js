/**
 * Route Mappings
 * (sails.config.routes)
 *
 * Your routes tell Sails what to do each time it receives a request.
 *
 * For more information on configuring custom routes, check out:
 * https://sailsjs.com/anatomy/config/routes-js
 */

module.exports.routes = {

  /***************************************************************************
  *                                                                          *
  * Make the view located at `views/homepage.ejs` your home page.            *
  *                                                                          *
  * (Alternatively, remove this and add an `index.html` file in your         *
  * `assets` directory)                                                      *
  *                                                                          *
  ***************************************************************************/

  '/': { view: 'pages/homepage' },

	'post /api/v1/admin/login': { action: 'user/login' },
	'post /api/v1/admin/forgot': { action: 'user/forgotPassword' },
	'post /api/v1/admin/reset-password': { action: 'user/resetPasswordByResetToken' },
	'post /api/v1/admin/change-password': { action: 'user/changePassword'},
	'put /api/v1/admin/:id': { action: 'user/updateAdmin' },
	'post /api/v1/admin': { action: 'user/createAdmin' },
	'delete /api/v1/admin/:id': { action: 'user/deleteAdmin' },
	'get /api/v1/admin': { action: 'user/getAllAdminUsers' },
  'post /api/v1/admin/logout': { action: 'user/logout' },
	'get /api/v1/admin/:id': { action: 'user/getUserDetails' },
  'post /api/v1/admin/diagrams': { action: 'diagram/createDiagram' },
  'post /api/v1/admin/diagrams/upload': { action: 'diagram/uploadDiagram' },
  'get /api/v1/admin/diagrams': { action: 'diagram/getDiagrams' },
  'get /api/v1/admin/diagrams/:id': { action: 'diagram/getDiagramDetails' },
  'put /api/v1/admin/diagrams/:id': { action: 'diagram/updateDiagram' },
  'get /api/v1/admin/diagrams/download': { action: 'diagram/downloadDiagram' },
  'get /api/v1/admin/diagrams/download/:id': { action: 'diagram/downloadDiagramDetails' },
  'get /api/v1/admin/diagrams/getDiagramDetailsByName': { action: 'diagram/getDiagramDetailsByName' },
  'delete /api/v1/admin/diagrams/:id': { action: 'diagram/deleteDiagram' },
  'put /api/v1/admin/diagram/parts/:id': { action: 'diagram/updateDiagramParts' },
  'delete /api/v1/admin/diagram/parts/:id': { action: 'diagram/deleteDiagramParts' },
  'post /api/v1/admin/diagram/parts': { action: 'diagram/createDiagramParts' },
  'post /api/v1/admin/diagram/createDiagramForScript': { action: 'diagram/createDiagramForScript' },
  'get /api/v1/admin/diagram/getEnv': { action: 'diagram/getEnv' },
  'get /api/v1/admin/getErrors': { action: 'diagram/getErrors' },
   'post /api/v1/admin/diagrams/uploadimages': { action: 'diagram/uploadImages' },
  


  

  

  
  
  

  
  /***************************************************************************
  *                                                                          *
  * More custom routes here...                                               *
  * (See https://sailsjs.com/config/routes for examples.)                    *
  *                                                                          *
  * If a request to a URL doesn't match any of the routes in this file, it   *
  * is matched against "shadow routes" (e.g. blueprint routes).  If it does  *
  * not match any of those, it is matched against static assets.             *
  *                                                                          *
  ***************************************************************************/


};
