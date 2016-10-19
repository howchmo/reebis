var lastEdited = null;
var lastEditedNumber = "";
var collapsed = true;
var resources = null;

$(function() {
	// Load the data from the web service
	$.ajax( {
		type: 'Get',
		url: '/months',
		success: function( data )
		{
			$.ajax({
				type: 'Get',
				url: '/projects',
				success: function( data )
				{
					generateProjects(data.data);
					$.ajax( {
						type:'Get',
						url:'/projections',
						success: function( data )
						{
							// Generate the view from the data retrieved
							generateProjections( data.data );
							
							// Make it a treetable
							$("#projections-table").treetable({ expandable: true })
							$(".editable").attr("contenteditable", "true");
							$(".editable").click(function(e)
							{
								postProjection( lastEdited );
								recomputeTotals();
								lastEdited = $(this);
								lastEditedNumber = $(this).text();
								e.stopPropagation();
							});
							$(".resource-adder").click( function()
							{
								var projectRow = $(this).parent().parent();
								// retrieve resources if you have not already done so
								if( resources == null )
								{
									$.get( "/resources", function( data, status )
									{
										resources = data.data;
										addResourceRow(projectRow);
									});
								}
								else
									addResourceRow(projectRow);
							});
							$(".resource-deleter").click( function()
							{
								// remove row from DOM
								removeRow($(this).parent().parent());
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
		}
	});
});

function setNewTotal( id, delta )
{
	// console.log("setNewTotal( "+id+", "+delta+" )");
	if( delta != 0 && !isNaN(delta) )
	{
		var ids = id.split("-");
		var totalId = ids[0]+"-"+ids[2]+"-"+ids[3];
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
				var project = id[0];
				var resource = id[1];
				var month = id[2]+"-"+id[3]+"-01";
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

function generateProjects( data )
{
	for( var i=0; i<data.length; i++ )
	{
		addProjectRow( data[i].project, data[i].title );
	}
}

function addProjectRow( id, title )
{
	var $projectrow = $("<tr/>", {
		"class":"resource-row branch",
		"data-tt-id":id
	});
	$projectrow.append('<td><div class="resource-adder">+</div><span class="resource">'+title+'</span></td>');
	// Append the totals to the top row for the resource
	for( var j=10; j<13; j++ )
		$projectrow.append('<td class="number totals" id="'+id+'-2016-'+j+'"></td>');
	for( var j=1; j<10; j++ )
		$projectrow.append('<td class="number totals" id="'+id+'-2017-0'+j+'"></td>');
	// rows.push($resourcerow);
	$("#projections-table tbody").append($projectrow);
}

function addProjectionRow( resource, project, title, month, hours )
{
	var $resourceRow = $("tr[data-tt-id="+project+"-"+resource+"]");
	if( $resourceRow.length == 0 )
		makeBlankResourceRow( resource, project, title );
	$("td[id="+project+"-"+resource+"-"+month+"]").text(hours);
	updateTotal(project, month, hours);
}

function updateTotal( project, month, hours )
{
	var totalHours = 0;
	var totalCell = $("td[id="+project+"-"+month+"]");
	var totalCellText = totalCell.text();
	if( totalCellText != "" )
		totalHours = parseInt(totalCell.text());
	totalHours += hours;
	totalCell.text(totalHours);
	
}

function makeBlankResourceRow( resource, project, title )
{
	$resourcerow = $("<tr>", {
		"data-tt-id":project+"-"+resource,
		"data-tt-parent-id":project,
		"class" : "project-row leaf collapsed"
	});
	$resourcerow.append('<td><div class="resource-deleter">x</div><span class="project">'+title+'</span></td>');
	for( var i=10; i<13; i++ )
		$resourcerow.append('<td id="'+project+'-'+resource+'-2016-'+i+'" class="number editable"></td>');
	for( var i=1; i<10; i++ )
		$resourcerow.append('<td id="'+project+'-'+resource+'-2017-0'+i+'" class="number editable"></td>');
	$("tr[data-tt-id="+project+"]").after($resourcerow);
}

function generateProjections( data )
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
		var projection = data[i];
		var resource = projection.resource;
		var projectId = projection.project;
		var projectTitle = projection.last + ", "+ projection.first;
		var splitDate = projection.month.split("-");
		var month = splitDate[0]+"-"+splitDate[1];	
		var hours = projection.hours;

		addProjectionRow(resource, projectId, projectTitle, month, hours);
	}
}

function toggleAllExpander()
{
	if( collapsed )
	{
		$(".all-expander").removeClass("collapsed");
		$(".all-expander").addClass("expanded");
		$("#projections-table").treetable('expandAll');
		collapsed = false;
	}
	else
	{
		$(".all-expander").removeClass("expanded");
		$(".all-expander").addClass("collapsed");
		$("#projections-table").treetable('collapseAll');
		collapsed = true;
	}
}

function addResourceRow( projectRow )
{
	$(".resource-adder").off();
//	var resource = resourceRow.data("ttId");
	var project = projectRow.attr("data-tt-id");
	var excludedResourceIds = findExcludedIds( project );
	var $resourceSelector = createResourceSelector(excludedResourceIds);
	// add another row to the DOM
	var $resourcerow = $("<tr>", {
		"id":"ZZZZZ",
		"data-tt-id":project+"-?",
		"data-tt-parent-id":project,
		"class" : "project-row leaf collapsed"
	});
	$resourcerow.append('<td><div class="resource-deleter">x</div><span class="project">'+$resourceSelector.prop('outerHTML')+'</span></td>');
	$("#projections-table").treetable("loadBranch", $("#projections-table").treetable("node", project), $resourcerow.prop("outerHTML") );
	// put a pull down selector for all the projects
	//$("#resource-selector").change(projectSelected);

	$(".resource-deleter").click( function()
	{
		// remove row from DOM
		removeRow($(this).parent().parent());
		// delete from projections where project=X
	});

	$("#resource-selector").editableSelect();
	$("#resource-selector").on('select.editable-select', resourceSelected);
	$("#resource-selector").on('inputted.editable-select', resourceInputted);
}

function findExcludedIds( rowId )
{
	var subnodes = $("[data-tt-parent-id='"+rowId+"']");
	var ids = [];
	for( var i=0; i<subnodes.length; i++ )
	{
		ids.push($(subnodes[i]).attr("data-tt-id").split('-')[1]);
	}
	return ids;
}

function resourceInputted(e, i)
{
	var resourceName = e.target.value;
	var resourceNameArray = e.target.value.split(", ");
	$.post( "resources", {"last": resourceNameArray[0], "first": resourceNameArray[1]}, function( data, status )
	{
		if( data.status == "success" )
		{
			if( data.type == "insert" )
			{
				var resourceId = data.resource;
				setResource( resourceName, resourceId );
				console.log(resources);
				resources.push({"last":resourceNameArray[0], "first":resourceNameArray[1],"resource":resourceId});
			}
		}
	}); 
}

function resourceSelected( e, i )
{
	console.log("resourceSelected()");
	var resourceName = i.text(); // $("select option:selected").text();
	console.log("	resourceTitle = "+resourceName);
	var resourceId = i.val(); // $("select option:selected").attr("value");
	console.log("	resourceId = "+resourceId);

	setResource( resourceName, resourceId );
}

function setResource(resourceName, resourceId)
{
	var $resourceRow = $("#ZZZZZ");
	// var resourceId = $resourceRow.data("ttParentId");
	var projectId = $resourceRow.attr("data-tt-parent-id");
	console.log("	projectId = "+resourceId);
	//var nodeId = $resourceRow.data("ttId");
	var nodeId = $resourceRow.attr("data-tt-Id");
	$resourceRow.find(".project").text(resourceName);
	$resourceRow.removeAttr("data-tt-id");
	$resourceRow.attr("data-tt-id", projectId+"-"+resourceId);
	$resourceRow.removeAttr("id");
	$resourceRow.attr("id", projectId+"-"+resourceId);
	$resourceRow.removeAttr("id");
	for( var j=10; j<13; j++ )
		$resourceRow.append('<td id="'+projectId+'-'+resourceId+'-2016-'+j+'" class="number editable" contenteditable="true"></td>');
	for( var j=1; j<10; j++ )
		$resourceRow.append('<td id="'+projectId+'-'+resourceId+'-2017-0'+j+'" class="number editable" contenteditable="true"></td>');

	//var $node = $("#resourceions-table").treetable("node", nodeId);
	//$("#resourceions-table").treetable("loadBranch", $("#resourceions-table").treetable("node", resource), $resourcerow.prop("outerHTML") );
	console.log("	resource row = '"+$resourceRow.prop("outerHTML")+"'");

	$(".editable").click(function(e)
	{
		postProjection( lastEdited );
		recomputeTotals();
		lastEdited = $(this);
		lastEditedNumber = $(this).text();
		e.stopPropagation();
	});
	$(".resource-deleter").click( function()
	{
		removeRow($(this).parent().parent());
	});
	$(".resource-adder").click( function()
	{
		var resourceRow = $(this).parent().parent();
		// retrieve resources if you have not already done so
		if( resources == null )
		{
			$.get( "/resources", function( data, status )
			{
				resources = data.data;
				addResourceRow(resourceRow);
			});
		}
		else
			addResourceRow(resourceRow);
	});
}

function createResourceSelector( exclusions )
{
	//console.log(exclusions);
	var $resourceSelector = $("<select id='resource-selector'>");
	$resourceSelector.append($("<option>"));
	for( var i=0; i<resources.length; i++ )
	{
		var resourceId = resources[i].resource;
		var resourceName = resources[i].last +", "+resources[i].first;
		console.log(resourceId+" "+resourceName);
		if( exclusions.indexOf(resourceId.toString()) < 0 )
		{
			var $option = $("<option>", {"value":resourceId}).text(resourceName);
			$resourceSelector.append($option);
		}
	}
	return $resourceSelector;
}

function removeRow( row )
{
	var rowTtId = row.data("ttId");
	var rowId = row.attr("data-tt-id");
	//console.log("removeRow( "+rowId+" ) ");
	if( !rowId.includes("?") )
	{
		for( var i=10; i<13; i++ )
		{
			var id = rowId+"-2016-"+i;
			if( $("#"+id) != null )
			{
				var delta = -parseInt($("#"+id).text());
				setNewTotal(id, delta);
			}
		}
		for( var i=1; i<10; i++ )
		{
			var id = rowId+"-2017-0"+i;
			if( $("#"+id) != null )
			{
				var delta = -parseInt($("#"+id).text());
				setNewTotal(id, delta);
			}
		}
	}
	$("#projections-table").treetable("removeNode", rowTtId);
	if( !rowId.includes("?") )
	{
		var deleteData = rowId.split("-");
		var deleteMessage = {};
		deleteMessage["resource"] = deleteData[1];
		deleteMessage["project"] = deleteData[0];
		$.ajax(
		{
			url: "/projections",
			type: 'DELETE',
			data: deleteMessage,
			success: function( data, status )
			{
				//console.log(data);
			}
		});
	}
}
