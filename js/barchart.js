function barchart() {
    console.log("barchart");
    var width, height
    var chartWidth, chartHeight
    var margin
    var svg = d3.select("#bar").append("svg")
    var axisLayer = svg.append("g").classed("axisLayer", true)
    var chartLayer = svg.append("g").classed("chartLayer", true)

    var xScale = d3.scaleBand()
    var yScale = d3.scaleLinear()

    d3.csv("jeuxjoues.csv", cast, main)

    function cast(d) {
        d.adorateur = +d.adorateur
        return d
    }


    function main(data) {
        setSize(data)
        drawAxis()
        drawChart(data)
    }

    function setSize(data) {
        var margin = {top: 10, right: 20, bottom: 20, left: 40},
            width = 960 - margin.left - margin.right,
            height = 500 - margin.top - margin.bottom;


        chartWidth = width - (margin.left + margin.right)
        chartHeight = height - (margin.top + margin.bottom)

        svg.attr("width", width).attr("height", height)

        axisLayer.attr("width", width).attr("height", height)

        chartLayer
            .attr("width", chartWidth)
            .attr("height", chartHeight)
            .attr("transform", "translate(" + [margin.left, margin.top] + ")")


        xScale.domain(data.map(function (d) {
            return d.Dieu
        })).range([0, chartWidth])
            .paddingInner(0.1) //バー間のパディング
            .paddingOuter(0.5) //x軸両端のパディング

        yScale.domain([0, 100]).range([chartHeight, 0])

    }

    function drawChart(data) {
        //トランジションオブジェクトを生成
        var t = d3.transition()
            .duration(1000)
            .ease(d3.easeLinear)
            //トランジションイベント
            .on("start", function (d) {
                console.log("transiton start")
            }) //トランジション開始時
            .on("end", function (d) {
                console.log("transiton end")
            }) //トランジション終了時

        var bar = chartLayer.selectAll(".bar").data(data)

        bar.exit().remove()

        bar.enter().append("rect").classed("bar", true)
            .merge(bar) //選択済みセレクションをenterで追加されるセレクションにマージする
            .attr("fill", function (d) {
                if (d.Dieu == "Yog-Sothoth") {
                    return "#35C2F2"
                }
                else {
                    return "#444444"
                }
                ;
            })

            .attr("width", xScale.bandwidth())
            .attr("height", 0)
            .attr("transform", function (d) {
                return "translate(" + [xScale(d.Dieu), chartHeight] + ")"
            })


        //アニメーション
        chartLayer.selectAll(".bar").transition(t)
            .attr("height", function (d) {
                return chartHeight - yScale(d.adorateur)
            })
            .attr("transform", function (d) {
                return "translate(" + [xScale(d.Dieu), yScale(d.adorateur)] + ")"
            })
    }

    function drawAxis() {
        var yAxis = d3.axisLeft(yScale)
            .tickSizeInner(-chartWidth)


        axisLayer.append("g")
            .attr("transform", "translate(" + [40, 10] + ")")
            .attr("class", "axis y")
            .call(yAxis);

        var xAxis = d3.axisBottom(xScale)

        axisLayer.append("g")
            .attr("class", "axis x")
            .attr("transform", "translate(" + [40, chartHeight+10] + ")")
            .call(xAxis);

    }

    /*var margin = {top: 10, right: 20, bottom: 20, left: 40},
     width = 960 - margin.left - margin.right,
     height = 500 - margin.top - margin.bottom;



     // set the ranges
     var x = d3.scaleBand()
     .range([0, width])
     .padding(0.1);
     var y = d3.scaleLinear()
     .range([height, 0]);

     // append the svg object to the body of the page
     // append a 'group' element to 'svg'
     // moves the 'group' element to the top left margin
     var svg = d3.select("#bar").append("svg")
     .attr("width", width + margin.left + margin.right)
     .attr("height", height + margin.top + margin.bottom)
     .append("g")
     .attr("transform",
     "translate(" + margin.left + "," + margin.top + ")");



     // get the data
     d3.csv("jeuxjoues.csv", function (error, data) {
     if (error) throw error;

     // format the data
     data.forEach(function (d) {
     d.adorateur = +d.adorateur;
     });

     // Scale the range of the data in the domains
     x.domain(data.map(function (d) {
     return d.Dieu;
     }));
     y.domain([0, 100]);

     // append the rectangles for the bar chart
     svg.selectAll(".bar")
     .data(data)
     .enter().append("rect")
     .attr("class", "bar")
     .attr("x", function (d) {
     return x(d.Dieu);
     })
     .attr("width", x.bandwidth())
     .attr("y", function (d) {
     return y(d.adorateur);
     })
     .attr("height", function (d) {
     return height - y(d.adorateur);
     })
     .style("fill", function(d){
     if (d.Dieu=="Yog-Sothoth") {return "#3EAD4E"}
     else {return "#444444"};
     });



     // add the x Axis
     svg.append("g")
     .attr("transform", "translate(0," + height + ")")
     .call(d3.axisBottom(x));

     // add the y Axis
     svg.append("g")
     .call(d3.axisLeft(y));

     });*/

}

