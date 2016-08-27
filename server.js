var express = require('express');
var promise = require('promise');
var app = express();

//var router = express.Router();
var options = {
	promiseLib: promise
};
var mysql = require("promise-mysql");
var db;
mysql.createConnection(
{
	host: 'localhost',
	user: 'reebis',
	password: 'password',
	database: 'reebis'
}).then(function (connection) {
	db = connection;
});
var bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());

function getProjections( req, res, next )
{
	db.query('select projection, month, projects.project, projects.title, resources.resource, resources.last, resources.first, hours from projections, projects, resources where projections.project=projects.project and resources.resource = projections.resource order by resources.department, resources.last, resources.first, projects.title, month;').then(
		function( data )
		{
			res.status(200).json(
			{
				status: 'success',
				data: data,
				message: 'Retrieved projections'
			});
		}
	).catch( function(err)
	{
		return next(err);
	});
}

function getProjects( req, res, next )
{
	var queryString = "select project, parent, status, title, chargenumber, start, end, manager, customer from (select p1.*, case when p2.parent is null then p2.title else p2.title end as parentTitle from projects p1, projects p2 where p1.parent = p2.project) p  order by parentTitle, status desc, title;";
	db.query(queryString).then(
		function( data )
		{
			res.status(200).json(
			{
				status: 'success',
				data: data,
				message: 'Retrieved projects'
			});
		}
	).catch( function(err)
	{
		return next(err);
	});
}

function getResources( req, res, next )
{
	db.query('select * from resources;').then(
		function( data )
		{
			res.status(200).json(
			{
				status: 'success',
				data: data,
				message: 'Retrieved projects'
			});
		}
	).catch( function(err)
	{
		return next(err);
	});
}

function getMonths( req, res, next )
{
	db.query("select * from months where extract(YEAR from month)=2016 order by month;").then(
		function( data )
		{
			res.status(200).json(
			{
				status: 'success',
				data: data,
				message: 'Retrieved months'
			});
		}
	).catch( function(err)
	{
		return next(err);
	});
}

function postProjection( req, res, next )
{
	console.log(req.body);
	if( req.body.projection != null )
	{
		db.query("update projections set hours="+req.body.hours+" where projection="+req.body.projection+";").then(function( data )
		{
			console.log(data);
			res.status(200).json(
			{
				status: 'success',
				type: 'update',
				projection: req.body.projection
			});
		}).catch( function( err )
		{
			return next(err);
		});
		console.log("update projections set hours="+req.body.hours+" where projection="+req.body.projection+";");
	}
	else
	{
		db.query("insert into projections (month, project, resource, hours) values ('"+req.body.month+"', "+req.body.project+", "+req.body.resource+", "+req.body.hours+");").then(function( data )
		{
			console.log(data);
			res.status(200).json(
			{
				status: 'success',
				type: 'insert',
				projection: data.insertId
			});
		}).catch( function( err )
		{
			return next(err);
		});
		console.log("insert into projections (month, project, resource, hours) values ('"+req.body.month+"', "+req.body.project+", "+req.body.resource+", "+req.body.hours+");");
	}
}

function removeProjections( req, res, next )
{
	if( req.body.project != null && req.body.resource != null )
	{
		console.log("delete from projections where project="+req.body.project+" and resource="+req.body.resource+";");
		db.query("delete from projections where project="+req.body.project+" and resource="+req.body.resource+";").then( function( data )
		{
			res.status(200).json(
			{
				status: 'success',
				type: 'delete',
				project: req.body.project,
				resource: req.body.resource
			});
		}).catch( function( err )
		{
			return next(err);
		});
	}
}

function postProjects( req, res, next )
{
	console.log(req.body);
	if( req.body.project != null )
	{
		// update project with new data
		var queryStr = "update projects "
		// set up updates if the values are included
		queryStr += "set "+req.body.column+" = '"+req.body.value+"'";
		queryStr += " where project="+req.body.project+";";
		console.log(queryStr);
		db.query(queryStr).then(function( data )
		{
			console.log(data);
			res.status(200).json(
			{
				status: 'success',
				type: 'update',
				project: req.body.project
			});
		}).catch( function( err )
		{
			return next(err);
		});
	}
	else
	{
		var queryStr = "insert into projects (status, title) values ('Active', '"+req.body.title+"');";
		db.query(queryStr).then(function( data )
		{
			console.log(data);
			db.query("update projects set parent="+data.insertId+" where project="+data.insertId+";");
			res.status(200).json(
			{
				status: 'success',
				type: 'insert',
				project: data.insertId
			});
		}).catch( function( err )
		{
			return next(err);
		});
		console.log(queryStr);
	}
}

function postResources( req, res, next )
{
	console.log(req.body);
	if( req.body.resource != null )
	{
		// update project with new data
		var queryStr = "update resources "
		// set up updates if the values are included
		queryStr += "set "+req.body.column+" = '"+req.body.value+"'";
		queryStr += " where resource="+req.body.resource+";";
		console.log(queryStr);
		db.query(queryStr).then(function( data )
		{
			console.log(data);
			res.status(200).json(
			{
				status: 'success',
				type: 'update',
				resource: req.body.resource
			});
		}).catch( function( err )
		{
			return next(err);
		});
	}
	else
	{
		var queryStr = "insert into resources (last) values ('"+req.body.last+"');";
		db.query(queryStr).then(function( data )
		{
			console.log(data);
			res.status(200).json(
			{
				status: 'success',
				type: 'insert',
				resource: data.insertId
			});
		}).catch( function( err )
		{
			return next(err);
		});
		console.log(queryStr);
	}
}

app.get('/projections', getProjections);
app.get('/projects', getProjects);
app.post('/projects', postProjects);
app.get('/resources', getResources);
app.post('/resources', postResources)
app.get('/months', getMonths);
app.post('/projections', postProjection);
app.delete('/projections', removeProjections);

app.use( '/', express.static(__dirname+'/public'));
app.use( '/scripts', express.static(__dirname+'/node_modules'));
var port = 3000;
app.listen(port);
console.log("listening on port "+port);
