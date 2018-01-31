/* bubbleChart creation function. Returns a function that will
 * instantiate a new bubble chart given a DOM element to display
 * it in and a dataset to visualize.
 *
 * Organization and style inspired by:
 * https://bost.ocks.org/mike/chart/
 *
 */

function toggle(anId) {
    node = document.getElementById(anId);
    if (node.style.visibility == "hidden") {
        // Contenu caché, le montrer
        node.style.visibility = "visible";
        node.style.height = "auto";			// Optionnel rétablir la hauteur
    }
    else {
        // Contenu visible, le cacher
        node.style.visibility = "hidden";
        node.style.height = "0";			// Optionnel libérer l'espace
    }
}


// Constants for sizing
var width = 900;
var height = 700;
var selector;
var rawData;
var activesection;

function clear() {
    $("#bar").hide();
    $("#blasons").html("");
    $("#viz").hide();
    $(".symbol").css("top", "0");
}


// Sizes bubbles based on area.
// @v4: new flattened scale names.
var radiusScale = 2;

var myBubbleChart = bubbleChart();
var data = {};


function myFunction() {
    myBubbleChart.myFunction();
    $("#all").onclick(function () {
        $('#all').css('background', 'red');
    })

};

// old way to separate the bubbles (with the "séparer" button)
function separate() {
    myBubbleChart.toggleDisplay();
    $("#all").click(function () {
        myBubbleChart.toggleDisplay();
    });
}

function erase() {
    $("#all").click(function () {
        hideTitles();
    });
}

// @v4 strength to apply to the position forces
var forceStrength = 0.03;
var forceStrengthSeparate = 0.02;
var current_index = 0;

function initialisation() {


    $.wait = function (duration) {
        return $.Deferred(function (def) {
            setTimeout(def.resolve, duration);
        });
    };

    /*
     * Function called once data is loaded from CSV.
     * Calls bubble chart function to display inside #vis div.
     */
    function data_loaded(error, data_l) {
        if (error) {
            console.log(error);
        }
        clear();
        console.log(data_l);
        data = data_l;
        myBubbleChart = bubbleChart();
        myBubbleChart('#vis', data);
        barchart();
        // comment = split then unsplit
        //separate();
        $("#vis").hide();
        $.wait(2000).then(function () {
            //separate();
        });
    }

    /*$(".problematique").click(function (e) {
     var key1 = $(this).attr('data-key1');
     var key2 = $(this).attr('data-key2');
     console.log(key1, key2);
     myBubbleChart.redraw(key1, key2);
     });*/

    /*
     * Sets up the layout buttons to allow for toggling between view modes.
     */


    /*
     * Helper function to convert a number into a string
     * and add commas to it to improve presentation.
     */
    function addCommas(nStr) {
        nStr += '';
        var x = nStr.split('.');
        var x1 = x[0];
        var x2 = x.length > 1 ? '.' + x[1] : '';
        var rgx = /(\d+)(\d{3})/;
        while (rgx.test(x1)) {
            x1 = x1.replace(rgx, '$1' + ',' + '$2');
        }

        return x1 + x2;
    }

    var scroll = scroller()
        .container(d3.select('body'));

    // pass in .step selection as the steps
    scroll(d3.selectAll('.tile'));

    // setup event handling
    scroll.on('active', function (index) {
        // highlight current step text
        //d3.selectAll('.step')
        //        .style('opacity', function (d, i) {
        //            return i === index ? 1 : 0.1;

        activesection = index;
        if (current_index != index) {

            // activate current section
            console.log("ACTIVATE " + index);
            if (index == 0 || index == 1) {
                clear();
            }

            if (index == 2) {
                clear();
                $("#blasons").html($("#step1").html());
            }

            if (index == 3) {
                $("#vis").hide();
                $("#bar, .not_selected").fadeIn(2000);
                console.log("barchart");
                $(".symbol").animate({top: "100px"}, 2000);
            }
            if (index == 4) {
                $(".not_selected").animate({opacity: 0.1}, 2000);
                $("#bar").fadeOut(2000, function () {
                    $("#vis").show();
                    setTimeout(function () {
                        myBubbleChart.redraw("AgeMoy");
                    }, 2000)
                });
                myBubbleChart.toggleDisplay();
            }
            if (index == 5) {
                $("#vis").show();
                myBubbleChart.redraw("Freq");
            }
            if (index == 6) {
                $("#vis").show();
                myBubbleChart.redraw("DpsAnnu");
            }
            if (index == 7) {
                $("#vis").show();
                myBubbleChart.redraw("CSP");

            }
        }
        current_index = index;

        /*key: d.key,
         radius: radiusScale,
         Sexe: d.Sexe,
         AnneeNaissance: d.AnneeNaissance,
         CSP: d.CSP,
         key1: 0,
         key2: 0,
         AgeDec: d.AgeDec,
         PJMJ: d.PJMJ,
         DureeMoyPartie: d.DureeMoyPartie,
         DpnsAnnull: d.DpnsAnnull,
         FreqJeu: d.FreqJeu,
         NbJeuJoue: d.NbJeuJoue,
         ClubJDR: d.ClubJDR,
         Conv: d.Conv,
         AchatJDR: d.AchatJDR,
         NbUniversAchat: d.NbUniversAchat,
         NbOuvrageAche: d.NbOuvrageAche,
         x: Math.random() * 1000,
         y: Math.random() * 700*/

    });

    scroll.on('progress', function (index, progress) {

    });
    // Load the data.
    d3.csv('data_JoueursdeCthulhu.csv', data_loaded);
    console.log("coucou");
}

