let chart = null;
let datetime = [];
let issueData = [];

const OPEN_ISSUES = 0,
    CLOSE_ISSUES = 1;

$(document).ready(function () {

    firebaseInit();
    getData();
});

// Main function to parse dat from database
async function getData() {

    let data = await pullFromFirebase();
    filterDateTime(data, 10);
    filterIssuesData(data, OPEN_ISSUES);

    console.table(datetime);

    createChart();
}


/**
 * Parse timestamp to human date time
 * @param {data} data data All data from Database
 * @param {day} days Number of days to be reversed to
 */
function filterDateTime(data, days) {

    datetime = data.filter(function (iss) {
        return new Date() - (1000 * 60 * 60 * 24 * days) < new Date(iss.timestamp);
    }).map(issue => {
        return new Date(issue.timestamp).toLocaleString();
    });
}

/**
 * Filter OPEN or CLOSE data depends on:
 * @param {data} data All data from Database
 * @param {*} variant OPEN or CLOSE issue
 */
function filterIssuesData(data, variant) {

    issueData = data.filter(function (iss) {
        return new Date() - (1000 * 60 * 60 * 24 * 10) < new Date(iss.timestamp);
    }).map(issue => {
        return variant === OPEN_ISSUES ? issues.open : issue.close;
    });
}



// Get data from Firebase Database
pullFromFirebase = () => {
    return firebase.database().ref('issues').once('value').then(function (snapshot) {
        const issues = Object.keys(snapshot.val()).map(function (key) {
            return snapshot.val()[key];
        });
        return issues;
    });
}

/** 
    Firebase config init
    @return Firebase Database reference of all issues
*/
function firebaseInit() {

    var config = {
        apiKey: "AIzaSyBo_u2lsqYTT_FQbzaqFC02039wS6c8vhw",
        authDomain: "flutter-github-issues.firebaseapp.com",
        databaseURL: "https://flutter-github-issues.firebaseio.com",
        projectId: "flutter-github-issues",
        storageBucket: "flutter-github-issues.appspot.com",
        messagingSenderId: "1082526570706"
    };

    firebase.initializeApp(config);
}

// Draw a chart 
function createChart() {

    var ctx = $("#chart");

    chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: datetime,
            datasets: [{
                label: '# of Open issues',
                data: issueData,
                backgroundColor: [
                    'rgba(54, 162, 235, 0.2)',
                ],
                borderColor: [
                    '#45B3F1'
                ],
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero: true
                    }
                }]
            }
        }
    });
}

