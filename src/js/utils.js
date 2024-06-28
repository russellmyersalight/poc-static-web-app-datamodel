// Functions to convert Azure cosmos gremlin graph to d3

    function convNode(n) {
        //return n;
        //console.log(n);
        qq = Object.keys(n.properties);
        n.name = n.properties.name[0].value;
        var hasPII = false;
        var hasEncrypted = false;
        qq.forEach((p) => {
            xx = n.properties[p][0].value;
            if (xx[0] == '{') {
                xxy = xx.replace(/'/gi, '"');
                xxx = JSON.parse(xxy);
                if ('isPII' in xxx) {
                    if (xxx['isPII'] == 'Y') {
                        hasPII = true;
                    }
                };
                if ('isEncrypted' in xxx) {
                    if (xxx['isEncrypted'] == 'Y') {
                        hasEncrypted = true;
                    }
                }
            }
        });
        n.hasPII = hasPII;
        n.hasEncrypted = hasEncrypted;
        if (qq.includes('DataType')) {
          n.DataType = n.properties.DataType[0].value;
        }
        else {
          n.DataType = "Unknown";
        }
        if (qq.includes('NodeDescription')) {
          n.NodeDescription = n.properties.NodeDescription[0].value;
        }
        else {
          n.NodeDescription = "Description of the node here ....";
        }



    }

    function convEdge(e) {
        //e.source = e.inV;
        //e.target = e.outV;
        e.source = e.outV;
        e.target = e.inV;



    }


    // Functions to load Nodes/Edges from Azure cosmos gremlin  extract

    function setNodes(json) {
        jNodes = json;
        jNodes.forEach((n) => convNode(n));

        fetch('./data/edges.json')
          .then((response) => response.json())
          .then((json) => setEdges(json, jNodes))
          .then((g) => fullGraphLoaded(g));

    }

    function setEdges(json, jN) {
        jEdges = json;
        jEdges.forEach((e) => convEdge(e));

        g = {"jV": jN, "jE": jEdges}
        return g;
    }


    // Function to load Nodes/Edges for myers/graph from json

   function setJsonNodes(json) {
        jNodes = json;
        return jNodes;

    }



 // Function to filter by label(s)

    function graphWithLabels(jV, jE, labels) {
        jVOut = [];
        for(i=0; i < jV.length;++i) {
            if (labels.includes(jV[i].label)) {
                jVOut.push(jV[i]);
            }
        }

        jVIds = [];
        jVOut.forEach((v) => {jVIds.push(v.id)});

        jEOut = []
        for (i = 0; i < jE.length; ++i) {
            if ((jVIds.includes(jE[i].source) && (jVIds.includes(jE[i].target)))) {
                jEOut.push(jE[i]);

            }
        }



        return {jV: jVOut, jE: jEOut};
    }


   // filter by ids

    function graphWithIds(jV, jE, ids) {
        jVOut = [];
        for(i=0; i < jV.length;++i) {
            if (ids.includes(jV[i].id)) {
                jVOut.push(jV[i]);
            }
        }

        jVIds = [];
        jVOut.forEach((v) => {jVIds.push(v.id)});

        jEOut = []
        for (i = 0; i < jE.length; ++i) {
            if ((jVIds.includes(jE[i].source) && (jVIds.includes(jE[i].target)))) {
                jEOut.push(jE[i]);

            }
        }



        return {jV: jVOut, jE: jEOut};
    }


    function nodesConnectedTo(g, n) {
         for (i = 0; i < g.jE.length; ++i) {
            if ((g.jE[i].source == n.id)  ||  (g.jE[i].target == n.id) ) {
                n1 = findNodeWithId(g, g.jE[i].source)
                n2 = findNodeWithId(g, g.jE[i].target)

                console.log("matched: " + n1.name + " " + n2.name);

            }
        }
    }

    function findNodeWithId(g, id) {
        for (i = 0; i < g.jV.length; ++i) {
            if (g.jV[i].id == id)  {
                return g.jV[i];

            }
        }
        return null;

    }

    function nodeIdsDirectlyConnectedTo(g, id) {
        ids = [];
        g.jE.forEach((e) => {
            if (e.target == id) {
                ids.push(e.source);
            }
        });
        return ids;

    }


    function getDataTypeFillColour(d) {
          if (showDataCategories) {
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

    }

    function getNodeProperties(n) {
                var ignoreProps = ['partitionKey', 'NodeDescription', 'name'];

                var fieldPropsForTable = ['fieldName', 'format', 'isPII', 'isEncrypted']
                var fieldProperties = [];
                var nonFieldProperties = [];
                for (var prop in n.properties) {
                    if (Object.prototype.hasOwnProperty.call(n.properties, prop)) {
                        if (ignoreProps.includes(prop)) {

                        }
                        else if (n.properties[prop][0].value[0] == '{') {
                           var d = JSON.parse(n.properties[prop][0].value);
                           var dd = {};
                           dd["fieldName"] = prop;
                           var otherProps = {};
                           for (var k in d) {
                               if (fieldPropsForTable.includes(k)) {
                                 dd[k] = d[k];
                               }
                               else otherProps[k] = d[k];
                           }
                           dd["other"] = JSON.stringify(otherProps);

                           fieldProperties.push(dd);
                        }
                        else {
                            var d = [];
                            d.push(prop);
                            d.push(n.properties[prop][0].value);
                            nonFieldProperties.push(d);
                        }


                    }
                }

                return {"fieldProperties": fieldProperties, "nonFieldProperties": nonFieldProperties};


    }


    function createTable(tabEl, data) {
          // Create table element
          //const table = document.createElement("table");

          const table = tabEl;
          tabEl.innerHTML = "";
          if (data.length == 0) {
            return;
          }

          //table.style.borderCollapse = "collapse";
          //table.style.width = "100%";

          // Create table header row
          const headerRow = document.createElement("tr");
          //const headers = Object.keys(data[0]);
          const headers = ['fieldName', 'format', 'isPII', 'isEncrypted', 'other'];
          headers.forEach(header => {
            const th = document.createElement("th");
            th.style.border = "1px solid #ddd";
            th.style.padding = "8px";
            th.style.textAlign = "left";
            th.style.backgroundColor = "#f2f2f2";
            th.textContent = header;
            headerRow.appendChild(th);
          });
          table.appendChild(headerRow);

          // Create table rows
          data.forEach(item => {
            const row = document.createElement("tr");
            headers.forEach(header => {
              const td = document.createElement("td");
              td.style.border = "1px solid #ddd";
              td.style.padding = "8px";
              td.textContent = item[header];
              row.appendChild(td);
            });
            table.appendChild(row);
          });

          // Append the table to the body or a specific element
          //document.body.appendChild(table);
    }




   // parse json from azure gremlin query through Pay/Calc nodes

   function setLinkedNodeIds(j, identifier) {
         var ids = [];
         j.forEach((item) => {
             ids.push(item.id);
         });
         var idSet = new Set(ids);
         var idAr = Array.from(idSet);
         linkedNodeIds[identifier] = idAr;
         return idAr;

   }

   function setPayCalcLinkedNodes(j) {
         qq = 1;
         var ids = [];
         j.forEach((item) => {
             // item.objects.forEach((obj) => {
             //     ids.push(obj.id);
             // });
             ids.push(item.id);
         });
         var idSet = new Set(ids);
         var idAr = Array.from(idSet);
         payCalcLinkedIds = idAr;
         return idAr;


   }

     function setEloiseLinkedNodes(j) {
         qq = 1;
         var ids = [];
         j.forEach((item) => {
             // item.objects.forEach((obj) => {
             //     ids.push(obj.id);
             // });
             ids.push(item.id);
         });
         var idSet = new Set(ids);
         var idAr = Array.from(idSet);
         eloiseLinkedIds = idAr;
         return idAr;


   }


   function nodeHasPIIData(n) {

   }

   function flattenObjects(ar) {
        // where gremlin query returns vertices embedded in objects

        var flattened = [];
        ar.forEach((g) => {
           g.objects.forEach((el) => {
                    flattened.push(el);
           });

        });

        return flattened;

    }


   function sendAjax(url, params, callback, method='GET', payload=null) {
        var xmlhttp;

        if(window.XMLHttpRequest){
            xmlhttp = new XMLHttpRequest();
        }else{
            xmlhttp = new ActiveXObject('Microsoft.XMLHTTP');
        }

        xmlhttp.onreadystatechange = function(){
            if(xmlhttp.readyState == 4 && xmlhttp.status == 200){
                callback(xmlhttp);
            }
        }

        xmlhttp.open(method,url + '?' + params,true);
        if (payload === null) {
            xmlhttp.send();
        }
        else {
          xmlhttp.setRequestHeader('Content-Type', 'application/json; charset=utf-8');
          xmlhttp.send(JSON.stringify(payload));
        }


     }
