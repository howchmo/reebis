$(function() {
	// Load the data from the web service
	$.ajax( {
		type:'Get',
		url:'http://localhost:8888/projections',
		success: function( data ) {
			// Generate the view from the data retrieved
			generateOverview( data.data );
			// Make it a treetable
			$("#example").treetable({ expandable: true })
		}
	});
});

function generateOverview( data )
{
	var totals = {};
	var rows = [];
	var resource = "";
	var month = "";
	var project = "";
	var totalHours = 0;
	for( var i=0; i<data.length; i++ )
	{
		if( resource != data[i].resource )
		{
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
			$resourcerow.append('<td><span class="resource">'+resource+'</span></td>');
			// delay writing out the resource data until we have totals
			rows.push($resourcerow);
			project = "";
		}

		if( project != data[i].title )
		{
			project = data[i].title;
			// create project row
			var $projectrow = $("<tr>", {
				"data-tt-id":resource+"-"+project,
				"data-tt-parent-id":resource
			});
			$projectrow.append('<td><span class="project">'+project+'</span></td>');

			var dateObj = new Date(data[i].month);
			var month = parseInt(dateObj.getMonth())+1;
			console.log(resource+"-"+project+"-"+month);
			// pad columns
			for( var j=1; j<13; j++ )
			{
				hours = "";
				if( month == j )
				{
					hours = data[i].hours;
					// what if we haven't calculated totals yet?
					if( totals[resource][month] == null )
						totals[resource][month] = 0;
					// calculate totals
					totals[resource][month] += hours;
				}
				$projectrow.append('<td id="'+resource+'-'+project+'-'+j+'" class="number">'+hours+'</td>');
			}
			// delay putting it in the DOM until we have totals
			rows.push($projectrow);
		}
	}
}
