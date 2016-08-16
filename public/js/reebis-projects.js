$(function() {
	// Load the data from the web service
	$.ajax( {
		type: 'Get',
		url: '/projects',
		success: function( data )
		{
			populateProjects(data.data);
			$("#overview").treetable();
		}
	});
});

function populateProjects( data )
{
	for( var i=0; i<data.length; i++ )
	{
		var project = data[i];
		var $row = $("<tr>", {"data-tt-id":project.project, "class":"project-row" });
		var $col = $("<td>", {
			class: "editable",
			project: project.project,
			text: project.status
		}).appendTo($row);
		var $col = $("<td>", {
			class: "editable",
			project: project.project,
			text: project.title
		}).appendTo($row);
		var $col = $("<td>", {
			class: "editable",
			project: project.project,
			text: project.chargenumber
		}).appendTo($row);
		var popStart = "";
		if( project.start != null )
			popStart = project.start.substring(0,10);
		var $col = $("<td>", {
			class: "editable",
			project: project.project,
			text: popStart
		}).appendTo($row);
		var popEnd = "";
		if( project.end != null )
			popEnd = project.end.substring(0,10);
		var $col = $("<td>", {
			class: "editable",
			project: project.project,
			text: popEnd
		}).appendTo($row);
		var $col = $("<td>", {
			class: "editable",
			project: project.project,
			text: project.manager
		}).appendTo($row);
		var $col = $("<td>", {
			class: "editable",
			project: project.project,
			text: project.customer
		}).appendTo($row);
		var $col = $("<td>", {
			class: "editable",
			project: project.project,
			text: project.description
		}).appendTo($row);
		$("#projects-rows").append($row);
	}
}
