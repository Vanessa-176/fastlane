CREATE TABLE IF NOT EXISTS settings (
    id INTEGER PRIMARY KEY NOT NULL AUTOINCREMENT, 
    key TEXT, 
    value TEXT, 
    date_updated DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY NOT NULL AUTOINCREMENT, 
    username TEXT, 
    password TEXT, 
    role TEXT, 
    date_recorded DATETIME NOT NULL,
    date_updated DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS customers (
    id INTEGER PRIMARY KEY NOT NULL AUTOINCREMENT, 
    fullname TEXT, 
    contact INTEGER, 
    age_range TEXT, 
    date_recorded DATETIME NOT NULL,
    date_updated DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS schedule(
    id INTEGER PRIMARY KEY NOT NULL AUTOINCREMENT, 
    route_id INTEGER, 
    departure_time TEXT, 
    arrival_time DATETIME, 
    date_recorded DATETIME NOT NULL
);

CREATE TABLE IF NOT EXISTS payment(
    id INTEGER PRIMARY KEY NOT NULL AUTOINCREMENT, 
    booking_id INTEGER, 
    amount INTEGER, 
    method TEXT,  
    date_recorded DATETIME NOT NULL
);

CREATE TABLE IF NOT EXISTS route (
    id INTEGER PRIMARY KEY NOT NULL AUTOINCREMENT, 
    bus_id INTEGER, 
    schedule_id INTEGER,
    date_recorded DATETIME NOT NULL
);

CREATE TABLE IF NOT EXISTS seat(
    id INTEGER PRIMARY KEY NOT NULL AUTOINCREMENT, 
    seat_id INTEGER, 
    seat_number INTEGER
);

CREATE TABLE IF NOT EXISTS booking (
    id INTEGER PRIMARY KEY NOT NULL AUTOINCREMENT, 
    booking_id INTEGER, 
    customer_id INTEGER, 
    route_id INTEGER, 
    seat_id INTEGER, 
    schedule_id INTEGER, 
    date_recorded DATETIME NOT NULL
);

CREATE TABLE IF NOT EXISTS drivers(
    id INTEGER PRIMARY KEY NOT NULL AUTOINCREMENT, 
    drivers_id INTEGER, 
    fullname TEXT, 
    contact TEXT, 
    age INTEGER, 
    date_recorded DATETIME NOT NULL
);

CREATE TABLE IF NOT EXISTS bus(
    id INTEGER PRIMARY KEY NOT NULL AUTOINCREMENT,
    bus_id INTEGER, 
    driver_id INTEGER,
    schedule_id INTEGER, 
    route_id INTEGER,
    date_recorded DATETIME NOT NULL
);