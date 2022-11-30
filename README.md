# tarsb-kanteen
TAR UMT Final Year Project React PWA for RSD

Final application for internal use at TAR UMT Sabah Branch only!

Create your own .env file with the following variables: <br />
REACT_APP_FIREBASE_API_KEY = ''<br />
REACT_APP_FIREBASE_AUTH_DOMAIN = ''<br />
REACT_APP_FIREBASE_PROJECT_ID = '<br />
REACT_APP_FIREBASE_STORAGE_BUCKET = ''<br />
REACT_APP_FIREBASE_MESSAGING_SENDER_ID = ''<br />
REACT_APP_FIREBASE_APP_ID = ''<br />
REACT_APP_FIREBASE_MEASUREMENT_ID = ''<br />
<br />
REACT_APP_STALL_REG_CODE = '' //code to allow stall owners to register their stall with TARSB Kanteen<br/>
<br />
For cloud function to delete subcollections: <br />
npm i firebase-tools<br />
firebase login:ci<br />
firebase functions:config:set ci.token="your_token"<br />
<br />
firebase functions:config:get > .runtimeconfig.json (to work on local emulator, DO NOT share this file!)<br />