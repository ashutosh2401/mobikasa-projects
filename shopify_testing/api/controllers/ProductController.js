const async = require('async');
const request = require('request');
const shopifyAPI = require('shopify-node-api');
const shopifyApi = require('shopify-api-node');

const startUrl = "https://";
const shopifyApiKey = 'bfa0a382105eec4c023acf7f23f378fa';
const shopifyApiSecret = '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';
const shopifyStoreUrl = 'manishclothes.myshopify.com/admin/api/2021-10/';
const shopifyUrl = `${startUrl}${shopifyApiKey}:${shopifyApiSecret}@${shopifyStoreUrl}`;

const Shopify = new shopifyAPI({
    shop: 'manishclothes.myshopify.com',
    shopify_api_key: shopifyApiKey,
    access_token: shopifyApiSecret
});

// var shopify = new shopifyApi({
//     shop: 'manishclothes.myshopify.com',
//     shopify_api_key: shopifyApiKey,
//     access_token: shopifyApiSecret
// });

const shopify = new shopifyApi({
    shopName: 'manishclothes.myshopify.com',
    apiKey: shopifyApiKey,
    password: shopifyApiSecret
  });


const shopifyEndpoint = {
    'product' : {
        'add' : 'products.json?limit=250',
        'count' : 'products/count.json',
        'list' : 'products.json',
    }
};

var productCount;
var sendingUrl = sendingUrl = shopifyUrl + shopifyEndpoint['product']['add'];

async function apiLog(method, requestData, responseData, responseCode, url) {
    var log = { 
        'method': method,
        'requestData': requestData,
        'responseData': responseData,
        'responseCode': responseCode,
        'url': url
    };
    
    var data = await ApiLog.create(log).fetch();
    sails.log('data',data);
    return data;
};


