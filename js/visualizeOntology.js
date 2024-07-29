    function parseJsonld(file) {
        let data = {nodes: [], links: []};
        let jsonld = JSON.parse(file);
        for (let object of jsonld) {
            let node = {};
            if (object["@type"] == "http://www.w3.org/2002/07/owl#Class") {
                node = {};
                node.id = stripOwlPrefix(object["@id"]);
                node.group = 1;
                if (object.hasOwnProperty("http://www.w3.org/2000/01/rdf-schema#subClassOf")) {
                    for (let target of object["http://www.w3.org/2000/01/rdf-schema#subClassOf"]) {
                        let link = {}
                        link.source = node.id;
                        link.target = stripOwlPrefix(target["@id"]);
                        link.value = 1;
                        link.name = "subClassOf"
                        data.links.push(link);
                    }
                }
                data.nodes.push(node);
            }
            
            if (object["@type"] == "http://www.w3.org/2002/07/owl#ObjectProperty") {
                /*
                node = {};
                node.id = stripOwlPrefix(object["@id"]);
                node.group = 2;
                let domainId
                let rangeId
                let link = {};
                for (let domain of object["http://www.w3.org/2000/01/rdf-schema#domain"]) {
                    link = {}
                    domainId = stripOwlPrefix(domain["@id"]);
                    link.source = domainId;
                    link.target = node.id;
                    link.value = 1;
                    //link.name = node.id;
                    data.links.push(link);
                }
                for (let range of object["http://www.w3.org/2000/01/rdf-schema#range"]) {
                    link = {}
                    rangeId = stripOwlPrefix(range["@id"]);
                    link.source = node.id;
                    link.target = rangeId;
                    link.value = 1;
                    //link.name = node.id;
                    data.links.push(link);
                }
                data.nodes.push(node);
            }
            */
                node = {};
                node.id = stripOwlPrefix(object["@id"]);
                let domainId
                let rangeId
                let link;
                for (let domain of object["http://www.w3.org/2000/01/rdf-schema#domain"]) {
                    domainId = stripOwlPrefix(domain["@id"]);
                    for (let range of object["http://www.w3.org/2000/01/rdf-schema#range"]) {
                        link = {}
                        rangeId = stripOwlPrefix(range["@id"]);
                        link.source = domainId;
                        link.target = rangeId;
                        link.value = 1;
                        link.name = node.id;
                        data.links.push(link);
                    }
                }
            }
        }
        data.nodes.push({id: "Thing", group: 1});
        let input = document.getElementById('input');
        let result = document.getElementById('result');
        result.innerHTML = '';
        result.appendChild(generateGraphWithLabels(data));
        //let output = document.getElementById("output");
        //output.innerHTML=JSON.stringify(data);

        /*
        for (let node of data.nodes) {
            output.innerHTML+=JSON.stringify(node)
            output.innerHTML+="<br><br>"
        }
        */
        
        /*
        for (let link of data.links) {
            output.innerHTML+=JSON.stringify(link)
            output.innerHTML+="<br><br>"
        }
        */
    }
    function stripOwlPrefix(string) {
        try {
        return string.split("#")[1];
        }
        catch (e) {
            return string;
        }
    }