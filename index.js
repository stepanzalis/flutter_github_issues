let admin = require('firebase-admin');
let fetch = require("node-fetch");

// API KEY
let serviceAccount = require('./flutter-github-issues-firebase-adminsdk-c7ina-bb7ac64db4.json');

// Firebase init
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://flutter-github-issues.firebaseio.com"
});

// Get a database reference to issues
let db = admin.app().database();

/**
 * @param owner Owner of the repository
 * @param repo Name of repository
 * @param state State - OPEN / CLOSED
 * @returns {string} query
 */
function getBody(state) {
    return JSON.stringify({
        query: `
        query {
            repository(owner: "flutter", name: "flutter") {
                issues(states:${state}) {
                  totalCount
                }
              }
        }`
    })
}

/**
 *
 * @param body Query to send
 * @returns Total count of OPEN / CLOSED issues
 */
function getIssues(body) {

    let url = 'https://api.github.com/graphql';

    let options = {
        method: 'POST',
        url: url,
        body: body,
        headers: {
            Accept: "application/json",
            'Content-Type': 'application/json',
            Authorization: `bearer ${process.env.TOKEN}`
        }
    };

    return fetch(url, options)
        .then(resp => resp.json())
        .then(data => {
            return data.data.repository.issues.totalCount;
        });
}

/**
 * Put record to Firebase database
 * @param open Number of opened issues
 * @param closed Number of closed issues
 */
function setToDatabase(open, closed) {

    let now = Date.now();
    let issues = db.ref("/issues/").child(now);

    issues.set({
        timestamp: now,
        open: open,
        close: closed
    });
}

// Main function
exports.handler = async (event, context) => {

    let open = await getIssues(getBody("OPEN"));
    let closed = await getIssues(getBody("CLOSED"));

    await setToDatabase(open, closed);

    return "BYE";
};







