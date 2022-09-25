const checkDiagramExists = (modelNumber, diagramName)=>{
             		return new Promise((resolve, reject) => {
						Diagram
						.findOne({"modelNumber":modelNumber, "diagramName":diagramName})
						.exec((err, diagram) => {
							if (err) return reject(err);
							return resolve(diagram);
						});
	});
}
const checkDiagramPartExists = (diagramId, partNo)=>{
             		return new Promise((resolve, reject) => {
						DiagramParts
						.findOne({diagramId, partNo})
						.exec((err, diagram) => {
							if (err) return reject(err);
							return resolve(diagram);
						});
	});
}
module.exports = {
	checkDiagramExists,
	checkDiagramPartExists
}
