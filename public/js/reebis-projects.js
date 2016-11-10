var $lastEdited = null;

$(function() {
	// Load the data from the web service
	$.ajax( {
		type: 'Get',
		url: '/projects',
		success: function( data )
		{
			populateProjects(data.data);
			$("#projects-table").treetable({expandable:true,initialState:"expanded"});
			makeCellsEditable();
			$("#project-adder").click(addBlankProjectRow);
			$(document).click( function()
			{
				console.log(lastEdited);
			});
			$(document).on('keypress', function(e)
			{
				var keyCode = e.keyCode || e.which;
				if( keyCode == 13 ) // ENTER
				{
					console.log(lastEdited);
					e.preventDefault();
					postProject(lastEdited.attr("project"), lastEdited.attr("data-col-name"), lastEdited.text());
					lastEdited = $(":focus");
				}
			});
			$(document).on('keyup', function(e)
			{
				var keyCode = e.keyCode || e.which;
				if( keyCode == 9 ) // TAB
				{
					console.log(lastEdited);
					postProject(lastEdited.attr("project"), lastEdited.attr("data-col-name"), lastEdited.text());
					lastEdited = $(":focus");
				}
			});
		}
	});
});

function postProject( projectId, columnName, text )
{
//	var projectId = lastEdited.attr("project");
//	var columnName = lastEdited.attr("data-col-name");
//	var text = lastEdited.text();
	var postMessage = {};
	if( projectId > -1 )
	{
		postMessage["project"] = projectId;
		postMessage["column"] = columnName;
		postMessage["value"] = text;
	}
	else
	{
		postMessage["title"] = text;
	}
	$.post( "projects", postMessage, function( data, status ) {
		console.log("POST data = "+JSON.stringify(data));
		if( data.status == 'success' )
		{
			if( data.type == "insert" )
			{
				console.log("project = "+data.project);
				// remove the old column
				var editRow = $("tr[data-tt-id='-1']");
				var titleColumn = editRow.find("td[data-col-name='title']");
				var projectObject = {
					"project_status":"active",
					"project":data.project,
					"parent":data.project,
					"title":titleColumn.text(),
					"chargenumber":"",
					"start":"",
					"end":"",
					"manager":"",
					"customer":""
				};
				console.log(JSON.stringify(projectObject));
				editRow.remove();
				// add the new column
				addProjectRow(projectObject);
				makeCellsEditable();
			}
		}
		else
		{
			// error handling here
			alert("Something went wrong on the server!");
		}
	});
}

function addBlankProjectRow()
{
	var temporaryProjectId = -1;
	var $row = $("<tr>", {"data-tt-id":temporaryProjectId, "class":"project-row" });

	// STATUS
	var $col = $("<td>", {
		project: temporaryProjectId,
		text: "Active",
		"data-col-name": "project_status"
	});
	$col.appendTo($row);

	// TITLE
	var $col = $("<td>", {
		class: "editable cell-project-title",
		project: temporaryProjectId,
		contenteditable: true,
		"data-col-name": "title"
	}).appendTo($row);

//	$(".cell-project-title").attr("contenteditable", "true");
	$("#project-adder").click(null);
	$("#projects-rows").append($row);
	$col.focus();
}

function makeCellsEditable()
{
	$(".editable").attr("contenteditable", "true");
	$(".datepicker").datepicker({
		changeMonth: true,
		changeYear: true,
		dateFormat: "yy-mm-dd",
		onSelect: function(dateText) {
			lastEdited = $($(this)[0]).parent();
			console.log(lastEdited.attr("project"), lastEdited.attr("data-col-name"), dateText);
			postProject(lastEdited.attr("project"), lastEdited.attr("data-col-name"), dateText);
		}
	});
	$(".editable").click( function(e) 
	{
		lastEdited = $($(this)[0]);
		e.stopPropagation();
	});
}

function addProjectRow( project )
{
	var $row = $("<tr>", {"data-tt-id":project.project, "class":"project-row" });

	// STATUS
	var $col = $("<td>", {
		class: "project-status-"+project.project_status_name,
		project: project.project,
		text: project.project_status_name,
		"data-col-name": "project_status"
	});

	var superproject = " superproject";
	var spacing = "";
	if( project.parent != project.project )
	{
		$row.attr("data-tt-parent-id", project.parent);
		superproject = "";
		spacing = "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;";
	}
	if( project.project_status == 1 )
	{
		$col.text("");
	}
	$col.appendTo($row);

	// TITLE
	var $col = $("<td>", {
		class: "editable cell-project-title"+superproject,
		project: project.project,
		html: spacing+project.title,
		"data-col-name": "title"
	}).appendTo($row);

	// Charge #
	var $col = $("<td>", {
		class: "editable",
		project: project.project,
		text: project.chargenumber,
		"data-col-name": "chargenumber"
	}).appendTo($row);

	// POP Start
	var popStart = "";
	if( project.start != null )
		popStart = project.start.substring(0,10);
	var $col = $("<td>", {
		project: project.project,
		"data-col-name": "start"
	}).append('<input type="text" class="datepicker" value='+popStart+'>');
	$col.appendTo($row);

	// POP End
	var popEnd = "";
	if( project.end != null )
		popEnd = project.end.substring(0,10);
	var $col = $("<td>", {
		project: project.project,
		"data-col-name": "end"
	}).append('<input type="text" class="datepicker" value='+popEnd+'>');
	$col.appendTo($row);


	var $col = $("<td>", {
		class: "editable",
		project: project.project,
		text: project.manager,
		"data-col-name": "manager"
	}).appendTo($row);

	var $col = $("<td>", {
		class: "editable",
		project: project.project,
		text: project.customer,
		"data-col-name": "customer"
	}).appendTo($row);
	$("#projects-rows").append($row);

}

function populateProjects( data )
{
	for( var i=0; i<data.length; i++ )
	{
		addProjectRow( data[i] );
	}
}
