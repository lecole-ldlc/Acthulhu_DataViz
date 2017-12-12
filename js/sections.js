var activateFunctions = [];

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

var setupSections = function () {
    activateFunctions[0] = bubbleChart("AnneeNaissance", "CSP");
    activateFunctions[1] = bubbleChart("AnneeNaissance", "AgeDec");
    activateFunctions[2] = bubbleChart("AnneeNaissance", "PJMJ");

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
            AnneeNaissance: d.AnneeNaissance,
            CSP: d.CSP,
            key1: 0,
            key2: 0,
            AgeDec: d.AgeDec,
            PJMJ: d.PJMJ,
            DureeMoyPartie: d.DureeMoyPartie,
            DpnsAnnull: d.DpnsAnnull,
            FreqJeu: d.FreqJeu,
            x: Math.random() * 900,
            y: 50
        };
    });

    // sort them to prevent occlusion of smaller nodes.
    //myNodes.sort(function (a, b) { return b.value - a.value; });
    return myNodes;
}

