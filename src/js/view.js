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


            function calcGrad(d) {
                  if (d.target == d.source) {
                    return {c:0, s: 0, grad: 0};
                  }
                  var grad = (d.target.y - d.source.y)  / (d.target.x - d.source.x);
                  var angle = Math.atan(grad);
                  var gradDegrees = angle * 180 / Math.PI;
                  var absS = Math.abs(Math.sin(angle));
                  var absC = Math.abs(Math.cos(angle));
                  //var deltaC = (d.target.x >= d.source.x) ? c : c * -1;
                  //var deltaS = (d.target.y >= d.source.y) ? s : s * -1;
                  return {c:absC, s:absS, grad:gradDegrees};
            }

            function isPos(a, b) {
              return b > a;
            }




        try {
          link.attr("x1", function (d) {
            return d.source.x + calcGrad(d).c * r * ((d.target.x >= d.source.x) ? 1 : -1)
          })
            .attr("x2", function (d) {
              return d.target.x - calcGrad(d).c * r * ((d.target.x >= d.source.x) ? 1 : -1)
            })
            .attr("y1", function (d) {
              return d.source.y + calcGrad(d).s * r * ((d.target.y >= d.source.y) ? 1 : -1)
            })
            .attr("y2", function (d) {
              return d.target.y - calcGrad(d).s * r * ((d.target.y >= d.source.y) ? 1 : -1)
            })
        }
        catch (e) {
              var qq = 1;
        }


        node.attr("cx", (d) => { return d.x;})
            .attr("cy", (d) => {return d.y});


        text.attr("x", (d) => { return d.x + 10;})
            .attr("y", (d) => { return d.y});

        testLock.attr("x", (d) => { return d.x-5})
            .attr("y", (d) => { return d.y-5});

        linkLabel.attr("x", (d) => {
              var deltaX;
              if (d.target.x < d.source.x) {
                deltaX = (d.target.y > d.source.y) ? -2 : 2;
              }
              else {
                deltaX = (d.target.y > d.source.y) ? 2 :  -2;
              }
              return d.source.x + (d.target.x - d.source.x) / 2 + deltaX;
              })
            .attr("y", (d) => {
              return d.target.y - (d.target.y - d.source.y) / 2;
            });

          if (true) {
            linkLabel.attr('transform', function (d) {


              //if (d.target.x < d.source.x) {
              let bbox = this.getBBox();

              let rx = bbox.x + bbox.width / 2;
              let ry = bbox.y + bbox.height / 2;
              var gradDegrees = Math.round(calcGrad(d).grad);
              var rotation = 'rotate(' + gradDegrees + ' ' + Math.round(rx) + ' ' + Math.round(ry) + ')';
              return rotation;
              //}
              // else {
              //     return 'rotate(0)';
              // }

            });
          }

    }


    function initialiseGraph() {


        if (fullGraph == null) {
            return;
        }

        if (useMyers) {
            gUse = JSON.parse(JSON.stringify(fullGraph));
            graph = {nodes: gUse.nodes, links: gUse.links};
        }
        else if (showFred) {
            gUse = JSON.parse(JSON.stringify(fullGraph));
            var fredNodes = nodesWithModuleName(gUse, "Fred");
            var fredIds = [];
            fredNodes.forEach((n) => {
               fredIds.push(n.id);
            });
            gUse = graphWithIds(gUse.jV, gUse.jE, fredIds);
            graph = {nodes: gUse.jV, links: gUse.jE};
            qq = 1;
        }
        else {
            isIndividualLevel = false;
            individualLevelType = null;

            if (levelUse in ["GCC", "LCC", "HRIS ID"]) {
                gUse = JSON.parse(JSON.stringify(fullGraph));
                var linkedIds = linkedNodeIds[search2Val];
                gUse = graphWithIds(gUse.jV, gUse.jE, linkedIds);
            }
            else if (levelUse == 'Definitions') {
                // gUse = JSON.parse(JSON.stringify(fullGraph));
                // var linkedIds = definitionIds['Client'];
                // //var clientDefNodeId = 'd4f2e6c2-2d6e-4c8f-aeaf-e963617d5e09'
                // //var both =  [clientDefNodeId].concat(linkedIds);
                // var both = linkedIds;
                // gUse = graphWithIds(gUse.jV, gUse.jE, both);
                gUse = JSON.parse(JSON.stringify(fullGraph));
                gUse = graphWithLabels(gUse.jV, gUse.jE, ['Definition']); //, 'GCC', 'HRIS ID']);
            }
            else if (levelUse ==  'All') {
                gUse = JSON.parse(JSON.stringify(fullGraph));
            }
            else if (levelUse == 'Modules') {
                gUse = JSON.parse(JSON.stringify(fullGraph));
                gUse = graphWithLabels(gUse.jV, gUse.jE, ['Platform', 'Module']); //, 'GCC', 'HRIS ID']);
            }
            else if (levelUse == 'Housekeeping') {
              gUse = JSON.parse(JSON.stringify(fullGraph));
            }
            else { // double click on individual module or select individual module in dropdown
              //else if (levelUse == 'Pay/Calc') {
              isIndividualLevel = true;
              gUse = JSON.parse(JSON.stringify(fullGraph));
              hrXPlatformNodeId = '5e2547ae-4cfe-4483-ae94-62237ca01c11';  // '075c5d82-2ed5-4dd8-b092-9a8983f2fc2f' (Persons graph)
              hrXRootNodes = nodeIdsDirectlyConnectedTo(gUse, hrXPlatformNodeId);
              combined = [hrXPlatformNodeId];
              var qqSplit = levelUse.split('//')
              var linkedIds;
              if (qqSplit.length == 2) {
                individualLevelType = qqSplit[0];
                var qqNode = qqSplit[1];
                if (individualLevelType == 'definition') {
                    linkedIds = definitionIds[qqNode];
                    if (linkedIds == null) {
                      document.getElementById("loading-alert").style.display="block";
                      return;
                    }
                    both = linkedIds;
                }
                else { // Module
                  console.log("linked node ids for node: " + qqNode + " is: " + linkedNodeIds[qqNode]);
                  if (linkedNodeIds[qqNode] == null) {
                      //alert("whoops");
                      document.getElementById("loading-alert").style.display="block";
                      return;
                  }
                  linkedIds = linkedNodeIds[qqNode];
                  both = combined.concat(hrXRootNodes.concat(linkedIds));
                }

              }
              else {
                linkedIds = linkedNodeIds[levelUse];
                both = combined.concat(hrXRootNodes.concat(linkedIds));  //payCalcLinkedIds));
              }
              //both = combined.concat(hrXRootNodes.concat(linkedIds));  //payCalcLinkedIds));
              gUse = graphWithIds(gUse.jV, gUse.jE, both);
            }
            // else {
            //     gUse = JSON.parse(JSON.stringify(fullGraph));
            //}

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




        //svg.selectAll("*").remove();
        svg.selectAll("g").remove();


        graph.nodes.forEach(function (n) {
            n.ageRange = Math.floor(n.age / 10);
        });


        //ctx = canvas.node().getContext("2d");

        container = svg.append("g");



        svg.call(zoom).on("dblclick.zoom", null);

        link = container.append("g")
            .attr("class", "links")
            .selectAll("line")
            .data(graph.links)
            .enter().append("line")
            .attr("class", "link")
            .attr("marker-end", "url(#arrowhead)")

       linkLabel = container.append("g")
            .attr("class", "link-labels")
            .style("visibility", showLinkLabels ? "visible" : "hidden")
            .selectAll("text")
            .data(graph.links)
            .enter().append("text")
            .attr("class", "link-label")
            .text(function(d) {return d.label;});



        node = container.append("g")
            .attr("class", "nodes")
            .selectAll("circle")
            .data(graph.nodes)
            .enter().append("circle")
            .attr("class", function(d)  {
                return getNodeClass(d);  //{ if (showPII) {return d.hasPII ? "node-pii" :"node-light";} else {return "node"}})
            })
            //.attr("class", "node")
            .attr("r", r)
            .attr("fill", function(d) {
              //  //if (levelUse == 'Housekeeping') {
              //  if (showDataCategories) {
              //    if ('DataType' in d.properties) {
              //      return d3.color(colours[d.properties['DataType'][0].value]); //color(d.properties['DataType'][0].value);
              //    }
              //    else {
              //         return d3.color("grey");//color("Unknown");
              //    }
              //    //return color("Housekeeping");
              //  }
              //  else {
              //    return color(d.label);
              //  }
              // })
                  return getDataTypeFillColour(d);
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
            .attr('class', 'node-labels')
            .selectAll("text")
            .data(graph.nodes)
            .enter().append("text")
            .attr('class', 'node-label')
            .text(function(d) {return d.name;});

        testLock = container.select('.node-labels')
          .selectAll("image")
          .data(graph.nodes)
          .enter().append("image")
          .attr('class', 'node-lock-status')
          .attr("href", function(d) {
                if (d.hasPII) {
                  if (d.hasEncrypted) {
                    return "img/locked.png";
                  }
                  else {
                    return "img/unlocked.png";
                  }

                }
                else {
                  return "";
                }


              })
          // .attr("x", curr_bounds.width / 2 - (150/2))
          // .attr("y", curr_bounds.height / 2)
          .attr("width", "10")
          .attr("height", "10")
          .attr("pointer-events", "none")



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
            //.force("center", d3.forceCenter(width / 2, height / 2))
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

    function getCentreForceForModuleName(d) {

          //return null;  // #TODO   <==== change this if needing actual force strength

          var positions = {"Pay/Calc": [1, 1], "Benfits": [4, 1], "People": [1, 4], "Payroll Verification": [4, 4], "Core": [4,3], "Workday": [2.5, 4]}
          if ('ModuleName' in d.properties) {
             var modName = d.properties['ModuleName'][0].value;
             if (modName in positions) {
               return positions[modName];
             }
             else {
               return null;
             }

          }
          else {
            return null;
          }

    }

    function changeChargeOrLinkStrength(value) {

                 if (simulation == null) {
                    return;
                }

                simulation.stop();

                console.log("charge strength now: " + chargeStrengthVal);
                simulation = d3.forceSimulation()
                //.force("x", d3.forceX(width / 2))
                //.force("y", d3.forceY(height / 2))
                .force("x",d3.forceX(function(d) {

                     if  (aggregateVal == 'Data Category') {//((levelUse == "Housekeeping") && (attractDataTypes)) {
                         if (d.DataType == 'Master Data') {
                            return width / 5 * 1;
                         }
                         else if (d.DataType == "Transaction Data") {
                            return width / 5 * 2;
                         }
                         else if (d.DataType == "Configuration Data") {
                            return width / 5 * 3;
                         }
                         else {
                            return  width / 5 * 4; //width / 2;
                         }
                     }
                     else if (aggregateVal == 'All') {
                          if (((isIndividualLevel) && (individualLevelType == 'definition')) || (levelUse == 'All')) {
                            var modNameCentreForce = getCentreForceForModuleName(d);
                            if (!(modNameCentreForce == null)) {
                              return width / 5 * modNameCentreForce[0];
                            } else {
                              return (width / 2);
                            }
                          }
                          else {
                              return (width / 2);
                          }
                     }
                     else {
                        if (d.label == aggregateVal) {
                          return width / 5 * 1;
                        } else {

                          return (width / 2);
                        }
                     }


                    //  if (d.label == "Module") {
                    //    return 50;
                    //  }
                    //  else {
                    //    return width / 2;
                    //
                    // }
                  }))
                .force("y", d3.forceY(function(d) {
                     // var modNameCentreForce = getCentreForceForModuleName(d);
                     // if (!(modNameCentreForce == null)) {
                     //     return width / 5 * modNameCentreForce[1];
                     // }
                    if  (aggregateVal == "Data Category") {//((levelUse == "Housekeeping")  && (attractDataTypes)) {
                         if (d.DataType == 'Master Data') {
                            return height / 5 * 1;
                         }
                         else if (d.DataType == "Transaction Data") {
                            return height / 5 * 2;
                         }
                         else if (d.DataType == "Configuration Data") {
                            return height / 5 * 3;
                         }
                         else {
                            return  height / 5 * 4; //width / 2;
                         }
                     }
                     else if (aggregateVal == 'All') {
                          if (((isIndividualLevel) && (individualLevelType == 'definition')) || (levelUse == 'All')) {
                            var modNameCentreForce = getCentreForceForModuleName(d);
                            if (!(modNameCentreForce == null)) {
                              return height / 5 * modNameCentreForce[1];
                            } else {
                              return (height / 2);
                            }
                          }
                          else {
                              return (height / 2);
                          }

                     }

                     else {
                      if (d.label == aggregateVal) {
                        return height / 5 * 1;
                      } else {

                        return (height / 2);
                      }
                    }



                //.force ("center", d3.forceCenter( width / 2, height / 2))
                //.force("center", d3.forceCenter((d) => {
                //     console.log("forcing centre: " + d);
                     // if (d.label == "Module") {
                     //      return (50, 50)
                     // }
                     // else {
                     //      return (width / 2, height / 2)
                     // }
                //    return (width / 2, height / 2)

                }))

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


    // function changeChargeStrength(value) {
    //     //simulation = simulation.force("charge", d3.forceManyBody().strength(value));
    //
    //             //chargeStrengthVal = chargeStrength.value;
    //
    //             if (simulation == null) {
    //                 return;
    //             }
    //
    //             simulation.stop();
    //
    //             console.log("charge strength now: " + chargeStrengthVal);
    //             simulation = d3.forceSimulation()
    //             //.force("x", d3.forceX(width / 2))
    //             //.force("y", d3.forceY(height / 2))
    //             .force("x",d3.forceX(function(d) {
    //                  if (d.label == "Module") {
    //                    return 50;
    //                  }
    //                  else {
    //                    return width / 2;
    //
    //                 }
    //               }))
    //             .force("y", d3.forceY(function(d) {
    //                   if (d.label == "Module") {
    //                     return 50;
    //                   } else {
    //                     return width / 2;
    //                   }
    //                }))
    //             //.force ("center", d3.forceCenter( width / 2, height / 2))
    //             //.force("center", d3.forceCenter((d) => {
    //             //     console.log("forcing centre: " + d);
    //                  // if (d.label == "Module") {
    //                  //      return (50, 50)
    //                  // }
    //                  // else {
    //                  //      return (width / 2, height / 2)
    //                  // }
    //             //    return (width / 2, height / 2)
    //
    //             // }))
    //
    //             .force("collide", d3.forceCollide(r + 1))
    //             .force("charge", d3.forceManyBody().strength(chargeStrengthVal)) //chargeStrength.value))
    //             .force("link", d3.forceLink().strength(linkStrengthVal) //linkStrength.value)
    //                 .id(function (d) {
    //                     return (useMyers) ? d.name : d.id //d.name
    //                 }))
    //             .on("tick", update);
    //
    //             simulation.nodes(graph.nodes);
    //             simulation.force("link").links(graph.links);
    //
    //
    //
    //             update();
    //
    //
    //
    // }
    //
    //
    // function changeLinkStrength(value) {
    //     //simulation = simulation.force("charge", d3.forceManyBody().strength(value));
    //
    //             if (simulation == null) {
    //                 return;
    //             }
    //
    //             simulation.stop();
    //
    //             //linkStrengthVal = linkStrength.value;
    //             simulation = d3.forceSimulation()
    //             //.force("x", d3.forceX(width / 2))
    //             //.force("y", d3.forceY(height / 2))
    //               .force("x",d3.forceX(function(d) {
    //                  if (d.label == "Module") {
    //                    return 50;
    //                  }
    //                  else {
    //                    return width / 2;
    //
    //                 }
    //               }))
    //              .force("y", d3.forceY(function(d) {
    //                   if (d.label == "Module") {
    //                     return 50;
    //                   } else {
    //                     return width / 2;
    //                   }
    //                }))
    //             // .force("y", d3.forceY(height / 2))
    //
    //             //.force ("center", d3.forceCenter( width / 2, height / 2))
    //             //.force("center", d3.forceCenter((d) => {
    //             //     console.log("forcing centre: " + d);
    //             //     return (width / 2, height / 2)
    //                  // if (d.label == "Module") {
    //                  //      return (50, 50)
    //                  // }
    //                  // else {
    //                  //      return (width /2, height / 2)
    //                  // }
    //
    //              //}))
    //             .force("collide", d3.forceCollide(r + 1))
    //             .force("charge", d3.forceManyBody().strength(chargeStrengthVal)) //chargeStrength.value))
    //             .force("link", d3.forceLink().strength(linkStrengthVal) //linkStrength.value)
    //                 .id(function (d) {
    //                     return (useMyers) ? d.name : d.id //d.name
    //                 }))
    //             .on("tick", update);
    //
    //             simulation.nodes(graph.nodes);
    //             simulation.force("link").links(graph.links);
    //
    //
    //
    //             update();
    //
    //
    //
    // }



    function showCard(node) {
                n = node.__data__;
                document.getElementById("node-card-title").innerHTML = n.name + "<br>(<small><small>" + n.label + "</small></small>)";
                const defaultDescription = "Description of the node here ....";

                document.getElementById("node-card-description").innerHTML = (n.NodeDescription == defaultDescription)? "" :n.NodeDescription;

                var listGroup = document.getElementById("node-card-list-group");
                listGroup.innerHTML = "";

                var props = getNodeProperties(n);

                var tab = document.getElementById("field-table");
                createTable(tab, props["fieldProperties"]);

                var moduleNameProp = "ModuleName";

                var ignoreProps = ['partitionKey', 'NodeDescription'];
                // for (var prop in n.properties) {
                //     if (Object.prototype.hasOwnProperty.call(n.properties, prop)) {
                //         if (ignoreProps.includes(prop)) {
                //
                //         }
                //         else {
                //             propEl = document.createElement('li');
                //             propEl.classList.add('list-group-item');
                //             qq = n.properties.prop;
                //             qqq = Object.keys(n.properties);
                //             propEl.innerHTML = prop + ": " + n.properties[prop][0].value;
                //             listGroup.appendChild(propEl);
                //         }
                //
                //
                //     }
                // }

                props["nonFieldProperties"].forEach((prop) => {
                     if (prop[0] == moduleNameProp) {
                               propEl = document.createElement('li');
                               propEl.classList.add('list-group-item');
                               propEl.innerHTML = prop[0] + ": <b>" + prop[1] + "</b>";
                               listGroup.appendChild(propEl);

                     }
                });


                if (true) {
                  for (var prop of props["nonFieldProperties"]) {
                    if (prop[0] == moduleNameProp) {

                    }
                    else {
                      propEl = document.createElement('li');
                      propEl.classList.add('list-group-item');
                      propEl.innerHTML = prop[0] + ": <b>" + prop[1] + "</b>";
                      listGroup.appendChild(propEl);
                    }
                  }

                }

                document.getElementById("node-card").style.visibility = "visible";
    }

    function showPIIChanged() {
             setNodeClasses();
                // tst = container.selectAll(".nodes")
                //  .selectAll("circle")
                //  .attr("class", function(d)  {
                //       return getNodeClass(d);  //{ if (showPII) {return d.hasPII ? "node-pii" :"node-light";} else {return "node"}})
                //   })
    }

    function setNodeClasses() {
             tst = container.selectAll(".nodes")
                 .selectAll("circle")
                 .attr("class", function(d)  {
                      return getNodeClass(d);  //{ if (showPII) {return d.hasPII ? "node-pii" :"node-light";} else {return "node"}})
                  })
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

    function updateNodeLabels() {

      if (container) {
        container.selectAll(".node-label")
          .text(function (d) {
            var name = d.name;
            if ((d.label == 'Module') && (d.name in retrieveModuleEndTimes)) {
               //name += '!!!';  visualise module loaded
            }
            return name;
          });
      }
    }

    function showDataCategoryLegend() {

            if (showDataCategories) {
              var keys = [];
              for (var k in colours) {
                keys.push([k, colours[k]]);
              }

              //var keys = [{"label": "One", "colour": "red"}, {"label": "Two", "colour": "green"}, {"label": "Three", "colour" : "orange"}];
              var size = 20;
              //var bBox = svg.getBBox();


              //svg.append("g")
              //   .attr("class", "data-category-legend");

              //svg.select(".data-category-legend")
              svg.selectAll("dclegenddots")
                .data(keys)
                .enter()
                .append("rect")
                .attr("class", "dc-legend-dot")
                .attr("x", 10)
                .attr("y", function (d, i) {
                  return rect.height - ((i+1) * (size + 5))
                }) // 100 is where the first dot appears. 25 is the distance between dots
                .attr("width", size)
                .attr("height", size)
                .style("fill", function (d) {
                  return d[1];
                });

              //svg.select(".data-category-legend")
              svg.selectAll("dclegendlabels")
                .data(keys)
                .enter()
                .append("text")
                .attr("class", "dc-legend-text")
                .attr("x", 10 + size * 1.2)
                .attr("y", function (d, i) {
                  return rect.height - ( ((i+1) * (size + 5)) - (size / 2))
                }) // 100 is where the first dot appears. 25 is the distance between dots
                .style("fill", function (d) {
                  return d[1]
                })
                .text(function (d) {
                  return d[0]
                })
                .attr("text-anchor", "left")
                .style("alignment-baseline", "middle");
            }
            else {
                svg.selectAll(".dc-legend-dot").remove();
                svg.selectAll(".dc-legend-text").remove();

            }

    }
