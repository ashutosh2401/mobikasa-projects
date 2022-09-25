const shopifyApi = require('shopify-api-node');
const request = require('request');
const async = require('async');
// import fetch from 'node-fetch';

const startUrl = "https://";
const shopifyApiKey = 'bfa0a382105eec4c023acf7f23f378fa';
const shopifyApiSecret = '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';
const shopifyStoreUrl = 'manishclothes.myshopify.com/admin/api/2021-10/';
const shopifyUrl = `${startUrl}${shopifyApiKey}:${shopifyApiSecret}@${shopifyStoreUrl}`;

const shopifyEndpoint = {
    'product' : {
        'add' : 'products.json?limit=250',
        'count' : 'products/count.json',
        'list' : 'products.json',
        'graphql' : 'graphql.json',
    }
};

const shopify = new shopifyApi({
    shopName: 'manishclothes.myshopify.com',
    apiKey: shopifyApiKey,
    password: shopifyApiSecret
  });

// var sendingUrl = shopifyUrl + shopifyEndpoint['product']['add'];
var graphqlUrl = `https://${shopifyStoreUrl}${shopifyEndpoint['product']['graphql']}`;
var cursor = "";
var query = `{
    products (first: 10) {
        edges {
            cursor
            node {
            id
            title
            vendor
            variants (first:10) {
                edges {
                    node {
                        id
                        title
                        price
                        sku
                    }
                }
            }
            images (first:10) {
                edges {
                    node {
                        id
                    }
                }
            }
            }
        }
    }
    }`;

