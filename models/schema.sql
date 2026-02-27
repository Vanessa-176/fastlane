CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, 
    username TEXT, 
    password TEXT, 
    role TEXT, 
    date_recorded DATETIME NOT NULL,
    date_updated DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS customers (
    id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, 
    fullname TEXT, 
    contact INTEGER, 
    age_range TEXT, 
    date_recorded DATETIME NOT NULL,
    date_updated DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS schedule(
    id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, 
    route TEXT, 
    departure_time DATETIME, 
    date_recorded DATETIME NOT NULL,
    date_updated DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS bus(
    id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    schedule_id INTEGER, 
    date_recorded DATETIME NOT NULL,
    date_updated DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (schedule_id) REFERENCES schedule(id)
);

CREATE TABLE IF NOT EXISTS booking (
    id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,  
    customer_id INTEGER,  
    schedule_id INTEGER,
    seat_Number INTEGER, 
    date_recorded DATETIME NOT NULL,
    date_updated DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id),
    FOREIGN KEY (schedule_id) REFERENCES schedule(id)
);

CREATE TABLE IF NOT EXISTS payment(
    id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, 
    booking_id INTEGER, 
    amount INTEGER, 
    method TEXT,  
    date_recorded DATETIME NOT NULL,
    date_updated DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES booking(id)
);

