# tarsb-kanteen
TAR UMT Final Year Project React PWA for RSD

Final application for internal use at TAR UMT Sabah Branch only!

Stall Reg Code is currently hardcoded, change it at /NewStallUser/index.js

To use Firebase emulators, set useEmulators in firebase.js to true and execute "./emulator.cmd" in terminal as the script saves Firestore data on exit.<br />
<br />
For cloud function to delete subcollections: <br />
npm i firebase-tools<br />
firebase login:ci<br />
firebase functions:config:set ci.token="your_token"<br />
<br />
firebase functions:config:get > .runtimeconfig.json (to work on local emulator, DO NOT share this file!)<br />
<br />
