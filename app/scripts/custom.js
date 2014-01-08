 $(function(){
 	   $("#jquery_jplayer_1").jPlayer({
			ready: function (event) {
				$(this).jPlayer("setMedia", {
					oga:"flash/intro.ogg"
				}).jPlayer("play");
			},
			swfPath: "js",
			supplied: "oga",
			wmode: "window",
			smoothPlayBar: true,
			keyEnabled: true,
			autoplay:true
		});
 });


(function( $, window, undefined ){ 

	var dataKey = 'lazyLinePainter';
	var methods = {
		// setup lazy line data
		init : function( options ) { 

			return this.each(function(){

				var $this = $(this),
					d = $this.data( dataKey );

				$this.addClass('lazy-line');

				// If the plugin hasn't been initialized yet
				if ( ! d ) { 

					/*
						SETUP DATA
					*/

					// Collect settings, define defaults
					var o = $.extend( {
							'width'			: null,
							'height'		: null,
							'strokeWidth'	: 2,
							'strokeColor'	: '#000',
							'strokeCap'		: 'round',
							'strokeJoin'	: 'round',
							'strokeOpacity'	: 1,
							'strokeDash'	: null,
							'onComplete'	: null, 
							'delay'			: null,
							'overrideKey'	: null
						},  options);  

					// Set up path information
					// if overrideKey has been defined - use overrideKey as key within the svgData object.
					// else - use the elements id as key within the svgData object.
					var target = ( o.overrideKey === null ) ? $this.attr('id').replace('#','') : o.overrideKey;
					
					var	$w = o.svgData[target].dimensions.width, 
						$h = o.svgData[target].dimensions.height;

					o.svgData  = o.svgData[target].strokepath;

					// Setup dimensions
					if( o.width  === null ) o.width  = $w;
					if( o.height === null ) o.height = $h; 

					// Setup Rapheal 
					var $s = $this.attr("id"); // Requires Id
					var paper = new Raphael($s, $w, $h);
					
				 
					/*
						BIND DATA TO ELEMENT
					*/

					$this.data( dataKey , { 
						'svgData'		: o.svgData,
						'width'			: o.width,
						'height'		: o.height,
						'strokeWidth'	: o.strokeWidth,
						'strokeColor'	: o.strokeColor,
						'strokeCap'		: o.strokeCap,
						'strokeJoin'	: o.strokeJoin,
						'strokeOpacity'	: o.strokeOpacity,
						'strokeDash'	: o.strokeDash,
						'onComplete'	: o.onComplete, 
						'delay'             : o.delay,
						'overrideKey'       : o.overrideKey,
						'paper'             : paper,
						'count'             : 1,
						'complete'          : false,
						'playhead'          : 0,
						'setTimeOutHandler' : []
					}); 
				}
			});

		},


		/*
			PAINT LAZY LINE DATA
		*/
		paint : function( ) { 

			return this.each(function(){

				var $this = $(this),
				d = $this.data( dataKey );  

				var init = function(){

					// Set width / height of container element
					$this.css({'width' : d.width, 'height' : d.height});

					// Loop paths 
					$.each(d.svgData, function (i, val) {

						var p = d.paper.path(val.path);

						p.attr({ 
							"stroke" : "none",
							"stroke-width": d.strokeWidth,
							"fill-opacity": 0
						});

						var sto = setTimeout(function () {
							var s = draw({
								'count'	: d.count,
								'canvas'   : d.paper, 
								'pathstr'  : p, 
								'duration' : val.duration, 
								'attr'     : applyStyles( d, val ),
								'callback' : function (e) {  

									// remove reference to setTimeOut
									d.setTimeOutHandler.splice(d.count,1);

									d.count++; 

									if ((d.svgData.length+1) == d.count){
											d.complete = true;
											if(d.onComplete !== null) d.onComplete.call($this);
										}
									}
								});

						}, d.playhead);

						d.playhead += val.duration;

						// Keep track of setTimeOuts calls
						d.setTimeOutHandler.push(sto); 

					});
				};
 

				// if delay isset
				if(d.delay === null)
					init();
				else
					setTimeout(init, d.delay);
			});
		},


		/*
			ERASE LAZY LINE DATA
		*/
		erase : function( ) { 

			return this.each(function(){

				var $this = $(this);
				$this.find('svg').empty();
				d = $this.data( dataKey ); 

				// reset properties
				for (i = 0; i < d.setTimeOutHandler.length; i++) {
					clearTimeout( d.setTimeOutHandler[i] );
				}

				d.playhead = 0;
				d.count = 0;
				d.complete = false; 
			});
		},


		/*
			DESTROY LAZY LINE DATA & ELEMENT
		*/
		destroy : function( ) { 

			return this.each(function(){

				var $this = $(this),
				d = $this.data( dataKey ); 
				$this.removeData( dataKey ); 
				$this.remove();
			});
		},


		/*
			STAMP LAZY LINE DATA 
		*/
		stamp : function( ) { 

			return this.each(function(){

				var $this = $(this),
				d = $this.data( dataKey );  
				
				var init = function(){

					// Set width / height of container element
					$this.css({'width' : d.width, 'height' : d.height});

					// Loop paths 
					//$.each(d.svgData, function (i, val) {
					for (i = 0; i < d.svgData.length; i++) {
						d.paper.path( d.svgData[i].path ).attr( applyStyles( d, d.svgData[i] ) );
					}
					 
				};
				
				// if delay isset
				if(d.delay === null)
					init();
				else
					setTimeout(init, d.delay);
			}); 
		} 
	};



	var applyStyles = function( data, value ) {
 
		var styles = {
			"stroke"		: ( !value.strokeColor ) ? data.strokeColor : value.strokeColor,
			"fill-opacity"    : 0,
			"stroke-dasharray": ( !value.strokeDash )	? data.strokeDash : value.strokeDash,
			"stroke-opacity"  : ( !value.strokeOpacity )? data.strokeOpacity : value.strokeOpacity,
			"stroke-width"    : ( !value.strokeWidth )	? data.strokeWidth : value.strokeWidth,
			"stroke-linecap"  : ( !value.strokeCap )	? data.strokeCap : value.strokeCap,
			"stroke-linejoin" : ( !value.strokeJoin )	? data.strokeJoin : value.strokeJoin
		};

		return styles;
	};
	
 

	var draw = function( settings ) {

		var canvas   = settings.canvas, 
			pathstr  = settings.pathstr, 
			duration = settings.duration, 
			attr     = settings.attr, 
			callback = settings.callback;

		var guide_path;
		
		if ( typeof( pathstr ) == "string" )
			guide_path = canvas.path( pathstr ).attr( { stroke: "none", fill: "none" } );
		else
			guide_path = pathstr;

		var path = canvas.path( guide_path.getSubpath( 0, 1 ) ).attr( attr ),
			total_length = guide_path.getTotalLength( guide_path ),
			last_point = guide_path.getPointAtLength( 0 ),
			start_time = new Date().getTime(),
			interval_length = 25;        

		var interval_id = setInterval( function()
		{
			var elapsed_time = new Date().getTime() - start_time,
				this_length = elapsed_time / duration * total_length,
				subpathstr = guide_path.getSubpath( 0, this_length );  

			attr.path = subpathstr;

			path.animate( attr, interval_length );
			if ( elapsed_time >= duration )
			{
				clearInterval( interval_id );
				if ( callback !== undefined ) callback();
				guide_path.remove();
			}                                       
		}, interval_length );   
	};
	

	$.fn.lazylinepainter = function(method){ 

		if ( methods[method] ) { 

			return methods[method].apply( this, Array.prototype.slice.call( arguments, 1 ));

		} else if ( typeof method === 'object' || ! method ) {

			return methods.init.apply( this, arguments );

		} else {
			 // error
		}  
	};

})( jQuery, window );

