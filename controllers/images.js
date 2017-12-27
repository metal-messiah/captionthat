/**
 * Created by Porter on 12/24/2017.
 */
let fs = require('fs');
let images = fs.readdirSync("./public/images");
//console.log(images);
let usedImages = [];

let getImage = () => {
    if (images.length) {
        let randomImage = images.splice(Math.floor(Math.random() * (images.length - 1 - 0 + 1) + 0), 1)[0];
        usedImages.push(randomImage);
        return {randomImage, images, usedImages};
    }
    else {
        images = usedImages.slice();
        usedImages = [];
        let randomImage = images.splice(Math.floor(Math.random() * (images.length - 1 - 0 + 1) + 0), 1)[0];
        usedImages.push(randomImage);
        return {randomImage, images, usedImages};
    }
};

module.exports = {getImage};