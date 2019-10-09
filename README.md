# Annot.AI

> AI Powered Notes

**WARNING**
I've stopped working on this project long ago (in 2017). All the packages are very old and probably depracated since long.

## Motivation

* I wanted to make a simple note taking app (becase there will be never enough!) with a streight forward flow: you take the note, paste text, link stuff - save and forget it. The logic inside would take care of the tagging, categorizing and other boring stuff.
* I wanted to put into practice what I had learn at the time in terms of Javascript stack: PWA with Cordova and Vue.js, plus Firebase.

## Live version

You can see it in action here https://www.annotai.com/

## Build Setup

``` bash
# install dependencies
npm install

# serve with hot reload at localhost:8080
npm run dev

# build for production with minification
npm run build

# run unit tests
npm run unit

# run e2e tests
npm run e2e

# run all tests
npm test
```

## Mobile

This app is setup to package via Cordova.

**Add whichever platforms you would like to support:**

```
cordova platform add browser
cordova platform add ios
cordova platform add android
```

The following commands are available:

```
cordova-build
cordova-run
cordova-run-ios
cordova-run-android
```

## License
This program is free software.
It is licensed under the GNU AGPL version 3 or later.
That means you are free to use this program for any purpose;
free to study and modify this program to suit your needs;
and free to share this program or your modifications with anyone.
If you share this program or your modifications
or use it as a web service
you must grant the recipients the same freedoms.
To be more specific: you must share the source code under the same license.
For details see https://www.gnu.org/licenses/agpl-3.0.html
