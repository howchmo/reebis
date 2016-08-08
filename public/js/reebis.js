var lastEdited = null;
var lastEditedNumber = "";
var collapsed = true;
var projects = null;

$(function() {
	// Load the data from the web service
	$.ajax( {
		type: 'Get',
		url: '/months',
		success: function( data )
		{
			generateHolidaysView( data.data );
			generateMaxHoursPerMonthView( data.data );
			$.ajax( {
				type:'Get',
				url:'/projections',
				success: function( data )
				{
					// Generate the view from the data retrieved
					generateOverview( data.data );
					// Make it a treetable
					$("#overview").treetable({ expandable: true })
					$(".editable").attr("contenteditable", "true");
					$(".editable").click(function(e)
					{
						postProjection( lastEdited );
						recomputeTotals();
						lastEdited = $(this);
						lastEditedNumber = $(this).text();
						e.stopPropagation();
					});
					$(".project-adder").click( function()
					{
						var resourceRow = $(this).parent().parent();
						// retrieve projects if you have not already done so
						if( projects == null )
						{
							$.get( "/projects", function( data, status )
							{
								projects = data.data;
								addProjectRow(resourceRow);
							});
						}
						else
							addProjectRow(resourceRow);
					});
					$(".project-deleter").click( function()
					{
						// remove row from DOM
						removeProjectRow($(this).parent().parent());
					});
					$(document).click( function()
					{
						postProjection( lastEdited );
						recomputeTotals();
					});
					$(document).on('keypress', function(e)
					{
						var keyCode = e.keyCode || e.which;
						if( keyCode == 13 )
						{
							e.preventDefault();
							postProjection(lastEdited);
							recomputeTotals();
							lastEdited = $(":focus");
							lastEditedNumber = lastEdited.text();
						}
					});
					$(document).on('keyup', function(e)
					{
						var keyCode = e.keyCode || e.which;
						if( keyCode == 9 )
						{
							postProjection(lastEdited);
							recomputeTotals();
							lastEdited = $(":focus");
							lastEditedNumber = lastEdited.text();
						}
					});
					$(".all-expander").click( toggleAllExpander );
				}
			});
		}
	});
});

function setNewTotal( id, delta )
{
	console.log("setNewTotal( "+id+", "+delta+" )");
	if( delta != 0 && !isNaN(delta) )
	{
		var ids = id.split("-");
		var totalId = ids[0]+"-"+ids[2];
		var total = $("#"+totalId).text();
		if( total == "" )
			total = 0;
		var newTotal = parseInt(total) + delta;
		if( isNaN(newTotal) || newTotal == 0 )
			$("#"+totalId).text("");
		else
			$("#"+totalId).text(newTotal);
	}
}

function recomputeTotals()
{
	if( lastEdited != null )
	{
		// check to make sure it is a number
		// sum it up
		if( lastEditedNumber == "" )
			lastEditedNumber = 0;
		var subtractor = 0;
		if( lastEdited.text() != "" )
			subtractor = parseInt(lastEdited.text());
		var difference = subtractor - parseInt(lastEditedNumber);
		//console.log(lastEdited.text()+" - "+lastEditedNumber);
		//console.log("difference == \""+difference+"\"");
		setNewTotal( lastEdited.attr("id"), difference );
		lastEdited = null;
		lastEditedNumber = "";
	}
}

function postProjection( cell )
{
	if( cell != null )
	{
		//console.log("postProjection("+cell.text()+")");
		//console.log("lastEditedNumber = "+lastEditedNumber);
		if( cell.text() != lastEditedNumber )
		{
			var hours = 0;
			if( cell.text() != "" && !isNaN(cell.text()) )
				hours = cell.text();
			var postMessage = {};
			if( cell.attr('data-projection-id') == null )
			{
				var id = cell.attr('id').split('-');
				var resource = id[0];
				var project = id[1];
				var month = "2016-";
				if( id[2].length < 2 )
					month += "0";
				month += id[2]+"-01";
				postMessage['month'] = month;
				postMessage['resource'] = resource;
				postMessage['project'] = project;
				postMessage['hours'] = hours;
			}
			else
			{
				postMessage['projection'] = cell.attr('data-projection-id');
				postMessage['hours'] = hours;
			}
			//console.log(JSON.stringify(postMessage));
			$.post( "projections", postMessage, function( data, status ) {
				//console.log("POST data = "+JSON.stringify(data));
				if( data.status == 'success' )
				{
					if( data.type == "insert" )
					{
						cell.attr('data-projection-id', data.projection);
					}
				}
				else
				{
					// error handling here
					alert("Something went wrong on the server!");
				}
			});
		}
	}
}

