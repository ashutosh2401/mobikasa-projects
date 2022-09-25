module.exports = {
    attributes: {
        diagramName: {
             type: 'string',
             required: false,
             maxLength: 100
         },
         modelNumber: {
            type: 'string',
            required: true,
            maxLength: 100
        },
        images: {
            type: 'json',
            columnType: 'array'      
        },
        seoTitle: {
            type: 'string'    
        },
        seoDescription: {
            type: 'string'    
        },
    }
}