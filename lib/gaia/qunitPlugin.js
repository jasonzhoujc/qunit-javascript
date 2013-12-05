/*
 * qunit监听测试流程点
 * @author jason.zhou
 * http://gruntjs.com/
 * 参考：grunt
 */
(function () {
    'use strict';

    // 发送消息到phantomjs处理通过alert，（phantomjs会监听alert）
    function sendMessage() {
        var args = [].slice.call(arguments);
        alert(JSON.stringify(args));
    }

    // These methods connect QUnit to PhantomJS.
    QUnit.log(function(obj) {
        // What is this I don’t even
        if (obj.message === '[object Object], undefined:undefined') { return; }
        // Parse some stuff before sending it.
        var actual = QUnit.jsDump.parse(obj.actual);
        var expected = QUnit.jsDump.parse(obj.expected);
        sendMessage('qunit.log', obj.result, actual, expected, obj.message, obj.source);
    });

    QUnit.testStart(function(obj) {
        sendMessage('qunit.testStart', obj.name);
    });

    QUnit.testDone(function(obj) {
        sendMessage('qunit.testDone', obj.name, obj.failed, obj.passed, obj.total);
    });

    QUnit.moduleStart(function(obj) {
        sendMessage('qunit.moduleStart', obj.name);
    });

    QUnit.moduleDone(function(obj) {
        sendMessage('qunit.moduleDone', obj.name, obj.failed, obj.passed, obj.total);
    });

    QUnit.begin(function() {
        sendMessage('qunit.begin');
    });

    QUnit.done(function(obj) {
        sendMessage('qunit.done', obj.failed, obj.passed, obj.total, obj.runtime);
    });
}());
