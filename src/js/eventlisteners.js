
    function chargeStrengthSliderChanged(value) {
        chargeStrengthVal = chargeStrengthSlider.value;
        chargeStrengthUpdated();

    }

    function linkStrengthSliderChanged(value) {
        linkStrengthVal = linkStrengthSlider.value;
        linkStrengthUpdated();
    }




    function radioButtonClicked(value) {
        levelUse = value;
        levelUseChanged();

    }


    function piiCheckboxClicked(value) {
        showPII = value.checked;
        showPIIChanged();  //levelUseChanged();
    }

    function attractDataTypeCheckboxClicked(value) {
        attractDataTypes = value.checked;
        attractDataTypeChanged();

    }

    function showLinkLabelsCheckboxClicked(value) {
        showLinkLabels = value.checked;
        showLinkLabelsUpdated();

    }

    // on mouse down in canvas
    function getCursorPosition(canvas, event) {
        const rect = canvas.getBoundingClientRect()
        const x = event.clientX - rect.left
        const y = event.clientY - rect.top
        console.log("x: " + x + " y: " + y)
        graph.nodes.forEach((n) => {
            console.log("Node: " + n.name + " " + n.x + " " + n.y);
            if (   ((x >= (n.x - r)) && (x <= (n.x + r)))
                  &&
                   ((y >= (n.y - r)) && (y <= (n.y + r)))) {
                showCard(n);

            }
        });
    }


    // zoom
    function zoomed() {
        container.attr("transform", d3.event.transform);
    }

    // drag
    function dragstarted(d) {
        if (!d3.event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;

    }

    function dragged(d) {
        d.fx = d3.event.x;
        d.fy = d3.event.y;
    }

    function dragended(d) {
        if (!d3.event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
    }


    function nodeDoubleClickedOld(n) {
        if ((n.label == 'Module') && (n.name == 'Pay/Calc')) {
            if (expandedNode == 'Pay/Calc') {
                expandedNode = null;
                levelUse = 'Modules';
            }
            else {
                expandedNode = 'Pay/Calc';
                levelUse = 'Pay/Calc';
            }
            levelUseChanged();

        }

        if ((n.label == 'Module') && (n.name == 'Payroll Verification')) {
            if (expandedNode == 'Payroll Verification') {
                expandedNode = null;
                levelUse = 'Modules';
            }
            else {
                expandedNode = 'Payroll Verification';
                levelUse = 'Payroll Verification';
            }
            levelUseChanged();

        }
    }


    function nodeDoubleClicked(n) {
           if (n.label == 'Module') {
               if (expandedNode == n.name) {
                   expandedNode = null;
                   levelUse = 'Modules';
               } else {
                   expandedNode = n.name;
                   levelUse = n.name;
               }
               levelUseChanged();
           }
           else if (n.label == 'Platform') {
                expandedNode = null;
                levelUse = 'Modules';
                levelUseChanged();
           }
    }


    function allQueriesReturned() {
         allQueries = true;
         queriesReturned.forEach((q) => {
             if (q) {

             }
             else {
                 allQueries = false;
             }
         });
         return allQueries;
    }


    function ajaxVerticesReturned(xmlhttp) {
        retrieveVerticesEndTime = performance.now();
        var parsed = JSON.parse(xmlhttp.responseText);
        //console.log('ajax Vertices retrieved. Result: ' + parsed);

        queriesReturned[0] = true;

        jNodes = parsed["Result"];
        flattened = [];
        if (jNodes[0] instanceof Array) {
            jNodes.forEach((ng) => {
                ng.forEach((n) => {
                    flattened.push(n);
                });

            });
        }
        else {
            flattened = jNodes;
        }

        console.log('ajax Vertices retrieved for query: ' + parsed.Query + ' Number of Vertices: ' + flattened.length + ' time taken: ' + ((retrieveVerticesEndTime - retrieveVerticesStartTime) / 1000).toFixed(1) + 's');

        flattened.forEach((n) => convNode(n));

        fullV = flattened;

        if ((queriesReturned[0]) && (queriesReturned[1])) {  // Full Nodes and Vertices loaded
           g = {"jV": fullV, "jE": fullE};
           fullGraphLoaded(g);
        }

        if (allQueriesReturned()) {
            console.log("QDone - last 0");
            //g = {"jV": fullV, "jE": fullE};
            //fullGraphLoaded(g);
        }
        return parsed

    }

    function flattenAr(ar) {
        flattened = [];
        if (ar[0] instanceof Array) {
            ar.forEach((g) => {
                g.forEach((el) => {
                    flattened.push(el);
                });

            });
        }
        else {
            flattened = ar;
        }
        return flattened;

    }

    function ajaxEdgesReturned(xmlhttp) {
        retrieveEdgesEndTime  = performance.now();
        var parsed = JSON.parse(xmlhttp.responseText);
        //console.log('ajax Edges retrieved. Result: ' + parsed);

        queriesReturned[1] = true;

        jEdges = parsed["Result"];

        flattened = [];
        if (jEdges[0] instanceof Array) {
            jEdges.forEach((eg) => {
                eg.forEach((e) => {
                    flattened.push(e);
                });

            });
        }
        else {
            flattened = jEdges;
        }

        console.log('ajax Edges retrieved for query: ' + parsed.Query + ' Number of Edges: ' + flattened.length +  ' time taken: ' + ((retrieveEdgesEndTime - retrieveEdgesStartTime) / 1000).toFixed(1) + 's');

        flattened.forEach((e) => convEdge(e));

        fullE = flattened;

        if ((queriesReturned[0]) && (queriesReturned[1])) {  // Full Nodes and Vertices loaded
           g = {"jV": fullV, "jE": fullE};
           fullGraphLoaded(g);
        }

        if (allQueriesReturned()) {
            console.log("QDone - last 1");
            //g = {"jV": fullV, "jE": fullE};
           // fullGraphLoaded(g);
        }
        return parsed

    }

    function ajaxModuleLinksReturned(xmlhttp) {
        var parsed = JSON.parse(xmlhttp.responseText);

        var module = parsed.Query.slice(19);
        var endInd = module.indexOf("'");
        module = module.slice(0, endInd);
        retrieveModuleEndTimes[module] = performance.now();
        var timeTaken = 0;
        if (module in retrieveModuleStartTimes) {
           timeTaken = ((retrieveModuleEndTimes[module] - retrieveModuleStartTimes[module]) / 1000).toFixed(1);
        }



        //queriesReturned[2] = true;
        //if (allQueriesReturned()) {
        //    console.log("QDone - last 2");
           //g = {"jV": fullV, "jE": fullE};
           // fullGraphLoaded(g);
       // }
        flattened = flattenAr(parsed["Result"]);

        console.log('ajax Module links retrieved for query: ' + parsed.Query + ' Number of links: ' + flattened.length + " Time taken: " + module + " " + timeTaken + "s");

        module = flattened[0].properties.name[0].value;
        linkedNodeIds[module] = setLinkedNodeIds(flattened, module);
        //payCalcLinkedIds = setPayCalcLinkedNodes(flattened);

        return parsed

    }

    // Deprecated (uses Module links)
    function ajaxPayCalcLinksReturned(xmlhttp) {
        var parsed = JSON.parse(xmlhttp.responseText);
        console.log('ajax Paycalc links retrieved. Result: ' + parsed);
        queriesReturned[2] = true;
        if (allQueriesReturned()) {
            console.log("QDone - last 2");
           //g = {"jV": fullV, "jE": fullE};
           // fullGraphLoaded(g);
        }
        flattened = flattenAr(parsed["Result"]);
        module = flattened[0].properties.name[0].value;
        linkedNodeIds[module] = setLinkedNodeIds(flattened, module);
        payCalcLinkedIds = setPayCalcLinkedNodes(flattened);

        return parsed

    }

    // Deprecated (uses Module links)
    function ajaxEloiseLinksReturned(xmlhttp) {
        var parsed = JSON.parse(xmlhttp.responseText);
        console.log('ajax Eloise links retrieved. Result: ' + parsed);
        queriesReturned[3] = true;
        if (allQueriesReturned()) {
            console.log("QDone - last 3");
            //g = {"jV": fullV, "jE": fullE};
            //fullGraphLoaded(g);
        }
        flattened = flattenAr(parsed["Result"]);
        eloiseLinkedIds = setEloiseLinkedNodes(flattened);

        return parsed

    }



    function fullGraphLoaded(g) {
        console.log("Full graph loaded");
        svg.selectAll("text").remove();
        fullGraph = g;


        initialiseGraph();

    }

