document.addEventListener('deviceready', onDeviceReady, false);

function onDeviceReady() {
    if (document.getElementById('bookingBtn')) {
        document.getElementById('bookingBtn').addEventListener('click', function(e) {
            saveBooking();
        });
    }
}

function saveBooking() {
    var fullname = document.getElementById('fullname').value.trim();
    var contact = document.getElementById('contact').value.trim();
    var age_range = document.getElementById('age_range').value.trim();
    var route = parseInt(document.getElementById('route').value, 10);
    var departure_time = document.getElementById('departure_time').value.trim();
    var amount = parseFloat(document.getElementById('amount').value);
    var method = document.getElementById('method').value;
    var date = new Date().toISOString();

    db.transaction(function (tx) {
    // 1. create customer
    tx.executeSql(
        'INSERT INTO customers (fullname, contact, age_range, date_recorded, date_updated) VALUES (?,?,?,?,?)',
        [fullname, contact, age_range, date, date],
        function (tx, res) {
        var customerId = res.insertId;

        // 2. create schedule
        tx.executeSql(
            'INSERT INTO schedule (route, departure_time, date_recorded, date_updated) VALUES (?,?,?,?,?)',
            [route, departure_time, date, date],
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