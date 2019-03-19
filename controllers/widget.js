/* ===============================
@ Imports
=============================== */
const { photoHandler } = require(WPATH('util')) /* eslint-disable-line */
const FA = require(WPATH('icons')) /* eslint-disable-line */

/* ===============================
@ Consts & Lets
=============================== */
let callback
let hasPhoto

/* ===============================
@ Functions
=============================== */
/*
@ Initialize
*/
const Initialize = () => {
	delete $.args.__parentSymbol

	//
	$.icon.text = FA.camera

	//
	$.photoBtn.addEventListener('click', onClick)

	//
	if ($.args.top || $.args.top === 0) {
		$.photoBtn.top = $.args.top
	}

	//
	$.photoBtn.applyProperties($.args)
	$.photo.applyProperties(_.pick($.args, ['width', 'borderRadius', 'height']))
}

/*
@ onClick
*/
const onClick = event => {
	if (event.source) {
		event = event.source
	}

	event.animate({
		duration: 200,
		opacity: 0.7,
		autoreverse: true,
	})

	_.delay(() => {
		Alloy.Alert.show({
			message: 'Você gostaria de mudar a foto do seu perfil?',
			btns: ['Tirar Foto', 'Galeria', 'Voltar'],
			callback: evt => {
				if (evt === 2) return

				// Alloy.Loading.show()

				photoHandler(evt === 1, (err, media) => {
					if (err) {
						Alloy.Loading.hide()
						return Alloy.Alert.show({
							message: err,
							btns: 'OK', // []
						})
					}

					//
					// Alloy.Loading.hide()
					$.photo.image = media
					hasPhoto = media

					callback &&
						callback({
							id: 'photoPerfil',
						})
				})
			},
		})
	}, 200)
}

/* ===============================
@ Exports
=============================== */
/*
@ cleanUp
*/
exports.cleanUp = () => {
	$.off()
	$.destroy()
}

/*
@ setPhoto
*/
exports.setPhoto = photo => {
	$.photo.image = photo
	hasPhoto = photo
}

/*
@ hasPhoto
*/
exports.hasPhoto = () => hasPhoto

/*
@ setCallback
*/
exports.setCallback = Next => {
	callback = Next
}

/* ===============================
@
=============================== */
Initialize()
