window.onload = function() {
    test('basic test', function() {
        ok(true, 'this had better work.');
        ok(1, 'this had not better work.');
        notEqual( 1, "1", "String '2' and number 1 don't have the same value" );
    });


    test('can access the DOM', function() {
        var fixture = document.getElementById('qunit-fixture');
        equal(fixture.innerText, 'this had better work.', 'should be able to access the DOM.');
    });
}