function generateHolidaysView( months )
{
	var $monthrow = $("<tr/>", {
		"class":"holiday-row",
	});
	$monthrow.append('<td><div class="holiday-row-label">Holidays</div></td>');
	for( var j=0; j<12; j++ )
	{
		var holidays = months[j].holidays;
		if( holidays != null )
			$monthrow.append('<td class="number">'+holidays+'</td>');
		else
			$monthrow.append('<td class="number"></td>');
	}
	$("thead").append($monthrow);
}

function generateMaxHoursPerMonthView( months )
{
	var $monthrow = $("<tr/>", {
		"class":"max-row",
	});
	$monthrow.append('<td><div class="max-row-label">Max Working Hours</div></td>');
	for( var j=0; j<12; j++ )
	{
		var work = months[j].work;
		if( months[j].holidays != null )
			work -= months[j].holidays;
		$monthrow.append('<td class="number">'+work+'</td>');
	}
	$("thead").append($monthrow);
}

function generateOverview( data )
{
	var totals = {};
	var rows = [];
	var resource = "";
	var month = "";
	var project = "";
	var totalHours = 0;
	var $projectrow = null;
	var prevMonth = 0;
	for( var i=0; i<data.length; i++ )
	{
		if( resource != data[i].resource )
		{
			if( $projectrow != null )
			{
				//console.log("really end month columns from "+(prevMonth+1)+" to 12");
				if( month+1 < 13 )
				{
					for( var j=month+1; j<13; j++ )
					{
						$projectrow.append('<td id="'+resource+'-'+project+'-'+j+'" class="number editable"></td>');
					}
				}
				prevMonth = 0;
				rows.push($projectrow);
				$projectrow = null;
			}
			// New resource, so write out the old resource
			if( rows.length > 0 )
			{
				// Append the totals to the top row for the resource
				for( var j=1; j<13; j++ )
				{
					if( totals[resource][j] == null )
						$resourcerow.append('<td class="number totals" id="'+resource+'-'+j+'"></td>');
					else
						$resourcerow.append('<td class="number totals" id="'+resource+'-'+j+'">'+totals[resource][j]+'</td>');
				}
				// Append all the rows to the table
				for( var r=0; r<rows.length; r++ )
				{
					$("tbody").append(rows[r]);
				}
				// Reset all the variables we collect for totals
				rows = [];
				totalHours = 0;
			}
			resource = data[i].resource;
			totals[resource] = [];
			// create top table row
			var $resourcerow = $("<tr/>", {
				"class":"resource-row",
				"data-tt-id":resource
			});
			$resourcerow.append('<td><div class="project-adder">+</div><span class="resource">'+data[i].last+', '+data[i].first+'</span></td>');
			// delay writing out the resource data until we have totals
			rows.push($resourcerow);
			project = "";
		}

		var dateObj = new Date(data[i].month);
		var month = parseInt(dateObj.getMonth())+1;
		if( project != data[i].project ) // New project row
		{
			// if there is a projectrow and all the month columns have not been filled out in the previous row
			// then pad to the end
			if( $projectrow != null )
			{
				// pad the ending month columns
				if( prevMonth+1 < 13 )
				{
					//console.log("end month columns from "+(prevMonth+1)+" to 12");
					for( var j=prevMonth+1; j<13; j++ )
					{https://www.google.com/search?client=ubuntu&channel=fs&q=javascript+force+string&ie=utf-8&oe=utf-8
						$projectrow.append('<td id="'+resource+'-'+project+'-'+j+'" class="number editable"></td>');
					}
				}https://www.google.com/search?client=ubuntu&channel=fs&q=javascript+force+string&ie=utf-8&oe=utf-8
				prevMonth = 0;
				rows.push($projectrow);
			}
			project = data[i].project;
			// create project row
			$projectrow = $("<tr>", {
				"data-tt-id":resource+"-"+project,
				"data-tt-parent-id":resource,
				"class" : "project-row"
			});
			$projectrow.append('<td><div class="project-deleter">x</div><span class="project">'+data[i].title+'</span></td>');
		}
		// pad month columns from the previous month to the current month
		if( prevMonth+1 < month )
		{
			//console.log("pad month columns from "+(prevMonth+1)+" to "+month);
			for( var j=prevMonth+1; j<month; j++ )
			{
				$projectrow.append('<td id="'+resource+'-'+project+'-'+j+'" class="number editable"></td>');
			}
		}
		hours = data[i].hours;
		// what if we haven't calculated totals yet?
		if( totals[resource][month] == null )
			totals[resource][month] = 0;
		// calculate totals
		totals[resource][month] += hours;
		// add the hours column
		//console.log("add "+hours+" hours for month "+month);
		$projectrow.append('<td id="'+resource+'-'+project+'-'+month+'" data-projection-id="'+data[i].projection+'" class="number editable">'+hours+'</td>');
		prevMonth = month;
		// delay putting it in the DOM until we have totals
	}
}

