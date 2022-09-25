const path = require('path');
var normalizedPath = path.join(__dirname, "./../validation");
const GetAllModules = ( dirname ) => {
    if ( dirname ) {
        let dirItems = require( "fs" ).readdirSync( dirname );
        return dirItems.reduce( ( acc, value, index ) => {
            if ( path.extname( value ) == ".js" && value.toLowerCase() != "index.js" ) {
                let moduleName = value.replace( /.js/g, '' );
                acc[ moduleName ] = require( `${dirname}/${moduleName}` );
            }
            return acc;
        }, {} );
    }
}
let dirModules = GetAllModules(normalizedPath);
module.exports =  dirModules;



