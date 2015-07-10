var express = require('express');
var bodyParser = require('body-parser');
var app = express();

var model = {};

app.use(bodyParser());

app.route('/model/:name')
	.get(function(req, res, next) {
		var m = model[req.params.name] || [];
		res.json(m);
	})
	.post(function(req, res, next) {
		var m = model[req.params.name];
		if(!m)
			m = model[req.params.name] = [];

		m.push(req.body);
	})
	.delete(function(req, res, next) {
		var m = model[req.params.name];
		if(!m)
			m = model[req.params.name] = [];

		m = m.filter(function(mi) {
			return mi != req.body;
		});

	});

app.use(express.static('public'));

app.use(function(req, res, next) {
	res.contentType('text/html');
	res.sendFile(__dirname + '/public/html/index.html');
});


app.listen(3000, function () {});
