
    function chargeStrengthSliderChanged(value) {
        chargeStrengthVal = chargeStrengthSlider.value;
        chargeStrengthUpdated();

    }

    function linkStrengthSliderChanged(value) {
        linkStrengthVal = linkStrengthSlider.value;
        linkStrengthUpdated();
    }




    function radioButtonClicked(value) {
        if ((value == "All") || (value == "Modules") || (value=="Definitions")) {
          search2Val = "Choose";
          search2ValUpdated();
        }
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

    function showDataCategoriesCheckboxClicked(value) {
        showDataCategories = value.checked;
        showDataCategoriesUpdated();

    }

    // function searchSelectChanged(el) {
    //      var val = el.options[el.selectedIndex].value;
    //      searchVal = val;
    //      searchValUpdated();
    // }

    function searchSelect2Changed(el) {
         var val = el.options[el.selectedIndex].value;
         search2Val = val;
         search2ValUpdated();
    }


    function aggregateSelectChanged(el) {
         var val = el.options[el.selectedIndex].value;
         aggregateVal = val;
         aggregateValUpdated();
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
               console.log("Module double clicked");
               console.log("Module ids for " + n.name + " : " + linkedNodeIds[n.name]);
               console.log("Current expanded node val: " + expandedNode);
               if (linkedNodeIds[n.name] == null) {
                 console.log("module ids is null");
                 document.getElementById("loading-alert").style.display="block";
                 return;
               }

               if (expandedNode == n.name) {
                   expandedNode = null;
                   //searchVal = 'Modules';
                   search2Val = 'Choose';
                   levelUse = 'Modules';
               } else {
                   expandedNode = n.name;
                   //searchVal = n.name;
                   search2Val = n.name;
                   levelUse = 'module//' + n.name;
               }


           }
           else if (n.label == 'Platform') {
                expandedNode = null;
                //searchVal = 'Modules';
                search2Val = 'Choose';
                levelUse = 'Modules';

           }
           else if (n.label == 'Definition') {
               console.log("Definition double clicked");
               console.log("Definition ids for " + n.name + " : " + definitionIds[n.name]);
               console.log("Current expanded node val: " + expandedNode);
               if (definitionIds[n.name] == null) {
                 console.log("def ids is null");
                 document.getElementById("loading-alert").style.display="block";
                 return;
               }
               // else {
               //   console.log("def ids not null");
               // }

               if (expandedNode == n.name) {
                 expandedNode = null;
                 levelUse = 'Definitions';
               }
               else {
                 expandedNode = n.name;

                 //search2Val = 'Choose';
                 levelUse = 'definition//' + n.name;
               }
           }


           //searchValUpdated();
           search2ValUpdated();
           levelUseChanged();
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
        //document.getElementsByClassName('loading-text')[0].innerHTML = "<p>Loading...<br>vertices loaded</p>"
       document.getElementsByClassName('loading-text')[0].innerHTML = "Loading..<tspan>Vertices loaded</tspan>"
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

        document.getElementsByClassName('loading-text')[0].innerHTML = "Loading..<tspan>Edges loaded</tspan>";
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

        updateNodeLabels(); // to show exclamation mark when module loaded
        setNodeClasses(); // highlight nodes when loaded

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

   function ajaxLabelTargetReturned(xmlhttp) {
        var parsed = JSON.parse(xmlhttp.responseText);

        var search = "until(hasLabel('";
        var labelStartInd = parsed.Query.indexOf("until(hasLabel('") + search.length;
        var label = parsed.Query.slice(labelStartInd);
        var labelEndInd = label.indexOf("'");
        label = label.slice(0, labelEndInd);
        retrieveLabelTargetEndTimes[label] = performance.now();
        var timeTaken = 0;
        if (label in retrieveLabelTargetStartTimes) {
           timeTaken = ((retrieveLabelTargetEndTimes[label] - retrieveLabelTargetStartTimes[label]) / 1000).toFixed(1);
        }



        //queriesReturned[2] = true;
        //if (allQueriesReturned()) {
        //    console.log("QDone - last 2");
           //g = {"jV": fullV, "jE": fullE};
           // fullGraphLoaded(g);
       // }
        flattened = flattenAr(parsed["Result"]);

        flattenedObs = flattenObjects(flattened);


        console.log('ajax Label Target links retrieved for query: ' + parsed.Query + ' Number of paths: ' + flattened.length + ' Number of links: ' + flattenedObs.length + " Time taken: " + label + " " + timeTaken + "s");

        linkedNodeIds[label] = setLinkedNodeIds(flattenedObs, label);
        //payCalcLinkedIds = setPayCalcLinkedNodes(flattened);


        return parsed

    }

     function ajaxDefinitionLinksReturned(xmlhttp) {
        var parsed = JSON.parse(xmlhttp.responseText);

        var definition = parsed.Query.slice(42);
        var endInd = definition.indexOf("'");
        definition = definition.slice(0, endInd);


        retrieveDefinitionEndTimes[definition] = performance.now();
        var timeTaken= ((retrieveDefinitionEndTimes[definition] - retrieveDefinitionStartTimes[definition]) / 1000).toFixed(1);

        flattened = flattenAr(parsed["Result"]);

        //flattenedObs = flattenObjects(flattened);


        console.log('ajax Definition links retrieved for query: ' + parsed.Query + ' Number of paths: ' + flattened.length   + " Time taken:  "  + timeTaken + "s"); //+ ' Number of links: ' + flattenedObs.length + " Time taken:  "  + timeTaken + "s");

        definitionIds[definition] = setDefinitionLinkedNodeIds(flattened, definition);
        //linkedNodeIds[label] = setLinkedNodeIds(flattenedObs, label);
        //payCalcLinkedIds = setPayCalcLinkedNodes(flattened);

        setNodeClasses(); // highlight nodes when loaded

        return parsed

    }


    function fullGraphLoaded(g) {
        console.log("Full graph loaded");
        svg.selectAll("text").remove();
        svg.selectAll(".loading-image").remove();

        retrieveSecondaryItems(); // kick off load of detailed module nodes/edges etc


        fullGraph = g;

        initialiseGraph();

    }

