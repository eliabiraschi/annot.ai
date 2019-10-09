const functions = require('firebase-functions')
const admin = require('firebase-admin')
const ipn = require('paypal-ipn')
const firebase = require('firebase')

const config = {
    apiKey: '',
    authDomain: '',
    databaseURL: '',
    storageBucket: '',
    messagingSenderId: ''
}

firebase.initializeApp(config)

admin.initializeApp(functions.config().firebase)

exports.paypalCallback = functions.https.onRequest((request, response) => {
    response.send(200)
    ipn.verify(request.body, (error, msg) => {
        if (request.body.payment_status == 'Completed') {
            const credentials = request.body.custom.split('|')
            firebase.auth().createUserWithEmailAndPassword(credentials[0], credentials[1])
                .then(() =>  console.log('OK'))
                .catch(error => console.error(error))
        }
    })
})
