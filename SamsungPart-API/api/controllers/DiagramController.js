const { ObjectID } = require('mongodb');
const uploadDiagram = async function(req, res){
    try{
        let maxUpload = 10;
        const req_data = req.body;
        const aggreagateRes = {};
        let status = true;
        for(let i=1; i<= maxUpload; i++){
            if(req_data["diagramName_"+i]){
                let cResData = await createDiagramBySeq(req, i);
                if(cResData.status == false){
                    status = false;
                    cResData.errors = cResData.msg;
                }                
                aggreagateRes[i] = cResData;
            }else{
                break;
            }
        }
        let msg = 'Data Uploaded successfully';
        if(!status){
            msg = 'Some error occurred';
        }
        return res.ok({
            msg: msg,
            data: aggreagateRes,
            status:status
        });
    }catch(err){
        let respData = Utils.jsonError(err);
        Logger.log('uploadDiagram', req, respData, 'user', req.decoded.userId);
        return res.badRequest(respData);
    }
}
const checkPartNO = (currentValue) => currentValue.partNo;

const createDiagramBySeq = async function(req, i){
    try{
        const req_data = req.body;
        const diagramName = req_data["diagramName_"+i];
        const modelNumber = req_data["modelNumber_"+i]; 
        const imageName = req_data["images_"+i]; 
        await Validations.DiagramSchema.createDiagram.validateAsync({diagramName, modelNumber });
        let checkDiagramExists = await DiagramManager.checkDiagramExists(modelNumber,diagramName);
        if(checkDiagramExists){
            throw {"error":"Diagram already exists","key":""};
        }
        let images = await Common.imageUploadTempToS3(req, imageName, "images_"+i);
        let csvData = await Common.csvUpload(req, 'csvData_'+i);
        let isValidData = csvData.every(checkPartNO)
        if(!isValidData){
            throw {"error":"Part no missing","key":'csvData_'+i};
        }
        let diagramData = await Diagram.create({diagramName, modelNumber, images}).fetch();
        csvData = csvData.map(ele=>{
            ele.diagramId = diagramData.id;
            return ele;
        })
        let diagramPartsData = await DiagramParts.createEach(csvData).fetch();
        return {
            diagramData,
            diagramPartsData
        }
    }catch(err){
        let respData = Utils.jsonError(err);
        console.log(err);

        Logger.log('createDiagramBySeq', req, respData, 'user', req.decoded.userId);
        return respData;
    }
}
const uploadImages = async function(req, res){
    try{
        let images = await Common.imageUploadTemp(req, 'images');
        return res.ok({
            msg: 'Data created successfully',
            data: {
                "images":images
            },
            status:true
        });
    }catch(err){
        let respData = Utils.jsonError(err);
        Logger.log('createDiagramBySeq', req, respData, 'user', req.decoded.userId);
        return respData;
    }
}

const createDiagram = async function(req, res){
    try{
        await Validations.DiagramSchema.createDiagram.validateAsync(req.body);
        const {diagramName, modelNumber} = req.body;
        let checkDiagramExists = await DiagramManager.checkDiagramExists(modelNumber);
        if(checkDiagramExists){
            throw "Diagram already exists";
        }
        let images = await Common.imageUpload(req, 'images');
        let csvData = await Common.csvUpload(req, 'csvData');
        let diagramData = await Diagram.create({diagramName, modelNumber, images}).fetch();
        csvData = csvData.map(ele=>{
            ele.diagramId = diagramData.id;
            return ele;
        })
        let diagramPartsData = await DiagramParts.createEach(csvData).fetch();
        return res.ok({
            msg: 'Data created successfully',
            data: {
                diagramData,
                diagramPartsData,
                baseUrl:process.env.BUCKET_ACCESS_URL
            },
            status:true
        });
    }catch(err){
        let respData = Utils.jsonError(err);
        Logger.log('createDiagram', req, respData, 'user', req.decoded.userId);
        return res.badRequest(respData);
    }
}
const createDiagramForScript = async function(req, res){
    try{
        const {modelNumber, digramName, partData} = req.body;
		if(!modelNumber || !digramName){
              throw "Invalid model no or dirame name"+modelNumber+"--"+digramName;
		}
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
        		continue;
        	}
        	diagranPart.partNo = key
        	diagranPart.description = partData[key][0]["description"];
        	diagranPart.details = partData[key][0]["Details"]; 	
        	diagranPart.price = partData[key][0]["price"];
		    diagranPart.materialCode = partData[key][0]["SEC"];
        	csvData.push(diagranPart);
        }
       let diagramPartsData =  await DiagramParts.createEach(csvData).fetch();
        return res.ok({
            msg: 'Data created successfully',
            data: diagramPartsData,
            status:true
        });
    }catch(err){ 
        let respData = Utils.jsonError(err);
        Logger.log('createDiagramForScript', req, respData, 'user', req.decoded.userId);
        return res.badRequest(respData);
    }
} 

