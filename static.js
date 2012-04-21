"use strict";

(function (K) {
    var express = require("express");
    K.app = express.createServer();

    K.app.get("/", function (req, res) {
        res.sendfile(__dirname + "/public/index.html");
    });

    K.app.configure(function () {
        K.app.use(express.methodOverride());
        K.app.use(express.bodyParser());
        K.app.use(express["static"](__dirname + '/public'));
        K.app.use(express.errorHandler({
            dumpExceptions: true,
            showStack: true
        }));
        K.app.use(K.app.router);
    });
})(process.KWARQUE);
