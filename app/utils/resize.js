const path = require('path');
const sharp = require('sharp');

const sharpCompresion = async (req) => {
    const {
        filename: image
    } = req.file;
    try {
        // console.log(path.resolve("resize"));
        await sharp(req.file.path)
            .resize({
                width: null,
                height: null
            })
            .withMetadata()
            .toFormat("jpeg", {
                mozjpeg: true
            })
            .toFile(path.resolve("resize","image-" + image));
        return `image-${image}`
    } catch (error) {
        console.log(error);
    }
}
module.exports = {
    sharpCompresion
}