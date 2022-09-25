const fs = require("fs");
const path = require("path");
const extract = require('extract-zip')
const htmlToJson = require("html-to-json");
const isFile = fileName =>  fs.statSync(fileName).isFile()
const isFolder = fileName => fs.statSync(fileName).isDirectory()
const getSubDirs = unzipFolderPath =>  fs.readdirSync(unzipFolderPath).map(fileName =>path.join(unzipFolderPath, fileName)).filter(isFolder) 
const getSubDirsNames = folders => folders.map(dirPath=>dirPath.split("/").pop())
const getDirDigramNames = fileName =>{
	try{
		let data = fs.readFileSync(fileName);
			data = data.toString('utf8');
        return new Promise((resolve, reject)=>{
			htmlToJson.parse(data, {
				'diagramName': function ($doc) {
					return this.map('a', function ($item) {
						return {key:$item.attr("href").split("/")[0], val:$item.text()};
					});
				}
			}, function (err, result) {
					if(err){
						reject(err)
					}
				   resolve(result)
			});
		})
	}catch(err){
		console.log("err getDirDigramNames", fileName);

		console.log(err)
	}		
}
const fetchAndSaveJsonData = async (dirName, modelNumber, mapping)=>{
	try{
		mapping = mapping["diagramName"];
		const digramName = dirName.split("/").pop();
		let actDigramName = mapping.find(ele=>ele.key==digramName)
		actDigramName = actDigramName["val"];
		const jsonPath = dirName+"/js/partsList.json";
				console.log("jsonPath",jsonPath);
		if(fs.existsSync(jsonPath)){
			const data = fs.readFileSync(jsonPath, {encoding:'utf8', flag:'r'});
					await createDiagram(modelNumber, actDigramName, data)            
		}
	}catch(err){
		console.log("err", dirName, modelNumber);

		console.log(err)
	}
}
const createDiagram = async function(modelNumber, digramName, partData){
    try{
		if(!modelNumber || !digramName){
              console.log("Invalid model no or dirame name",modelNumber+"--"+digramName)
			  return false;
		}
		console.log("model no or dirame name",modelNumber+"--"+digramName)

       	partData = JSON.parse(partData);
	let checkDiagramExists = await DiagramManager.checkDiagramExists(modelNumber, digramName);
        let diagramData = {};
        if(checkDiagramExists){
            diagramData = checkDiagramExists;
        }else{
           diagramData = await Diagram.create({diagramName:digramName, modelNumber}).fetch();
        }
        let csvData = [];

        for(let key in partData){
        	let diagranPart = {diagramId:diagramData.id}
        	let isPartExists = await DiagramManager.checkDiagramPartExists(diagramData.id, key);
        	if(isPartExists){
        	//	console.log("isPartExists", isPartExists);
        		continue;
        	}
        	diagranPart.partNo = key
        	diagranPart.description = partData[key][0]["description"];
        	diagranPart.details = partData[key][0]["Details"]; 	
        	diagranPart.price = partData[key][0]["price"];
		    diagranPart.materialCode = partData[key][0]["SEC"];
        	csvData.push(diagranPart);
        }
        let diagramPartsData = await DiagramParts.createEach(csvData).fetch();
      	//console.log("diagramPartsData",diagramPartsData);
    }catch(err){
       console.log(err)
    }
} 
async function main () {
  try {  
  	const unzipFolderPath = path.join(__dirname, "../unzip");
  	const zipFolderPath = path.join(__dirname, "../zips");
	let folders = fs.readdirSync(zipFolderPath).map(fileName => {
	  return path.join(zipFolderPath, fileName)
	})
	.filter(isFile)
	folders.forEach(async (source)=>{
		await extract(source, { dir: unzipFolderPath })
	})
	let unzipFolders = getSubDirs(unzipFolderPath);
	for(let j=0; j < unzipFolders.length; j++){
	                let folderPath = unzipFolders[j];
					let folderName = folderPath.split("/").pop();
			let unzipSubFolders = getSubDirs(folderPath);
			const unzipSubFoldersNames = getSubDirsNames(unzipSubFolders);	
			let dirDigramNameMapping = await getDirDigramNames(folderPath+"/"+folderName+".html");
			if(unzipSubFoldersNames.includes("css")){
				await fetchAndSaveJsonData(folderPath, folderName, dirDigramNameMapping)
			}else{
				for(let i=0; i < unzipSubFolders.length; i++){
					let unzipSubFolders2 = getSubDirs(unzipSubFolders[i]);
					const unzipSubFoldersNames2 = getSubDirsNames(unzipSubFolders2);	
					if(unzipSubFoldersNames2.includes("css")){
						await fetchAndSaveJsonData(unzipSubFolders[i], folderName, dirDigramNameMapping)
					}	
				}
			}
		//break;			
	}

  } catch (err) { console.log(err);
    // handle any errors
  }
}

module.exports = {
  friendlyName: 'Samsung zipped data import',

  description: '',


  fn: async function () {

    await main()

  }


};

