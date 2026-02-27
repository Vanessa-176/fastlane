document.addEventListener('deviceready', onDeviceReady, false);

var db = null;

function onDeviceReady() {
    // Wire up button click
    if (document.getElementById('bookingBtn')) {
        document.getElementById('bookingBtn').addEventListener('click', function(e) {
            saveBooking(e);
        });
    }

    // Load available seats when route or departure_time changes
    var routeSelect = document.getElementById('route');
    var timeSelect = document.getElementById('departure_time');

    if (routeSelect) {
        routeSelect.addEventListener('change', loadAvailableSeats);
    }
    if (timeSelect) {
        timeSelect.addEventListener('change', loadAvailableSeats);
    }
}

/**
 * Load available seats for selected route and departure time
 */
function loadAvailableSeats() {
    var route = document.getElementById('route').value.trim();
    var departure_time = document.getElementById('departure_time').value.trim();

    if (!route || !departure_time) {
        document.getElementById('seat_id').innerHTML = '<option value="">-- Select route and time first --</option>';
        return;
    }

    if (!db) {
        console.error('Database not initialized');
        return;
    }

    db.transaction(function(tx) {
        // 1. Find schedule for this route and departure time
        tx.executeSql(
            'SELECT id FROM schedule WHERE route = ? AND departure_time = ? LIMIT 1',
            [route, departure_time],
            function(tx, res) {
                if (res.rows.length === 0) {
                    document.getElementById('seat_id').innerHTML = '<option value="">-- No schedule found --</option>';
                    console.warn('No schedule found for route and time');
                    return;
                }

                var scheduleId = res.rows.item(0).id;

                // 2. Get available seats (not booked) for this schedule
                tx.executeSql(
                    'SELECT s.id, s.seat_number FROM seat s ' +
                    'LEFT JOIN booking b ON s.id = b.seat_id AND b.schedule_id = ? ' +
                    'WHERE s.is_booked = "0" OR (b.id IS NULL) ' +
                    'ORDER BY s.seat_number',
                    [scheduleId],
                    function(tx, res) {
                        var seatSelect = document.getElementById('seat_id');
                        seatSelect.innerHTML = '<option value="">-- Select a seat --</option>';

                        if (res.rows.length === 0) {
                            seatSelect.innerHTML = '<option value="">-- No seats available --</option>';
                            alert('No available seats for this route and time');
                            return;
                        }

                        for (var i = 0; i < res.rows.length; i++) {
                            var seat = res.rows.item(i);
                            var option = document.createElement('option');
                            option.value = seat.id;
                            option.text = 'Seat ' + seat.seat_number;
                            seatSelect.appendChild(option);
                        }
                        console.log('Loaded ' + res.rows.length + ' available seats');
                    },
                    sqlErrorHandler
                );
            },
            sqlErrorHandler
        );
    }, sqlErrorHandler);
}

/**
 * Save the complete booking (customer -> schedule -> booking -> payment)
 */
function saveBooking(e) {
    if (e) e.preventDefault();

    // Validate inputs
    var fullname = document.getElementById('fullname').value.trim();
    var contact = document.getElementById('contact').value.trim();
    var age_range = document.getElementById('age_range').value;
    var route = document.getElementById('route').value.trim();
    var departure_time = document.getElementById('departure_time').value.trim();
    var seat_id = document.getElementById('seat_id').value;
    var amount = document.getElementById('amount').value;
    var method = document.getElementById('method').value;
    var date = new Date().toISOString();

    if (!fullname || !contact || !route || !departure_time || !seat_id || !amount) {
        alert('Please fill all required fields');
        return;
    }

    if (!db) {
        alert('Database not initialized. Please refresh the page.');
        return;
    }

    db.transaction(function(tx) {
        // 1. Create customer record
        tx.executeSql(
            'INSERT INTO customers (fullname, contact, age_range, date_recorded, date_updated) VALUES (?,?,?,?,?)',
            [fullname, parseInt(contact), age_range, date, date],
            function(tx, res) {
                var customerId = res.insertId;
                console.log('Customer created: ' + customerId);

                // 2. Get or create schedule
                tx.executeSql(
                    'SELECT id FROM schedule WHERE route = ? AND departure_time = ?',
                    [route, departure_time],
                    function(tx, res) {
                        var scheduleId;
                        if (res.rows.length > 0) {
                            scheduleId = res.rows.item(0).id;
                            proceedWithBooking(tx, customerId, scheduleId, seat_id, date, amount, method);
                        } else {
                            // Create schedule if it doesn't exist
                            tx.executeSql(
                                'INSERT INTO schedule (route, departure_time, date_recorded, date_updated) VALUES (?,?,?,?)',
                                [route, departure_time, date, date],
                                function(tx, res) {
                                    scheduleId = res.insertId;
                                    console.log('Schedule created: ' + scheduleId);
                                    proceedWithBooking(tx, customerId, scheduleId, seat_id, date, amount, method);
                                },
                                sqlErrorHandler
                            );
                        }
                    },
                    sqlErrorHandler
                );
            },
            sqlErrorHandler
        );
    },
    function(error) {
        console.error('Transaction error: ' + error.message);
        alert('Error saving booking: ' + error.message);
    },
    function() {
        console.log('Booking transaction completed');
    });
}

/**
 * Continue with booking after customer and schedule are ready
 */
function proceedWithBooking(tx, customerId, scheduleId, seatId, date, amount, method) {
    // 3. Create booking record
    tx.executeSql(
        'INSERT INTO booking (customer_id, schedule_id, seat_id, date_recorded, date_updated) VALUES (?,?,?,?,?)',
        [customerId, scheduleId, seatId, date, date],
        function(tx, res) {
            var bookingId = res.insertId;
            console.log('Booking created: ' + bookingId);

            // 4. Mark seat as booked
            tx.executeSql(
                'UPDATE seat SET is_booked = "1", date_updated = ? WHERE id = ?',
                [date, seatId],
                function(tx, res) {
                    // 5. Create payment record
                    tx.executeSql(
                        'INSERT INTO payment (booking_id, amount, method, date_recorded, date_updated) VALUES (?,?,?,?,?)',
                        [bookingId, parseInt(amount), method, date, date],
                        function(tx, res) {
                            alert('Booking complete! Reference #' + bookingId);
                            // Reset form
                            if (document.getElementById('bookingForm')) {
                                document.getElementById('bookingForm').reset();
                            }
                            // Reset seat dropdown
                            document.getElementById('seat_id').innerHTML = '<option value="">-- Select a seat --</option>';
                        },
                        sqlErrorHandler
                    );
                },
                sqlErrorHandler
            );
        },
        sqlErrorHandler
    );
}

function sqlErrorHandler(tx, error) {
    console.error('SQL error: ' + error.message);
    alert('SQL Error: ' + error.message);
}