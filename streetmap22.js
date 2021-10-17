
	var MAPNAME = 'map';
	var MAPGROUPNAME = 'mapGroup';
	var MAPWIDTH = 668; // 835; 
	var MAPHEIGHT = 624; // 780;
	var MAPWIDTH_OFFSET = 132; //165;
	var MAPHEIGHT_OFFSET = 128; //160;
	var SCALE = 40; //50;
	var POINTRADIUS = 4;
	var PUMP_COLOR = '#000000'; // black
	var MALE_COLOR = '#006400';  // darkgreen
	var FEMALE_COLOR = '#ff8c00'; // darkorange
	var MAX_AGE_GROUP = 5; 
	var CHARTNAME = 'chart';
	var CHARTGROUPNAME = 'chartGroup';
	var CHART_WIDTH = 668; // 800; // 1000;
	var CHART_HEIGHT = 624; // 432; // 540;
	var CHART_MAXHEIGHT = 500; // 320; // 400;
	var CHART_MAXHEIGHT_OFFSET = 100; // 100;
	var CHART_POINTRADIUS = 5;
	var CHART_X_TRANSLATE = 50; // 50;
	var CHART_Y_TRANSLATE = 50; // 50;
	var CHART_POINT_COLOR = '#ff00ff'; // purple


	var deathIdsToShow = [];
	var deathIdsToHide = [];
	var deathIdsPreviousState = [];
	
	var selectedDataPointId = undefined;
	var selectedCircleG = undefined;


	Array.prototype.max = function() {
	  return Math.max.apply(null, this);
	};
	Array.prototype.min = function() {
	  return Math.min.apply(null, this);
	};	

    function arrayRemoveItem(array, item) {
        if (!Array.isArray(array) || item === undefined || item === null) 
			return array;
		
        var index = array.indexOf(item);
        if (index > -1) {
            return array.splice(index, 1);
        }
        return array;
    }

	function getMaleColor() {
		//var maleColor = $().val() == undefined ? MALE_COLOR : $('#maleColor').val();
		var maleColor = controlValueOrDefault('#maleColor', MALE_COLOR);
        return maleColor;
    }
    function getFemaleColor() {
		var femaleColor = controlValueOrDefault('#femaleColor', FEMALE_COLOR);
        return femaleColor;
	}
	function getAgeString(age) {
		return (age == undefined)
			? age
			: 'age' + age;
	}

	function ageClass(age) {
		return '.' + getAgeString(age);
	}
	function ageId(age) {
		return '#' + getAgeString(age);
	}
	function ageOpacityControlId(age) {
		return ageId(age) + 'Opacity';
	}
    
	function getClassesArray(deathCircle) {
		var classArray = [];
		if (deathCircle != undefined) {
			var classes = deathCircle.attr("class");
			if (classes != undefined)
				classArray = classes.split(" ");
		}
		return classArray;
	}
    function getCircleClassValue(deathCircle, classNamePrefix) {
		var thisClassValue = '';
		var classArray = getClassesArray(deathCircle);
		for(var i=0; i<classArray.length; i++) {
			var thisClass = classArray[i];
			if (thisClass.startsWith(classNamePrefix)) {
				thisClassValue = thisClass.substring(classNamePrefix.length);
				break;
			}
		}
        return thisClassValue;
	}
    function getCircleAgeValue(deathCircle) {
		var ageVal = getCircleClassValue(deathCircle, getAgeString());
		return ageVal;
	}
	function getCircleSexValue(deathCircle) {
		var classes = getClassesArray(deathCircle);
		var sex = (classes.indexOf("male") > -1)? 0 : 1;
		return sex;
	}

	function controlValueOrDefault(ctrlId, defaultValue) {
        var ctrlVal = $(ctrlId).val() == undefined ? defaultValue : $(ctrlId).val();
        return ctrlVal;
	}
	
	function getAgeOpacityControlValueFromCircle(deathCircle, defaultValue) {
		var thisAge = getCircleAge(deathCircle);
		var ctrlId = ageOpacityControlId(thisAge);
		var opacityCtrlVal = (defaultValue != undefined)
			? controlValueOrDefault(ctrlId, defaultValue)
			: controlValueOrDefault(ctrlId, "1.0");
		return Number(opacityCtrlVal);
	}
	function getSexOpacityControlValueFromCircle(deathCircle, defaultValue) {
		var thisSex = getCircleSexValue(deathCircle);
		var sexOpacity = thisSex == 0 
			? controlValueOrDefault('#maleOpacity', defaultValue)
			: controlValueOrDefault('#femaleOpacity', defaultValue)
			;
		return Number(sexOpacity);
	}
	function getSexAgeCalculatedOpacityFromCircle(deathCircle, defaultValue) {
		var calcOpacity = 
			Number(getAgeOpacityControlValueFromCircle(deathCircle, defaultValue))
			*
			Number(getSexOpacityControlValueFromCircle(deathCircle, defaultValue))
		return calcOpacity;
	}

	function getAgeOpacityControlValueFromDeathObject(deathObj, defaultValue) {
		var ctrlId = ageOpacityControlId(deathObj.age);
		var opacityCtrlVal = (defaultValue != undefined)
			? controlValueOrDefault(ctrlId, defaultValue)
			: controlValueOrDefault(ctrlId, "1.0");
		return Number(opacityCtrlVal);
	}
 	function getSexOpacityControlValueFromDeathObject(deathObj, defaultValue) {
		var sexOpacity = deathObj.sex == 0 
			? controlValueOrDefault('#maleOpacity', defaultValue)
			: controlValueOrDefault('#femaleOpacity', defaultValue)
			;
		return Number(sexOpacity);
	}
	function getSexAgeCalculatedOpacityFromDeathObject(deathObj, defaultValue) {
		var calcOpacity = 
			Number(getAgeOpacityControlValueFromDeathObject(deathObj, defaultValue))
			*
			Number(getSexOpacityControlValueFromDeathObject(deathObj, defaultValue))
		return calcOpacity;
	}

    function calculateNewOpacity(deathDatesToShow, deathsObjects) {

        var newOpacity = [];

        var showAllDeaths = (deathDatesToShow.length == 0);

        for (var j = 0; j < deathsObjects.length; j++) {
            var showDeath = showAllDeaths || (deathDatesToShow.indexOf(deathsObjects[j].date) > -1);
			
            // set opacity multiplier based on showDeath
            var showVal = (showDeath)? 1.0 : 0.0;

			// get calculated age/sex opacity value
            var calcSexAgeOpacityVal = Number(getSexAgeCalculatedOpacityFromDeathObject(deathsObjects[j]));
			
			// save updated value into indexed object
            var newVal = showVal * calcSexAgeOpacityVal;
			newOpacity.push("" + newVal);
        }

        return newOpacity;
    }
	
	function makeDeathObjectClassString(deathObj, i) {
		var id = "id_" + i;
		var sex = (deathObj.sex == 0 ?  "male"  : "female");
		var age = "age" + deathObj.age;
		var dateStr = "date_" + deathObj.date;
		var classString = "death" + " " + id + " " + sex + " " + age + " " + dateStr; 
		return classString;
	}
	
    // save the object to the objectArray
    function saveObject(objectArray, object, name, index) {
		if (objectArray != undefined) {
			objectArray.push(object);
			printObject(object, name, index);	
		}
	}
	// print the point data to the console
    function printObject(obj, name, index) {
	    if (obj != undefined) {
		    name = (name == undefined)? "obj" : name;
			var arrayindex = (index == undefined)? "" : "[" + index + "]";
			console.log(name + arrayindex + " = "  + JSON.stringify(obj));
		}
    }	
	function getMinMaxArrayValues(data, xName, yName) {
		
		// ensure we have valid data
		if (data == undefined) {
			return undefined;
		}

		var xData = [];		
		var yData = [];		

		// loop through the all the points and get the X/Y values
		for (var i=0; i<data.length; i++) {
			xData.push(data[i][xName]);
			yData.push(data[i][yName]);
		}

		// calculate the min/max X and Y values from the data
		var minX = xData.min();
		var maxX = xData.max();
		var minY = yData.min();
		var maxY = yData.max();
		
		return { 
			minX: minX,
			maxX: maxX,
			minY: minY,
			maxY: maxY,
		};
	}
	function getMinMaxPointValues(data) {
		return getMinMaxArrayValues(data, 'x', 'y');
	}

	function createMapScales(minX, maxX, minY, maxY) {
		if (minX == undefined || maxX == undefined ||
			minY == undefined || maxY == undefined) {
			return undefined;
		}
				
		var xScale = d3.scaleLinear()
			.domain([ minX, maxX ])
			.range([ 0, MAPWIDTH ]);
		
		var yScale = d3.scaleLinear()
			.domain([ minY, maxY ])
			.range([ MAPHEIGHT, 0 ]);

		return { 
			xScale: xScale,
			yScale: yScale
		};
	}
	function createPointScales(minX, maxX, minY, maxY) {
		if (minX == undefined || maxX == undefined ||
			minY == undefined || maxY == undefined) {
			return undefined;
		}
				
		// pass the calculated min/max values to get the Scales
		var rangeMinX = ((minX * SCALE) - MAPWIDTH_OFFSET);
		var rangeMaxX = ((maxX * SCALE) - MAPWIDTH_OFFSET);
		
		var xScale = d3.scaleLinear()
			.domain([ minX, maxX ])
			.range([ rangeMinX, rangeMaxX ]);
		
		var rangeMinY = (MAPHEIGHT + MAPHEIGHT_OFFSET - (minY * SCALE));
		var rangeMaxY = (MAPHEIGHT + MAPHEIGHT_OFFSET - (maxY * SCALE));
		
		var yScale = d3.scaleLinear()
			.domain([ minY, maxY ])
			.range([ rangeMinY, rangeMaxY ]);

		return { 
			xScale: xScale,
			yScale: yScale
		};
	}
	function createScalesFromPointData(pointData) {

		var minMax = getMinMaxPointValues(pointData);
		if (minMax == undefined) {
			return undefined;
		}

		// pass the calculated min/max values to get the Scales
		var xyScales = createPointScales(minMax.minX, minMax.maxX, minMax.minY, minMax.maxY);
		return xyScales;
	}

	function createSVGAndGroup(svgId, svgWidth, svgHeight, groupId) { 
		
		// Create the SVG element and group element
		// set the width and height and name of the map specified by id 
		var map = d3.select("body")
			.append("svg")
			.attr("id", svgId)
			.attr("class", svgId)
			.attr("preserveAspectRatio", "xMinYMin meet") 
			.attr("viewBox", "0 0 " + svgWidth + " " + svgHeight)
			.attr("width", svgWidth) 
			.attr("height", svgHeight)
			.attr('align', 'center')
			.style("border", "1px solid black")
			.append("g")
			.attr("id", groupId)
			.attr("width", svgWidth) 
			.attr("height", svgHeight)
			 //.attr('transform', 'translate(' + MAPWIDTH_OFFSET + ',' + MAPHEIGHT_OFFSET + ')')
			;		
			
		svgGroup = getGroup(groupId);
		return svgGroup;
		
    }
	function getGroup(groupId) { 	
		var group = d3.select("#" + groupId);
		return (group == undefined)
			? undefined
			: group;
	}
	function drawStreets(parentId, streetData) {
 		function getLineSegments(data) {
			var lineSegments = [];
			
			for (var i=0; data && i<data.length; i++) {
				var lineSegment = data[i];
				if (lineSegment != undefined) {
					saveObject(lineSegments, lineSegment, 'lineSegment', i);
				}
			}
			return lineSegments;
		}
		function getLinesData(lineSegments) {
			if (!Array.isArray(lineSegments)) 
				return;
			
			var points = [];		

			// loop through the all the line segments and get save the points
			for (var i=0; i<lineSegments.length; i++) {
				var lineSegment = lineSegments[i];
				if (Array.isArray(lineSegment)) {
					for (var j=0; lineSegment && j<lineSegment.length; j++) {
						var point = lineSegment[j];
						points.push(point);
					}
				}				
			}

			// calculate the min/max X and Y values from the saved points
			var minX = d3.min(points, function(d) { return d["x"]; });
			var maxX = d3.max(points, function(d) { return d["x"]; });
			var minY = d3.min(points, function(d) { return d["y"]; });
			var maxY = d3.max(points, function(d) { return d["y"]; });

			// pass the calculated min/max values to get the Scales
			var xyScales = createMapScales(minX, maxX, minY, maxY);

			return { 
			    lines: lineSegments,
				points: points, 
				xScale: (xyScales == undefined)? undefined: xyScales.xScale,
				yScale: (xyScales == undefined)? undefined: xyScales.yScale,
				minX: minX, 
				maxX: maxX, 
				minY: minY, 
				maxY: maxY 
			};
		}
		function drawLines(linesData) {
			if (linesData == undefined || 
				linesData.xScale == undefined || 
				linesData.yScale == undefined) {
				return undefined;
			}
			
			var pathGenerator = d3.line()
				.x(function(d, i) { 
					var scaledX = linesData.xScale(d.x); 
					return scaledX; 
				})
				.y(function(d, i) { 
					var scaledY = linesData.yScale(d.y); 
					return scaledY; 
				})
				;

			var g = d3.select('svg').select('#' + parentId);
				
			// loop through the all the line segments and get save the points
			for (var j=0; j< linesData.lines.length; j++) {
				var linePoints = linesData.lines[j];
				if (linePoints && Array.isArray(linePoints) && linePoints.length > 0) {
					g.append('path')
						.attr("id", function (d, i) { return ("path" + (j+1)); })
						.style('fill', 'none')
						.style('stroke', 'steelblue')
						.style('stroke-width', '1px')
						.attr('d', pathGenerator(linePoints))
						;
				}				
			}
					  
		}
		
		var lineSegments = getLineSegments(streetData);
		var linesData = getLinesData(lineSegments);
		drawLines(linesData);
	}
	
	function UpdateDeathCircles(deathDatesToShow, deathsObjects)
	{
		var showAllDeaths = (deathDatesToShow.length == 0);

		for (var j = 0; j < deathsObjects.length; j++) {
			var showDeath = showAllDeaths || (deathDatesToShow.indexOf(deathsObjects[j].date) > -1);
			var classes;
			
			// make death circle visible if showDeath
			var newVal = (showDeath)? "1.0" : "0.0";
			var deathCircle = d3.select("#death" + (j+1));
			
			deathCircle
				.attr("stroke", function(d) { 
					 return deathsObjects[j].sex == 0 ? getMaleColor() : getFemaleColor();
				})
				.attr("fill", function(d) {
					 return deathsObjects[j].sex == 0 ? getMaleColor() : getFemaleColor();
				})
				.attr("class", function(d) { 
					classes = makeDeathObjectClassString(d, j);
					return classes;
				})
				.attr("opacity", function(d) {
					var newOpacityVal = Number(newVal);
					var calcSexAgeOpacityVal = Number(getSexAgeCalculatedOpacityFromDeathObject(deathsObjects[j]));
					var newCalculatedOpacityVal = newOpacityVal * calcSexAgeOpacityVal;
					var opacityStr = "" + newCalculatedOpacityVal;
					return opacityStr;
				})
					
				;
			
			var node = document.getElementById(deathCircle.attr('id'));
			node.parentNode.appendChild(node);
		}

	}
	
	var datesToShow = [];
	function drawLineChart(dataArray, 
						   svgId,
						   groupId, 
						   title, 
						   xLabel, 
						   yLabel, 
						   xName, 
						   yName, 
						   chartWidth, 
						   chartHeight, 
						   maxHeight,
						   pointRadius, 
						   xOffset, 
						   yOffset, 
						   maxHeightOffset) {
							   
		function adjustTextPosition(txt) {
			var classes = txt.attr('class');
			// if not adjusted then adjust if needed
			if (!classes || classes.indexOf("adjusted") == -1) {
				// calculated the text length and adjust if needed
				var textWidth = document.getElementById(txt.attr("id")).getComputedTextLength();
				var x = Number(txt.attr('x'));
				var textLength = Math.round(x + textWidth);
				if (textLength >= (chartWidth - xOffset)) {
					// move text to new position
					var newX = "" + Math.round(chartWidth - textWidth - xOffset);
					txt.attr('x', newX);
				}
				// mark as adjusted
				txt.classed("adjusted", true);
			}
		}
		function liteToggle(ptNode, d, i, opacityOverride) {
			var txt = d3.select("#txt" + (i+1));
			adjustTextPosition(txt)
			var opacity = Number(txt.attr("opacity"));

			if (opacityOverride != undefined)
                opacity = Number(opacityOverride);

			if (opacity < 1) {
				// make text visible
				txt.attr("opacity", "1.0")
				var txtNode = document.getElementById(txt.attr('id'))
				ptNode.parentNode.appendChild(txtNode);
			}
			else {
				// make text invisible
				txt.attr("opacity", "0.0")
			}
		}			
		function mapToggle(ptNode, d, i, deathDatesToShow) {
			UpdateDeathCircles(deathDatesToShow, deathsObjects);
		}			
		function adjustChartSVG(chartWidth, chartHeight, maxHeight, xOffset, yOffset, maxHeightOffset) 		{
			// adjust to keep within chart
			if (maxHeight > chartHeight)
				maxHeight = chartHeight - maxHeightOffset;

			// adjust SVG width and height if needed
			var svg = d3.select('#' + svgId);
			if (svg.attr('width') < chartWidth)
				svg.attr('width', chartWidth);
			if (svg.attr('height') < chartHeight)
				svg.attr('height', chartHeight);
			
			return svg;
		}
		function createXAxis(parentGroupId, xScale, xLabel, chartWidth, maxHeight, yOffset) {
			// Create x-axis 
			var xAxis = d3.axisBottom(xScale);
			var g = getGroup(parentGroupId);

			g.append('g')
				.attr('id', 'x-axis')
				.attr('class', 'axis')
				.attr('transform', 'translate(0,' + maxHeight + ')')
				.call(xAxis);

			// x-axis Label
			g.append("text")             
				.attr('transform', 'translate(' + (chartWidth/2) + ',' + (maxHeight + yOffset) + ')')
				.style('text-anchor', 'middle')
				.text(xLabel);
				
			return xAxis;
		}
		function createYAxis(parentGroupId, yScale, yLabel, chartWidth, maxHeight, yOffset) {
			// Create y-axis 
			var yAxis = d3.axisLeft(yScale);
			var g = getGroup(parentGroupId);
			
			g.append('g')
				.attr('id', 'y-axis')
				.attr('class', 'axis')
				.call(yAxis);

			// y-axis Label
			g.append("text")
				.attr('transform', 'rotate(-90)')
				.attr('y', 0 - yOffset)
				.attr('x', 0 - (maxHeight / 2))
				.attr('dy', '1em')
				.style('text-anchor', 'middle')
				.text(yLabel);  
				
			return yAxis;
		}
		function createDataPoints(parentGroupId, formattedData, xScale, yScale, xName, yName, pointRadius, pointToggle) {
			var g = getGroup(parentGroupId);

			g.append('g')
				.attr('id', 'datapoints')
				//Create data points
				.selectAll("circle") 
				.data(formattedData)
				.enter()
				.append("circle")
				.attr("id", function(d, i) { return ("pt" + (i+1)); })
				.attr('cx', function(d) { return Math.round(Number(xScale(d[xName]))); })
				.attr('cy', function(d) { return Math.round(Number(yScale(d[yName]))); })
				.attr("r", pointRadius)
				.attr("opacity", "1.0")
				.attr("class", function(d, i) { 
					var x = xName + '_' + d['raw_' + xName];
					var y = yName + '_' + d[yName];
					var classString = "pt" + " " + x + " " + y;
					return classString;
				})
				.attr("stroke", CHART_POINT_COLOR)
				.attr("fill", CHART_POINT_COLOR)				
				;
				
			g.append('g')
				//Create labels
				.selectAll("text") 
				.data(formattedData)
				.enter()
				.append("text") 
				.attr("id", function(d, i) { return ("txt" + (i+1)); })
				.text(function(d) { return "(" + d['raw_' + xName] + ", " + d[yName] + ")" ; })
				.attr("x", function(d) { return Math.round(Number(xScale(d[xName]) + (pointRadius + 1))); })
				.attr("y", function(d) { return Math.round(Number(yScale(d[yName]) - (pointRadius + 1))); })
				.attr("font-size", "11px")
				.attr("fill", "black")
				.attr("opacity", "0.0")
				;				

            function isClicked(dateToShow) {
                return (datesToShow.indexOf(dateToShow) > -1);
            }

			function toggleClickedDate(clickedDate) {
				const index = datesToShow.indexOf(clickedDate);
				var clickedOn = false;
				var clickedString = ((datesToShow == undefined) ? "empty" : JSON.stringify(datesToShow));
				console.log("clicked (before) => " + clickedString);
				
				// is the clickedDate in the array?
				if (index > -1) { 
					// remove it from the array
                    datesToShow.splice(index, 1);
				}
				else { 
					// put it in the array
                    datesToShow.push(clickedDate);
					clickedOn = true;
				}
				clickedString = ((datesToShow == undefined) ? "empty" : JSON.stringify(datesToShow));
				console.log("clicked (after) => " + clickedString);
				return clickedOn;
			}

			//Add events to data points
			g.selectAll('circle')
				.on('click', function(d, i) {
                    //var toggle = !isClicked(i);
                    //d.raw_date
                    var toggle = toggleClickedDate(d.raw_date);
                    pointToggle(this, d, i, toggle? "1.0" : "0.0"); 
					mapToggle(this, d, i, datesToShow); 
				})
				.on('mouseover', function(d, i) {
					if (isClicked(d.raw_date))
                        pointToggle(this, d, i, "0.0");
					else
                        pointToggle(this, d, i);
                })
				.on('mouseout', function(d, i) {
					if (isClicked(d.raw_date))
                        pointToggle(this, d, i, "0.0");
                    else
                        pointToggle(this, d, i);
                })
				;				
		}
		function getReformattedData(dataArray, xName, yName, parser) {
			
			if (dataArray == undefined || parser == undefined ||
				xName == undefined || yName == undefined) {
				return dataArray;
			}
			
			// Javascript Note: 
			// d.date == d[xName] where xName = 'date' is same as i.e. ==> d['date']
			// d.deaths == d[yName] where yName = 'deaths' i.e. ==> d['deaths']

			// reformat the data 
			var formattedDataArray = dataArray.map(function(d, i) {
				var newData = {};
				newData['raw_' + xName] = d[xName];
				newData['raw_' + yName] = d[yName];
				
				newData[xName] = parser(d[xName]);
				newData[yName] = Number(d[yName]);
				return newData;
			});
			return formattedDataArray;
		}
		function createChartScales(formattedDataArray, xName, yName, chartWidth, maxHeight, yOffset, pointRadius) {
			if (formattedDataArray == undefined ||
				xName == undefined || 
				yName == undefined ||
				chartWidth == undefined ||
				maxHeight == undefined ||
				yOffset == undefined ||
				pointRadius == undefined) {
				return undefined;
			}

			var xScale = d3.scaleTime()
				.domain(d3.extent(formattedDataArray, function(d) { return d[xName]; }))
				.range([ 0, chartWidth - (xOffset + pointRadius) ]);
			
			var yScale = d3.scaleLinear()
				.domain([0, d3.max(formattedDataArray, function(d) { return d[yName]; })])
				.range([ maxHeight, 0 ]);

			return { 
				xScale: xScale,
				yScale: yScale
			};
		}
		
		// adjust the chart SVG if needed
		var svg = adjustChartSVG(chartWidth, chartHeight, maxHeight, xOffset, yOffset, maxHeightOffset);

		// reformat the data
		var formattedDataArray = getReformattedData(dataArray, xName, yName, d3.timeParse("%d-%b"));
		
		// create the X/Y Scale functions
		var xyScales = createChartScales(formattedDataArray, xName, yName, chartWidth, maxHeight, yOffset, pointRadius);

		// create the X/Y Axes
		var xAxis = createXAxis(groupId, xyScales.xScale, xLabel, chartWidth, maxHeight, yOffset);
		var yAxis = createYAxis(groupId, xyScales.yScale, yLabel, chartWidth, maxHeight, yOffset);
		
		// Add the chart title
		var g = getGroup(groupId)
			.append("text") 
			.attr("id", "title")
			.text(title)
			.attr("x", xOffset / 2)
			.attr("y", 0 - yOffset / 2)
			;

		// shift the chart
		g = getGroup(groupId)
			.attr('transform', 'translate(' + xOffset + ',' + yOffset + ')')

		// create the path generator to draw the lines
		var pathGenerator = d3.line()
			.x(function(d) { return xyScales.xScale(d[xName]); })
			.y(function(d) { return xyScales.yScale(d[yName]); });
	
		//Create the lines between points
		g.append('path')
			.style('fill', 'none')
			.style('stroke', 'steelblue')
			.style('stroke-width', '3px')
			.attr('d', pathGenerator(formattedDataArray));

		// put the datapoints on the chart
		createDataPoints(groupId, formattedDataArray, xyScales.xScale, xyScales.yScale, xName, yName, pointRadius, liteToggle);

	}
	
	function createDeathDays(deathDaysData) {
		var deathDays = [];
	
		// loop through all death dates data 
		for (var i=0; i<deathDaysData.length; i++) 
		{
			// create the deathDays object
			var deathDay = {};
			deathDay.date = deathDaysData[i].date;
			deathDay.deaths = deathDaysData[i].deaths;

			// save to the deathDays array
			saveObject(deathDays, deathDay, 'deathDays', i);
		}
		
		return deathDays;
	}
	function createDeathAgeSex(deathAgeSexData) {
		var deathAgeSex = [];
	
		// loop through all death dates data 
		for (var i=0; i< deathAgeSexData.length; i++) 
		{
			// create the deathDays object
			var death = {};
            death.id = i;
			death.x = deathAgeSexData[i].x;
			death.y = deathAgeSexData[i].y;
			death.age = deathAgeSexData[i].age;
			death.sex = deathAgeSexData[i].gender;

			// save to the deathDays array
			saveObject(deathAgeSex, death, 'deathAgeSex', i);
		}
		
		return deathAgeSex;
	}
	function createDeathsObjects(deathData, deathDays) {
	
        // ensure we have valid deathData and deathDays before creating deathsObjects
		if (deathData == undefined || !Array.isArray(deathData) || deathData.length == 0 ||
		    deathDays == undefined || !Array.isArray(deathDays) || deathDays.length == 0) {
			return undefined;
		}
			
		var deaths = [];			
        var deathIndex = 0;
		
		// loop through all deathdays 
		for (var i=0; i<deathDays.length; i++) 
		{
			var deathDate = deathDays[i].date;
			var numDeaths = deathDays[i].deaths;

            // loop through all deaths data for this deathDate
            //for ( ; numDeaths > 0 &&
            //        (deathIndex + numDeaths) < deathData.length ; deathIndex++, numDeaths--) 
			for (; deathIndex < deathData.length && numDeaths > 0 && deathIndex < deathData.length ; deathIndex++, numDeaths--) 					
			{
				// create the death object
				var deathObj = {};
                deathObj.id = deathIndex;
				deathObj.x = deathData[deathIndex].x;
				deathObj.y = deathData[deathIndex].y;
				deathObj.sex = deathData[deathIndex].sex;
				deathObj.age = deathData[deathIndex].age;
				deathObj.date = deathDate;

				// save to the deathsObjects array
				saveObject(deaths, deathObj, 'deaths', deathIndex);
			}
		}
		return deaths;
	}
	function createDeathCircles(mapGroup, deathData) {

		if (mapGroup == undefined || deathData == undefined)
			return undefined;
			
		// get Scales for the death point data
		var xyScales = createScalesFromPointData(deathData);
			
		// only want circles with death class attribute
		// note: using just "circle" without "death" class will grab pump circles too
		var deathCircles = mapGroup.selectAll("circle .death") 
			.data(deathData)
			.enter()
			.append("circle")
			.attr("id", function(d, i) { return ("death" + (i+1)); })
			.attr("cx", function(d) { 
				var scaledX = Math.round(Number(xyScales.xScale(d.x))); 
				return scaledX; 
			})
			.attr("cy", function(d) { 
				var scaledY = Math.round(Number(xyScales.yScale(d.y))); 
				return scaledY; 
			})
			.attr("r", POINTRADIUS)
			.attr("opacity", "1.0")
			.attr("stroke", function(d) { return d.sex == 0 ?  getMaleColor() : getFemaleColor(); })
			.attr("fill", function(d) { return d.sex == 0 ?  getMaleColor() : getFemaleColor(); })
			.attr("class", makeDeathObjectClassString)
			;
		return deathCircles;
	}


	function getMinMaxPumpPointValues(pumpData) {
		if (pumpData == undefined)
			return;

		var xData = [];		
		var yData = [];		

		// loop through the all the pumps and get the X/Y values
		for (var i=0; i<pumpData.length; i++) {
			xData.push(pumpData[i].x);
			yData.push(pumpData[i].y);
		}

		// calculate the min/max X and Y values from the pumpData
		var minX = xData.min();
		var maxX = xData.max();
		var minY = yData.min();
		var maxY = yData.max();
		
		return { 
			minX: minX,
			maxX: maxX,
			minY: minY,
			maxY: maxY,
		};
	}
	function createPumpText(mapGroup, pumpData) {

		if (mapGroup == undefined || pumpData == undefined)
			return undefined;

		var minMax = getMinMaxPumpPointValues(pumpData);

		// pass the calculated min/max values to get the Scales
		var xyScales = createPointScales(minMax.minX, minMax.maxX, minMax.minY, minMax.maxY);

		var pumps = mapGroup.selectAll("text")
			.data(pumpData)
			.enter()
			.append("text")
			.attr("id", function(d, i) { return ("pump" + (i+1)); })
			.attr("x", function(d) { 
				var scaledX = Math.round(Number(xyScales.xScale(d.x))); 
				return scaledX; 
			})
			.attr("y", function(d) { 
				var scaledY = Math.round(Number(xyScales.yScale(d.y))); 
				return scaledY; 
			})
			.classed("pump", true)
			.attr("opacity", "1.0")
			.attr("stroke", PUMP_COLOR)
			.attr("fill", PUMP_COLOR)
			.style("color", PUMP_COLOR)
			.text(function(d, i) { return ('P' + i); })
			;
			
		return pumps;
	}
	function createPumpCircles(mapGroup, pumpData) {
		
		if (mapGroup == undefined || pumpData == undefined)
			return undefined;
	
		// get Scales for the pump point data
		var xyScales = createScalesFromPointData(pumpData);

		var pumpCircles = mapGroup.selectAll("circle .pump")
			.data(pumpData)
			.enter()
			.append("circle")
			.attr("id", function(d, i) { return ("pump" + (i+1)); })
			.attr("cx", function(d) { 
				var scaledX = Math.round(Number(xyScales.xScale(d.x))); 
				return scaledX; 
			})
			.attr("cy", function(d) { 
				var scaledY = Math.round(Number(xyScales.yScale(d.y))); 
				return scaledY; 
			})
			.attr("r", POINTRADIUS)
			.classed("pump", true)
			.attr("opacity", "1.0")
			.attr("stroke", PUMP_COLOR)
			.attr("fill", PUMP_COLOR)
			;
			
		return pumpCircles;
	}


	// read the pump data from the comma separated values file
	// fill pumpData array with the x,y points for the pump locations
	// x,y points
	var pumpData;
	d3.csv('pumps.csv', function(data) { 
	    pumpData = data; 
		mapGroup = getGroup(MAPGROUPNAME);
		var pumpText = createPumpText(mapGroup, pumpData);
		var pumpCircles = createPumpCircles(mapGroup, pumpData);
	});

	// read the death days  data from the comma separated values file
	// fill death_days array with the dates and number of death 
	// date,deaths
	var deaths_days = [];
	d3.csv('deathdays.csv', function(data) {
		deaths_days = createDeathDays(data);
		chartGroup = getGroup(CHARTGROUPNAME);	
		drawLineChart(deaths_days, 
		              CHARTNAME, 
		              CHARTGROUPNAME, 
					  'cholera outbreak deaths', 
					  'Timeline', 
					  'Number of Deaths', 
					  'date', 
					  'deaths', 
					  CHART_WIDTH, 
					  CHART_HEIGHT, 
					  CHART_MAXHEIGHT, 
					  CHART_POINTRADIUS, 
					  CHART_X_TRANSLATE, 
					  CHART_Y_TRANSLATE, 
					  CHART_MAXHEIGHT_OFFSET);
		
		var deaths = createDeathsObjects(deaths_age_sex, deaths_days);
		if (deaths != undefined) {
			deathsObjects = deaths;
			deathCircles = createDeathCircles(mapGroup, deathsObjects);
		}
	});

	// read the death age sex  data from the comma separated values file
	// fill deaths_age_sex array with the x,y points for the death locations with age & sex
	// x,y,age,gender
	var deaths_age_sex;
	var deathsObjects = [];
	d3.csv('deaths_age_sex.csv', function(data) { 
	    deaths_age_sex = createDeathAgeSex(data); 
		mapGroup = getGroup(MAPGROUPNAME);
		var deaths = createDeathsObjects(deaths_age_sex, deaths_days);
		if (deaths != undefined) {
			deathsObjects = deaths;
			deathCircles = createDeathCircles(mapGroup, deathsObjects);
		}
	});

	// array of array of x,y points
	var streetLineSegments = [];
	var streetData;
	d3.json('streets.json', function(data) { 
	    streetData = data; 
		mapGroup = getGroup(MAPGROUPNAME);
		drawStreets(MAPGROUPNAME, streetData);
	});
	

	function setChangeHandler(id, classSelector, attribs, initialValue) {
        function handleOpacity(thisObj, newValue, regex, opacityValues) {

            // get the id of this matched element
            var id = $(thisObj).attr('id');

			// get the index based off the id 
			var index = regex.exec(id);
            if (index != null)
            {
                //look up the new opacity from the calculated array
				index--;
                newValue = opacityValues[index];
            }
            $(thisObj).attr('opacity', newValue);

        }

		// create jQuery selector, set initial value if defined
	    var selector = id;
		
		if (initialValue != undefined)
			$(selector).val(initialValue);

		// create jQuery change handler 
		// sets all matching classSelector elements with the attribute(s) to the new value
		$(selector).change(function() { 
            function isPump() {
				return classSelector.indexOf("pump") > -1;
			}
            function isDataPoint() {
				return classSelector.indexOf("pt") > -1;
            }
            function isDeathPoint() {
				return !(isPump() || isDataPoint());
            }
            function isOpacity(attrName) {
				return attrName = 'opacity';
            }
            function isColor(attrName) {
				return attrName = 'color';
            }

            var attrName;

			var value = $(selector).val();
			if (!Array.isArray(attribs) && !isDeathPoint()) {
                $(classSelector).attr(attribs, value);
                return true;
			}

            var newOpacityValues = calculateNewOpacity(datesToShow, deathsObjects);
			var idRegexPattern = RegExp(/[0-9]+/);

			$(classSelector).each(function () { 
                if (!Array.isArray(attribs)) {
                    if (isOpacity(attribs) && isDeathPoint()) 
                        handleOpacity(this, value, idRegexPattern, newOpacityValues);
                }
				else {

					// attribute changes
					for (var i = 0; i < attribs.length; i++) {
						attrName = attribs[i];
						var attrValue = $(this).attr(attrName)

						if (isColor(attrName)) {
							$(this).css(attrName, value);
						}
						else if (isOpacity(attrName) && isDeathPoint()) {
                            handleOpacity(this, value, idRegexPattern, newOpacityValues);
						}
						else if (attrValue != undefined) {
							$(this).attr(attrName, value);
						}
					}
					return true;
				}
			});
		});
	}

	var deathCircles;
	var mapGroup = createSVGAndGroup(MAPNAME, MAPWIDTH, MAPHEIGHT, MAPGROUPNAME);
	var chartGroup = createSVGAndGroup(CHARTNAME, CHART_WIDTH, CHART_HEIGHT, CHARTGROUPNAME);

	$(document).ready(function () {
		$('#maleColor').val(MALE_COLOR); // darkgreen
		$('#femaleColor').val(FEMALE_COLOR); // darkorange
		$('#ptColor').val(CHART_POINT_COLOR); // purple

		setChangeHandler('#pumpColor', '.pump', ['stroke', 'color', 'fill'], PUMP_COLOR);
		setChangeHandler('#maleColor', '.male', ['stroke', 'fill'], MALE_COLOR);
		setChangeHandler('#femaleColor', '.female', ['stroke', 'fill'], FEMALE_COLOR);
		setChangeHandler('#ptColor', '.pt', ['stroke', 'fill' ], CHART_POINT_COLOR);

		setChangeHandler('#pumpOpacity', '.pump', 'opacity', '1.0');
		setChangeHandler('#maleOpacity', '.male', 'opacity', '1.0');
		setChangeHandler('#femaleOpacity', '.female', 'opacity', '1.0');
		setChangeHandler('#ptOpacity', '.pt', 'opacity', '1.0');

		// set Age Group Handlers and initial values
		for (var ageGroup = 0; ageGroup <= MAX_AGE_GROUP; ageGroup++) 
			setChangeHandler(ageOpacityControlId(ageGroup), ageClass(ageGroup), 'opacity', '1.0');
		
	});
		
