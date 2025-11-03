
const { GoogleAuth  } = require('google-auth-library');
const axios = require('axios');
const path = require('path');
// Path to your service account key file
//const serviceAccountKeyFile = //path.join(__dirname, 'service-account.json');

// Your Firebase project ID
const projectId = 'narada-8acee';

// Scopes required for FCM
const SCOPES = ['https://www.googleapis.com/auth/firebase.messaging'];

// The message payload
// const message = {
//   "message": {
//     "token": "e_hEbjVLTXGAGs3dQNxiMP:APA91bF9RFASJEDlbqNm01xY1Ln_H8MAoYY9x6F1otcUYfFYpNC1cIfFp49mol-ZjO6JDk_BseAJ-2JMOk_d2VV0H6QHlY2Sxw0VhwkcxTx7aLLPXw_A5tAmkZaQ1ZWvUHD4bvIwUmZp", // The recipient device token
//     "notification": {
//       "title": "Hello",
//       "body": "This is a test message"
//     }
//   }
// };

// Function to get access token
exports.getAccessToken=async ()=> {
    try {
        const auth = new GoogleAuth({
          keyFile: path.join(__dirname,  "./narada.json"),
          scopes: SCOPES
        });
        const client = await auth.getClient();``
        const accessToken = await client.getAccessToken();
        return accessToken.token;
      } catch (error) {
        throw new Error(`Failed to get access token: ${error.message}`);
      }
    // return new Promise((resolve, reject) => {
    //     try {
    //       const key = require("../go-cut-user-firebase-adminsdk-g4g9g-0d96379afc.json");
    //       const jwtClient = new google.auth.JWT(
    //         key.client_email,
    //         null,
    //         key.private_key,
    //         SCOPES,
    //         null
    //       );
    //       jwtClient.authorize((err, tokens) => {
    //         if (err) {
    //           reject(err);
    //           return;
    //         }
    //         resolve(tokens.access_token);
    //       });
    //     } catch (error) {
    //       reject(error);
    //     }
    //   });
}

// Function to send the message
exports.sendMessage = async (accessToken, message) => {
  try {
    const FCM_URL = `https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`;
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
    };

    const response = await axios.post(FCM_URL, message, { headers });
    return response.data;
  } catch (error) {
    console.error('Error sending message:', error.response ? error.response.data : error.message);
    throw error;
  }
};
