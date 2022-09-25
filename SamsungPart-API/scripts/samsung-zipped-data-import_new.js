const fs = require("fs");
const path = require("path");
const extract = require('extract-zip')
const htmlToJson = require("html-to-json");
const isFile = fileName =>  fs.statSync(fileName).isFile()
const isFolder = fileName => fs.statSync(fileName).isDirectory()
const getSubDirs = unzipFolderPath =>  fs.readdirSync(unzipFolderPath).map(fileName =>path.join(unzipFolderPath, fileName)).filter(isFolder) 
const getSubDirsNames = folders => folders.map(dirPath=>dirPath.split("/").pop())
const fetch = require('node-fetch');
const postData = async (body, url)=>{
	let baseURL = "";
	const response = await fetch(url, {
		method: 'post',
		body: JSON.stringify(body),
		headers: {'Content-Type': 'application/json','access_token':'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjYxNzJhNWY4OGYzN2MzNjQ4YmQyOTBjYSIsImZpcnN0TmFtZSI6IlN1cGVyIiwiaXNBZG1pbiI6dHJ1ZSwiaWF0IjoxNjM0OTAzNjYxLCJleHAiOjE2MzU1MDg0NjF9.OzRyKCAP_3ABtGaCJ-kQHwsREgWXKI3hmmBBPngUCXY'}
	});
	const data = await response.json();
	console.log(data);

	return data;
}



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
	    let data = {modelNumber, digramName, partData}
        await postData(data,"https://samsungpartsapi.mobikasa.net/api/v1/admin/diagram/createDiagramForScript")
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
//		break;			
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

