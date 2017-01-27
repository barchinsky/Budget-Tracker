/*
* canvasService manage and build canvases for app
*/


function CanvasService(){
	Chart.defaults.global.defaultFontColor = '#dbdde0';
	var services = {
		drawIncomeOutcome: drawIO,
		drawExpensesPie: drawEP,
	};

	function drawIO(cId, d){
			var ctx = document.getElementById(cId);
			var myChart = new Chart(ctx, {
				type: 'bar',
				data: {
					labels: ["Incomes", "Outcomes"],
					datasets: [{
							label: 'UAH',
							data: d,
							backgroundColor: [
								'rgba(255, 99, 132, 0.2)',
								'rgba(54, 162, 235, 0.2)',
							],
							borderColor: [
								'rgba(255,99,132,1)',
								'rgba(54, 162, 235, 1)',
							],
							borderWidth: 1
					}]
				},
				options: {
					scales: {
							yAxes: [{
								ticks: {
									beginAtZero:true
								}
							}]
					},
					title: {
						display:false,
						text: "Incomes and Outcomes",
					},
					legend: {
						display:false,
						position: 'bottom',
					},
				}
			});
	};

	function drawEP(cId, d){
		// draw pie chart for expenses type
		// And for a doughnut chart
		var ctx=document.getElementById(cId);

		var data = {
			labels: d.map(function(obj){
				return obj.category;
			}),
			datasets: [{
				label:'UAH',
				data: d.map(function(obj){
					return obj.spentCosts;
				}),
				backgroundColor: [
					"#FF6384",
					"#36A2EB",
					"#FFCE56",
					"#F44336",
					"#E91E63",
					"#9C27B0",
					"#673AB7",
					"#3F51B5",
					"#2196F3",
					"#00BCD4",
					"#009688",
					"#4CAF50",
					"#8BC34A",
					"#CDDC39",
					"#FFC107"

				],
				hoverBackgroundColor: [
					"#FF6384",
					"#36A2EB",
					"#FFCE56",
					"#F44336",
					"#E91E63",
					"#9C27B0",
					"#673AB7",
					"#3F51B5",
					"#2196F3",
					"#00BCD4",
					"#009688",
					"#4CAF50",
					"#8BC34A",
					"#CDDC39",
					"#FFC107"
				]
			}]
		};

		var options = {
			title: {
				display:false,
				text: "Expenses disrtibution",
			},
			legend:{
				display:false,
				position: 'left',
				fontSize:4,
				fullWidth:false,
			},
		};

		var myDoughnutChart = new Chart(ctx, {
			type: 'doughnut',
			data: data,
			options: options
		});
	};

	return services;
}