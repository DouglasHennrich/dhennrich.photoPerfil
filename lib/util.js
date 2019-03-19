/* ===============================
@ Imports
=============================== */
const ImageFactory = require('ti.imagefactory')

/* ===============================
@ Functions
=============================== */
/*
@ Guid
*/
const guid = () => {
	const S4 = () => (((1 + Math.random()) * 65536) | 0).toString(16).substring(1)

	return `${S4() + S4()}-${S4()}-${S4()}-${S4()}-${S4()}${S4()}${S4()}`
}

/*
@ photoHandler
*/
exports.photoHandler = (gallery, callback = () => {}) => {
	const permissions = [
		'android.permission.CAMERA',
		'android.permission.WRITE_EXTERNAL_STORAGE',
		'android.permission.READ_EXTERNAL_STORAGE',
	]

	const hasCameraPermissions = OS_IOS
		? Ti.Media.hasCameraPermissions()
		: Ti.Android.hasPermission(permissions)

	//
	Alloy.Log(`[hasCameraPermissions]: ${JSON.stringify(hasCameraPermissions)}`)

	// takePhotoFunc
	const takePhotoFunc = () => {
		if (gallery) {
			fromGallery(callback)
		} else {
			fromCamera(callback)
		}
	}

	//
	if (hasCameraPermissions) {
		takePhotoFunc()

		//
	} else if (OS_IOS) {
		Ti.Media.requestCameraPermissions(e => {
			if (e.success) {
				takePhotoFunc()
			} else {
				Alloy.Alert.show({
					message: 'Precisamos de autorização para continuar',
					btns: 'OK', // []
				})
			}
		})

		//
	} else {
		_.delay(() => {
			// if (!Ti.Android.hasPermission(permissions)) {
			exports.photoHandler(fromGallery, callback)
			// }
		}, 3000)

		// no permission - request it
		Ti.Android.requestPermissions(permissions, e => {
			Alloy.Log(`[requestPermission]: ${JSON.stringify(e)}`)
		})
	}
}

/*
@ fixImage
*/
const fixImage = (media, nomeFoto) => {
	// this is where magic happens using in-built method of Ti.Blob
	let correctOrientationPic = media.imageAsResized(media.width, media.height)
	const tempFile = Ti.Filesystem.getFile(Ti.Filesystem.tempDirectory, nomeFoto)
	tempFile.write(correctOrientationPic)

	correctOrientationPic = null
	return tempFile
}

/*
@ fromGallery
*/
function fromGallery(callback) {
	Ti.Media.openPhotoGallery({
		allowEditing: false,
		saveToPhotoGallery: false,

		// we got something
		success: event => {
			successFunc(event, callback)
		},

		// do somehting if user cancels operation
		cancel: () => {
			callback('Cancelado')
		},

		// error happend, create alert
		error: error => {
			callback('Dispositivo não suporta camera.')
		},

		mediaTypes: [Ti.Media.MEDIA_TYPE_PHOTO],
	})
}

/*
@ fromCamera
*/
function fromCamera(callback) {
	Ti.Media.showCamera({
		success: event => {
			successFunc(event, callback)
		},

		// do somehting if user cancels operation
		cancel: () => {
			callback('Cancelado')
		},

		// error happend, create alert
		error: error => {
			callback('Dispositivo não suporta camera.')
		},

		mediaTypes: [Ti.Media.MEDIA_TYPE_PHOTO],
	})
}

/*
@ successFunc
*/
const successFunc = (event, callback) => {
	// Alloy.Log(`[event]: ${JSON.stringify(event)}`)
	const isAndroid = Ti.Platform.osname === 'android'
	const nomeFoto = `${guid()}.jpg`
	const transformedImage = isAndroid ? fixImage(event.media, nomeFoto) : null

	const newBlob = ImageFactory.imageAsResized(OS_IOS ? event.media : transformedImage.read(), {
		width: Alloy.CFG.style.widgets.photoPerfil.transformWidth || event.media.width * 0.3,
		height: Alloy.CFG.style.widgets.photoPerfil.transformHeight || event.media.height * 0.3,
		quality: OS_IOS ? ImageFactory.QUALITY_MEDIUM : 0.5,
	})

	Alloy.Log(`[newBlob]: ${JSON.stringify(newBlob)}`)

	const f = Ti.Filesystem.getFile(Ti.Filesystem.tempDirectory, nomeFoto)
	f.write(newBlob)

	Alloy.Log(`[f] read: ${JSON.stringify(f.read())}`)
	Alloy.Log(`[f] resolve: ${JSON.stringify(f.resolve())}`)
	Alloy.Log(`[f] blob: ${JSON.stringify(f.toBlob())}`)

	callback(null, f.toBlob())
}
