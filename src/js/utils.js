// Functions to convert Azure cosmos gremlin graph to d3

    function convNode(n) {
        //return n;
        console.log(n);
        qq = Object.keys(n.properties);
        n.name = n.properties.name[0].value;
        var hasPII = false;
        qq.forEach((p) => {
            xx = n.properties[p][0].value;
            if (xx[0] == '{') {
                xxy = xx.replace(/'/gi, '"');
                xxx = JSON.parse(xxy);
                if ('isPII' in xxx) {
                    if (xxx['isPII'] == 'Y') {
                        hasPII = true;
                    }
                }
            }
        });
        n.hasPII = hasPII;


    }

    function convEdge(e) {
        e.source = e.inV;
        e.target = e.outV;


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





   // parse json from azure gremlin query through Pay/Calc nodes

   function setLinkedNodeIds(j, module) {
         var ids = [];
         j.forEach((item) => {
             ids.push(item.id);
         });
         var idSet = new Set(ids);
         var idAr = Array.from(idSet);
         linkedNodeIds[module] = idAr;
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
