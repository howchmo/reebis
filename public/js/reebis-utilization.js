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
							$(".editable").mousedown(function(e)
							{
								console.log("editable mousedown "+lastEdited);
								postProjection( lastEdited );
								recomputeTotals();
								lastEdited = $(this);
								console.log("    "+lastEdited.attr("id"));
								lastEditedNumber = lastEdited.attr("hours");
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
								if( $(":focus").hasClass("editable") == false )
								{
									postProjection( lastEdited );
									recomputeTotals();
								}
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
									lastEditedNumber = lastEdited.attr("hours");
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
									lastEditedNumber = lastEdited.attr("hours");
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

function recomputeTotals()
{
	if( lastEdited != null )
	{
		// check to make sure it is a number
		// sum it up
		if( lastEditedNumber == "" )
			lastEditedNumber = 0;
		var subtractor = 0;
		if( lastEdited.attr("hours") != "" )
			subtractor = parseInt(lastEdited.attr("hours"));
		var difference = subtractor - parseInt(lastEditedNumber);
		//console.log(lastEdited.text()+" - "+lastEditedNumber);
		//console.log("difference == \""+difference+"\"");
		setNewTotal( lastEdited.attr("id"), difference );
		console.log("recomputeTotals: lastEdited=="+lastEdited.attr("id")+" "+lastEditedNumber);
		lastEdited = null;
		lastEditedNumber = "";
	}
	else
	{
		console.log("recomputeTotals: lastEdited == null");
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
	var start = "2017-01-01"; 
	var end = "2017-12-01";
	var $monthrow = $("<tr/>", {
		"class":"holiday-row",
	});
	$monthrow.append('<td><div class="holiday-row-label">Holidays</div></td>');
	for( var j=1; j<13; j++ )
	{
		var holidays = months[j-1].holidays;
		var monthString = ("0"+j).slice(-2);
		if( holidays != null )
			$monthrow.append('<td id="holiday-2017-'+monthString+'" class="number">'+holidays+'</td>');
	}
	$("thead").append($monthrow);
}

function generateMaxHoursPerMonthView( months )
{
	var $monthrow = $("<tr/>", {
		"class":"max-row",
	});
	$monthrow.append('<td><div class="max-row-label">Max Working Hours</div></td>');
	for( var j=1; j<13; j++ )
	{
		var work = months[j-1].work;
		if( months[j-1].holidays != 0 )
			work -= months[j-1].holidays;
		var monthString = ("0"+j).slice(-2);
		$monthrow.append('<td id="max-2017-'+monthString+'" class="number">'+work+'</td>');
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
		"class":"resource-row branch dept-"+department,
		"data-tt-id":id
	});
	var department_color = department+"-color";
	$resourcerow.append('<td class="resource-row-label"><div class="project-adder">+</div><span class="'+department_color+'">&#x258A;</span><span class="resource">'+last+', '+first+'</span></td>');
	// Append the totals to the top row for the resource
	for( var j=1; j<13; j++ )
	{
		var monthString = ("0"+j).slice(-2);
		$resourcerow.append('<td class="number totals blank-utilization" id="'+id+'-2017-'+monthString+'"></td>');
	}
	// rows.push($resourcerow);
	$("#projections-table tbody").append($resourcerow);
}

function addProjectionRow( resource, project, title, month, hours, project_status )
{
	var $projectRow = $("tr[data-tt-id="+resource+"-"+project+"]");
	if( $projectRow.length == 0 )
		makeBlankProjectRow( resource, project, title, project_status );
	$("td[id="+resource+"-"+project+"-"+month+"]").text(hours);
	if( project_status == 3 )
	{
		$projectRow.addClass("speculation");
		$("td[id="+resource+"-"+project+"-"+month+"]").addClass("speculation");
	}
	updateTotal(resource, month, hours);
}

function isSpeculation( resource, month )
{
	var $resourceMonths = $("td[id^="+resource+"-][id$=-"+month+"]");
	for( var i=1; i<$resourceMonths.length; i++ )
	{
		if( $($resourceMonths[i]).hasClass("speculation") && $($resourceMonths[i]).text() != "" && $($resourceMonths[i]).text() != "0" )
		{
			return true;
		}
	}
	return false;
}

function setNewTotal( id, delta )
{
	//console.log("setNewTotal( "+id+", "+delta+" )");
	if( delta != 0 && !isNaN(delta) )
	{
		var ids = id.split("-");
		var totalId = ids[0]+"-"+ids[2]+"-"+ids[3];
		var total = $("#"+totalId).attr("hours");
		if( total == "" )
			total = 0;
		var newTotal = parseInt(total) + delta;
		if( isNaN(newTotal) || newTotal == 0 )
		{
			$("#"+totalId).attr("hours") = "";
			//$("#"+totalId).text("");
		}
		else
		{
			$("#"+totalId).attr("hours") = newTotal;
			//$("#"+totalId).text(newTotal);
		}
	}
	updateTotalStyles(id);
}

function updateTotal( resource, month, hours )
{
	var id=resource+"-"+month;
	var totalHours = 0;
	var totalCell = $("td[id="+resource+"-"+month+"]");
	if( typeof totalCell.attr("hours") !== 'undefined' && !isNaN(totalCell.attr("hours")) )
	{
		totalHours = parseInt(totalCell.attr("hours"));
	}
	totalHours += hours;
	if( totalHours == 0 )
	{
		totalCell.attr("hours", "");
		totalCell.text("0 %");
	}
	else
	{
		totalCell.attr("hours", totalHours);
		var maxHours = parseInt($("td[id='max-"+month+"']").text());
		var percent = Math.ceil(totalHours/maxHours*100);
		totalCell.text(percent+" %");
	}
	updateTotalStyles( id )
}

function updateTotalStyles( id )
{
	var split = id.split("-");
	var month = split[split.length-2]+"-"+split[split.length-1];
	var resource = split[0];
	var totalCell = $("td[id="+resource+"-"+month+"]");
	var totalHours = parseInt(totalCell.attr("hours"));
	var maxHours = parseInt($("td[id='max-"+month+"']").text());
	
	totalCell.removeClass("speculation");
	if( totalHours > maxHours )
	{
		totalCell.removeClass("correct-utilization");
		totalCell.removeClass("blank-utilization");
		totalCell.removeClass("under");
		totalCell.addClass("over");
	}
	if( totalHours < maxHours )
	{
		totalCell.removeClass("correct-utilization");
		totalCell.removeClass("blank-utilization");
		totalCell.addClass("under");
		totalCell.removeClass("over");
	}
	if( totalHours == maxHours )
	{
		totalCell.addClass("correct-utilization");
		totalCell.removeClass("blank-utilization");
		totalCell.removeClass("under");
		totalCell.removeClass("over");
	}
	
	if( isSpeculation( resource, month ) )
	{
		totalCell.addClass("speculation");
		totalCell.removeClass("correct-utilization");
		totalCell.removeClass("blank-utilization");
		totalCell.removeClass("under");
		totalCell.removeClass("over");
	}	

	totalCell.trigger("create");
}

function makeBlankProjectRow( resource, project, title, project_status )
{
	$projectrow = $("<tr>", {
		"data-tt-id":resource+"-"+project,
		"data-tt-parent-id":resource,
		"class" : "project-row leaf collapsed"
	});
	if( project_status == 3 )
		$($projectrow).addClass("speculation");
	$projectrow.append('<td><div class="project-deleter">x</div><span class="project">'+title+'</span></td>');
	for( var i=1; i<13; i++ )
	{
		var monthString = ("0"+i).slice(-2);
		if( project_status == 3 )
			$projectrow.append('<td id="'+resource+'-'+project+'-2017-'+monthString+'" class="number editable speculation"></td>');
		else
			$projectrow.append('<td id="'+resource+'-'+project+'-2017-'+monthString+'" class="number editable"></td>');

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
		var project_status = projection.project_status;

		addProjectionRow(resource, projectId, projectTitle, month, hours, project_status);
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
				projects.push({"title":projectTitle,"project":projectId});
			}
		}
	}); 
}

