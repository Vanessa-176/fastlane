/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

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
        tx.executeSql('CREATE TABLE IF NOT EXISTS settings (id INTEGER PRIMARY KEY NOT NULL AUTOINCREMENT, key TEXT, value TEXT, date_updated DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP)');
        tx.executeSql('CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY NOT NULL AUTOINCREMENT, username TEXT, password TEXT, role TEXT, date_recorded DATETIME NOT NULL, date_updated DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP)');
        tx.executeSql('CREATE TABLE IF NOT EXISTS customers (id INTEGER PRIMARY KEY NOT NULL AUTOINCREMENT, fullname TEXT, contact INTEGER, age_range TEXT, date_recorded DATETIME NOT NULL, date_updated DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP)');
        tx.executeSql('CREATE TABLE IF NOT EXISTS schedule(id INTEGER PRIMARY KEY NOT NULL AUTOINCREMENT, route_id INTEGER, departure_time TEXT, arrival_time DATETIME, date_recorded DATETIME NOT NULL)');
        tx.executeSql('CREATE TABLE IF NOT EXISTS payment(id INTEGER PRIMARY KEY NOT NULL AUTOINCREMENT, booking_id INTEGER, amount INTEGER, method TEXT,  date_recorded DATETIME NOT NULL)');
        tx.executeSql('CREATE TABLE IF NOT EXISTS route (id INTEGER PRIMARY KEY NOT NULL AUTOINCREMENT, bus_id INTEGER, schedule_id INTEGER , date_recorded DATETIME NOT NULL)');
        tx.executeSql('CREATE TABLE IF NOT EXISTS seat(id INTEGER PRIMARY KEY NOT NULL AUTOINCREMENT, seat_id INTEGER, seat_number INTEGER)');
        tx.executeSql('CREATE TABLE IF NOT EXISTS booking (id INTEGER PRIMARY KEY NOT NULL AUTOINCREMENT, booking_id INTEGER, customer_id INTEGER, route_id INTEGER, seat_id INTEGER, schedule_id INTEGER, date DATETIME)')
        tx.executeSql('CREATE TABLE IF NOT EXISTS drivers(id INTEGER PRIMARY KEY NOT NULL AUTOINCREMENT, drivers_id INTEGER, fullname TEXT,contact TEXT, age INTEGER, date DATETIME)')
        tx.executeSql('CREATE TABLE IF NOT EXISTS bus(id INTEGER PRIMARY KEY NOT NULL AUTOINCREMENT, bus_id INTEGER, driver_id INTEGER,schedule_id INTEGER, route_id INTEGER)')
    }, function(error) {
        console.error('Initialization Error: ' + error.message);
        alert("Initialization Error! : " + error.message);
    }, function() {
        console.log('Database and Tables Ready!');
        alert("Database and Tables Ready!");
    });
}

/**
 * Utility functions used by booking form pages.  These functions assume
 * the global `db` variable has already been opened in onDeviceReady.
 */

function sqlErrorHandler(tx, error) {
    console.error('SQL error: ' + error.message);
    alert('SQL error: ' + error.message);
}

/**
 * Create a new customer/booking/schedule/payment sequence.
 *
 * The form code implemented in booking.html uses this helper for clarity,
 * but you can also call it directly from other controllers if needed.
 */
function createFullBooking(data, successCallback, errorCallback) {
    // data should contain: fullname, contact, age_range,
    // route_id, departure_time, arrival_time, seat_id (nullable),
    // amount, method
    db.transaction(function(tx) {
        tx.executeSql(
            'INSERT INTO customers (fullname, contact, age_range, date_recorded) VALUES (?,?,?,datetime("now"))',
            [data.fullname, data.contact, data.age_range],
            function(tx, res) {
                var customerId = res.insertId;
                tx.executeSql(
                    'INSERT INTO schedule (route_id, departure_time, arrival_time, date_recorded) VALUES (?,?,?,datetime("now"))',
                    [data.route_id, data.departure_time, data.arrival_time],
                    function(tx, res2) {
                        var scheduleId = res2.insertId;
                        tx.executeSql(
                            'INSERT INTO booking (customer_id, route_id, seat_id, schedule_id, date) VALUES (?,?,?,?,datetime("now"))',
                            [customerId, data.route_id, data.seat_id, scheduleId],
                            function(tx, res3) {
                                var bookingId = res3.insertId;
                                tx.executeSql(
                                    'INSERT INTO payment (booking_id, amount, method, date_recorded) VALUES (?,?,?,datetime("now"))',
                                    [bookingId, data.amount, data.method],
                                    function(tx, res4) {
                                        if (successCallback) successCallback(bookingId);
                                    },
                                    errorCallback || sqlErrorHandler
                                );
                            },
                            errorCallback || sqlErrorHandler
                        );
                    },
                    errorCallback || sqlErrorHandler
                );
            },
            errorCallback || sqlErrorHandler
        );
    }, function(err) {
        console.error('createFullBooking transaction error', err);
        if (errorCallback) errorCallback(err);
    }, function() {
        console.log('createFullBooking transaction complete');
    });
}

