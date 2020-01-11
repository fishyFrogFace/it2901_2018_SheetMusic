# ScoresButler

## What is this?

ScoresButler is a sheet music management application for orchestras and bands. It makes it easier to sort, archive and distribute their sheets. It uses RegEx to extract information from the PDFs for labeling the instruments.

## Requirements

#### Node.js

To deploy and to run the project locally you will have to have Node.js installed. Installing npm through a [version manager like n](https://github.com/tj/n), is **strongly recommended**. The project is compatible with node-8-13-0, but might get an upgrade soon.

Node.js can also be installed from the [Node.js website](https://nodejs.org/en/).

#### Python >= v2.5.0 & < v3.0.0
On Debian/Ubuntu based operating system, you can install the correct version by typing the command below.
```bash
sudo apt install python
```
For other operating systems, visit the [Python download site](https://www.python.org/downloads/) and choose one of the compatible versions here.

#### Firebase CLI
To run firebase command tools you will have to install and update via npm
```
npm install firebase-functions@latest --save
npm install firebase-admin@latest --save-exact
npm install -g firebase-tools
```

## Installation

After you have configured the database, clone the repo and type
npm install in hosting and functions. The commands below will installTypo the project packages that are needed.

```bash
cd functions
npm install
cd ../hosting
npm install
```

To run the app, run npm start in hosting folder

Create your own firebase project on firebase.google.com and get the service account key. This is found by following the path -> settings next to Project overview -> Service Account -> Generate new key.

Then replace all the service-account-key.json files in the project with your new key.

You will also have to go to /hosting/src/index.js, and replace
```javascript
var config = {
            apiKey: "AIzaSyCBHe8CK4uabfrJeS-GwyQ3phiQQ2Q73cE",
            authDomain: "scores-bc679.firebaseapp.com",
            databaseURL: "https://scores-bc679.firebaseio.com",
            projectId: "scores-bc679",
            storageBucket: "scores-bc679.appspot.com",
            messagingSenderId: "717099268802"
        };
```
with your information from firebase. This is stored around on the firebase console. The areas where you will find this information is:

    apiKey: Settings:General
    authDomain: Hosting
    databaseURL: Settings:Service Account
    projectId: Settings:General
    messageSenderId: Cloud Messaging
    storageBucket: Storage

Lastly you will have to replace all the buckets with your new storagebucket.
Locations for these are:
* hosting\src\index.js
* functions\src\index.ts.

### Hosting:

Firstly, you will have to have node.js installed on the machine performing the deployment.

This is the first thing you have to deploy.
This is done by following these steps in the command prompt/terminal from the root folder in the project:
1. firebase login (use the projects firebase account)
2. firebase init
3. Choose “Hosting” and press enter
4. Choose these alternatives for the following questions:
   - What do you want to use as your public directory? hosting/build
   - Configure as a single-page app (rewrite all urls to /index.html)? Yes
   - File public/index.html already exists. Overwrite? No
5. Run “npm run build” from the hosting folder
6. Run firebase deploy --only hosting

### Functions:

Every time you want to upload or update functions this is done through the command “firebase deploy --only functions”. This can be ran from wherever in the project folder. If you want to only upload a specific function this would be done by “firebase deploy --only functions:xxxxx” where “xxxxx” represents the function name. An example of this would be “firebase deploy --only functions:ConvertPDF”

### To set up the database:

The database is set up through firebase and most of the fields are generated by use of the website. However, some collections have to be created. This is the collection “instrumentcheck”. This contains the document “instrumentCheck” with the field “checked”. When field is used as a check for the makeInstrumentList function that is used to create the instruments needed for the site. When this field is set to false it will not create the instrumentlist, while when set to true it creates it. To create the list you enter the website and upload any pdf to the site. This will trigger the function. This functions gives the ability to get all the instruments without having to manually create them.

**IMPORTANT: This function will create a duplication of the same instruments again if used twice, so remember to disable after setting up the instruments.**

When this list is created you will have to create a new document in instruments collection. **This must be given the documentID: “XK8EywtzoeHXjcfrYXNR” and create the fields shown in the picture below. These have to be accurate.**
![InstrumentList](/README-images/readmeinstruments.png)

If new instruments are added they must follow a certain structure. This structure is shown below:
```
displayName: String
name: String
type: String
voice: Number
```

### Run the site locally
To run it through localhost you will have to run npm start from the hosting folder through the command prompt/terminal. This will then open a version of the site from your computer. Only changes performed on the hosting version of the site can be tested here. All changes to functions have to deployed to take effect.

### CORS (Cross-Origin Resource Sharing)
For the download function to work the site has to be setup with CORS. CORS is a configuration for cross-origin access from your storage bucket. Create a cors.json file with this configuration:
```JSON
[
  {
    "origin": ["*"],
    "method": ["GET"],
    "maxAgeSeconds": 3600
  }
]
```
Then run “gsutil cors set cors.json gs://<your-cloud-storage-bucket>” to deploy these configurations from the root folder.

If any issues occur with this deployment, check the [official documentation](https://firebase.google.com/docs/storage/web/download-files#cors_configuration) for help.

### Documents rules
To have a ruleset that avoids some potential errors and security risks the rules for the documents have to be set to the following: 
```
// Allow read/write access to all users under any conditions
// Warning: **NEVER** use this rule set in production; it allows
// anyone to overwrite your entire database.
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} { allow read, write: if request.auth.uid != null; }

  	// Rules for band data manipulation
    match /bands/{bandId} {
    	allow read, write: if /databases/$(database)/documents/bands/$(bandId) in get(/databases/$(database)/documents/users/$(request.auth.uid)).data.bandRefs
		}
    match /bands/{bandId}/{anything=**} {
    	allow read, write: if /databases/$(database)/documents/bands/$(bandId) in get(/databases/$(database)/documents/users/$(request.auth.uid)).data.bandRefs
		}
    
    // Rules for bandtype data manipulation
    match /bandtype/{bandtypeId} {
      allow read, write: if true;
      //allow read, write: if request.auth.uid != null;
    }
    
    // Rules for instrumentcheck data manipulation
    match /instrumentcheck/{instrumentcheckId} {
      allow read, write: if true;
      //allow read, write: if request.auth.uid != null;
    }
    
    // Rules for instruments data manipulation
    match /instruments/{instrumentID} {
      allow read, write: if true;
      //allow read, write: if request.auth.uid != null;
    }
    
    // Rules for users data manipulation
    match /users/{userId} {
      allow read, write: if true;
      //allow read, write: if request.auth.uid != null;
    }
  }
}
```
## Usage
**TODO** This section is coming soon to a repo near you. Much excite. Wow.
