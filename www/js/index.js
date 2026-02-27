// Wait for the deviceready event before using any of Cordova's device APIs.
// See https://cordova.apache.org/docs/en/latest/cordova/events/events.html#deviceready
var db = null;
document.addEventListener('deviceready', onDeviceReady, false);

function onDeviceReady() {
    // Cordova is now initialized. Have fun!

    console.log('Running cordova-' + cordova.platformId + '@' + cordova.version);
    // This line creates the physical .db file if it's the first time the app is opened.
    // Otherwise, it simply establishes a connection to the existing file.
    // Open the database
    db = window.sqlitePlugin.openDatabase({
        name: 'fastlane.db',
        location: 'default', // Essential for Android/iOS
        androidDatabaseProvider: 'system' // Recommended for modern Android
    });

    // If the tables already exist, does nothing, and moves to the "Success" callback
    // Initialize your tables
    db.transaction(function(tx) {
        tx.executeSql('CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, username TEXT, password TEXT, role TEXT, date_recorded DATETIME NOT NULL, date_updated DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP');
        tx.executeSql('CREATE TABLE IF NOT EXISTS customers (id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, fullname TEXT, contact INTEGER, age_range TEXT, date_recorded DATETIME NOT NULL, date_updated DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP');
        tx.executeSql('CREATE TABLE IF NOT EXISTS schedule(id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, route TEXT, departure_time DATETIME, date_recorded DATETIME NOT NULL, date_updated DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP');
        tx.executeSql('CREATE TABLE IF NOT EXISTS bus(id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, schedule_id INTEGER, seat_limit INTEGER, date_recorded DATETIME NOT NULL, date_updated DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (schedule_id) REFERENCES schedule(id)');
        tx.executeSql('CREATE TABLE IF NOT EXISTS booking (id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, customer_id INTEGER, schedule_id INTEGER, seat_Number INTEGER, date_recorded DATETIME NOT NULL, date_updated DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (customer_id) REFERENCES customers(id), FOREIGN KEY (schedule_id) REFERENCES schedule(id)');
        tx.executeSql('CREATE TABLE IF NOT EXISTS payment(id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, booking_id INTEGER, amount INTEGER, method TEXT,  date_recorded DATETIME NOT NULL, date_updated DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (booking_id) REFERENCES booking(id)');
    }, function(error) {
        alert("Initialization Error! : " + error.message);
    }, function() {
        alert("Database and Tables Ready!");
    });
}

