var fs = require('fs');
var express = require('express');
var promise = require('promise');
var app = express();

//var router = express.Router();
var options = {
	promiseLib: promise
};
var mysql = require("promise-mysql");
var dbConfig = JSON.parse(fs.readFileSync('db-config.json', 'utf8'));
var db;
mysql.createConnection(dbConfig).then(
	function (connection)
	{
		db = connection;
	}
);
var bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());

function getProjections( req, res, next )
{
	db.query('select projection, month, projects.project, projects.title, resources.resource, resources.last, resources.first, hours from projections, projects, resources where projections.project=projects.project and resources.resource = projections.resource order by resources.department desc, resources.last desc, resources.first desc, projects.title desc, month;').then(
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
	var queryString = "select project, parent, p.project_status, project_statuses.name as project_status_name, title, chargenumber, start, end, manager, customer from project_statuses, (select p1.*, case when p2.parent is null then p2.title else p2.title end as parentTitle, case when p2.project_status=1 then 2 else p2.project_status end as parentStatus from projects p1, projects p2 where p1.parent = p2.project) p where p.project_status=project_statuses.project_status order by parentStatus, parentTitle, p.project_status asc, title;";
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
	if( req.body.hasOwnProperty("projection") )
	{
		var queryString = "update projections set hours="+req.body.hours+" where projection="+req.body.projection+";";
		db.query(queryString).then(function( data )
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
		console.log(queryString);
	}
	else
	{
		db.query("select projection from projections where month='"+req.body.month+"' and resource="+req.body.resource+" and project='"+req.body.project+"';").then( function(data)
		{
			if( data.length == 0 )
			{
				var queryString = "insert into projections (month, project, resource, hours) values ('"+req.body.month+"', "+req.body.project+", "+req.body.resource+", "+req.body.hours+");";
				db.query(queryString).then(function( data )
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
				console.log(queryString);
			}
			else
			{
				var projection = data[0].projection;
				var queryString = "update projections set hours="+req.body.hours+" where projection="+projection+";";
				db.query(queryString).then(function( data )
				{
					console.log(data);
					res.status(200).json(
					{
						status: 'success',
						type: 'update',
						projection: projection
					});
				}).catch( function( err )
				{
					return next(err);
				});
				console.log(queryString);
			}
		}).catch( function( err )
		{
			return next(err);
		});
	}
}

function removeProjections( req, res, next )
{
	if( req.body.project != null && req.body.resource != null )
	{
		var queryString = "delete from projections where project="+req.body.project+" and resource="+req.body.resource+";";
		console.log(queryString);
		db.query(queryString).then( function( data )
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
		var queryString = "update projects "
		// set up updates if the values are included
		queryString += "set "+req.body.column+" = '"+req.body.value+"'";
		queryString += " where project="+req.body.project+";";
		console.log(queryString);
		db.query(queryString).then(function( data )
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
		var queryString = "insert into projects (project_status, title) values (2, '"+req.body.title+"');";
		db.query(queryString).then(function( data )
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
		console.log(queryString);
	}
}

function postResources( req, res, next )
{
	console.log(req.body);
	if( req.body.resource != null )
	{
		// update project with new data
		var queryString = "update resources "
		// set up updates if the values are included
		queryString += "set "+req.body.column+" = '"+req.body.value+"'";
		queryString += " where resource="+req.body.resource+";";
		console.log(queryString);
		db.query(queryString).then(function( data )
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
		var queryString = "insert into resources (last, first, status) values ('"+req.body.last+"', '"+req.body.first+"', 'active');";
		db.query(queryString).then(function( data )
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
		console.log(queryString);
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