module.exports = {

    productCount: (req,res) => {
        shopify.product.count()
            .then( (count) => {
                res.json({count:count});
        });
    },

    fetchProduct: (req,res) => {
        countUrl = shopifyUrl + shopifyEndpoint['product']['count'];
        request.get(countUrl, async (error, response) => {
            if(error){
                console.log('count url error',error);
                return res.negotiate(error);
            }
            else if (!error && response.statusCode == 200) {
                productCount = JSON.parse(response.body)['count'];
                var productIter = Math.ceil(productCount / 10);
                var productIterArray = Array.from(Array(productIter).keys());
                // var options = { method: 'POST',
                //     url: graphqlUrl,
                //     headers: 
                //     {   'x-shopify-access-token': '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',
                //         'content-type': 'application/graphql' },
                //     body: query 
                // };
                // sails.log('options',options);
                // request(options, (error, response, body) => {
                //     // sails.log('body',body);
                //     if (error) {
                //         sails.log('graphql error',error);
                //         res.negotiate(error);
                //     }
                //     else if(response.statusCode == 200){
                //         // sails.log(JSON.parse(body));
                //         var products = JSON.parse(body)["data"]["products"]["edges"];
                //         sails.log('products',products);
                //         cursor = products.at(-1)["cursor"];
                //         sails.log('cursor',cursor);
                //     }
                // });
                async.eachSeries(productIterArray, (iter, cb) => {  
                    sails.log("iter",iter); 
        //             sails.log('cursor',cursor);
        //             if (iter > 0 && iter < (productIterArray.length - 1)) {
        //                 sails.log('productIterArray.length',(productIterArray.length - 1));
        //                 query = `{
        //                     products (first: 10, after: ${cursor}) {
        //                         edges {
        //                             cursor
        //                           node {
        //                             id
        //                             title
        //                             vendor
        //                             variants (first:10) {
        //                                 edges {
        //                                     node {
        //                                         id
        //                                         title
        //                                         price
        //                                         sku
        //                                     }
        //                                 }
        //                             }
        //                             images (first:10) {
        //                                 edges {
        //                                     node {
        //                                         id
        //                                     }
        //                                 }
        //                             }
        //                           }
        //                         }
        //                     }
        //                   }`;
        //             }
        //             if(iter == 188) {
        //                 sails.log('query for 188',query);
        //             }
        //             if(iter == 189) {
        //                 sails.log('query for 189',query);
        //             }
                    var options = { method: 'POST',
                    url: graphqlUrl,
                    headers: 
                    {   'x-shopify-access-token': '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',
                        'content-type': 'application/graphql' },
                    body: query 
                    };
        //             // sails.log('options',options);
                    request(options, function (error, response, body) {
        //                 sails.log('body',body)
                        if (error) {
                            sails.log('graphql error',error);
                            res.negotiate(error);
                        }
                        else if(response.statusCode == 200){
                            sails.log('product body',JSON.parse(body) + iter);
                        }
                    });
        //                     var products = JSON.parse(body)["data"]["products"]["edges"];
        //                     // if( iter == 188 ) {
        //                     // sails.log('products info for iter 188',products);
        //                     // }
        //                     sails.log('products',products);
        //                     async.eachSeries(products, (product, cb) => {
        //                         sails.log('product',product);
        //                         cursor = product["cursor"];
        //                         sails.log('product cursor',cursor);
        //                         // sails.log('node',product["node"]);
        //                         var productInfo = {'productId': product["node"].id.split('/').at(-1), 'title': product["node"].title,'vendor': product["node"].vendor};
        //                         // sails.log('product info',productInfo);
        //                         Product.find(productInfo).exec( async (err, result) => {
        //                             if(err){
        //                                 res.negotiate(err);
        //                             }
        //                             else{
        //                                 if(result.length > 0) {
        //                                     console.log('############product already exists###################');
        //                                     cb();
        //                                 }
        //                                 else{
        //                                     await Product.create(productInfo).fetch();
        //                                     // sails.log('vari',product["node"].variants["edges"]);
        //                                     async.eachSeries(product["node"].variants["edges"], async (variant, cb) => {
        //                                         // sails.log('variant',variant["node"]);
        //                                         var variantInfo = { productId : product["node"].id.split('/').at(-1), variantId : variant["node"].id.split('/').at(-1), title : variant["node"].title, price : variant["node"].price, sku : variant["node"].sku };
        //                                         // sails.log('variant info', variantInfo);
        //                                         Variant.find(variantInfo).exec( async (err, result) => {
        //                                             if(err){
        //                                                 res.negotiate(err);
        //                                             }
        //                                             else{
        //                                                 if(result.length > 0) {
        //                                                     console.log('**************variant already exists*****************');
        //                                                 }
        //                                                 else{
        //                                                     await Variant.create(variantInfo);
        //                                                 }
        //                                             }
        //                                         })
        //                                         cb
        //                                     });
        //                                 }
        //                             }                            
        //                         });
        //                         cb();
        //                     })
        //                 }
        //             });
                    cb();
                })
            }
        });
        res.ok();     
    },
                
    // var options = { method: 'POST',
    // url: graphqlUrl,
    // headers: 
    // {   'x-shopify-access-token': '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',
    //     'content-type': 'application/graphql' },
    // body: query };
    // request(options, function (error, response, body) {
    //     if (error) {
    //         sails.log('graphql error',error);
    //         res.negotiate(error);
    //     }
    //     else if(response.statusCode == 200){
    //         sails.log(JSON.parse(body));
    //         var products = JSON.parse(body)["data"]["products"]["edges"];
    //         sails.log(products);
    //         cursor = products[-1];
    //         sails.log('cursor',iter + cursor);
    //     }
    // });

            //         request.get(sendingUrl, (error, response) => {
            //             // sails.log('response',response);
            //             if(error){
            //                 sails.log('add product url error apilog',apiLog('get', `product info of ${iter + 1} 250 products`, response.body, response.statusCode, sendingUrl));
            //                 console.log('add product url error',error);
            //                 return res.negotiate(error);
            //             }
            //             else if(!error && response.statusCode == 200) {
            //                 sails.log('product apilog',apiLog('get', `product info of ${iter + 1} 250 products`, response.body, response.statusCode, sendingUrl));
            //                 if(iter == 0) {
            //                     pageInfo = response.headers['link'].split(" ")[0].slice(1,-2).split("/").at(-1).split("&").at(-1).split("=").at(-1);
            //                 }
            //                 else{
            //                     pageInfo = response.headers['link'].split(",").at(-1).split(" ").at(-2).slice(1,-2).split("/").at(-1).split("&").at(-1).split("=").at(-1); //[0].slice(1,-2).split("/").at(-1).split("&").at(-1).split("=").at(-1);
            //                 }
            //                 // pageInfoArray.push(pageInfo);
            //                 var productList = JSON.parse(response.body).products;
                            
            //                 if (iter == productIterArray.length - 1) {
            //                     // sails.log("pageInfoArray at end of loop",pageInfoArray);
            //                     cb();
            //                 }
            //                 else {
            //                     cb();
            //                 }
            //             }
            //         })
            //     })
            // }
    //         }})
    //     var query = `{
    //         products (first: 10) {
    //             edges {
    //                 cursor
    //               node {
    //                 id
    //                 title
    //                 vendor
    //                 variants (first:10) {
    //                     edges {
    //                         node {
    //                             id
    //                             title
    //                             price
    //                             sku
    //                         }
    //                     }
    //                 }
    //                 images (first:10) {
    //                     edges {
    //                         node {
    //                             id
    //                         }
    //                     }
    //                 }
    //               }
    //             }
    //         }
    //       }`; 
    //     var options = { method: 'POST',
    //     url: 'https://manishclothes.myshopify.com/admin/api/2021-10/graphql.json',
    //     headers: 
    //     {   'x-shopify-access-token': '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',
    //         'content-type': 'application/graphql' },
    //     body: query };

    //     request(options, function (error, response, body) {
    //         if (error) throw new Error(error);
    //         // sails.log(response);
    //         else if(response.statusCode == 200){
    //             sails.log(JSON.parse(body)["data"]["products"]["edges"]);
    //         }
            
    //     });
    //     res.ok()
    // },



        // var query = `{
        //     products (first: 10) {
        //         edges {
        //           node {
        //             id
        //             title
        //             vendor
        //             variants (first:10) {
        //                 edges {
        //                     node {
        //                         id
        //                         title
        //                         price
        //                         sku
        //                     }
        //                 }
        //             }
        //             images (first:10) {
        //                 edges {
        //                     node {
        //                         id
        //                     }
        //                 }
        //             }
        //           }
        //         }
        //     }
        //   }`;
        // fetch(sendingUrl, {
        //         method: 'POST',
        //         headers: {
        //             "Content-Type": "application/json",
        //             "X-Shopify-Access-Token": shopifyApiSecret
        //         },
        //         body: JSON.stringify(query),
        //     }).then( async (response) => {
        //         sails.log('response',response);
        //     })
        //     .catch( (err) => {
        //         sails.log('err',err);
        //     });
        // const data = await response.json();
        // sails.log('data',data);
        // var oauth =
        //     { 
        //         // callback: 'http://mysite.com/callback/',
        //          consumer_key: shopifyApiKey
        //         , consumer_secret: shopifyApiSecret
        //     }
        // request.post({
        //     url: sendingUrl,
        //     headers: {
        //         "Content-Type": "application/graphql",
        //         "X-Shopify-Access-Token": `${shopifyApiSecret}`
        //     },
        //     body: JSON.stringify(query),
        //     }, (err, res) => {
        //         if(err) {
        //             sails.log('err',err);
        //             res.negotiate(err);
        //         }
        //         else {
        //             sails.log('res',res);
        //             var json = JSON.parse(res.body);
        //             sails.log("Access Token:", json);
        //         }
        // });
            // request.post({url:sendingUrl, oauth:oauth}, (err, response, body) => {
            // if(err) {
            //     res.negotiate(err);
            // }
            // else {
            //     // sails.log('response',response);
            //     sails.log('body',body);
            // }
        // })
        // shopify.product.count()
        //     .then( (count) => {
        //         var productIter = Math.ceil(count / 250);
        //         productIterArray = Array.from(Array(productIter).keys());
        //         async.eachSeries(productIterArray, (iter,cb) => {
        //             sails.log('iter',iter);
        //             cb();
        //         });
        //         res.ok()
        // });
        // var query = `query {
        //     productByHandle(handle: "pc5519x-cabin-air-filter-2003-honda-accord") {
        //       metafields(first: 250, namespace: "yotpo") {
        //           edges {
        //           node {
        //             key
        //             value
        //           }
        //         }
        //       }
        //     }
        //   }`;
        
        //   variants {
        //     
        // }
        // var query = '{product{}}';
        // shopify.graphql(query).then( (products) => {
            // sails.log('products length',products);
            // sails.log('products length',typeof(products));
            // sails.log('products length',products.edges);
            // sails.log('products from graphql',JSON.stringify(products));
        //     async.eachSeries(products, (product,cb) => {
        //         sails.log('product',product);
        //         cb();
        //     })
        //     res.json({products:products});
        // })
        // .catch( (err) => {
        //     res.negotiate(err);
        // })
    

    addProduct: async (req,res) => {
        var productInfo = {'productId': req.body.productId, 'title': req.body.title, 'vendor':req.body.vendor};
        sails.log(productInfo);
        Product.find(productInfo).exec( async (err, result) => {
            if(err){
                res.negotiate(err);
            }
            else{
                if(result.length > 0) {
                    console.log('############product already exists###################');
                    return res.json({problem: "product already exists"});
                }
                else{
                    var post_data = {
                        "product": {
                          "title": productInfo.title,
                          "body_html": "<strong>Good snowboard!</strong>",
                          "vendor": productInfo.vendor,
                          "product_type": "Snowboard",
                          "variants": [
                            {
                              "option1": "First",
                              "price": "10.00",
                              "sku": 123
                            },
                            {
                              "option1": "Second",
                              "price": "20.00",
                              "sku": "123"
                            }
                          ]
                        }
                      }
                    // Shopify.post('/admin/products.json', post_data, async(err, data) => {
                    //     if(err){
                    //         sails.log('apilog',apiLog('post', post_data, data, 400, '/admin/products.json'));
                    //         res.negotiate(err);
                    //     }
                    //     else{
                    //         sails.log('apilog',apiLog('post', post_data, data, 200, '/admin/products.json'));
                    // productInfo['productId'] = data.product.id;
                    var productCreated = await Product.create(productInfo).fetch();
                    return res.json({productCreated:productCreated});
                        // }
                    // res.ok();
                    // });
                 }
            // }
            }  
        });
    },

    updateProduct: async (req,res) => {
        var query = `mutation {
            productUpdate(input: {id: "gid://shopify/Product/5282978005129",
                  title: "PC1032X Cabin Air Filter 1995 Lexus LS400",
                  descriptionHtml: "description here",
                      metafields: [{
                          id: "gid://shopify/Metafield/14040218665097",
                          description: null,
                          key: "technical_details",
                          value: "{\"brand\":\"Premium Guard\",\"weight\":\"0.60\",\"dimensions\":\"10.00,10.00,1.00\",\"part_number\":\"PC1032X\",\"oem_part_number\":\"87139-YZZ02,87139-50010\"}",
                          valueType: STRING
                    }],
                    variants: [{
                        id: "gid://shopify/ProductVariant/34651492548745",
                        barcode: "846156070685",
                        sku: "PC1032X",
                        inventoryItem: {tracked: true},
                        price: 399.95
                    }]
                } ) {
              product {
                id
                title
               }
               
               
            }
          }`;
        var productInfo = {'productId': req.body.productId, 'title': req.body.title};
        sails.log(productInfo);
        var productId = req.body.productId;
        sails.log(productId);
        var options = { method: 'POST',
        url: 'https://manishclothes.myshopify.com/admin/api/2021-10/graphql.json',
        headers: 
        { 'postman-token': 'a2c0cbc4-cfd0-03bd-78de-df102424f74e',
            'cache-control': 'no-cache',
            'x-shopify-access-token': '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',
            'content-type': 'application/graphql' },
        body: `mutation {\r\n  productDelete(input: {\r\n\tid: "gid://shopify/Product/${productId}"\r\n  })\r\n  {\r\n    deletedProductId\r\n  }\r\n}` };

        request(options, function (error, response, body) {
            if (error) throw new Error(error);
            sails.log(JSON.parse(body)["data"]["productDelete"]["deletedProductId"]);
            if(JSON.parse(body)["data"]["productDelete"]["deletedProductId"] == null){
                res.json({status:'product not deleted/found'});
            }
            else{
                res.json({status:'product deleted'});
            }
        });



        var put_data = {
            "product": {
              "title":productInfo['title'],
              "body_html": "<strong>Updated!</strong>"
            }
          }
        Shopify.put(url, put_data, (err, data) => {
            if(err){
                sails.log('apilog',apiLog('put', put_data, data, 400, url));
                sails.log("error occured.");
                res.negotiate(err);
            }
            else{
                sails.log('apilog',apiLog('put', put_data, data, 200, url));
                Product.find({'productId':productInfo['productId']}).exec( async (err, result) => {
                    if(err){
                        res.negotiate(err);
                    }
                    else{
                        if(result.length > 0){
                            sails.log("product already present");
                            var productUpdated = await Product.update({'productId':productInfo['productId']}).set({'title':productInfo['title']}).fetch();
                            res.json({productUpdated:productUpdated});
                        }
                        else{
                            sails.log("product not already present");
                            res.json({problem: "product not already present"});
                        }
                    }
                });
            }
          });
    },

    deleteProduct: (req,res) => {
        var productId = req.body.productId;
        sails.log(productId);
        var options = { method: 'POST',
        url: 'https://manishclothes.myshopify.com/admin/api/2021-10/graphql.json',
        headers: 
        { 'postman-token': 'a2c0cbc4-cfd0-03bd-78de-df102424f74e',
            'cache-control': 'no-cache',
            'x-shopify-access-token': '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',
            'content-type': 'application/graphql' },
        body: `mutation {\r\n  productDelete(input: {\r\n\tid: "gid://shopify/Product/${productId}"\r\n  })\r\n  {\r\n    deletedProductId\r\n  }\r\n}` };

        request(options, function (error, response, body) {
            if (error) throw new Error(error);
            sails.log(JSON.parse(body)["data"]["productDelete"]["deletedProductId"]);
            if(JSON.parse(body)["data"]["productDelete"]["deletedProductId"] == null){
                res.json({status:'product not deleted/found'});
            }
            else{
                res.json({status:'product deleted'});
            }
        });
        
    },

};