function projectSelected( e, i )
{
	var projectTitle = i.text(); // $("select option:selected").text();
	var projectId = i.val(); // $("select option:selected").attr("value");
	var projectStatus = i.attr("project_status");
	console.log("project_status = "+projectStatus);

	setProject( projectTitle, projectId, projectStatus );
}

function setProject(projectTitle, projectId, projectStatus )
{
	var $projectRow = $("#ZZZZZ");
	// var resourceId = $projectRow.data("ttParentId");
	var resourceId = $projectRow.attr("data-tt-parent-id");
	//var nodeId = $projectRow.data("ttId");
	var nodeId = $projectRow.attr("data-tt-Id");
	$projectRow.find(".project").text(projectTitle);
	$projectRow.removeAttr("data-tt-id");
	$projectRow.attr("data-tt-id", resourceId+"-"+projectId);
	$projectRow.removeAttr("id");
	$projectRow.attr("id",resourceId+"-"+projectId);
	$projectRow.removeAttr("id");
	var html = "";
	for( var j=1; j<13; j++ )
	{
		var monthString = ("0"+j).slice(-2);
		if( projectStatus == 3 )
			html += '<td id="'+resourceId+'-'+projectId+'-2017-'+monthString+'" class="number editable speculation" contenteditable="true"></td>';
		else
			html += '<td id="'+resourceId+'-'+projectId+'-2017-'+monthString+'" class="number editable" contenteditable="true"></td>';
	}
	$projectRow.append(html);
	//var $node = $("#projections-table").treetable("node", nodeId);
	//$("#projections-table").treetable("loadBranch", $("#projections-table").treetable("node", resource), $projectrow.prop("outerHTML") );

	$(".editable").mousedown(function(e)
	{
		postProjection( lastEdited );
		recomputeTotals();
		lastEdited = $(this);
		lastEditedNumber = lastEdited.attr("hours");
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
			$option.attr("project_status", projects[i].project_status);
			$projectSelector.append($option);
		}
	}
	return $projectSelector;
}

function removeProjectRow( row )
{
	var rowTtId = row.data("ttId");
	var rowId = row.attr("data-tt-id");
	if( !rowId.includes("?") )
	{
		for( var i=1; i<13; i++ )
		{
			var monthString = ("0"+i).slice(-2);
			var id = rowId+"-2017-"+monthString;
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