module.exports = {
    
    getProduct: async (req,res) => {
        countUrl = shopifyUrl + shopifyEndpoint['product']['count'];
        request.get(countUrl, async (error, response) => {
            if(error){
                console.log('count url error',error);
                sails.log('count url error apilog',apiLog('post', 'count', response, response.statusCode, countUrl));
                return res.negotiate(error);
            }
            else if (!error && response.statusCode == 200) {
                sails.log('apilog',apiLog('get', 'count', response.body, response.statusCode, countUrl));
                productCount = JSON.parse(response.body)['count'];
                var productIter = Math.ceil(productCount / 250);
                // var pageInfoArray = new Array;
                productIterArray = Array.from(Array(productIter).keys());
                async.eachSeries(productIterArray, async (iter, cb) => {            
                    if (iter > 0) {
                        sendingUrl = shopifyUrl + shopifyEndpoint['product']['add'] + '&page_info=' + pageInfo;
                    }
                    request.get(sendingUrl, (error, response) => {
                        // sails.log('response',response);
                        if(error){
                            sails.log('add product url error apilog',apiLog('get', `product info of ${iter + 1} 250 products`, response.body, response.statusCode, sendingUrl));
                            console.log('add product url error',error);
                            return res.negotiate(error);
                        }
                        else if(!error && response.statusCode == 200) {
                            sails.log('product apilog',apiLog('get', `product info of ${iter + 1} 250 products`, response.body, response.statusCode, sendingUrl));
                            if(iter == 0) {
                                pageInfo = response.headers['link'].split(" ")[0].slice(1,-2).split("/").at(-1).split("&").at(-1).split("=").at(-1);
                            }
                            else{
                                pageInfo = response.headers['link'].split(",").at(-1).split(" ").at(-2).slice(1,-2).split("/").at(-1).split("&").at(-1).split("=").at(-1); //[0].slice(1,-2).split("/").at(-1).split("&").at(-1).split("=").at(-1);
                            }
                            // pageInfoArray.push(pageInfo);
                            var productList = JSON.parse(response.body).products;
                            async.eachSeries(productList, (product, cb) => {
                                var productInfo = {'productId': product.id, 'title': product.title,'vendor': product.vendor};
                                Product.find(productInfo).exec( async (err, result) => {
                                    if(err){
                                        res.negotiate(err);
                                    }
                                    else{
                                        if(result.length > 0) {
                                            console.log('############product already exists###################');
                                            cb();
                                        }
                                        else{
                                            await Product.create(productInfo).fetch();
                                            async.eachSeries(product.variants, async (variant, cb) => {
                                                var variantInfo = { productId:product['id'], variantId:variant.id, title:variant.title, price:variant.price, sku:variant.sku };
                                                Variant.find(variantInfo).exec( async (err, result) => {
                                                    if(err){
                                                        res.negotiate(err);
                                                    }
                                                    else{
                                                        if(result.length > 0) {
                                                            console.log('**************variant already exists*****************');
                                                            cb();
                                                        }
                                                        else{
                                                            await Variant.create(variantInfo);
                                                            cb();
                                                        }
                                                    }
                                                })
                                            })
                                            cb();
                                        }
                                    }
                                });
                                
                            });
                            if (iter == productIterArray.length - 1) {
                                // sails.log("pageInfoArray at end of loop",pageInfoArray);
                                cb();
                            }
                            else {
                                cb();
                            }
                        }
                    })
                })
            }
            res.ok();
        });
    },
      
    

    productCount: async (req, res) => {
        Shopify.get('/admin/products/count.json', async (err, data) => {
            if(err){
                res.negotiate(err);
            }
            else{
                sails.log(typeof(data));
                res.json({data:data});
            }            
        });
    },


    getProductSmall: async (req,res) => {
        shopify.product.delete(req.allParams().productId);
        res.ok();
    },
    

    listProducts: async (req,res) => {
        Product.find({}).exec( async (err, result) => {
            if(err) {
                res.negotiate(err);
            }
            else{
                if(result.length > 0) {
                    let productList = new Array;
                    async.eachSeries(result, (product, cb) => {
                        let variantList = new Array;
                        Variant.find({'productId': product.productId}).exec( async (err, result) => {
                            if(err) {
                                res.negotiate(err);
                            }
                            else{
                                if(result.length > 0) {
                                    async.eachSeries(result, (variant, cb) => {
                                        variantList.push(variant);
                                        cb();
                                    })
                                } 
                            }
                        });
                        let productInfo = { productId: product.productId, productName: product.productName, variants: variantList};
                        productList.push(productInfo);
                        if(productList.length == result.length){
                            sails.log("all products listed");
                            res.json({productList: productList});
                        }
                        cb();
                    });
                }
                else{
                    sails.log("no records present");
                    res.json({problem: "no records present"});
                }
            }
        });
    },



    addProduct: async (req,res) => {
        var productInfo = {'productId': req.body.productId, 'title': req.body.title, 'vendor':req.body.vendor};
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
                    Shopify.post('/admin/products.json', post_data, async(err, data) => {
                        if(err){
                            sails.log('apilog',apiLog('post', post_data, data, 400, '/admin/products.json'));
                            res.negotiate(err);
                        }
                        else{
                            sails.log('apilog',apiLog('post', post_data, data, 200, '/admin/products.json'));
                            productInfo['productId'] = data.product.id;
                            var productCreated = await Product.create(productInfo).fetch();
                            return res.json({productCreated:productCreated});
                        }
                        res.ok()
                    });
                 }
            }
        });  
    },


    addVariant: async (req,res) => {
        sails.log(req.body);
        var variantInfo = { productId: req.body.productId, variantId: req.body.variantId, title: req.body.variantTitle, price: req.body.variantPrice, sku: req.body.variantSku };
        Product.find({'productId': req.body.productId}).exec( async (err, result) => {
            if(err){
                res.negotiate(err);
            }
            else{
                if(result.length > 0) {
                    sails.log('############product already exists###################');
                    Variant.find(variantInfo).exec( async (err, result) => {
                        if(err){
                            res.negotiate(err);
                        }
                        else{
                            if(result.length > 0){
                                sails.log('############variant already exists###################');
                                return res.json({problem:"variant already exists"})
                            }
                            else{
                                var variantCreated = await Variant.create(variantInfo).fetch();
                                return res.json({variantCreated:variantCreated});
                            }
                        }
                    });
                }
                else{
                    sails.log('############product doesnt exists###################');
                    return res.json({problem:"product doesnt exists"});
                }
            }
        });
    },


    updateProduct: async (req,res) => {
        var productInfo = {'productId': req.body.productId, 'title': req.body.title};
        sails.log(productInfo);
        var put_data = {
            "product": {
              "title":productInfo['title'],
              "body_html": "<strong>Updated!</strong>"
            }
          }
        var url = '/admin/products/' + productInfo['productId'] + '.json';
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


    deleteProduct: async (req,res) => {
        let productId = req.allParams().productId;
        Product.find({'productId':productId}).exec( async (err, result) => {
            if(err){
                res.negotiate(err);
            }
            else{
                if(result.length > 0){
                    sails.log("product already present");
                    shopify.product.delete(productId).then( async () => {
                        let productDeleted = await Product.destroy({'productId': productId}).fetch();
                        res.json({productDeleted:productDeleted});
                    });
                }
                else{
                    sails.log("product not already present");
                    res.json({problem: "product not already present"});
                }
            }
        });
    }
};