    var jNodes = null;
    var graph = {};
    var chargeStrengthSlider = document.getElementById("chargeStrength");
    var linkStrengthSlider = document.getElementById("linkStrength");

    var svg = d3.select("#network");
    //var width = svg.attr("width");
    //var height = svg.attr("height");
    var rect; // = document.getElementById("network").getBoundingClientRect();
    var width; // = rect.width;
    var height; //  = rect.height;
    //var rectX;  // = rect.x;
    //var rectY; //= rect.y;


    var r = 12; //radius2460.9
    var color = d3.scaleOrdinal(d3.schemeCategory20);
    //var color = d3.scaleOrdinal().domain(domain).range(d3.schemeSet3);
    //qq = color("Age");

    var fullGraph;
    var graph;
    var levelUse; // = 'Modules' ; // 'All'; //Modules

    var link;
    var node;
    var text;

    var simulation;

    var container;

    var zoom;

    var payCalcLinkedNodes;
    var payCalcLinkedIds;
    var eloiseLinkedIds;
    var linkedNodeIds = {};

    var showPII = false;

    var linkStrengthVal; //= 0.2;
    var chargeStrengthVal;  //= -344;


    var expandedNode = null;

    var useMyers;

    var queriesReturned;

    var fullV;
    var fullE;





//  Property listeners

    function linkStrengthUpdated() {
        changeLinkStrength();
        showLinkStrength();
    }

    function chargeStrengthUpdated() {
        changeChargeStrength();
        showChargeStrength();
    }


   function levelUseChanged() {
            // if (levelUse == 'All') {
            //          gUse = fullGraph;
            // }
            // else if (levelUse == 'Modules') {
            //     gUse = graphWithLabels(fullGraph.jV, fullGraph.jE, ['Platform', 'Module', 'GCC', 'HRIS ID'])
            // }
            // graph = {nodes: gUse.jV, links: gUse.jE};
            // update();
            changeLevelRadioButtonSelection();

            initialiseGraph();

   }
