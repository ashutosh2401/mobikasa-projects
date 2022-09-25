/**
 * ProductController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

const { disconnect } = require('process');

let picturePath = './assets/images';

module.exports = {
  
    add : async (req,res) => {
        let productName = req.body.productName;
        let productCompany = req.body.productCompany;
        let productDesc = req.body.productDesc;
        let product = await Product.create({'productName': productName, 'productCompany': productCompany}).fetch();
        sails.log(req.body);
        // sails.log('product',product.id);
        let productdesc = await ProductDesc.create({'productDesc':productDesc}).fetch();
        // sails.log('productimg',req.file('productImg'));
        req.file('productImg').upload({
            maxBytes: 10000000,
            dirname: require('path').resolve(sails.config.appPath, picturePath),
        }, async function whenDone(err,uploadedImg) {
            if (err) {
                return res.serverError(err);
            }
            if (uploadedImg.length === 0){
                return res.badRequest('No image was uploaded');
            }
            let filenameArray = new Array;
            let filepathArray = new Array;
            let productimg = new Array;
            for (let i = 0; i < uploadedImg.length; i++) {
                filenameArray.push(uploadedImg[i]['filename']);
                filepathArray.push(uploadedImg[i]['fd']);
                productimg.push(await ProductImages.create({'productId':product.id,'imageName': uploadedImg[i]['filename'],'imagePath': uploadedImg[i]['fd']}).fetch());
            }
            sails.log('filenameArray',filenameArray);
            sails.log('filepathArray',filepathArray);
            // let productimg = await ProductImages.create({'imageName': filenameArray,'imagePath': filepathArray}).fetch();
            sails.log('productimg',productimg);
            return res.json({productName: product['productName'],productCompany: product['productCompany'],productDesc: productdesc['productDesc'],'filenameArray':filenameArray,'filepathArray':filepathArray});

        })
    },

    listing : async (req,res) => {
        if(req.param('productId')) {
            let p = req.allParams();
            let pid = p['productId'];
            let product = await Product.find({where: {'id':pid}, sort: 'id DESC'});
            let productDesc = await ProductDesc.find({where: {'id':pid}, sort: 'id DESC'});
            let productImages = await ProductImages.find({where: {'productId':pid}, sort: 'id DESC'});
            p['productDesc'] = productDesc[0].productDesc;
            sails.log('p',p);
            let productInfo = new Object();
            productInfo['productId'] = product.id;
            productInfo['productDesciption'] = productDesc.productDesc;
            // sails.log('productDesc',productInfo);
            // sails.log('product',product);
            return res.json({product: product});
        }
        else if(req.param('productCompany')) {
            let pcmp = req.param('productCompany');
            let product = await Product.find({'productCompany':{contains:pcmp}, sort: 'id DESC'});
            let productDesc = await ProductDesc.find({where: {'id':pid}, sort: 'id DESC'});
            let productImages = await ProductImages.find({where: {'productId':pid}, sort: 'id DESC'});
            product['productDesc'] = productDesc;
            product['productImgs'] = productImages;
            return res.json({product: product});
        }
        return res.ok();        
    },
};

