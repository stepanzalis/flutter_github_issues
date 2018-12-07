
$(document).ready(function() {

    let ref = firebaseInit();
    
    ref.on('value', function (snapshot) {
        snapshot.forEach(function (childSnapshot) {
            var childData = childSnapshot.val();
            console.log(childData.timestamp);
        });
    });

});

/** 
    Firebase config init
    @return Firebase Database reference of all issues
*/
function firebaseInit() {

    var config = {
            apiKey: "<API-KEY>",
            authDomain: "flutter-github-issues.firebaseapp.com",
            databaseURL: "https://flutter-github-issues.firebaseio.com",
            projectId: "flutter-github-issues",
            storageBucket: "flutter-github-issues.appspot.com",
            messagingSenderId: "1082526570706"
        };

        firebase.initializeApp(config);

        return firebase.database().ref('issues');
}