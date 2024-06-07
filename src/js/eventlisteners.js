
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
        var parsed = JSON.parse(xmlhttp.responseText);
        console.log('Got stuff. Result: ' + parsed);
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
        var parsed = JSON.parse(xmlhttp.responseText);
        console.log('Got stuff. Result: ' + parsed);
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
        console.log('Got stuff. Result: ' + parsed);
        //queriesReturned[2] = true;
        //if (allQueriesReturned()) {
        //    console.log("QDone - last 2");
           //g = {"jV": fullV, "jE": fullE};
           // fullGraphLoaded(g);
       // }
        flattened = flattenAr(parsed["Result"]);
        module = flattened[0].properties.name[0].value;
        linkedNodeIds[module] = setLinkedNodeIds(flattened, module);
        //payCalcLinkedIds = setPayCalcLinkedNodes(flattened);

        return parsed

    }

    function ajaxPayCalcLinksReturned(xmlhttp) {
        var parsed = JSON.parse(xmlhttp.responseText);
        console.log('Got stuff. Result: ' + parsed);
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

    function ajaxEloiseLinksReturned(xmlhttp) {
        var parsed = JSON.parse(xmlhttp.responseText);
        console.log('Got stuff. Result: ' + parsed);
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
        console.log(g);
        svg.selectAll("text").remove();
        fullGraph = g;


        initialiseGraph();

    }

