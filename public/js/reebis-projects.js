$(function() {
	// Load the data from the web service
	$.ajax( {
		type: 'Get',
		url: '/projects',
		success: function( data )
		{
			populateProjects(data.data);
			$("#projects-table").treetable({expandable:true,initialState:"expanded"});
			$(".editable").attr("contenteditable", "true");
			$(".datepicker").datepicker({
				changeMonth: true,
				changeYear: true,
				dateFormat: "yy-mm-dd"
			});
			$("#project-adder").click(addBlankProjectRow);
		}
	});
});

function addBlankProjectRow()
{
	var blankProjectData = {
		"project":-1,
		"parent":-1,
		"status":"Active",
		"title":"",
		"start":"",
		"end":"",
		"manager":"",
		"custome":""
	};
	addProjectRow( blankProjectData );
	$(".editable").attr("contenteditable", "true");
	$(".datepicker").datepicker({
		changeMonth: true,
		changeYear: true,
		dateFormat: "yy-mm-dd"
	});
}

function addProjectRow( project )
{
	var $row = $("<tr>", {"data-tt-id":project.project, "class":"project-row" });

	// STATUS
	var $col = $("<td>", {
		project: project.project,
		text: project.status,
	});

	if( project.parent != project.project )
	{
		$row.attr("data-tt-parent-id", project.parent);
	}
	if( project.status == "Parent" )
	{
		$col.text("");
	}
	$col.appendTo($row);

	// TITLE
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

	// POP Start
	var popStart = "";
	if( project.start != null )
		popStart = project.start.substring(0,10);
	var $col = $("<td>", {
		project: project.project,
	}).append('<input type="text" class="datepicker" value='+popStart+'>');
	$col.appendTo($row);

	// POP End
	var popEnd = "";
	if( project.end != null )
		popEnd = project.end.substring(0,10);
	var $col = $("<td>", {
		project: project.project,
	}).append('<input type="text" class="datepicker" value='+popEnd+'>');
	$col.appendTo($row);


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
	$("#projects-rows").append($row);

}

function populateProjects( data )
{
	for( var i=0; i<data.length; i++ )
	{
		addProjectRow( data[i] );
	}
}
