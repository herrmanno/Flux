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

app.use(function(req, res, next) {
	res.contentType(req.path.substr(1));
	console.log("set content-type for file " + req.path);
	next();
});

app.use(express.static('.'));


app.listen(3000, function () {});
