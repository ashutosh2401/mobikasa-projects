module.exports = {
    attributes: {
        diagramId: {
             type: 'string',
             required: true,
             maxLength: 100
        },
        no: {
            type: 'string',
            required: false,
            maxLength: 100
        },
        partNo: {
            type: 'string',
            required: true,
            maxLength: 100
        },
        materialCode: {
            type: 'string',
            required: false,
            maxLength: 100
        },
        description: {
            type: 'string'    
        },
        specification:{
            type: 'string'
        },
        seoTitle: {
            type: 'string'    
        },
        seoDescription: {
            type: 'string'    
        },
        price:{
            type: 'string'    
        },
        details:{
            type: 'string'    
        },
        coordinates:{
            type: 'json'    
        },
        status:{
            type: 'number',
            defaultsTo:1
        }

    }
}