$(function(){
	$('.4u').on('click','h6[rel=#mies3]',function(){
		$('#mies3 h4').hide();
		flashembed('flash1','flash/KefexLoader.swf');
	});
	$('.4u').on('click','h6[rel=#mies4]',function(){
		$('#mies4 h4').hide();
		flashembed('flash2','flash/AppLoader.swf');
	});
	$('.simple_overlay').on('click','.close',function(){
		$('#mies2 h4').show();
		$('#flash1,#flash2').html('');
	});
	$('h6[rel]').overlay();
	$('.video').magnificPopup({
		  type: 'iframe'
		});
	$('h6[rel=]').click(function(){
		alert('Flash apps are not supported on your mobile or this Browser');
	});
});

$(function(){
    angular.element(document).ready(function() {
           angular.bootstrap(document, ['jkefex']);
      });
});

(function(){
	var width = 1120,
	  height = 400,
	  radius = 10;

	var p0 = [250, 200, 60,'JKefex - JS',],
	  p1 = [560, 300, 120,'Kiran Kumar Amruthaluri',];

	var svg = d3.select(".wrapper-style6").append("svg")
	  .attr('id','hex')
	  .attr("width", width)
	  .attr("height", height)
	.append("g")
	  .call(transition, p0, p1);

	svg.append("path")
	  .attr("class", "mesh")
	  .attr("d", d3.hexbin()
	    .size([width, height])
	    .radius(radius)
	    .mesh);

	svg.selectAll("circle")
	  .data([p0, p1])
	.enter().append("circle")
	  .attr("class", function(d, i) { return i ? "end" : "start"; })
	  .attr("cx", function(d) { return d[0]; })
	  .attr("cy", function(d) { return d[1]; })
	  .attr("r", function(d) { return d[2] / 2 - .5; });

	svg.selectAll("text")
	  .data([p0, p1])
	  .enter().append("text")
	  .attr("x", function(d) { return d[0]; })
	  .attr("y", function(d) { return d[1]; })
	  .text(function(d,i){ return d[3]; })
	  .style('font-size','20px');

	function transition(svg, start, end) {
	var center = [width / 2, height / 2],
	    i = d3.interpolateZoom(start, end);

	svg
	    .attr("transform", transform(start))
	  .transition()
	    .delay(250)
	    .duration(i.duration * 2)
	    .attrTween("transform", function() { return function(t) { return transform(i(t)); }; })
	    .each("end", function() { d3.select(this).call(transition, end, start); });

	function transform(p) {
	    var k = height / p[2];
	    return "translate(" + (center[0] - p[0] * k) + "," + (center[1] - p[1] * k) + ")scale(" + k + ")";
	  }
	}

})();

