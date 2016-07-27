var express = require('express');
var app = express();
//var router = express.Router();
var pgp = require("pg-promise")(/* options */);
var db = pgp("postgres://postgres:postgres@localhost:5432/reebis");
var bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());

function getProjections( req, res, next )
{
	db.any('select month, projects.title, resource, hours from projections, projects where projections.project = projects.project order by resource, projects.title, month').then(
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
	db.any('select * from projects;').then(
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
	db.any('select * from resources;').then(
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

app.get('/projections', getProjections);
app.get('/projects', getProjects);
app.get('/resources', getResources);

app.use( '/', express.static(__dirname+'/public'));
app.use( '/scripts', express.static(__dirname+'/node_modules/'));
app.listen(8888, "127.0.0.1");
