const multer = require('multer');

// setting multer config.
module.exports.storage = multer.diskStorage({
	destination: function(req, file, cb) {
		cb(null, './public/uploads/');
	},
	filename: function(req, file, cb) {
		cb(null, file.originalname);
	}
});

module.exports.fileFilter = (req, file, cb) => {
	// reject a file
	if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
		cb(null, true);
	} else {
		cb(null, false);
	}
};

module.exports.upload = multer({
	storage: module.exports.storage,
	limits: {
		fileSize: 1024 * 1024 * 22
	},
	fileFilter: module.exports.fileFilter
});