(function(){
	var pathObj = {
		    "lazy": {
		        "strokepath": [
		            {
		                "path": "m 304.5,-281.00002 c -18.2,-42.5 -21.2,-26.3 -24.3,-43.5 -3,-17.2 -5.93676,-7.16147 2.36324,-21.86147 8.9,-15.6 6.73676,-14.23853 8.73676,-16.53853 4.5,-5.1 22.22931,-40.60126 -7.3,-5.6 -14.2,13.1 -11.5,25.9 -28.7,-7.4 -7.98005,-7.42665 -4.58974,-9.2626 -14.5,-20.4 -18.26087,-20.52201 -21.2,-35.4 -37.4,-50.5 -16.2,-15.2 -16.2,-24.3 -27.3,-8.1 -11.1,16.2 -24.3,6.1 -32.4,23.3 -8.1,17.2 -2,12.1 -22.3,31.3 -20.2,19.2 -26.3,31.3 -45.5,29.3 -19.2,-2 -35.4,-13.1 -32.4,6.1 3,19.2 1,35.4 3,45.5 2,10.1 -7.336754,-65.17819 -7.336754,-65.17819 L 46.5,-416.40002 l 19.2,-31.3 38.4,-42.5 21.2,-13.1 25.3,-8.1 36.4,-5.1 23.3,3 c 0,0 17.2,6.1 29.3,12.1 12.1,6.1 9.43675,11.50226 27.3,32.4 14.2,25.3 11.1,24.3 19.2,44.5 8.1,20.2 6.1,22.2 11.1,32.4 5.38224,13.4017 6.37476,15.63831 0.5053,28.30622 -1.59791,3.44874 -1.28411,12.34193 -2.85919,16.21559 -6.01021,14.78114 0.35389,13.17819 5.35389,31.37819 5.1,18.2 14.2,25.3 9.1,31.3 -5.1,6.1 -5.1,4 -5.1,4 z",
		                "duration": 1800
		            },
		            {
		                "path": "m 303.7,-350.52233 c 0,-12.12178 -2.7402,-17.52056 2.7402,-15.17769 5.5587,2.34287 3.36654,0 8.2989,6.92673 4.93236,6.92673 6.49819,8.25096 10.0996,14.15906 3.60141,5.90809 1.40925,2.54659 1.40925,2.54659",
		                "duration": 600
		            },
		            {
		                "path": "m 306.5,-333.10002 c 2,12.6 -7.3,8.8 -1,14.2 6.3,5.3 6.3,5.1 8.6,11.1 2.3,6.1 0.5,9.4 2.8,10.9 2.3,1.5 1.5,1.8 3.5,-5.1 2,-6.8 2,-6.8 2,-6.8",
		                "duration": 600
		            },
		            {
		                "path": "m 327,-233.80002 c -3,-16.7 -6.3,-21.5 -4,-25.8 2.3,-4.3 2.5,-1.5 2.5,-1.5",
		                "duration": 600
		            },
		            {
		                "path": "m 286,-369.30002 c -43.6,42.7 -54.7,55.2 -58.1,56.1 -3.4,0.9 -2.5,2.7 -6.6,1.4 -4.1,-1.3 -6.8,-4.1 -8.6,-2.7 -1.8,1.4 -14.1,5 -20.7,10 -6.6,5 -30.2,22.9 -34.5,26.8 -4.3,3.9 -8,10.5 -11.1,15.7 -3,5.2 -6.3,8.2 -12.3,10.2 -6.1,2 -7.5,1.6 -12.5,2.3 -5,0.7 -2.9,-1.4 -12.2,2.9 -9.3,4.3 -19.7,10.4 -25.6,15.2 -5.9,4.8 -8.2,5 -13.8,11.4 -5.5,6.4 -7.5,5.2 -7.7,12.7 -0.2,7.5 -5,6.8 0,13.4 5,6.6 4.7,6.3 7,8.8 2.3,2.5 4.1,7.9 4.1,7.9",
		                "duration": 800
		            },
		            {
		                "path": "m 90.319316,-169.82262 c 7.250827,-2.14376 8.459299,-2.04168 13.696004,-5.51255 5.23671,-3.47086 6.6466,-4.90004 11.37977,-8.3709 4.22965,-3.16462 3.82683,-3.06253 10.27201,-8.37091 5.53883,-4.49171 3.62541,-2.96045 7.95577,-6.94173 4.53177,-4.18546 3.02118,-18.37517 3.92753,-27.56275 0.90635,-9.0855 -0.90635,-9.69801 -0.20141,-13.67929 1.40988,-7.7584 4.63247,-8.47299 10.97695,-6.53339 6.848,2.04168 3.62541,0.91876 10.07059,5.51255 6.44518,4.59379 2.01412,4.38962 7.35153,7.45215 5.43812,3.06252 1.10777,3.67503 10.27201,3.06252 9.46636,-0.6125 6.14306,-0.40833 13.29318,-4.59379 7.25083,-4.18545 7.75436,-1.63334 15.71013,-7.86048 7.95577,-6.22714 11.68189,-6.94173 18.02636,-14.18972 6.34448,-7.24798 10.27201,-7.86048 10.77554,-11.53552 0.50353,-3.67503 0.20141,-5.61463 -0.20141,-12.25011 -0.40283,-6.53339 -2.01412,-8.77924 1.30917,-11.53552 3.22259,-2.75627 7.25083,-6.73756 6.84801,-8.37091 -0.40283,-1.63334 5.23671,-5.51255 9.56706,-10.92301 4.33036,-5.51255 12.28613,-13.88346 17.32142,-21.13144 5.0353,-7.24798 13.88156,-16.81182 22.34085,-29.36818",
		                "duration": 1800
		            },
		            {
		                "path": "m 80.6,-410.60002 c 4.7,-6.7 8.5,-13.9 12.8,-20.8 3.4,-5.4 6.8,-10.9 10.4,-16.2 2.8,-4.1 5.8,-8.1 8.8,-12.1 4,-5.4 8.9,-11.1 16.1,-12.2 0,0 -8.4,6.4 -8.4,6.4 l 0,0 c -3.3,1.5 -2.1,1 7.4,-4.4 0.4,-0.2 -0.8,0.5 -1.1,0.8 -2,1.6 -3.5,3.7 -5.1,5.6 -3.1,4.1 -6.4,8.1 -9.3,12.3 -3.7,5.2 -7,10.7 -10.3,16.1 -4,6.7 -7.7,13.5 -11.4,20.3 0,0 -9.8,4.2 -9.8,4.2 z",
		                "duration": 800
		            },
		            {
		                "path": "m 275.2,-382.60002 c -2.1,-10.6 -6.1,-20.7 -9.9,-30.8 -3.9,-10.1 -7.6,-20.4 -12.7,-30 -0.9,-1.5 -1.7,-3 -2.9,-4.3 -1,-1.1 -2.3,-2 -3.6,-2.8 -3,-1.9 -5.7,-4.2 -8.5,-6.4 -2.9,-2.5 -6,-4.8 -9.1,-7 -2.4,-1.7 -4.9,-3.5 -7.5,-5 -2.1,-1.3 -4.3,-2.3 -6.6,-3.3 -3.2,-1.1 -6.6,-2 -9.9,-2.7 -4.3,-0.7 -8.7,-1.1 -13.1,-1.3 -7.2,-0.3 -14.4,-0.1 -21.6,0.3 -10.4,0.9 -20.6,3 -30.8,4.9 -7.1,1.2 -14.2,2.3 -21.3,3.8 -3.3,0.7 -6.4,2.2 -9.5,3.5 -2,0.8 -3.9,1.6 -5.9,2.4 -0.9,0.3 -1.8,0.7 -2.6,1 -0.7,0.3 -1.4,0.6 -2.2,1 -0.6,0.3 -2.3,1.2 -1.7,0.9 11.7,-6.8 8,-5.1 5,-1.9 -1.6,2 -2.8,4.3 -3.7,6.7 -0.6,1.9 -0.9,3.9 -1.3,5.9 -0.5,2.3 -0.6,4.8 -0.9,7.1 -0.3,1.7 -0.5,3.5 -0.6,5.2 -0.4,2.3 -1.6,4.4 -2.6,6.5 0,0 -9.5,4.3 -9.5,4.3 l 0,0 c 1,-1.9 2,-3.9 2.6,-6 0.1,-1.8 0.3,-3.5 0.7,-5.3 0.4,-2.4 0.4,-4.8 0.9,-7.2 0.4,-2 0.6,-4.1 1.2,-6 0.9,-2.5 2.1,-5 3.6,-7.1 0.2,-0.2 2,-2.3 2.2,-2.5 5.4,-3.5 10.6,-6.5 16.6,-8.6 5.2,-2.1 10.2,-4.5 15.6,-5.8 6.9,-1.4 13.8,-2.1 20.7,-3.3 10.3,-2 20.6,-4.1 31.1,-5 7.3,-0.5 14.7,-0.8 22,-0.5 4.5,0.2 8.9,0.5 13.3,1.3 3.4,0.7 6.8,1.6 10.1,2.8 2.3,1 4.6,2 6.8,3.4 2.5,1.6 4.9,3.4 7.4,5.2 3.1,2.3 6.2,4.6 9.2,7.1 2.8,2.2 5.5,4.5 8.5,6.4 0.7,0.5 2.1,1.5 2.7,2 1.8,1.6 2.8,3.7 3.8,5.8 4.2,10.1 7.5,20.6 11.6,30.7 4,10.1 7.8,20.2 11.8,30.2 0,0 -9.4,4.8 -9.4,4.8 z",
		                "duration": 1800
		            },
		            {
		                "path": "m 77.2,-395.00002 c 4.7,-5 8.8,-10.4 13,-15.8 6.9,-8.9 12.9,-18.5 19.8,-27.4 4.3,-5.3 9.4,-10 15.1,-13.7 1.1,-0.7 2.1,-1.3 3.2,-2 4,-2.2 10.2,-6 15.1,-8.2 4.4,-2 9.1,-3.6 13.6,-5.4 6.7,-3.3 13.5,-6.5 20.5,-9.2 4,-1.5 8.1,-2.4 12.4,-2.8 4.9,-0.3 9.7,-0.9 14.6,-1.5 2.6,-0.4 1.3,-0.2 3.8,-0.5 0,0 -8.2,6.1 -8.2,6.1 l 0,0 c -2.4,0.3 -1.2,0.1 -3.7,0.4 -4.9,0.6 -9.7,1.1 -14.6,1.5 -4.1,0.5 -8.2,1.3 -12,2.8 -6.9,2.6 -13.6,5.9 -20.3,9.1 -4.5,1.8 -9.1,3.4 -13.5,5.5 -1.1,0.5 -4.3,2.5 -3.3,1.7 1.5,-1.2 3.3,-2 5,-3 -7.1,4.2 -13.5,9 -18.8,15.5 -1.1,1.3 -2.1,2.6 -3.2,3.9 -5.9,7.6 -10.8,15.9 -16.7,23.5 -4,5.1 -7.8,10.3 -11.8,15.4 0,0 -9.8,4 -9.8,4 z",
		                "duration": 1300
		            },
		            {
		                "path": "m 60.6,-414.20002 c 3.4,-2.4 6.2,-5.6 9.1,-8.7 3.7,-4 5.6,-5.9 9.5,-9.9 12.9,-13.4 27,-25.6 41.4,-37.4 10.1,-8 20.5,-15.7 31.6,-22.4 4.9,-1.9 9.2,-6.2 14.5,-7.6 1.4,-0.4 2.7,-0.4 4.1,-0.5 4.1,0.1 8.2,0 12.2,-0.3 3.3,-0.3 1.7,-0.1 4.8,-0.5 0,0 -8.1,6 -8.1,6 l 0,0 c -3.1,0.3 -1.5,0.2 -4.8,0.4 -4.2,0.3 -8.3,0.5 -12.5,0.5 -1.3,0.1 -2.6,0.2 -3.9,0.6 -3,1 -9,4.6 2.7,-2.2 -11.6,6.7 -22.6,14.5 -33.1,22.8 -14.3,11.6 -28.2,23.6 -40.9,37 -4.1,4.4 -5.1,5.4 -8.9,9.7 -2.6,2.9 -5,5.9 -8,8.4 0,0 -9.9,3.9 -9.9,3.9 z",
		                "duration": 1000
		            },
		            {
		                "path": "m 78.4,-212.50002 c -8.6,9.9 -15.2,-0.3 -8.9,9.9 6.3,10.1 6.3,8.8 6.3,8.8 l 3.201695,-9.86693 -0.594915,-9.16931 3.99322,11.23624 c -0.01281,10.47534 3.355403,14.31212 3.862712,22.70554",
		                "duration": 600
		            },
		            {
		                "path": "m 92.5,-191.60002 c 20.7,-8.8 13.2,4.8 23.3,-10.4 10.1,-15.2 10.6,-17.2 11.6,-18.4 1,-1.3 1.8,0.3 1.8,0.3",
		                "duration": 600
		            },
		            {
		                "path": "m 84.631672,-204.1961 c 1.158442,-9.13399 1.158442,-13.70099 4.402082,-18.50835 3.24364,-4.80737 3.475328,-4.80737 11.121056,-6.73031 7.64572,-1.80276 3.24364,-6.73031 13.20625,-2.16332 9.96261,4.567 8.80417,3.60553 10.54183,4.80737 1.73766,1.20184 6.13975,0.96147 -3.82286,4.20644 -9.96261,3.36516 -16.44989,5.16792 -20.85197,9.97528 -4.402092,4.80736 -14.017167,8.77344 -14.596388,8.17252 z",
		                "duration": 800
		            },
		            {
		                "path": "m 180.8,-255.20002 c 15.2,-0.5 31.4,-4.3 35.7,-10.4 4.3,-6.1 9.9,-5.8 9.6,-9.1 -0.3,-3.3 -0.3,-3.3 -0.3,-3.3",
		                "duration": 600
		            },
		            {
		                "path": "m 177.3,-263.60002 c 4,-7.3 6.6,-16.9 14.2,-21.5 7.6,-4.5 8.6,-5.8 14.2,-7.3 5.6,-1.5 9,-2.9 12.2,-2.2 3.2,0.7 5.4,-0.2 4.5,1.1 -0.9,1.3 -4.7,6.4 -10,11.1 -5.4,4.6 -12,8.2 -17.5,11.3 -5.5,3 -8.9,4.5 -12.5,6.3 -3.6,1.8 -5,1.3 -5,1.3 z",
		                "duration": 600
		            },
		            {
		                "path": "m 66.240387,-210.69373 c 9.896954,-9.93329 11.876345,-10.32283 18.309364,-14.60778 6.433021,-4.28495 1.385574,-2.72678 9.600048,-6.23265 8.214471,-3.60325 7.205471,-7.8193 14.608901,-8.00834 11.19507,-0.28584 6.70813,-2.58543 10.76587,0.4335 3.95879,3.11633 4.613,-0.80029 7.48312,6.21145 2.87011,7.01173 3.16702,7.98558 4.25569,13.04961 1.08866,5.06403 4.2557,4.18757 -1.2866,12.07577 -5.5423,7.8882 -5.64126,8.95943 -10.29283,12.66007 -4.65159,3.70065 -15.53824,12.75747 -19.2001,13.82871 -3.661874,0.97384 -6.136113,4.96663 -11.18356,3.79801 -5.047446,-1.07124 -23.455782,-25.70968 -23.55475,-29.31294 -0.09897,-3.60326 0.296908,-3.79802 0.296908,-3.79802 z",
		                "duration": 1400
		            },
		            {
		                "path": "m 213.49853,-309.36294 c 8.18402,7.8052 8.08299,5.49255 10.60891,11.85233 2.52594,6.35978 2.72801,6.84159 4.0415,12.33412 1.41452,5.49255 3.53631,5.97435 0.90933,11.56325 -2.72801,5.5889 -1.31348,2.79445 -5.35497,7.22703 -4.0415,4.33622 -11.41722,11.46688 -21.11679,15.41766 -9.69959,4.04714 -9.69959,4.72165 -17.37842,6.93795 -7.67884,2.21628 -10.10373,5.01073 -13.84211,2.409 -3.73838,-2.60172 -20.30849,-13.49045 -17.68152,-21.10292 2.728,-7.51611 10.60891,-13.77953 13.84211,-17.92302 3.23319,-4.1435 19.60122,-11.4669 22.2282,-14.93586 2.72801,-3.56534 23.64272,-13.77954 23.64272,-13.77954 z",
		                "duration": 1300
		            },
		            {
		                "path": "m 137.5,-183.00002 c -4.6,24.5 -4.6,20.7 -6.6,31.6 -2,10.9 -3.5,1.8 -2,10.6 1.5,8.8 0.5,5.6 3.8,11.6 3.3,6.1 7.3,12.9 7.3,12.9 l 0.3,-1.5",
		                "duration": 600
		            },
		            {
		                "path": "m 211.7,-214.00002 c 37.4,11.6 33.6,8.8 37.4,11.6 3.8,2.8 1.5,2.8 1.5,2.8",
		                "duration": 600
		            },
		            {
		                "path": "m 144.1,-157.20002 c 0.8,-4.3 7.3,-5.1 7.3,-5.1 0,0 14.7,3.3 11.9,2.5 -2.8,-0.8 -2.8,-0.8 -2.8,-0.8 l 2.5,1.5",
		                "duration": 600
		            },
		            {
		                "path": "m 150,-234.00002 c 4.3,36.1 1.1,32.9 3.2,43.6 2.1,10.7 2.1,10.7 2.1,10.7",
		                "duration": 600
		            },
		            {
		                "path": "m 146.1,-118.60002 c 5.7,-12.9 1.1,-10.7 12.9,-17.9 11.8,-7.1 7.1,1.2 20,-8.9 13.6,-10.7 7.2,-11.1 24,-18.9 16.8,-7.9 15,-10.7 26.5,-13.2 11.2,-2.4 22.5,-4.3 14,8.6 -8.6,12.9 -1.1,6.1 -15,17.5 -14,11.4 -15.7,16.8 -19.3,22.2 -3.6,5.4 -4.3,6.7 -14.3,13.9 -8.9,6.4 -5.7,6.4 -18.6,6.1 -11.3,-0.3 -15.7,-4.6 -22.2,-6.1 -6.4,-1.4 -7.9,-3.2 -7.9,-3.2 z",
		                "duration": 600
		            },
		            {
		                "path": "m 149.3,-119.30002 c 21.1,-6.8 13.6,-0.7 27.9,-9.7 14.3,-8.9 17.2,-7.9 25,-15.7 7.9,-7.9 11.4,-5.4 17.9,-13.6 6.4,-8.2 6.1,-9.7 13.6,-11.8 7.5,-2.1 11.4,-3.9 11.4,-3.9",
		                "duration": 600
		            },
		            {
		                "path": "m 250.2,-188.60002 c 7.2,18.9 6.4,5.4 7.2,18.9 0.7,13.6 0.7,10.4 0.7,10.4",
		                "duration": 600
		            },
		            {
		                "path": "m 257.3844,-49.231989 c 26.42819,-34.655411 17.27636,-18.936964 26.42819,-34.655411 25.33349,-43.51079 22.40869,-46.17263 29.44281,-65.05671 7.13461,-18.88409 9.64679,-19.92168 9.64679,-19.92168",
		                "duration": 600
		            },
		            {
		                "path": "m 308,-106.10002 c 0,0 -14.7,40.4 -16.7,38.9 -2,-1.5 0.5,1 0.5,1",
		                "duration": 600
		            },
		            {
		                "path": "m 270.6,-123.30002 c 7.1,29.3 7.1,29.3 7.1,29.3",
		                "duration": 600
		            },
		            {
		                "path": "m 178.11465,-94.537983 c 7.02864,-2.220113 2.67478,3.243245 14.06945,-6.163167 9.92471,-8.19295 16.81838,-9.49604 21.91838,-17.59604",
		                "duration": 600
		            },
		            {
		                "path": "m 335.44081,-280.64251 c 6.6,-11.1 7.15919,-1.75751 7.35919,-14.35751 0.3,-12.6 0.8,-10.1 -0.5,-21.2 -1.3,-11.1 -6.1,-14.4 -6.1,-19.7 0,-5.3 -3.8,-16.9 -3.8,-16.9 0,0 -2.8,-8.8 -7.8,-15.7 -5.1,-6.8 -1,-10.6 -11.1,-11.4 -10.1,-0.8 -8.9,9.4 -11.1,0 -2.3,-9.4 -8.9,-22.5 -11.6,-31.1 -2.8,-8.6 -5.1,-15.2 -8.6,-26.5 -3.5,-11.4 -11.1,-26.5 -15.4,-32.1 -4.3,-5.6 -20.5,-23 -24.8,-27 -4.3,-4 -25.3,-14.4 -35.2,-18.7 -9.9,-4.3 -24.8,1 -42,3.8 -17.2,2.8 -32.4,6.6 -39.7,10.9 -7.3,4.3 -35.4,26.3 -42.2,32.6 -6.8,6.3 -14.4,20 -20.5,28.3 -6.1,8.3 -5.6,7.8 -12.1,19.7 -6.6,11.9 -10.1,21.7 -10.6,35.6 -0.5,13.9 2.8,47.5 6.1,60.9 3.3,13.4 7.6,22.5 12.4,38.9 4.8,16.4 9.1,22.7 9.4,29.6 0.3,6.8 -0.3,7.6 0,14.9 0.3,7.3 1.159322,12.59188 4.759322,17.19188 -1.790292,4.66481 -23.740488,17.44459 1.90678,45.95327 4.8,6.6 1.033898,4.55485 7.033898,6.35485 2.90678,3.82337 7.1,-7.8 8.6,2.3 1.5,10.1 2.8,19 7.1,27 4.3,8.1 10.1,18.7 16.4,23.8 6.3,5.1 15.9,17.7 24,23.8 8.1,6.1 16.9,13.1 25,18.7 8.1,5.6 10.9,7.6 17.5,15.4 6.6,7.8 7.6,6.8 11.4,12.9 15.89167,24.06153 40.58782,4.200403 59.2,-1.011287 5.38549,-2.804274 8.86259,-4.928361 14.2,2.211287 2.43018,8.876015 41.58736,19.839519 40.24068,52.7695107 0,0 3.15932,23.7304893 5.25932,11.1304893 2,-12.6 0,-3.8 1.5,-18.7 1.5,-14.9 0.8,-12.4 3.5,-22.7 2.8,-10.4 -4,6.8 3,-20.5 7.1,-27.3 2,-22.2 5.6,-31.8 3.5,-9.6 0.8,-8.8 4.8,-26.3 4,-17.4 4.3,-54.1 8.3,-70.3 4,-16.2 3,-22.5 4.8,-29.6 7.05095,-13.0145 -14.90626,-41.23401 -10.88974,-68.66204 -0.74457,-1.89135 -0.13562,0.63144 4.63055,-10.48045 z",
		                "duration": 1800
		            },
		            {
		                "path": "m 71.644298,-236.37602 c 14.300336,-18.4895 16.188548,-17.87165 28.600672,-22.89177 7.14881,-2.89136 14.30034,1.32067 14.30034,1.32067",
		                "duration": 600
		            },
		            {
		                "path": "m 144.65128,-276.43662 c 0,0 7.43582,-15.61194 16.93461,-25.53311 10.53709,-11.00567 37.25613,-17.60906 39.89041,-18.48952 2.63427,-0.88045 2.63427,-0.88045 2.63427,-0.88045",
		                "duration": 600
		            },
		            {
		                "path": "m 143.92102,-126.81715 c 5.85423,-13.07405 -0.53221,-15.25306 9.84576,-17.74335 10.37796,-2.4903 15.16779,-3.73544 18.89322,-6.53703 3.72542,-2.80159 4.25762,-3.73544 4.25762,-3.73544 0,0 3.19323,-8.71604 6.38645,-9.02733 3.19322,-0.31128 9.84576,-8.09346 13.03898,-9.33861 3.19322,-1.24515 7.98305,-5.60316 10.91017,-5.29188 2.92712,0.31129 12.24068,-4.35801 16.4983,-4.98059 4.25763,-0.62257 5.05593,-3.11287 9.31356,-2.4903 4.25763,0.62257 2.12882,0.93387 2.12882,0.93387",
		                "duration": 1000
		            },
		            {
		                "path": "m 96.597095,-226.3226 c 1.936076,3.82701 -0.08093,2.89644 1.393429,6.72927 1.211549,3.14961 6.851816,1.7411 6.722526,-0.83812 -0.12928,-2.57922 1.45087,-5.58772 -2.55685,-6.04287 -4.007727,-0.45515 -6.593358,-1.97234 -5.559105,0.15172 z",
		                "duration": 600
		            },
		            {
		                "path": "m 196.27773,-285.14357 c 1.84165,4.41463 -0.077,3.34117 1.32547,7.76252 1.15245,3.63321 6.5176,2.00843 6.39463,-0.96682 -0.12298,-2.97524 1.25928,-8.56082 -2.43214,-6.97071 -1.03752,0.44691 -5.76667,-2.09827 -5.28796,0.17501 z",
		                "duration": 600
		            }
		        ],
		        "dimensions": {
		            "width": 350,
		            "height": 500
		        }
		    }
		}; 
		 
		$(function(){ 
			 
			$('#lazy').lazylinepainter({
			    "svgData": pathObj,
			    "strokeWidth": 3,
			    "strokeColor": "#000"
			 }).lazylinepainter('paint');

			$('#lazy').css('overflow','hidden');

		});

		$(function(){
			$.get('http://kiranml1.nodejitsu.com/',function(data){
				$.notifyBar({
				    html: "Thank you, Number of Visits : " + data.visits,
				    position: "bottom"
				}); 
				console.log(data);
			});
		});
})();

