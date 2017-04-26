// api endpoints for fo

var MongoClient = require('mongodb').MongoClient
	, assert = require('assert');
var express = require('express');
var cors = require('cors');
//var bodyParser = require('body-parser');
var app = express();

app.listen(3001);

//app.use(bodyParser.json()); // support json encoded bodies
app.use(cors());

var url = 'mongodb://localhost:27017/fo';


app.use (function(req, resp, next) {
    var data='';
    req.setEncoding('utf8');
    req.on('data', function(chunk) { 
       data += chunk;
    });

    req.on('end', function() {
        req.body = data;
        next();
    });
});

app.post('/api', function(req, resp)
{
	var data = JSON.parse(req.body);

	if(data.requestType == undefined)
	{
		resp.send({error: "requestType not given"});
	}
	else if(data.requestType.toString() == "add")
	{
		insert("data",data,function() {
			resp.send({success:true});
		});
	}
	else
	{
		resp.send({error: "requestType not defined in this api"});
	}

});

app.get('/api', function(request,response) {

	if(request.query.requestType == undefined)
	{
		response.send({error: "requestType not given"});
	}
	else if(request.query.requestType == "get")
	{
		getdb(function(db) {
			var data = db.collection("data");

			if(request.query.search != undefined && request.query.search != "")
			{
				data.find({"name": {'$regex': request.query.search, '$options':'i'}}).sort({hours:-1,minutes:-1}).limit(10).toArray(function(e,a) {response.json(a)});
			}
			else 
			{
				
				var skp = request.query.start == undefined ? 0 : parseInt(request.query.start);
				data.find().sort({hours:-1,minutes:-1}).skip(skp).limit(10).toArray(function(e,a) {response.json(a)});
			}
			//function(res) {
			//console.log(fmt);
			//response.send(fmt);

		})
		//response.send({send:false});
	}
	else if(request.query.requestType == "email")
	{
		if(request.query.email == undefined || request.query.email.length < 0) response.send({error: "email not found"});
		insert("email",{email: request.query.email}, function() {
			response.send({success:true});
		});

	}
	else
	{
		response.send({error: "requestType not defined in this api"});
	}
});



function getdb(callback)
{
	MongoClient.connect(url, function(err,db) {
		assert.equal(null, err);

		callback(db);

		db.close();
	})
}


function insert(col, data, callback)
{
	getdb(function(db) {
		var cl = db.collection(col);
		cl.insert(data);
		callback();
	})
}