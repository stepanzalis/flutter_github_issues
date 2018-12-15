var chart = null;

const OPEN_ISSUES = 0, CLOSE_ISSUES = 1;
const DATETIME = 0, ISSUES = 1, BOTH = 2;

$(document).ready(function () {
    createChart();
    firebaseInit();
    getData();
});

// Main function to parse dat from database
async function getData() {

    let data = await pullFromFirebase();
    
    const issueData = filterIssuesData(data, ISSUES);
    let datetime = filterIssuesData(data, DATETIME);

    let openedIssues = issueData.map(issue => {
        return issue.open;
    });

    let closedIssues = issueData.map(issue => {
        return issue.close;
    });

    notifyChart(openedIssues, closedIssues, datetime);
    setTodayStatistics(data);
}

/**
 * Filter date depends on:
 * @param {data} data All data from Database
 * @param {openIssues} variant OPEN or CLOSE issue
 * @param {days} number of days to go back
 * @param {variant} DATETIME, ISSUES or BOTH
 */
function filterIssuesData(data, variant, days = 10) {

    const returnData = data.filter(function (iss) {
        return new Date() - (1000 * 60 * 60 * 24 * days) < new Date(iss.timestamp);
    }).filter(function (iss) {
        return new Date(iss.timestamp).getHours() === new Date().getHours();
    }).map(issue => {
        switch (variant) {
            case DATETIME:
                return new Date(issue.timestamp).toLocaleString();
            case ISSUES:
                return { open: issue.open, close: issue.close };
            default: return { datetime: new Date(issue.timestamp).toLocaleString(), open: issue.open, close: issue.close }
        }
    });

    console.table(returnData)

    return returnData;
}

// Compare data now and yesterday
function statsData(data) {

    return {
        "now": data[data.length - 1],
        "yesterday": data[data.length - 25]
    }
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
            labels: [],
            datasets: [{
                label: '# of OPENED issues',
                data: [],
                backgroundColor: [
                    'rgba(54, 162, 235, 0.2)',
                ],
                borderColor: [
                    '#45B3F1'
                ],
                borderWidth: 1
            },
            {
                label: '# of CLOSED issues',
                data: [],
                hidden: true,
                backgroundColor: [
                    '#EF9A9A',
                ],
                borderColor: [
                    '#D32F2F'
                ],
                borderWidth: 1
            }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                yAxes: [{
                    scaleLabel: {
                        display: true,
                        labelString: 'Number of issues'
                    },
                    ticks: {
                        major: {
                            fontStyle: 'bold',
                            fontColor: '#FF0000'
                        }
                    }
                }]
            }
        }
    });
}

// Set data to chart 
function notifyChart(openedIssues, closedIssues, datetime) {
    chart.data.datasets[0].data = openedIssues;
    chart.data.datasets[1].data = closedIssues;
    chart.data.labels = datetime;
    chart.update();
}

// Set statistics on the top of the page
function setTodayStatistics(data) {

    // const statsAll = filterIssuesData(data, BOTH, 2);

    const stats = statsData(data);
    
    var moreOrLess = stats.now > stats.yesterday ? "more" : "less";
    var icon = stats.now > stats.yesterday ? '<i class="tiny material-icons red-text">arrow_upward</i>' : '<i class="tiny material-icons blue-text">arrow_downward</i>';

    let issues = Math.abs(stats.now.open - stats.yesterday.open);

    const text = `${icon} ${issues} ${moreOrLess} issues compared to yesterday.`
    $('#today-stats').prepend(text);
}

