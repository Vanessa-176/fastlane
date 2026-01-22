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
        tx.executeSql('CREATE TABLE IF NOT EXISTS settings (id integer primary key, key text, value text, date_update text)');
        tx.executeSql('CREATE TABLE IF NOT EXISTS users (id integer primary key, username text, password text, role text, date_registered text)');
        tx.executeSql('CREATE TABLE IF NOT EXISTS user_profile (id integer primary key, user_id integer, email text, contact integer, address text, picture text, date_updated text, FOREIGN KEY(user_id) REFERENCES users(id))');
        tx.executeSql('CREATE TABLE IF NOT EXISTS crops (id integer primary key, user_id integer, crop_name text, crop_metadata text, date_updated text, FOREIGN KEY(user_id) REFERENCES users(id))');
        tx.executeSql('CREATE TABLE IF NOT EXISTS plots (id integer primary key, user_id integer, name text, area real, location text, soil_type text, date_created text, date_updated text, FOREIGN KEY(user_id) REFERENCES users(id), FOREIGN KEY(crop_id) REFERENCES crops(id))');
        tx.executeSql('CREATE TABLE IF NOT EXISTS crop_requirements (id integer primary key, user_id, crop_id integer, season text, temp_range text, rainfall integer, soil text, pH integer, date_updated text, FOREIGN KEY(user_id) REFERENCES users(id), FOREIGN KEY(crop_id) REFERENCES crops(id))');
        tx.executeSql('CREATE TABLE IF NOT EXISTS recommendations (id integer primary key, user_id integer, crop_id integer, recommendation text, date_updated text, FOREIGN KEY(user_id) REFERENCES users(id), FOREIGN KEY(crop_id) REFERENCES crops(id))');
        tx.executeSql('CREATE TABLE IF NOT EXISTS weather_cache (id integer primary key, user_id integer, location text, temperature integer, measuring text, appearance text, wind_speed integer, humidity integer, date_updated text, FOREIGN KEY(user_id) REFERENCES users(id))')
    }, function(error) {
        console.error('Initialization Error: ' + error.message);
        alert("Initialization Error! : " + error.message);
    }, function() {
        console.log('Database and Tables Ready!');
        alert("Database and Tables Ready!");
    });
}
