var lastEdited = null;
var lastEditedNumber = "";
var collapsed = true;
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
					$(".editable").click(function(e) {
						postProjection( lastEdited );
						recomputeTotals();
						lastEdited = $(this);
						lastEditedNumber = $(this).text();
						e.stopPropagation();
					});
					$(document).click( function() {
						postProjection( lastEdited );
						recomputeTotals();
					});
					$(document).on('keyup', function(e) {
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
		console.log(lastEdited.text()+" - "+lastEditedNumber);
		console.log("difference == \""+difference+"\"");
		if( difference != 0 && !isNaN(difference) )
		{
			var id = lastEdited.attr("id");
			var ids = id.split("-");
			var totalId = ids[0]+"-"+ids[2];
			var total = $("#"+totalId).text();
			if( total == "" )
				total = 0;
			var newTotal = parseInt(total) + difference;
			if( isNaN(newTotal) )
				$("#"+totalId).text("");
			else
				$("#"+totalId).text(newTotal);
		}
		lastEdited = null;
		lastEditedNumber = "";
	}
}

function postProjection( cell )
{
	if( cell != null )
	{
		console.log("postProjection("+cell.text()+")");
		console.log("lastEditedNumber = "+lastEditedNumber);
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
			console.log(JSON.stringify(postMessage));
			$.post( "projections", postMessage, function( data, status ) {
				console.log("POST data = "+JSON.stringify(data));
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
				console.log("really end month columns from "+(prevMonth+1)+" to 12");
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
			$resourcerow.append('<td><span class="resource">'+data[i].last+', '+data[i].first+'</span></td>');
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
					console.log("end month columns from "+(prevMonth+1)+" to 12");
					for( var j=prevMonth+1; j<13; j++ )
					{
						$projectrow.append('<td id="'+resource+'-'+project+'-'+j+'" class="number editable"></td>');
					}
				}
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
			$projectrow.append('<td><span class="project">'+data[i].title+'</span></td>');
		}
		// pad month columns from the previous month to the current month
		if( prevMonth+1 < month )
		{
			console.log("pad month columns from "+(prevMonth+1)+" to "+month);
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
		console.log("add "+hours+" hours for month "+month);
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