function bubbleChart(abscisse, ordonnee) {

    // tooltip for mouseover functionality
    var tooltip = floatingTooltip('gates_tooltip', 240);

    // Locations to move bubbles towards, depending
    // on which view mode is selected.
    var center = {x: width / 2, y: height / 2};

    var centers = [];

    key1 = abscisse;
    key2 = ordonnee;
    // These will be set in create_nodes and create_vis
    var svg = null;
    var bubbles = null;
    var nodes = [];
    var keys1 = [];
    var keys2 = [];
    var splitted = false;
    // Charge function that is called for each node.
    // As part of the ManyBody force.
    // This is what creates the repulsion between nodes.
    //
    // Charge is proportional to the diameter of the
    // circle (which is stored in the radius attribute
    // of the circle's associated data.
    //
    // This is done to allow for accurate collision
    // detection with nodes of different sizes.
    //
    // Charge is negative because we want nodes to repel.
    // @v4 Before the charge was a stand-alone attribute
    //  of the force layout. Now we can use it as a separate force!
    function charge(d) {
        //return -Math.pow(d.radius, 2.0) * forceStrengthSeparate;
        return -forceStrengthSeparate;
    }

    // Here we create a force layout and
    // @v4 We create a force simulation now and
    //  add forces to it.
    var simulation = d3.forceSimulation()
        .velocityDecay(0.2)
        .force('x', d3.forceX().strength(forceStrength).x(center.x))
        //.force('y', d3.forceY().strength(forceStrength).y(center.y))
        .force('collide', d3.forceCollide().radius(2).iterations(2).strength(1))
        //.force('charge', d3.forceManyBody().strength(charge).distanceMax(50w00).distanceMin(1))
        .on('tick', ticked);

    // @v4 Force starts up automatically,
    //  which we don't want as there aren't any nodes yet.
    simulation.stop();

    // Nice looking colors - no reason to buck the trend
    // @v4 scales now have a flattened naming scheme
    var fillColor = d3.scaleOrdinal()
        .domain(['low', 'medium', 'high'])
        .range(['#349142']);


    /*
     * This data manipulation function takes the raw data from
     * the CSV file and converts it into an array of node objects.
     * Each node will store data and visualization values to visualize
     * a bubble.
     *
     * rawData is expected to be an array of data objects, read in from
     * one of d3's loading functions like d3.csv.
     *
     * This function returns the new node array, with a node in that
     * array for each element in the rawData input.
     */

    function updateNodes(key1, key2) {
        nodes.forEach(function (d) {
            d.key1 = d[key1];
            d.key2 = d[key2];
        });
    }

    function collide() {
        return 4;
    }

    function createNodes() {
        // Use the max total_amount in the data as the max in the scale's domain
        // note we have to ensure the total_amount is a number.
        //var maxAmount = d3.max(rawData, function (d) { return +d.total_amount; });


        // removed it, didn't break anything, left in comment just to be sure
        /*centers = {
         H: {x: width / 3, y: height / 2},
         //femme: { x: width / 2, y: height / 2 },
         F: {x: 2 * width / 3, y: height / 2}
         };*/

        // Use map() to convert raw data into node data.
        // Checkout http://learnjsdata.com/ for more on
        // working with data.
        var myNodes = rawData.map(function (d) {
            return {
                key: d.key,
                radius: radiusScale,
                Sexe: d.Sexe,
                AgeMoy: d.AgeMoy,
                CSP: d.CSP,
                key1: 0,
                key2: 0,
                AgeDec: d.AgeDec,
                Anciennete: d.Anciennete,
                DpsAnnu: d.DpsAnnu,
                Freq: d.Freq,
                x: Math.random() * 1000,
                y: Math.random() * 700
            };
        });

        // sort them to prevent occlusion of smaller nodes.
        //myNodes.sort(function (a, b) { return b.value - a.value; });
        return myNodes;
    }

    function do_redraw(svg, key1, key2) {

        // reset the state
        splitted = false;

        //svg.selectAll('.bubble').remove();

        updateNodes(key1, key2);

        nested_data = d3.nest()
            .key(function (d) {
                return d[key1];
            })
            .key(function (d) {
                return d[key2];
            })
            .entries(rawData);

        var x_num = nested_data.length;
        var y_num = d3.max(nested_data, function (d) {
            return d.values.length;
        });

        keys1 = nested_data.map(function (d) {
            return d.key
        });
        keys1.sort(function (a, b) {
            return d3.ascending(a, b)
        });

        var k2 = nested_data.map(function (d) {
            if (d.values.length == y_num) {
                return d.values.map(function (d) {
                    return d.key
                })
            }
        });
        k2.forEach(function (d) {
            if (d) {
                keys2 = d;
            }
        });
        keys2.sort(function (a, b) {
            //var order = {"1/semaine" : 1, "2/mois" : 2, "1/mois" : 3, "3/an" : 4, "1/an" : 5, "joue plus vraiment" : 6};
            return d3.ascending(a, b)
        });

        keys1.forEach(function (k1, ind1) {
            keys2.forEach(function (k2, ind2) {
                centers[k1 + '_' + k2] = {
                    x: (ind1 + 1) * width / (x_num + 1),
                    y: (ind2 + 1) * height / (y_num + 1)
                };
            })

        });


        // Set the simulation's nodes to our newly created nodes array.
        // @v4 Once we set the nodes, the simulation will start running automatically!
        simulation.nodes(nodes);
        showTitles();
        // Set initial layout to single group.
        groupBubbles();

        separate();
        erase();
    }

    /*
     * Main entry point to the bubble chart. This function is returned
     * by the parent closure. It prepares the rawData for visualization
     * and adds an svg element to the provided selector and starts the
     * visualization creation process.
     *
     * selector is expected to be a DOM element or CSS selector that
     * points to the parent element of the bubble chart. Inside this
     * element, the code will add the SVG continer for the visualization.
     *
     * rawData is expected to be an array of data objects as provided by
     * a d3 loading function like d3.csv.
     */
    var chart = function chart(selector_, rawData_) {
        // convert raw data into nodes data
        selector = selector_;
        rawData = rawData_;

        svg = d3.select(selector)
            .append('svg')
            .attr('width', width)
            .attr('height', height);

        nodes = createNodes();

        // Bind nodes data to what will become DOM elements to represent them.
        bubbles = svg.selectAll('.bubble')
            .data(nodes, function (d) {
                return d.key;
            });

        // Create new circle elements each with class `bubble`.
        // There will be one circle.bubble for each object in the nodes array.
        // Initially, their radius (r attribute) will be 0.
        // @v4 Selections are immutable, so lets capture the
        //  enter selection to apply our transtition to below.
        var bubblesE = bubbles.enter().append('circle')
            .classed('bubble', true)
            .attr('r', radiusScale)
            .attr('fill', function (d) {
                return fillColor(d.Sexe);
            })
            //    .attr('stroke', function (d) {
            //        return d3.rgb(fillColor(d.CSP)).darker();
            //    })
            //    .attr('stroke-width', 2)
            .on('mouseover', showDetail)
            .on('mouseout', hideDetail);

        // @v4 Merge the original empty selection and the enter selection
        bubbles = bubbles.merge(bubblesE);

        // Fancy transition to make bubbles appear, ending with the
        // correct radius
        //bubbles.transition()
        //    .duration(200)
        //   .attr('r', function (d) {
        //      return d.radius;
        //  });

        do_redraw(svg, "Sexe", "");


        // Create a SVG element inside the provided selector
        // with desired size.
        hideTitles();

    };

    /*
     * Callback function that is called after every tick of the
     * force simulation.
     * Here we do the acutal repositioning of the SVG circles
     * based on the current x and y values of their bound node data.
     * These x and y values are modified by the force simulation.
     */
    function ticked() {
        bubbles
            .attr('cx', function (d) {
                return d.x;
            })
            .attr('cy', function (d) {
                return d.y;
            });
    }

    /*
     * Provides a x value for each node to be used with the split by year
     * x force.
     */
    function xPos(d) {
        return centers[d.key1 + "_" + d.key2].x;
    }

    /*function yPos(d) {
     return centers[d.key1 + "_" + d.key2].y;
     }*/

    /*
     * Sets visualization in "single group mode".
     * The year labels are hidden and the force layout
     * tick function is set to move all nodes to the
     * center of the visualization.
     */
    function groupBubbles() {
        /*if (activesection === 0) {
         hideTitles();
         }
         if (activesection === 2) {
         hideTitles();
         }
         if (activesection === 8) {
         hideTitles();
         }*/
        // @v4 Reset the 'x' force to draw the bubbles to the center.
        simulation.force('x', d3.forceX().strength(forceStrength).x(center.x));
        simulation.force('y', d3.forceY().strength(forceStrength).y(center.y));
        // @v4 We can reset the alpha value and restart the simulation
        simulation.alpha(1).restart();
    }


    /*
     * Sets visualization in "split by year mode".
     * The year labels are shown and the force layout
     * tick function is set to move nodes to the
     * yearCenter of their data's year.
     */
    function splitBubbles() {

        // @v4 Reset the 'x' force to draw the bubbles to their year centers
        simulation.force('x', d3.forceX().strength(forceStrength).x(xPos));
        //simulation.force('y', d3.forceY().strength(forceStrength).y(yPos));

        // @v4 We can reset the alpha value and restart the simulation
        simulation.alpha(1).restart();
    }

    /*
     * Hides Year title displays.
     */
    function hideTitles() {
        svg.selectAll('.keys1').remove();
        svg.selectAll('.keys2').remove();
    }

    /*
     * Shows Year title displays.
     */
    function showTitles() {
        // Another way to do this would be to create
        // the year texts once and then just hide them.

        svg.selectAll(".keys1").remove();
        svg.selectAll(".keys2").remove();
        svg.selectAll(".centers").remove();

        svg.selectAll('.keys1')
            .data(keys1)
            .enter().append('text')
            .attr('class', 'keys1')
            .attr('x', function (d, ind) {
                return (ind + 1) * width / (keys1.length + 1);
            })
            .attr('y', 650)
            .attr('text-anchor', 'middle')
            .text(function (d) {
                return d.substr(2);
            });
        ;

        /*svg.selectAll('.keys2')
         .data(keys2)
         .enter().append('text')
         .attr('class', 'keys2')
         .attr('y', function (d, ind) {
         return (ind + 1) * height / (keys2.length + 1);
         })f
         .attr('x', 40)
         .attr('text-anchor', 'middle')
         .text(function (d) {
         return d.substr(2);
         });*/

        if (false) {
            var _centers = []
            $.each(centers, function (i, n) {
                _centers.push(n);
            });

            svg.selectAll('.centers')
                .data(_centers)
                .enter()
                .append("circle")
                .attr("class", "centers")
                .attr("cx", function (d) {
                    return d.x;
                })
                .attr("cy", function (d) {
                    return d.y;
                })
                .attr("r", 10)
                .style("fill", "black");
        }
    }


    /*
     * Function called on mouseover to display the
     * details of a bubble in the tooltip.
     */
    function showDetail(d) {
        // change outline to indicate hover state.
        d3.select(this).attr('stroke', 'black');

        var content = '<span class="name" style="font-weight:bold">CSP : </span><span class="value">' +
            d.CSP.substr(2) +
            '</span><br/>' +
            '<span class="name" style="font-weight:bold">AnneeNaissance : </span><span class="value">' +
            d.AnneeNaissance.substr(2) +
            '</span><br/>' +
            '<span class="name" style="font-weight:bold">Age découverte : </span><span class="value">' +
            d.AgeDec.substr(2) +
            '</span>';

        tooltip.showTooltip(content, d3.event);
    }

    /*
     * Hides tooltip
     */
    function hideDetail(d) {
        // reset outline
        d3.select(this)
            .attr('stroke', "none");

        tooltip.hideTooltip();
    }

    /*
     * Externally accessible function (this is attached to the
     * returned chart function). Allows the visualization to toggle
     * between "single group" and "split by year" modes.
     *
     * displayName is expected to be a string and either 'year' or 'all'.
     */
    chart.toggleDisplay = function () {
        console.log("TOGGLE DISPLAY !", splitted);
        if (!splitted) {
            splitted = true;
            splitBubbles();
        } else {
            splitted = false;
            groupBubbles();
        }
    };

    chart.redraw = function (key1, key2) {
        do_redraw(d3.select(selector).select("svg"), key1, key2);
    };


    // return the chart function from closure.
    return chart;
}



