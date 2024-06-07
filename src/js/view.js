 // Functions to draw graph

    function update() {

            function drawNode(d) {
                ctx.beginPath();
                var colorVar = (useMyers) ? d.ageRange : d.label;
                ctx.fillStyle = color(colorVar); //(d.ageRange); //d.label
                ctx.moveTo(d.x, d.y);
                ctx.arc(d.x, d.y, r, 0, 2 * Math.PI);
                ctx.fill();
            }

            function drawLink(l) {
                ctx.moveTo(l.source.x, l.source.y);
                ctx.lineTo(l.target.x, l.target.y);

            }

            function drawText(d) {
                ctx.strokeText(d.name, d.x + 10, d.y);
            }

        link.attr("x1", function(d) {return d.source.x;})
            .attr("x2", function(d) {return d.target.x; })
            .attr("y1", function(d) {return d.source.y; })
            .attr("y2", function(d) {return d.target.y; })


        node.attr("cx", (d) => { return d.x;})
            .attr("cy", (d) => {return d.y});


        text.attr("x", (d) => { return d.x + 10;})
            .attr("y", (d) => { return d.y});



    }


    function initialiseGraph() {

        if (fullGraph == null) {
            return;
        }

        if (useMyers) {
            gUse = JSON.parse(JSON.stringify(fullGraph));
            graph = {nodes: gUse.nodes, links: gUse.links};
        }
        else {
            if (levelUse ==  'All') {
                gUse = JSON.parse(JSON.stringify(fullGraph));
            }
            else if (levelUse == 'Modules') {
                gUse = JSON.parse(JSON.stringify(fullGraph));
                gUse = graphWithLabels(gUse.jV, gUse.jE, ['Platform', 'Module']); //, 'GCC', 'HRIS ID']);
            }
            else if (levelUse == 'Pay/Calc') {
                gUse = JSON.parse(JSON.stringify(fullGraph));
                hrXPlatformNodeId = '5e2547ae-4cfe-4483-ae94-62237ca01c11';  // '075c5d82-2ed5-4dd8-b092-9a8983f2fc2f' (Persons graph)
                hrXRootNodes = nodeIdsDirectlyConnectedTo(gUse, hrXPlatformNodeId);
                combined = [hrXPlatformNodeId];
                var linkedIds = linkedNodeIds[levelUse];
                both = combined.concat(hrXRootNodes.concat(linkedIds));  //payCalcLinkedIds));
                gUse = graphWithIds(gUse.jV, gUse.jE, both);
            }
            else {
                gUse = JSON.parse(JSON.stringify(fullGraph));

            }

          //   else if (levelUse == 'Pay/Calc') {
          //       gUse = JSON.parse(JSON.stringify(fullGraph));
          //       hrXPlatformNodeId = '5e2547ae-4cfe-4483-ae94-62237ca01c11';  // '075c5d82-2ed5-4dd8-b092-9a8983f2fc2f' (Persons graph)
          //       hrXRootNodes = nodeIdsDirectlyConnectedTo(gUse, hrXPlatformNodeId);
          //       combined = [hrXPlatformNodeId];
          //       var linkedIds = linkedNodeIds['Pay/Calc'];
          //       both = combined.concat(hrXRootNodes.concat(linkedIds));  //payCalcLinkedIds));
          //       gUse = graphWithIds(gUse.jV, gUse.jE, both);
          //   }
          // else if (levelUse == 'Payroll Verification') {
          //       gUse = JSON.parse(JSON.stringify(fullGraph));
          //       hrXPlatformNodeId = '5e2547ae-4cfe-4483-ae94-62237ca01c11';  // '075c5d82-2ed5-4dd8-b092-9a8983f2fc2f' (Persons graph)
          //       hrXRootNodes = nodeIdsDirectlyConnectedTo(gUse, hrXPlatformNodeId);
          //       combined = [hrXPlatformNodeId];
          //       var linkedIds = linkedNodeIds['Payroll Verification'];
          //       both = combined.concat(hrXRootNodes.concat(linkedIds));
          //       gUse = graphWithIds(gUse.jV, gUse.jE, both);
          //   }

            //gUse = graphWithLabels(g.jV, g.jE, ['Platform', 'Module', 'GCC', 'HRIS ID'])
            //gUse = g;

            graph = {nodes: gUse.jV, links: gUse.jE};
        }




        svg.selectAll("*").remove();


        graph.nodes.forEach(function (n) {
            n.ageRange = Math.floor(n.age / 10);
        });


        //ctx = canvas.node().getContext("2d");

        container = svg.append("g");

        var colours = {"Configuration Data": "blue",
                       "Master Data": "green",
                       "Transaction Data":  "orange",
                       "Other": "grey"}

        svg.call(zoom).on("dblclick.zoom", null);

        link = container.append("g")
            .attr("class", "links")
            .selectAll("line")
            .data(graph.links)
            .enter().append("line")
            .attr("class", "link")

        node = container.append("g")
            .attr("class", "nodes")
            .selectAll("circle")
            .data(graph.nodes)
            .enter().append("circle")
            .attr("class", function(d) { if (showPII) {return d.hasPII ? "node-pii" :"node-light";} else {return "node"}})
            //.attr("class", "node")
            .attr("r", r)
            .attr("fill", function(d) {
                   if (levelUse == 'Housekeeping') {
                     if ('DataType' in d.properties) {
                       return d3.color(colours[d.properties['DataType'][0].value]); //color(d.properties['DataType'][0].value);
                     }
                     else {
                          return d3.color("grey");//color("Unknown");
                     }
                     //return color("Housekeeping");
                   }
                   else {
                     return color(d.label);
                   }
                  })
            .on("click", function() {
                console.log("clicked node");
                showCard(this);
            })
            .on("dblclick",function(d){nodeDoubleClicked(d)})
            .call(d3.drag()
                .on("start", dragstarted)
                .on("drag", dragged)
                .on("end", dragended))




        text = container.append("g")
            .selectAll("text")
            .data(graph.nodes)
            .enter().append("text")
            .text(function(d) {return d.name;});


        // try labels on links... not working yet
        if (false) {
            text2 = container.append("g")
                .selectAll("text")
                .data(graph.links)
                .enter()
                .append("text")
                .attr("x", function (d) {
                    return d.source.x + (d.target.x - d.source.x) / 2;
                })
                .attr("y", function (d) {
                    return d.source.y + (d.target.y - d.source.y) / 2;
                })
                .text(function (d) {
                    return d.label; // Replace with your actual label data
                });
        }
        console.log("Setting up force. Charge: " + chargeStrengthVal + " Link: " + linkStrengthVal);
        simulation = d3.forceSimulation()
            //.force("x", d3.forceX(width / 2))
            //.force("y", d3.forceY(height / 2))
            .force("center", d3.forceCenter(width / 2, height / 2))
            .force("collide", d3.forceCollide(r + 1))
            .force("charge", d3.forceManyBody().strength(chargeStrengthVal))
            .force("link", d3.forceLink().strength(linkStrengthVal)
                .id(function (d) {
                    return (useMyers) ? d.name : d.id //d.name
                }))
            .on("tick", update);

        simulation.nodes(graph.nodes);
        simulation.force("link").links(graph.links);

         //linkStrengthVal = 0.2;
         //chargeStrengthVal = -208;
         //chargeStrengthUpdated();
         //linkStrengthUpdated();

         update();

         chargeStrengthVal +=1;
         chargeStrengthUpdated();

    }



    function changeChargeStrength(value) {
        //simulation = simulation.force("charge", d3.forceManyBody().strength(value));

                //chargeStrengthVal = chargeStrength.value;

                if (simulation == null) {
                    return;
                }

                simulation.stop();

                console.log("charge strength now: " + chargeStrengthVal);
                simulation = d3.forceSimulation()
                .force("x", d3.forceX(width / 2))
                .force("y", d3.forceY(height / 2))
                .force("collide", d3.forceCollide(r + 1))
                .force("charge", d3.forceManyBody().strength(chargeStrengthVal)) //chargeStrength.value))
                .force("link", d3.forceLink().strength(linkStrengthVal) //linkStrength.value)
                    .id(function (d) {
                        return (useMyers) ? d.name : d.id //d.name
                    }))
                .on("tick", update);

                simulation.nodes(graph.nodes);
                simulation.force("link").links(graph.links);



                update();



    }


    function changeLinkStrength(value) {
        //simulation = simulation.force("charge", d3.forceManyBody().strength(value));

                if (simulation == null) {
                    return;
                }

                simulation.stop();

                //linkStrengthVal = linkStrength.value;
                simulation = d3.forceSimulation()
                .force("x", d3.forceX(width / 2))
                .force("y", d3.forceY(height / 2))
                .force("collide", d3.forceCollide(r + 1))
                .force("charge", d3.forceManyBody().strength(chargeStrengthVal)) //chargeStrength.value))
                .force("link", d3.forceLink().strength(linkStrengthVal) //linkStrength.value)
                    .id(function (d) {
                        return (useMyers) ? d.name : d.id //d.name
                    }))
                .on("tick", update);

                simulation.nodes(graph.nodes);
                simulation.force("link").links(graph.links);



                update();



    }



    function showCard(node) {
                n = node.__data__;
                document.getElementById("node-card-title").innerHTML = n.name + " (<small><small>" + n.label + "</small></small>)";


                var listGroup = document.getElementById("node-card-list-group");
                listGroup.innerHTML = "";

                var ignoreProps = ['partitionKey'];
                for (var prop in n.properties) {
                    if (Object.prototype.hasOwnProperty.call(n.properties, prop)) {
                        if (ignoreProps.includes(prop)) {

                        }
                        else {
                            propEl = document.createElement('li');
                            propEl.classList.add('list-group-item');
                            qq = n.properties.prop;
                            qqq = Object.keys(n.properties);
                            propEl.innerHTML = prop + ": " + n.properties[prop][0].value;
                            listGroup.appendChild(propEl);
                        }


                    }
                }


                document.getElementById("node-card").style.visibility = "visible";
    }

    function showPIIChanged() {
                tst = container.selectAll(".nodes")
                 .selectAll("circle")
                 .attr("class", function(d) { if (showPII) {return d.hasPII ? "node-pii" :"node-light";} else {return "node"}});
    }

    function showChargeStrength() {
        document.getElementById("charge-strength-label").innerHTML = "Charge strength <small><small><small>(" + chargeStrengthVal + ")</small></small></small>"
        chargeStrengthSlider.value = chargeStrengthVal;
    }

    function showLinkStrength() {
        document.getElementById("link-strength-label").innerHTML = "Link strength <small><small><small>(" + linkStrengthVal + ")</small></small></small>"
        linkStrengthSlider.value = linkStrengthVal;
    }

    function changeLevelRadioButtonSelection() {
        radios = document.getElementsByName("options");


        for (i = 0; i < radios.length; ++i) {
            if (radios[i].value === levelUse) {
                radios[i].checked = true;
            }
            else {
                radios[i].checked = false;
            }
        }
    }
