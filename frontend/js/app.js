
var instance_tabs = null;

let chartToday = null;
let chartMonth = null;
let chartTotal = null;

let data = null;

// CONSTANTS
const TIME = 0; 
const DATE = 1;

$(document).ready(function () {

    // TABS
    let elem = document.querySelector('.tabs');
    let init_tab = M.Tabs.init(elem, { onShow: tab_callback });
    instance_tabs = M.Tabs.getInstance(elem);

    firebaseInit();
    data = getData();
});

function tab_callback() {

    switch (instance_tabs.index) {
        case 0:
            notifyToday();
            break;
        case 1:
            if (chartMonth == null) chartMonth = createChart("#month");
            let month = otherData(30, 6);
            notifyChart(chartMonth, month, DATE);
            break;
        case 2:
            if (chartTotal == null) chartTotal = createChart("#total");
            let days = data.length / 24;
            let total = otherData(days, 12);
            notifyChart(chartTotal, total, DATE);
            break;
    }
}

// show today graph after initialization
function notifyToday() {
    if (chartToday == null) chartToday = createChart("#today");
    let today = todayData(data);
    notifyChart(chartToday, today, TIME);
}


// Main function to parse dat from database
async function getData() {
    if (data == null) data = await pullFromFirebase();
    notifyToday();
}

// Get today data
function todayData() {
    return data.filter(function (issue) {
        let now = new Date();
        let iss = new Date(issue.timestamp);
        return now.getDate() === iss.getDate() && now.getMonth() === iss.getMonth();
    });
}

/**
 * @param days Number of days to be filter
 * @param skip Filter offset 
 */
function otherData(days, skip) {
    return data.filter(function (issue) {
        return new Date() - (1000 * 60 * 60 * 24 * days) <= new Date(issue.timestamp);
    }).filter(function (_, index, _) {
        if (index % skip == 0) return this;
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

/*
*  Firebase config init
*  @return Firebase Database reference of all issues
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
function createChart(chartId) {

    var ctx = $(chartId);

    return new Chart(ctx, {
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

/**
 * @param chart Id of chart to bind data
 * @param dataset Data
 * @param time show only TIME or DATE (TIME used in today's stats)
 */
function notifyChart(chart, dataset, time) {

    let open = dataset.map(issue => issue.open);
    let closed = dataset.map(issue => issue.close);
    let datetime = dataset.map(issue => time === TIME ? new Date(issue.timestamp).toLocaleTimeString() : new Date(issue.timestamp).toLocaleDateString());

    chart.data.datasets[0].data = open;
    chart.data.datasets[1].data = closed;
    chart.data.labels = datetime;
    chart.update();
}

