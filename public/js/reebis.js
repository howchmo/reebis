$(function() {
	// Load the data from the web service
	$.ajax( {
		type: 'Get',
		url: 'http://localhost:8888/months',
		success: function( data )
		{
			generateHolidaysView( data.data );
			generateMaxHoursPerMonthView( data.data );
			$.ajax( {
				type:'Get',
				url:'http://localhost:8888/projections',
				success: function( data )
				{
					// Generate the view from the data retrieved
					generateOverview( data.data );
					// Make it a treetable
					$("#example").treetable({ expandable: true })
				}
			});
		}
	});
});

function generateHolidaysView( months )
{
	var $monthrow = $("<tr/>", {
		"class":"resource",
	});
	$monthrow.append('<td><span class="resource">Holidays</span></td>');
	for( var j=0; j<12; j++ )
	{
		var holidays = months[j].holidays;
		if( holidays != null )
			$monthrow.append('<td class="number">'+holidays+'</td>');
		else
			$monthrow.append('<td class="number"></td>');
	}
	$("tbody").append($monthrow);
}

function generateMaxHoursPerMonthView( months )
{
	var $monthrow = $("<tr/>", {
		"class":"resource",
	});
	$monthrow.append('<td><span class="resource">Max Working Hours</span></td>');
	for( var j=0; j<12; j++ )
	{
		var work = months[j].work;
		if( months[j].holidays != null )
			work -= months[j].holidays;
		$monthrow.append('<td class="number">'+work+'</td>');
	}
	$("tbody").append($monthrow);
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
	var prevMonth = null;
	for( var i=0; i<data.length; i++ )
	{
		if( resource != data[i].resource )
		{
			if( $projectrow != null )
			{
				if( prevMonth+1 < 13 )
				{
					for( var j=prevMonth+1; j<13; j++ )
					{
						$projectrow.append('<td id="'+resource+'-'+project+'-'+j+'" class="number"></td>');
					}
				}
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
						$resourcerow.append('<td class="number" id="'+resource+'-'+j+'"></td>');
					else
						$resourcerow.append('<td class="number" id="'+resource+'-'+j+'">'+totals[resource][j]+'</td>');
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
				"class":"resource",
				"data-tt-id":resource
			});
			$resourcerow.append('<td><span class="resource">'+data[i].last+', '+data[i].first+'</span></td>');
			// delay writing out the resource data until we have totals
			rows.push($resourcerow);
			project = "";
		}

		var dateObj = new Date(data[i].month);
		var month = parseInt(dateObj.getMonth())+1;
		if( project != data[i].project )
		{
			if( $projectrow != null )
			{
				// pad the following rows
				if( prevMonth+1 < 13 )
				{
					for( var j=prevMonth+1; j<13; j++ )
					{
						$projectrow.append('<td id="'+resource+'-'+project+'-'+j+'" class="number"></td>');
					}
				}
				rows.push($projectrow);
			}
			project = data[i].project;
			// create project row
			$projectrow = $("<tr>", {
				"data-tt-id":resource+"-"+project,
				"data-tt-parent-id":resource
			});
			$projectrow.append('<td><span class="project">'+data[i].title+'</span></td>');
			// pad columns
			for( var j=1; j<month; j++ )
			{
				$projectrow.append('<td id="'+resource+'-'+project+'-'+j+'" class="number"></td>');
			}
		}
		hours = data[i].hours;
		// what if we haven't calculated totals yet?
		if( totals[resource][month] == null )
			totals[resource][month] = 0;
		// calculate totals
		totals[resource][month] += hours;
		// add the hours column
		$projectrow.append('<td id="'+resource+'-'+project+'-'+month+'" data-projection-id="'+data[i].projection+'" class="number">'+hours+'</td>');
		prevMonth = month;
		console.log(data[i].projection);
		// delay putting it in the DOM until we have totals
	}
}
