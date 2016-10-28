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
			$.ajax({
				type: 'Get',
				url: '/resources',
				success: function( data )
				{
					generateResources(data.data);

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
		}
	});
	$("projects-table").fixedHeaderTable('show');
});

function setNewTotal( id, delta )
{
	//console.log("setNewTotal( "+id+", "+delta+" )");
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
				var resource = id[0];
				var project = id[1];
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

function generateHolidaysView( months )
{
	var start = "2016-10-01"; 
	var end = "2017-09-01";
	var $monthrow = $("<tr/>", {
		"class":"holiday-row",
	});
	$monthrow.append('<td><div class="holiday-row-label">Holidays</div></td>');
	for( var j=0; j<12; j++ )
	{
		var holidays = months[j+9].holidays;
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
		var work = months[j+9].work;
		if( months[j].holidays != null )
			work -= months[j].holidays;
		$monthrow.append('<td class="number">'+work+'</td>');
	}
	$("thead").append($monthrow);
}

function generateResources( data )
{
	for( var i=0; i<data.length; i++ )
	{
		addResourceRow( data[i].resource, data[i].last, data[i].first, data[i].department );
	}
}

function addResourceRow( id, last, first, department )
{
	var $resourcerow = $("<tr/>", {
		"class":"resource-row branch",
		"data-tt-id":id
	});
	var department_color = department+"-color";
	$resourcerow.append('<td><div class="project-adder">+</div><span class="'+department_color+'">&#x258A;</span><span class="resource">'+last+', '+first+'</span></td>');
	// Append the totals to the top row for the resource
	for( var j=10; j<13; j++ )
		$resourcerow.append('<td class="number totals" id="'+id+'-2016-'+j+'"></td>');
	for( var j=1; j<10; j++ )
		$resourcerow.append('<td class="number totals" id="'+id+'-2017-0'+j+'"></td>');
	// rows.push($resourcerow);
	$("#projections-table tbody").append($resourcerow);
}

function addProjectionRow( resource, project, title, month, hours )
{
	var $projectRow = $("tr[data-tt-id="+resource+"-"+project+"]");
	if( $projectRow.length == 0 )
		makeBlankProjectRow( resource, project, title );
	$("td[id="+resource+"-"+project+"-"+month+"]").text(hours);	
	updateTotal(resource, month, hours);
}

function updateTotal( resource, month, hours )
{
	var totalHours = 0;
	var totalCell = $("td[id="+resource+"-"+month+"]");
	var totalCellText = totalCell.text();
	if( totalCellText != "" )
		totalHours = parseInt(totalCell.text());
	totalHours += hours;
	totalCell.text(totalHours);
	
}

function makeBlankProjectRow( resource, project, title )
{
	$projectrow = $("<tr>", {
		"data-tt-id":resource+"-"+project,
		"data-tt-parent-id":resource,
		"class" : "project-row leaf collapsed"
	});
	$projectrow.append('<td><div class="project-deleter">x</div><span class="project">'+title+'</span></td>');
	for( var i=10; i<13; i++ )
	{
		$projectrow.append('<td id="'+resource+'-'+project+'-2016-'+i+'" class="number editable"></td>');
	}
	for( var i=1; i<10; i++ )
	{
		$projectrow.append('<td id="'+resource+'-'+project+'-2017-0'+i+'" class="number editable"></td>');
	}
	$("tr[data-tt-id="+resource+"]").after($projectrow);
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
		var projectTitle = projection.title;
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

function addProjectRow( resourceRow )
{
	$(".project-adder").off();
//	var resource = resourceRow.data("ttId");
	var resource = resourceRow.attr("data-tt-id");
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
	$("#projections-table").treetable("loadBranch", $("#projections-table").treetable("node", resource), $projectrow.prop("outerHTML") );
	// put a pull down selector for all the projects
	//$("#project-selector").change(projectSelected);

	$(".project-deleter").click( function()
	{
		// remove row from DOM
		removeProjectRow($(this).parent().parent());
		// delete from projections where project=X
	});

	$("#project-selector").editableSelect();
	$("#project-selector").on('select.editable-select', projectSelected);
	$("#project-selector").on('inputted.editable-select', projectInputted);
}

function findExcludedProjectIds( rowId )
{
	var subnodes = $("[data-tt-parent-id='"+rowId+"']");
	var ids = [];
	for( var i=0; i<subnodes.length; i++ )
	{
		ids.push($(subnodes[i]).attr("data-tt-id").split('-')[1]);
	}
	return ids;
}

function projectInputted(e, i)
{
	var projectTitle = e.target.value;
	$.post( "projects", {"title": projectTitle}, function( data, status )
	{
		if( data.status == "success" )
		{
			if( data.type == "insert" )
			{
				var projectId = data.project
				setProject( projectTitle, projectId );
				console.log(projects);
				projects.push({"title":projectTitle,"project":projectId});
			}
		}
	}); 
}

function projectSelected( e, i )
{
	console.log("projectSelected()");
	var projectTitle = i.text(); // $("select option:selected").text();
	console.log("	projecTitle = "+projectTitle);
	var projectId = i.val(); // $("select option:selected").attr("value");
	console.log("	projectId = "+projectId);

	setProject( projectTitle, projectId );
}

function setProject(projectTitle, projectId)
{
	var $projectRow = $("#ZZZZZ");
	// var resourceId = $projectRow.data("ttParentId");
	var resourceId = $projectRow.attr("data-tt-parent-id");
	console.log("	resourceId = "+resourceId);
	//var nodeId = $projectRow.data("ttId");
	var nodeId = $projectRow.attr("data-tt-Id");
	$projectRow.find(".project").text(projectTitle);
	$projectRow.removeAttr("data-tt-id");
	$projectRow.attr("data-tt-id", resourceId+"-"+projectId);
	$projectRow.removeAttr("id");
	$projectRow.attr("id",resourceId+"-"+projectId);
	$projectRow.removeAttr("id");
	for( var j=10; j<13; j++ )
	{
		$projectRow.append('<td id="'+resourceId+'-'+projectId+'-2016-'+j+'" class="number editable" contenteditable="true"></td>');
	}
	for( var j=1; j<10; j++ )
	{
		$projectRow.append('<td id="'+resourceId+'-'+projectId+'-2017-0'+j+'" class="number editable" contenteditable="true"></td>');
	}

	//var $node = $("#projections-table").treetable("node", nodeId);
	//$("#projections-table").treetable("loadBranch", $("#projections-table").treetable("node", resource), $projectrow.prop("outerHTML") );
	console.log("	project row = '"+$projectRow.prop("outerHTML")+"'");

	$(".editable").click(function(e)
	{
		postProjection( lastEdited );
		recomputeTotals();
		lastEdited = $(this);
		lastEditedNumber = $(this).text();
		e.stopPropagation();
	});
	$(".project-deleter").click( function()
	{
		removeProjectRow($(this).parent().parent());
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
}

function createProjectSelector( exclusions )
{
	//console.log(exclusions);
	var $projectSelector = $("<select id='project-selector'>");
	$projectSelector.append($("<option>"));
	for( var i=0; i<projects.length; i++ )
	{
		var projectId = projects[i].project;
		var projectTitle = projects[i].title;
		//console.log(projectId);
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
	var rowTtId = row.data("ttId");
	var rowId = row.attr("data-tt-id");
	console.log("removeProjectRow( "+rowId+" ) ");
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
		deleteMessage["resource"] = deleteData[0];
		deleteMessage["project"] = deleteData[1];
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
