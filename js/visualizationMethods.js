function generateGraph(data) {
    // Specify the dimensions of the chart.
    const width = 1500;
    const height = 900;

    // Specify the color scale.
    const color = d3.scaleOrdinal(d3.schemeCategory10);

    // The force simulation mutates links and nodes, so create a copy
    // so that re-evaluating this cell produces the same result.
    const links = data.links.map(d => ({...d}));
    const nodes = data.nodes.map(d => ({...d}));

    // Create a simulation with several forces.
    const simulation = d3.forceSimulation(nodes)
        .force("link", d3.forceLink(links).id(d => d.id))
        .force("charge", d3.forceManyBody().strength(-200))
        .force("center", d3.forceCenter(width / 2, height / 2))
        .on("tick", ticked);

    // Create the SVG container.
    const svg = d3.create("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("viewBox", [0, 0, width, height])
        .attr("style", "max-width: 100%; height: auto;");

    // Add a line for each link, and a circle for each node.
    const link = svg.append("g")
        .attr("stroke", "#999")
        .attr("stroke-opacity", 0.6)
        .selectAll()
        .data(links)
        .join("line")
        .attr("stroke-width", d => Math.sqrt(d.value));

    const node = svg.append("g")
        .attr("stroke", "#fff")
        .attr("stroke-width", 1.5)
        .selectAll()
        .data(nodes)
        .join("circle")
        .attr("r", 10)
        .attr("fill", d => color(d.group));

    node.append("text")
        .attr("x", 8)
        .attr("y", "0.31em")
        .text(d => d.id)
        .clone(true).lower()
        .attr("fill", "none")
        .attr("stroke", "white")
        .attr("stroke-width", 3);


    // Add a drag behavior.
    node.call(d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended));
    
    // Set the position attributes of links and nodes each time the simulation ticks.
    function ticked() {
        link
            .attr("x1", d => d.source.x)
            .attr("y1", d => d.source.y)
            .attr("x2", d => d.target.x)
            .attr("y2", d => d.target.y);

        node
            .attr("cx", d => d.x)
            .attr("cy", d => d.y);
    }

    // Reheat the simulation when drag starts, and fix the subject position.
    function dragstarted(event) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        event.subject.fx = event.subject.x;
        event.subject.fy = event.subject.y;
    }

    // Update the subject (dragged node) position during drag.
    function dragged(event) {
        event.subject.fx = event.x;
        event.subject.fy = event.y;
    }

    // Restore the target alpha so the simulation cools after dragging ends.
    // Unfix the subject position now that it’s no longer being dragged.
    function dragended(event) {
        if (!event.active) simulation.alphaTarget(0);
        event.subject.fx = null;
        event.subject.fy = null;
    }

    // When this cell is re-run, stop the previous simulation. (This doesn’t
    // really matter since the target alpha is zero and the simulation will
    // stop naturally, but it’s a good practice.)
    //invalidation.then(() => simulation.stop());

    return svg.node();
    }

    function generateGraphWithLabels(data){
        return ForceGraph(data, {
            nodeId: d => d.id,
            nodeGroup: d => d.group,
            nodeTitle: d => `${d.id}`, //\n${d.group}
            linkStrokeWidth: l => Math.sqrt(l.value),
            width: 1000,
            height: 500,
            //invalidation // a promise to stop the simulation when the cell is re-run
          });
          function ForceGraph(
            {
              nodes, // an iterable of node objects (typically [{id}, …])
              links // an iterable of link objects (typically [{source, target}, …])
            },
            {
              nodeId = (d) => d.id, // given d in nodes, returns a unique identifier (string)
              nodeGroup, // given d in nodes, returns an (ordinal) value for color
              nodeGroups, // an array of ordinal values representing the node groups
              nodeTitle, // given d in nodes, a title string
              nodeFill = "currentColor", // node stroke fill (if not using a group color encoding)
              nodeStroke = "#fff", // node stroke color
              nodeStrokeWidth = 1.5, // node stroke width, in pixels
              nodeStrokeOpacity = 1, // node stroke opacity
              nodeRadius = 5, // node radius, in pixels
              nodeStrength,
              linkSource = ({ source }) => source, // given d in links, returns a node identifier string
              linkTarget = ({ target }) => target, // given d in links, returns a node identifier string
              linkStroke = "#999", // link stroke color
              linkStrokeOpacity = 0.6, // link stroke opacity
              linkStrokeWidth = 1.5, // given d in links, returns a stroke width in pixels
              linkStrokeLinecap = "round", // link stroke linecap
              linkStrength,
              colors = d3.schemeTableau10, // an array of color strings, for the node groups
              width = 100,//640, // outer width, in pixels
              height = 500,//400, // outer height, in pixels
              invalidation // when this promise resolves, stop the simulation
            } = {}
          ) {
            // Compute values.
            const N = d3.map(nodes, nodeId).map(intern);
            const LS = d3.map(links, linkSource).map(intern);
            const LT = d3.map(links, linkTarget).map(intern);
            if (nodeTitle === undefined) nodeTitle = (_, i) => N[i];
            const T = nodeTitle == null ? null : d3.map(nodes, nodeTitle);
            const G = nodeGroup == null ? null : d3.map(nodes, nodeGroup).map(intern);
            const W =
              typeof linkStrokeWidth !== "function"
                ? null
                : d3.map(links, linkStrokeWidth);
            const L = typeof linkStroke !== "function" ? null : d3.map(links, linkStroke);
          
            // Replace the input nodes and links with mutable objects for the simulation.
            nodes = d3.map(nodes, (_, i) => ({ id: N[i] }));
            links = d3.map(links, (_, i) => ({ source: LS[i], target: LT[i] }));
          
            // Compute default domains.
            if (G && nodeGroups === undefined) nodeGroups = d3.sort(G);
          
            // Construct the scales.
            const color = nodeGroup == null ? null : d3.scaleOrdinal(nodeGroups, colors);
          
            // Construct the forces.
            const forceNode = d3.forceManyBody().strength(-100);
            const forceLink = d3.forceLink(links).id(({ index: i }) => N[i]);
            if (nodeStrength !== undefined) forceNode.strength(nodeStrength);
            if (linkStrength !== undefined) forceLink.strength(linkStrength);
          
            const simulation = d3
              .forceSimulation(nodes)
              .force("link", forceLink)
              .force("charge", forceNode)
              .force("center", d3.forceCenter())
              .on("tick", ticked);
          
            const svg = d3
              .create("svg")
              .attr("width", width)
              .attr("height", height)
              .attr("viewBox", [-width / 2, -height / 2, width, height])
              .attr("style", "max-width: 100%; height: auto; height: intrinsic;");
          
            const link = svg
              .append("g")
              .attr("stroke", typeof linkStroke !== "function" ? linkStroke : null)
              .attr("stroke-opacity", linkStrokeOpacity)
              .attr(
                "stroke-width",
                typeof linkStrokeWidth !== "function" ? linkStrokeWidth : null
              )
              .attr("stroke-linecap", linkStrokeLinecap)
              .selectAll("line")
              .data(links)
              .join("line");
          
            const node = svg
              .append("g")
              .attr("fill", nodeFill)
              .attr("stroke", nodeStroke)
              .attr("stroke-opacity", nodeStrokeOpacity)
              .attr("stroke-width", nodeStrokeWidth)
              // SM: change
              // .selectAll("circle")
              .selectAll("g")
              .data(nodes)
              // SM: change
              // .join("circle")
              .join("g")
              // SM: change
              // .attr("r", nodeRadius)
              .call(drag(simulation));
          
            // SM: change
            // append circle and text to node <g> (selection of all <g> elements corresponding to each node)
            node.append("circle").attr("r", nodeRadius);
            node
              .append("text")
              .text(({ index: i }) => T[i])
              .attr("fill", "gray")
              .attr("stroke", "none")
              .attr("font-size", "0.7em");
          
            if (W) link.attr("stroke-width", ({ index: i }) => W[i]);
            if (L) link.attr("stroke", ({ index: i }) => L[i]);
            if (G) node.attr("fill", ({ index: i }) => color(G[i]));
            if (T) node.append("title").text(({ index: i }) => T[i]);
            if (invalidation != null) invalidation.then(() => simulation.stop());
          
            function intern(value) {
              return value !== null && typeof value === "object"
                ? value.valueOf()
                : value;
            }
          
            function ticked() {
              link
                .attr("x1", (d) => d.source.x)
                .attr("y1", (d) => d.source.y)
                .attr("x2", (d) => d.target.x)
                .attr("y2", (d) => d.target.y);
          
              node.attr("transform", (d) => `translate(${d.x} ${d.y})`);
              // SM: change
              // instead of moving the circle centers we transform the whole <g>
              // .attr("cx", d => d.x)
              // .attr("cy", d => d.y);
            }
          
            function drag(simulation) {
              function dragstarted(event) {
                if (!event.active) simulation.alphaTarget(0.3).restart();
                event.subject.fx = event.subject.x;
                event.subject.fy = event.subject.y;
              }
          
              function dragged(event) {
                event.subject.fx = event.x;
                event.subject.fy = event.y;
              }
          
              function dragended(event) {
                if (!event.active) simulation.alphaTarget(0);
                event.subject.fx = null;
                event.subject.fy = null;
              }
          
              return d3
                .drag()
                .on("start", dragstarted)
                .on("drag", dragged)
                .on("end", dragended);
            }
          
            return Object.assign(svg.node(), { scales: { color } });
          }
    }