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
    var linkLabel;

    var simulation;

    var container;

    var zoom;

    var payCalcLinkedNodes;
    var payCalcLinkedIds;
    var eloiseLinkedIds;
    var linkedNodeIds = {};

    var showPII = false;

    var showLinkLabels = false;

    var defaultLinkStrengthVal = 0.3;
    var defaultChargeStrengthVal  = -344; //-344;

    var linkStrengthVal; //= 0.2;
    var chargeStrengthVal;  //= -344;


    var expandedNode = null;

    var useMyers;

    var queriesReturned;

    var fullV;
    var fullE;

    var attractDataTypes = false;

    var retrieveVerticesStartTime;
    var retrieveVerticesEndTime;
    var retrieveEdgesStartTime;
    var retrieveEdgesEndTime;
    var retrieveModuleStartTimes = {};
    var retrieveModuleEndTimes = {};




//  Property listeners

    function linkStrengthUpdated() {
        //changeLinkStrength();
        changeChargeOrLinkStrength();
        showLinkStrength();
    }

    function chargeStrengthUpdated() {
        //changeChargeStrength();
        changeChargeOrLinkStrength();
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
            if (levelUse == 'Housekeeping') {
               document.getElementById("attract-checkbox").style.visibility = "visible";
            }
            else {
               document.getElementById("attract-checkbox").style.visibility = "hidden";
               attractDataTypes = false;
               attractDataTypeChanged();
            }

            changeLevelRadioButtonSelection();

            initialiseGraph();


            // if (levelUse == 'Modules') {
            //     hrXNode = null;
            //     var nodes = document.getElementsByClassName("node");
            //     for (var n of nodes){
            //         if (n.__data__.label == 'Platform') {
            //           hrXNode = n;
            //         }
            //     };
            //     if (hrXNode) {
            //       showCard(hrXNode);
            //     }
            //
            // }

   }

   function attractDataTypeChanged() {
       if (attractDataTypes) {
           chargeStrengthVal = -100;
           linkStrengthVal = 0;
           chargeStrengthUpdated();
           linkStrengthUpdated();
       }
       else {
           chargeStrengthVal = defaultChargeStrengthVal;
           linkStrengthVal = defaultLinkStrengthVal;
           chargeStrengthUpdated();
           linkStrengthUpdated();

       }
       document.getElementById("attractDataType").checked = attractDataTypes;
   }


   function showLinkLabelsUpdated() {
      // update checkbox
      document.getElementById("show-link-labels-cb").checked = showLinkLabels;
      // make link labels hidden or visible
      d3.select('svg')
               .selectAll('.link-labels')
               .style("visibility", showLinkLabels ? "visible" : "hidden");

   }

