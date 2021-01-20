const cloudinary = require('cloudinary').v2;


module.exports.fileUpload = (file) => {
    return new Promise((resolve, reject) => {
        cloudinary.uploader.upload(file, { folder: 'patients' }, function(error, result) {
            if (error) {
                reject(error)
            } else {
                resolve(result)
            }
        });
    });
}