function toggleAllExpander()
{
	if( collapsed )
	{
		$(".all-expander").removeClass("collapsed");
		$(".all-expander").addClass("expanded");
		$("#overview").treetable('expandAll');
		collapsed = false;
	}
	else
	{
		$(".all-expander").removeClass("expanded");
		$(".all-expander").addClass("collapsed");
		$("#overview").treetable('collapseAll');
		collapsed = true;
	}
}

function addProjectRow( resourceRow )
{
	var resource = resourceRow.data("ttId");
	var excludedProjectIds = findExcludedProjectIds( resource );
	var $projectSelector = createProjectSelector(excludedProjectIds);
	// add another row to the DOM
	var $projectrow = $("<tr>", {
		"id":"ZZZZZ",
		"data-tt-id":resource+"-?",
		"data-tt-parent-id":resource,
		"class" : "project-row leaf collapsed"
	});
	$projectrow.append('<td><div class="project-deleter">x</div><span class="project">'+$projectSelector.prop('outerHTML')+'</span></td>');
	$("#overview").treetable("loadBranch", $("#overview").treetable("node", resource), $projectrow.prop("outerHTML") );
	// put a pull down selector for all the projects
	$("#project-selector").change(projectSelected);
	$(".project-deleter").click( function()
	{
		// remove row from DOM
		removeProjectRow($(this).parent().parent());
		// delete from projections where project=X
	});
}

function findExcludedProjectIds( rowId )
{
	var subnodes = $("[data-tt-parent-id='"+rowId+"']");
	var ids = [];
	for( var i=0; i<subnodes.length; i++ )
	{
		ids.push($(subnodes[i]).data("ttId").split('-')[1]);
	}
	return ids;
}

function projectSelected()
{
	console.log("projectSelected()");
	var projectTitle = $("select option:selected").text();
	var projectId = $("select option:selected").attr("value");
	var $projectRow = $("#ZZZZZ");
	var resourceId = $projectRow.data("ttParentId");
	$projectRow.find(".project").text(projectTitle);
	$projectRow.removeAttr("data-tt-id");
	$projectRow.attr("data-tt-id", resourceId+"-"+projectId);
	$projectRow.removeAttr("id");
	$projectRow.attr("id",resourceId+"-"+projectId);
	$projectRow.removeAttr("id");
	for( var j=1; j<13; j++ )
	{
		$projectRow.append('<td id="'+resourceId+'-'+projectId+'-'+j+'" class="number editable" contenteditable="true"></td>');
	}
	$(".editable").click(function(e)
	{
		postProjection( lastEdited );
		recomputeTotals();
		lastEdited = $(this);
		lastEditedNumber = $(this).text();
		e.stopPropagation();
	});
}

function createProjectSelector( exclusions )
{
	console.log(exclusions);
	var $projectSelector = $("<select id='project-selector'>");
	$projectSelector.append($("<option>"));
	for( var i=0; i<projects.length; i++ )
	{
		var projectId = projects[i].project;
		var projectTitle = projects[i].title;
		console.log(projectId);
		if( exclusions.indexOf(projectId.toString()) < 0 )
		{
			var $option = $("<option>", {"value":projectId}).text(projectTitle);
			$projectSelector.append($option);
		}
	}
	return $projectSelector;
}

function removeProjectRow( row )
{
	var rowId = row.data("ttId");
	console.log("removeProjectRow( "+rowId+" )");
	if( !rowId.includes("?") )
	{
		for( var i=1; i<13; i++ )
		{
			var id = rowId+"-"+i;
			if( $("#"+id) != null )
			{
				var delta = -parseInt($("#"+id).text());
				setNewTotal(id, delta);
			}
		}
	}
	//console.log("removeProjectRow( "+rowId+" )");
	$("#overview").treetable("removeNode", rowId);
	// console.log("delete from projections");
	var deleteData = rowId.split("-");
	var deleteMessage = {};
	deleteMessage["resource"] = deleteData[0];
	deleteMessage["project"] = deleteData[1];
	$.ajax(
	{
		url: "/projections",
		type: 'DELETE',
		data: deleteMessage,
		success: function( data, status )
		{
			console.log(data);
		}
	});
}
