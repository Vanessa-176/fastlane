/*
     * Because index.js already opens the database and declares `db` as a global,
     * we just need to wait for deviceready and wire up the form handler here.
     */
document.addEventListener('deviceready', function () {
    document.getElementById('bookingBtn').addEventListener('click', function(e) {
        saveBooking();
    });
});

function saveBooking() {
    // e.preventDefault();

    var fullname = document.getElementById('fullname').value.trim();
    var contact = document.getElementById('contact').value.trim();
    var age_range = document.getElementById('age_range').value.trim();
    var route_id = parseInt(document.getElementById('route_id').value, 10);
    var departure_time = document.getElementById('departure_time').value.trim();
    var arrival_time = document.getElementById('arrival_time').value.trim();
    var seat_id_val = document.getElementById('seat_id').value;
    var seat_id = seat_id_val === '' ? null : parseInt(seat_id_val, 10);
    var amount = parseFloat(document.getElementById('amount').value);
    var method = document.getElementById('method').value;
    var date = new Date().toISOString();

    db.transaction(function (tx) {
    // 1. create customer
    tx.executeSql(
        'INSERT INTO customers (fullname, contact, age_range, date_recorded) VALUES (?,?,?,?)',
        [fullname, contact, age_range, date],
        function (tx, res) {
        var customerId = res.insertId;

        // 2. create schedule
        tx.executeSql(
            'INSERT INTO schedule (route_id, departure_time, arrival_time, date_recorded) VALUES (?,?,?,?)',
            [route_id, departure_time, arrival_time, date],
            function (tx, res2) {
            var scheduleId = res2.insertId;

            // 3. create booking
            tx.executeSql(
                'INSERT INTO booking (customer_id, route_id, seat_id, schedule_id, date) VALUES (?,?,?,?,?)',
                [customerId, route_id, seat_id, scheduleId, date],
                function (tx, res3) {
                var bookingId = res3.insertId;

                // 4. create payment
                tx.executeSql(
                    'INSERT INTO payment (booking_id, amount, method, date_recorded) VALUES (?,?,?,?)',
                    [bookingId, amount, method, date],
                    function (tx, res4) {
                    alert('Booking complete! Reference #' + bookingId);
                    document.getElementById('bookingForm').reset();
                    },
                    sqlErrorHandler
                );
                },
                sqlErrorHandler
            );
            },
            sqlErrorHandler
        );
        },
        sqlErrorHandler
    );
    },
    function (error) {
    alert('Error saving booking: ' + error.message);
    },
    function () {
    alert('Booking completed!');
    });
}

function sqlErrorHandler(tx, error) {
    alert('SQL Error: ' + error.message);
}