const updateDiagram = async function(req, res){
    try{
        await Validations.CommonSchema.idValidate.validateAsync(req.params);
        const id = req.params.id;
        const {diagramName, modelNumber, seoDescription, seoTitle} = req.body;
        let diagramData = await Diagram.findOne({id});
        if(!diagramData){
            throw "Diagram not exists";
        }
        let fieldToUpdate = {};
        if(diagramName && diagramData.diagramName != diagramName){
            fieldToUpdate.diagramName = diagramName;
        }
        if(modelNumber && diagramData.modelNumber != modelNumber){
            if(!diagramName){
                diagramName = diagramData.diagramName
            }
            let checkDiagramExists = await DiagramManager.checkDiagramExists(modelNumber, diagramName);
            if(checkDiagramExists){
                throw "Diagram already exists";
            } 
            fieldToUpdate.modelNumber = modelNumber;
        }
        if(seoDescription){
            fieldToUpdate["seoDescription"] = seoDescription
        }
        if(seoTitle){
            fieldToUpdate["seoTitle"] = seoTitle
        }

        let images = await Common.imageUpload(req, 'images');
        if(images && images.length > 0){
            fieldToUpdate.images = images;
        }
        if(fieldToUpdate && Object.keys(fieldToUpdate).length !== 0){
            diagramData = await Diagram.update({id}).set(fieldToUpdate).fetch();
        }        
        return res.ok({
            msg: 'Data updated successfully',
            data: {
                diagramData,
                baseUrl:process.env.BUCKET_ACCESS_URL
            },
            status:true
        });
    }catch(err){
        let respData = Utils.jsonError(err);
        Logger.log('updateDiagram', req, respData, 'user', req.decoded.userId);
        return res.badRequest(respData);
    }
}
const deleteDiagram = async function(req, res){
    try{
        await Validations.CommonSchema.idValidate.validateAsync(req.params);
        const id = req.params.id;
        let diagramData = await Diagram.findOne({id});
        if(!diagramData){
            throw "Diagram not exists";
        }        
        diagramData = await Diagram.destroy({id:id}).fetch();
        let diagramParts = await DiagramParts.destroy({diagramId:id}).fetch()
        return res.ok({
            msg: 'Diagram deleted successfully',
            data: {
                diagramData,
                diagramParts
            },
            status:true
        });
    }catch(err){
        let respData = Utils.jsonError(err);
        Logger.log('deleteDiagram', req, respData, 'user', req.decoded.userId);
        return res.badRequest(respData);
    }
}
const getDiagrams = async function(req, res){
     if(!req.decoded){
        req.decoded = {}
     }
    try{
        
        Logger.log('getDiagrams', req, {}, 'user', req.decoded.userId);

        const pageno = req.query.page || 1;
        const limit  = req.query.limit  || 10;
        const skip = (pageno-1)*limit;
        const sortBy = req.query.sortBy || "createdAt";
        const sortOrder = req.query.sortOrder || "DESC"
        let wherecon = {};
        if(req.query.diagramName){
        	 wherecon["diagramName"] = {"contains":req.query.diagramName}
        }
        if(req.query.modelNumber){
        	 wherecon["modelNumber"] = {"contains":req.query.modelNumber}
        }
        let diagramData = await Diagram.find(wherecon).skip(skip).limit(limit).sort(sortBy+' '+sortOrder);
        ;
        let diagramCount = await Diagram.count(wherecon);
        return res.ok({
            msg: 'Diagram data fetched successfully',
            data: {
                data:diagramData, count:diagramCount, baseUrl:process.env.BUCKET_ACCESS_URL
            },
            status:true
        });
    }catch(err){
        let respData = Utils.jsonError(err);
        Logger.log('getDiagrams', req, respData, 'user', req.decoded.userId);
        return res.badRequest(respData);
 
    }
}
const getDiagramDetails = async function(req, res){
    if(!req.decoded){
        req.decoded = {}
     }
    try{
        await Validations.CommonSchema.idValidate.validateAsync(req.params);
        const id = req.params.id;
        let diagramPartsData = await DiagramParts.find({"diagramId":id});
        let diagramData = await Diagram.find({id})
        return res.ok({
            msg: 'Diagram data fetched successfully',
            data: {
                diagram:diagramData,
                part:diagramPartsData,
                baseUrl:process.env.BUCKET_ACCESS_URL

            },
            status:true
        });
    }catch(err){
        let respData = Utils.jsonError(err);
        Logger.log('getDiagramDetails', req, respData, 'user', req.decoded.userId);
        return res.badRequest(respData);
    }
}
const getDiagramDetailsByName = async function(req, res){
    try{
        const diagramName = req.query.diagramName;
        const modelNumber = req.query.modelNumber;

        
        let diagramData = await Diagram.findOne({"diagramName":diagramName, "modelNumber":modelNumber});
        let diagramPartsData = "";
        console.log(diagramData);

        if(diagramData.id){
            diagramPartsData = await DiagramParts.find({"diagramId":diagramData.id});
        }

        return res.ok({
            msg: 'Diagram data fetched successfully',
            data: {
                diagram:diagramData,
                part:diagramPartsData,
                baseUrl:process.env.BUCKET_ACCESS_URL

            },
            status:true
        });
    }catch(err){
        return res.badRequest(Utils.jsonError(err));
    }
}
const createDiagramParts = async function(req, res){
    try{
        const data = req.body;
        const diagramId = data.diagramId;
        if(!data.partNo){
            throw "Part no is required"
        }
        let diagramPartsData = await DiagramParts.findOne({"partNo":data.partNo, "diagramId":data.diagramId});
        if(diagramPartsData){
            throw "partNo already added";
        }
        diagramPartsData = await DiagramParts.createEach([data]).fetch();
        return res.ok({
            msg: 'Created successfully',
            data: {
                diagramPartsData
            },
            status:true
        });
    }catch(err){
        let respData = Utils.jsonError(err);
        Logger.log('createDiagramParts', req, respData, 'user', req.decoded.userId);
        return res.badRequest(respData);
    }
}
const updateDiagramParts = async function(req, res){
    try{
        await Validations.CommonSchema.idValidate.validateAsync(req.params);
        const id = req.params.id;
        let diagramPartsData = await DiagramParts.findOne({"id":id});
        //console.log("diagramPartsData", diagramPartsData);
        if(!diagramPartsData){
            throw "Invalid id provided";
        }
        
        const fieldToUpdate = getDiagramPartDataForUpdate(req.body);

        diagramPartsData = await DiagramParts.update({"id":id}).set(fieldToUpdate).fetch();
        return res.ok({
            msg: 'Diagram data fetched successfully',
            data: {
                diagramPartsData
            },
            status:true
        });
    }catch(err){
        let respData = Utils.jsonError(err);
        Logger.log('updateDiagramParts', req, respData, 'user', req.decoded.userId);
        return res.badRequest(respData);
    }
}

const deleteDiagramParts = async function(req, res){
    try{
        Logger.log('getDiagrams', req, {}, 'user', req.decoded.userId);
        await Validations.CommonSchema.idValidate.validateAsync(req.params);
        const id = req.params.id;
        let diagramData = await DiagramParts.findOne({id});
        if(!diagramData){
            throw "Diagram part not exists";
        }        
        diagramData = await DiagramParts.destroy({id:id}).fetch();
        return res.ok({
            msg: 'Diagram deleted successfully',
            data: {
                 "deletedData":diagramData
            },
            status:true
        });
    }catch(err){
        let respData = Utils.jsonError(err);
        Logger.log('deleteDiagramParts', req, respData, 'user', req.decoded.userId);
        return res.badRequest(respData);
    }
} 

const downloadDiagram = async function(req, res){
    try{
        const id = req.params.id;
        let wherecon = {};
        if(req.query.diagramName){
        	 wherecon["diagramName"] = {"contains":req.query.diagramName}
        }
        if(req.query.modelNumber){
        	 wherecon["modelNumber"] = {"contains":req.query.modelNumber}
        }
        if(req.query.ids){
            let ids = req.query.ids.split(",");
            wherecon["id"] = {"in":ids}
       }
        let diagramData = await Diagram.find(wherecon);
        return res.ok({
            msg: 'Diagram data fetched successfully',
            data: {
                diagramData
            },
            status:true
        });
    }catch(err){
        let respData = Utils.jsonError(err);
        Logger.log('downloadDiagram', req, respData, 'user', req.decoded.userId);
        return res.badRequest(respData);
    }
}
const downloadDiagramDetails = async function(req, res){
    try{
        await Validations.CommonSchema.idValidate.validateAsync(req.params);
        const id = req.params.id;
        let diagramData = await Diagram.find({where: {id:id}});
        let diagramPartsData = await DiagramParts.find({diagramId:id});
        return res.ok({
            msg: 'Diagram fetched successfully',
            data: {
                diagramData,
                diagramPartsData
            },
            status:true
        });
    }catch(err){
        let respData = Utils.jsonError(err);
        Logger.log('downloadDiagramDetails', req, respData, 'user', req.decoded.userId);
        return res.badRequest(respData);
    }
}
const getEnv = function(req, res){
    try{
           return res.ok({
            msg: 'Conf fetched successfully',
            data: {
                "env":process.env
            },
            status:true
        });
    }catch(err){
        return res.badRequest(Utils.jsonError(err));
    }
}
const getErrors = async function(req, res){
    try{
        let createdAt = req.query.startTime || 1636454661431;
        const limit  = req.query.limit  || 10;
        const pageno  = req.query.page  || 1;
        const skip = (pageno-1)*limit;
        let data = await ApiErrorLogs.find({where: {createdAt:{ '>=' : createdAt }}}).skip(skip).limit(limit);

           return res.ok({
            msg: 'Conf fetched successfully',
            data: {
                "data":data
            },
            status:true
        });
    }catch(err){ console.log("err",err)
        return res.badRequest(Utils.jsonError(err));
    }
}
function getDiagramPartDataForUpdate(data){
    const fieldToUpdate = {};
    if(data){
        fieldToUpdate["no"] = data.no;
    }
    if(data.partNo){
        fieldToUpdate["partNo"] = data.partNo;
    }
    if(data.materialCode){
        fieldToUpdate["materialCode"] = data.materialCode;
    }
    if(data.description){
        fieldToUpdate["description"] = data.description;
    }

    if(data.specification){
        fieldToUpdate["specification"] = data.specification;
    }
    if(data.seoDescription){
        fieldToUpdate["seoDescription"] = data.seoDescription;
    }
    if(data.seoTitle){
        fieldToUpdate["seoTitle"] = data.seoTitle;
    }
    if(data.status === 0 || data.status === 1){
        fieldToUpdate["status"] = data.status;
    }
    if(data.coordinates){
        fieldToUpdate["coordinates"] = JSON.parse(data.coordinates);
    }
    return fieldToUpdate;
}
module.exports = {
    createDiagram,
    getDiagrams,
    getDiagramDetails,
    updateDiagram,
    downloadDiagram,
    downloadDiagramDetails,
    deleteDiagram,
    updateDiagramParts,
    deleteDiagramParts,
    createDiagramParts,
    uploadDiagram,
    createDiagramForScript,
    getDiagramDetailsByName,
    getEnv,
    getErrors,
    uploadImages
}
