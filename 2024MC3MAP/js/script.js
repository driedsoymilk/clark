


// Apply from https://gist.github.com/steveharoz/8c3e2524079a8c440df60c1ab72b5d03
var nodeIdDropdown = document.getElementById("node-select");
var generateButton = document.getElementById("generateButton");
var degreeDropdown = document.getElementById("degree-select");
var selectedId, selectedDegree, targetNodes;
var suspectedNodes = ["Mar de la Vida OJSC-string", "979893388-number", "Oceanfront Oasis Inc Carriers-string", "8327-number"]

// Create an SVG container for the network
var svg = d3.select("svg")
  .style("background-color", "black");
var width = +svg.node().getBoundingClientRect().width;
var height = +svg.node().getBoundingClientRect().height;
// zoom: https://observablehq.com/@jrladd/marvel-network
container = svg.append('g');
// Call zoom for svg container.
function zoomed() {
  container.attr("transform", d3.event.transform);
}
const zoom = d3.zoom()
  .scaleExtent([0.2, 8])
  .on("zoom", zoomed);
svg.call(zoom);

svg.on('click', () => {
  var Size = forceProperties.label.size + 'pt';
  ifClicked = false;
  node
    .transition(500)
    .style('opacity', 1);

  link
    .transition(500)
    .style("stroke-opacity", 1);
  label
    .attr("opacity", forceProperties.label.enabled ? 1 : 0)
    .style("font-size", Size);

});


// Create an SVG container for the legend
var legend = d3.select("body")
  .append("svg")
  .attr("class", "legend")
  .attr("width", 400)
  .attr("height", 230)
  .style("position", "absolute")
  .style("top", "10px")
  .style("right", "10px")
  .style("background-color", "rgba(211, 211, 211, 0.5)");
// svg objects for graph
var container, link, node, image, label;
// svg objects for legend
var legendItemsNodes, legendItemsLinks;
// the data - an object with nodes and links
var graph, storeData, originalData, graphData;
// For filter
var linkTypes, nodeTypes, withOutLinkTypesList, withOutNodeTypesList;
// For legend
var nondeCounts, linkCounts, legendDataNodes, legendDataLinks, nodeCountry,nodeCountryCounts;
// For country
var country_select;

// values for all forces
forceProperties = {
  inspected: {
    enabled: true,
  },
  focus: {
    enabled: false,
  },
  country: {
    enabled: true,
  },
  weight: {
    min: 0,
    max: 100,
    change: false
  },
  symbol: {
    enabled: true,
  },
  center: {
    x: 0.5,
    y: 0.5
  },
  label: {
    enabled: true,
    size: 10
  },
  charge: {
    enabled: true,
    strength: -30,
    distanceMin: 1,
    distanceMax: 2000
  },
  collide: {
    enabled: true,
    strength: .7,
    iterations: 1,
    radius: 5
  },
  forceX: {
    enabled: false,
    strength: .1,
    x: .5
  },
  forceY: {
    enabled: false,
    strength: .1,
    y: .5
  },
  link: {
    enabled: true,
    distance: 80,
    iterations: 1,
    width: 1
  }
}

let ifClicked = false;
// create link reference
let linkedByIndex = {};
// nodes map
let nodesById = {};
// Initialize data
d3.json("./data/mc3.json", function (error, _graph) {
  if (error) {
    console.log("error", error);
    throw error
  };
  graph = $.extend(true, {}, _graph);
  originalData = $.extend(true, {}, _graph);
  storeData = $.extend(true, {}, _graph);

  linkedByIndex = {};
  storeData.links.forEach(d => {
    if (typeof d.source === 'number') {
      d.sourceLabel = d.source;
      d.source = d.source+'-number';
    } 
    else if (typeof d.source === 'string') {
      d.sourceLabel = d.source;
      d.source = d.source+'-string';
    }
    
    if (typeof d.target === 'number') {
      d.targetLabel = d.target;
      d.target = d.target+'-number';
    }
    else if (typeof d.target === 'string') {
      d.targetLabel = d.target;
      d.target = d.target+'-string';
    }
    linkedByIndex[`${d.source},${d.target}`] = true;
  });
  nodesById = {};
  storeData.nodes.forEach(d => {
    d.label = d.id
    if (typeof d.id === 'number') {
      d.id = d.id+'-number'
    }
    else if (typeof d.id === 'string') {
      d.id = d.id+'-string'
    }
    if (d.country != undefined) {
      d.countryLabel = d.country;
      if (d.countryLabel.includes("'")) {
        var words = d.country.split(/[']/).filter(function(word) {
          return word !== '';
        });
        d.countryLabel = words[0];
      }
    }
    else {
      d.countryLabel = d.country
    }
    nodesById[d.id] = { ...d };
  })
console.log(storeData.nodes, storeData.links)
  linkTypes = Array.from(new Set(storeData.links.map(d => d.type)))
  nodeTypes = Array.from(new Set(storeData.nodes.map(d => d.type)))
  // nodeCountry = Array.from(new Set(storeData.nodes.map(d => d.country)))
  // nodeCountryCounts = {}
  // nodeCountry.forEach(key => {
  //   nodeCountryCounts[key] = 0;
  // });
  // storeData.nodes.forEach(d => {
  //   nodeCountryCounts[d.country] = nodeCountryCounts[d.country] +1;
  // })
  
  // console.log(nodeCountry)
  // console.log(nodeCountryCounts);

  withOutLinkTypesList = [];
  withOutNodeTypesList = [];
  updateData();
  initializeDisplay();
  initializeSimulation();
  update_control();
  updateDisplay();
});



const isConnectedAsSource = (a, b) => linkedByIndex[`${a},${b}`];
const isConnectedAsTarget = (a, b) => linkedByIndex[`${b},${a}`];
const isConnected = (a, b) => isConnectedAsTarget(a, b) || isConnectedAsSource(a, b) || a === b;
const isEqual = (a, b) => a === b;

//////////// FORCE SIMULATION //////////// 

// force simulator
var simulation = d3.forceSimulation();

// set up the simulation and event to update locations after each tick
function initializeSimulation() {
  simulation.nodes(graph.nodes);
  initializeForces();
  simulation.on("tick", ticked);
}

// add forces to the simulation
function initializeForces() {
  // add forces and associate each with a name
  simulation
    .force("link", d3.forceLink())
    .force("charge", d3.forceManyBody())
    .force("collide", d3.forceCollide())
    .force("center", d3.forceCenter())
    .force("forceX", d3.forceX())
    .force("forceY", d3.forceY());
  // apply properties to each of the forces
  updateForces();
}

// apply new force properties
function updateForces() {
  // get each force by name and update the properties
  simulation.force("center")
    .x(width * forceProperties.center.x)
    .y(height * forceProperties.center.y);
  simulation.force("charge")
    .strength(forceProperties.charge.strength * forceProperties.charge.enabled)
    .distanceMin(forceProperties.charge.distanceMin)
    .distanceMax(forceProperties.charge.distanceMax);
  simulation.force("collide")
    .strength(forceProperties.collide.strength * forceProperties.collide.enabled)
    .radius(function (d) {
      return suspectedNodes.includes(d.id) ? forceProperties.collide.radius * 2 : forceProperties.collide.radius;
    })
    .iterations(forceProperties.collide.iterations);
  simulation.force("forceX")
    .strength(forceProperties.forceX.strength * forceProperties.forceX.enabled)
    .x(width * forceProperties.forceX.x);
  simulation.force("forceY")
    .strength(forceProperties.forceY.strength * forceProperties.forceY.enabled)
    .y(height * forceProperties.forceY.y);
  simulation.force("link")
    .id(function (d) { return d.id; })
    .distance(forceProperties.link.distance)
    .iterations(forceProperties.link.iterations)
    .links(forceProperties.link.enabled ? graph.links : []);

  // updates ignored until this is run
  // restarts the simulation (important if simulation has already slowed down)
  simulation.alpha(1).restart();
}

function updateData() {
  selectedId = nodeIdDropdown.value;
  // if (!isNaN(parseInt(selectedId))) {
  //   selectedId = parseInt(selectedId)
  // }
  selectedDegree = degreeDropdown.value;
  targetNodes = [selectedId];
  const degree_select = d3.select("#degree-select");
  // console.log(targetNodes, graph, storeData);
  if (selectedId === "all") {
    graph = $.extend(true, {}, storeData);
    // Disable the dropdown
    degree_select.attr("disabled", "disabled");
  } else {
    // Enable the dropdown
    degree_select.attr("disabled", null);
    if (selectedId === "all-suspect-nodes") {
      targetNodes = [...suspectedNodes];
    }
    var filteredLinks = [];
    var filteredNodes = [];t
    var visitedNodes = [];
    for (let currentDegree = 1; currentDegree <= selectedDegree; currentDegree++) {
      // console.log(currentDegree, storeData);
      var Nodes = [];
      var Links = [];
      var tempTargetNodes = [];
      while (targetNodes.length > 0) {
        var targetNode = targetNodes.shift();
        // console.log(targetNode);
        if (!visitedNodes.includes(targetNode)) {
          visitedNodes.push(targetNode);
          // console.log(visitedNodes, targetNode, Nodes, Links)
          var tempLinks = storeData.links.filter(function (link) {
            var con1 = (link.source === targetNode || link.target === targetNode);
            var con2 = (link.weight*100 >= forceProperties.weight.min && link.weight*100 <= forceProperties.weight.max);
            // console.log(forceProperties.weight.min, forceProperties.weight.max);
            // console.log(link.target === targetNode, link.source, link.target, targetNode);
            return con1 && con2;
          });
          // console.log(tempLinks);
          var nodeIds = new Set();
          tempLinks.forEach(function (link) {
            nodeIds.add(link.source);
            nodeIds.add(link.target);
            // if (link.source === 38 || link.source === '38' || link.target === 38 || link.target === '38') {
            //   console.log(link.source, link.target , link)
            // }
          });
          nodeIds = [...nodeIds];
          var tempNodes = storeData.nodes.filter(function (node) {
            // if (node.id === 38 || node.id === '38') {
            //   if (nodeIds.includes(node.id)) {
            //     console.log(node ) 
                
            //   }
              
            // }
            return nodeIds.includes(node.id);
          });
          tempTargetNodes = tempTargetNodes.concat([...nodeIds]);
          Links = Links.concat(tempLinks);
          Nodes = Nodes.concat(tempNodes);
        }
      }
      if (currentDegree != selectedDegree) {
        targetNodes = targetNodes.concat(tempTargetNodes);
        targetSet = new Set(targetNodes);
        targetNodes = [...targetSet]
      }

      filteredLinks = filteredLinks.concat(Links);
      filteredNodes = filteredNodes.concat(Nodes);

      console.log(filteredLinks, filteredNodes);
    }
    var nodeSet = new Set(filteredNodes);
    var linkSet = new Set(filteredLinks);
    var nodeArray = [...nodeSet];
    var linkArray = [...linkSet];
    // nodeArray.forEach(node => {
    //   if (node.id === 38 || node.id === '38') {
    //     console.log(node) 
    //   }
    // });
    // linkArray.forEach(link => {
    //   if (link.source === 38 || link.source === '38' || link.target === 38 || link.target === '38') {
    //     console.log(link.source, link.target , link) 
    //   }
    // });
    graph.nodes = $.extend(true, [], [...nodeSet]);
    graph.links = $.extend(true, [], [...linkSet]);
    // console.log(graph, storeData)
  }

  // console.log(graph, storeData)
  graphData = $.extend(true, {}, graph);
  if (forceProperties.focus.enabled) {
    updateFocusData();
  }

  // Legend Data
  nondeCounts = {
    company: 0,
    person: 0,
    organization: 0,
    political_organization: 0,
    location: 0,
    vessel: 0,
    event: 0,
    movement: 0,
    undefined: 0
  };
  linkCounts = {
    membership: 0,
    partnership: 0,
    ownership: 0,
    family_relationship: 0
  };
  for (var i = 0; i < graph.nodes.length; i++) {
    var type = graph.nodes[i].type;
    if (nondeCounts[type]) {
      nondeCounts[type]++;
    } else {
      nondeCounts[type] = 1;
    }
  }

  for (var i = 0; i < graph.links.length; i++) {
    var type = graph.links[i].type;
    if (linkCounts[type]) {
      linkCounts[type]++;
    } else {
      linkCounts[type] = 1;
    }
  }

  legendDataNodes = [
    { label: "Company", color: "#1f77b4", count: nondeCounts["company"], value: "company", id: "company", img: `url(#company-legend)` },
    { label: "Person", color: "#ff7f0e", count: nondeCounts["person"], value: "person", id: "person", img: `url(#person-legend)` },
    { label: "Organization", color: "#2ca02c", count: nondeCounts["organization"], value: "organization", id: "organization", img: `url(#organization-legend)` },
    { label: "Political Organization", color: "#9467bd", count: nondeCounts["political_organization"], value: "political_organization", id: "political_organization", img: `url(#political_organization-legend)` },
    { label: "Location", color: "#D6CE1B", count: nondeCounts["location"], value: "location", id: "location", img: `url(#location-legend)` },
    { label: "Vessel", color: "#e377c2", count: nondeCounts["vessel"], value: "vessel", id: "vessel", img: `url(#vessel-legend)` },
    { label: "Event", color: "#17becf", count: nondeCounts["event"], value: "event", id: "event", img: `url(#event-legend)` },
    { label: "Movement", color: "#CE6C57", count: nondeCounts["movement"], value: "movement", id: "movement", img: `url(#movement-legend)` },
    { label: "Undefined", color: "#7f7f7f", count: nondeCounts["undefined"], value: undefined, id: "undefined", img: `url(#undefined-legend)` }
  ];
  legendDataLinks = [
    { label: "Membership", color: "#00ff00", count: linkCounts["membership"], value: "membership", id: "membership" },
    { label: "Partnership", color: "#ffffff", count: linkCounts["partnership"], value: "partnership", id: "partnership" },
    { label: "Ownership", color: "#FF00EA", count: linkCounts["ownership"], value: "ownership", id: "ownership" },
    { label: "Family Relationship", color: "#FFE800", count: linkCounts["family_relationship"], value: "family_relationship", id: "family_relationship" },
  ];

  graphData = $.extend(true, {}, graph);
  linkedByIndex = {};
  graphData.links.forEach(d => {
    linkedByIndex[`${d.source},${d.target}`] = true;
  });
  nodesById = {};
  graphData.nodes.forEach(d => {
    nodesById[d.id] = { ...d };
  })

  // For country select in control
  nodeCountry = Array.from(new Set(graphData.nodes.map(d => d.country)))
  nodeCountryCounts = {}
  nodeCountry.forEach(key => {
    nodeCountryCounts[key] = 0;
  });
  graphData.nodes.forEach(d => {
    nodeCountryCounts[d.country] = nodeCountryCounts[d.country] +1;
  })
}
// https://medium.com/@gmcharmy/sort-objects-in-javascript-e-c-how-to-get-sorted-values-from-an-object-142a9ae7157c
function sortObj(obj) {
  return Object.entries(obj).sort((a,b) => b[1]-a[1])
}



function updateDataBcOfFilter() {
  // // Only Display
  // node
  //   .attr("opacity", function (d) {
  //     return withOutNodeTypesList.includes(d.type) ? 0 : 1;
  //   });
  // link
  //   .attr("opacity", function (d) {
  //     return withOutLinkTypesList.includes(d.type) ? 0 : 1;
  //   });
  // Data and Display
  // Filter Legend Data

  var selectedOptions = d3.selectAll('.mulinput:checked');
  var Options = d3.selectAll('.mulinput');
  var selectedValues = selectedOptions.nodes().map(option => option.value);
  var optionsValues = Options.nodes().map(option => option.value);
  var removeCountryList = optionsValues.filter(item => !selectedValues.includes(item) && item != 'all');
  removeCountryList = removeCountryList.map(item => item === 'undefined' ? undefined : item);

  graph = $.extend(true, {}, graphData);
  if (withOutLinkTypesList.length > 0 || withOutNodeTypesList.length > 0) {
    var tempLinks = $.extend(true, [], graphData.links);
    var tempNodes = $.extend(true, [], graphData.nodes);
    if (withOutLinkTypesList.length > 0) {
      tempLinks = graphData.links.filter(link => { return !withOutLinkTypesList.includes(link.type) })
    }
    if (withOutNodeTypesList.length > 0) {
      var removedNodeList = graphData.nodes.filter(node => { return withOutNodeTypesList.includes(node.type) && !suspectedNodes.includes(node.id) })
      var removedNodeIdList = new Set();
      removedNodeList.forEach(node => {
        removedNodeIdList.add(node.id)
      });
      removedNodeIdList = [...removedNodeIdList]
      console.log(removedNodeList);
      tempLinks = graphData.links.filter(link => { return !withOutLinkTypesList.includes(link.type) && !(removedNodeIdList.includes(link.source) || removedNodeIdList.includes(link.target)) })
      tempNodes = graphData.nodes.filter(node => { return !withOutNodeTypesList.includes(node.type) || suspectedNodes.includes(node.id)})
    }
    graph.nodes = $.extend(true, [], tempNodes);
    graph.links = $.extend(true, [], tempLinks);
  }
  if (removeCountryList.length > 0) {
    var removedNodeList = graph.nodes.filter(node => { return removeCountryList.includes(node.countryLabel) })
    var removedNodeIdList = new Set();
    removedNodeList.forEach(node => {
      removedNodeIdList.add(node.id)
    });
    removedNodeIdList = [...removedNodeIdList]
    console.log(removedNodeList);
    var tempLinks = graph.links.filter(link => { return !(removedNodeIdList.includes(link.source) || removedNodeIdList.includes(link.target)) })
    var tempNodes = graph.nodes.filter(node => { return !removeCountryList.includes(node.countryLabel) })
    console.log(removeCountryList,tempNodes);
    
    // console.log(tempNodes, tempLinks);
    graph.nodes = $.extend(true, [], tempNodes);
    graph.links = $.extend(true, [], tempLinks);
    // console.log(graph.nodes, graph.links);
  }
  if (forceProperties.weight.change) {
    // console.log(1)
    var tempLinks = graph.links.filter(function (link) {
      return link.weight*100 >= forceProperties.weight.min && link.weight*100 <= forceProperties.weight.max;
    });
    // console.log(tempLinks);
    var nodeIds = new Set();
    tempLinks.forEach(function (link) {
      nodeIds.add(link.source);
      nodeIds.add(link.target);
    });
    nodeIds = [...nodeIds];
    var tempNodes = graph.nodes.filter(function (node) {
      return nodeIds.includes(node.id);
    });
    graph.nodes = $.extend(true, [], tempNodes);
    graph.links = $.extend(true, [], tempLinks);
    
  }
  
  initializeSimulation();
  updateDisplay();
  updateDisplayWithOutData();
}
//////////// DISPLAY ////////////

// generate the svg objects and force simulation
function initializeDisplay() {
  // Initialize All Object
  // Initialize Link Object
  link = container.append("g").selectAll(".links")

  // Initialize Node Object
  node = container.append("g").selectAll(".nodes")
  image = container.append("defs");

  legendDataNodes.forEach(element => {
    image.append('pattern')
      .attr("class", "img")
      .attr("id", element.id)
      .attr("width", 1)
      .attr("height", 1)
      .append("image")
      .attr("xlink:href", "./img/withBG/" + element.id + ".png")
      .attr("width", 2 * forceProperties.collide.radius)
      .attr("height", 2 * forceProperties.collide.radius)
      .attr("y", 0)
      .attr("x", 0);
    image.append('pattern')
      .attr("class", "img")
      .attr("id", element.id + "-suspected")
      .attr("width", 1)
      .attr("height", 1)
      .append("image")
      .attr("xlink:href", "./img/withBG/" + element.id + ".png")
      .attr("width", 4 * forceProperties.collide.radius)
      .attr("height", 4 * forceProperties.collide.radius)
      .attr("y", 0)
      .attr("x", 0);

    image.append('pattern')
      .attr("class", "img")
      .attr("id", element.id + "-legend")
      .attr("width", 1)
      .attr("height", 1)
      .append("image")
      .attr("xlink:href", "./img/withBG/" + element.id + ".png")
      .attr("width", 18)
      .attr("height", 18)
      .attr("y", 0)
      .attr("x", 0);
  });

  // Initialize Label Object
  label = container.append("g").selectAll(".texts")
  // Create the node legend column
  var legendNodes = legend.append("g")
    .attr("class", "legend-column")
    .attr("transform", "translate(20, 20)"); // Adjust the position

  // Add node legend header
  legendNodes.append("text")
    .attr("class", "legend-header")
    .style("fill", "black")
    .attr("x", 0)
    .attr("y", 0)
    .text("Node Type");

  legendItemsNodes = legendNodes.selectAll(".legend-nodes-item");

  // Create the link legend column
  var legendLinks = legend.append("g")
    .attr("class", "legend-column")
    .attr("transform", "translate(200, 20)"); // Adjust the position

  // Add link legend header
  legendLinks.append("text")
    .attr("class", "legend-header")
    .style("fill", "black")
    .attr("x", 0)
    .attr("y", 0)
    .text("Link Type");

  legendItemsLinks = legendLinks.selectAll(".legend-links-item");
}

function update_control() {
  d3.select("#country_section").selectAll(".MultiCheckBox").remove()
  d3.select("#country_section").selectAll(".MultiCheckBoxDetail").remove()
  country_select = d3.select('#country_select').selectAll('option');
  country_select.remove()
  country_select = d3.select('#country_select').selectAll('option');
  var optList = sortObj(nodeCountryCounts);
  country_select = country_select.data(optList);

  var new_country_select  =  country_select.enter()
      .append('option')
      .attr('value', d => d[0])
      .text(d => d[0] + " (" + d[1] + ")");
      country_select = country_select.merge(new_country_select);
  $(document).ready(function () {
    $("#country_select").CreateMultiCheckBox({ width: '230px', defaultText : 'Select Below', height:'250px' });
    d3.select("#country_section").selectAll(".mulinput")
    .on('change', function() {
      updateDataBcOfFilter();
    });
  });
}


function update_network() {
  link.remove();
  node.remove();
  label.remove();
  image.remove();
  link = container.append("g").selectAll(".links");
  node = container.append("g").selectAll(".nodes");
  label = container.append("g").selectAll(".texts");
  //////////////////////////////////////////////////////////////////////////////
  image = container.append("defs");

  legendDataNodes.forEach(element => {
    image.append('pattern')
      .attr("class", "img")
      .attr("id", element.id)
      .attr("width", 1)
      .attr("height", 1)
      .append("image")
      .attr("xlink:href", "./img/withBG/" + element.id + ".png")
      .attr("width", 2 * forceProperties.collide.radius)
      .attr("height", 2 * forceProperties.collide.radius)
      .attr("y", 0)
      .attr("x", 0);
    image.append('pattern')
      .attr("class", "img")
      .attr("id", element.id + "-suspected")
      .attr("width", 1)
      .attr("height", 1)
      .append("image")
      .attr("xlink:href", "./img/withBG/" + element.id + ".png")
      .attr("width", 4 * forceProperties.collide.radius)
      .attr("height", 4 * forceProperties.collide.radius)
      .attr("y", 0)
      .attr("x", 0);

    image.append('pattern')
      .attr("class", "img")
      .attr("id", element.id + "-legend")
      .attr("width", 1)
      .attr("height", 1)
      .append("image")
      .attr("xlink:href", "./img/withBG/" + element.id + ".png")
      .attr("width", 18)
      .attr("height", 18)
      .attr("y", 0)
      .attr("x", 0);
  });
  ////////////////////////////// LINK //////////////////////////////////////////
  //	UPDATE
  link = link.data(graph.links);
  //	ENTER
  var newLink = link.enter().append("path")
    .attr("class", "links")
    .attr("fill", "none")
    .attr("stroke-width", function (d) {return d.weight*forceProperties.link.width})
    .attr("opacity", forceProperties.link.enabled ? 1 : 0)
    .attr("stroke", function (d) { return colorLink(d.type); });
  // link tooltip
  newLink.append("title")
    .text(function (d) { return "Type: " + d.type + " source: " + d.sourceLabel + " target: " + d.targetLabel + " weight: " + d.weight; });
  newLink.on('mouseover', mouseLinkOverFunction)
    .on('mouseout', mouseOutFunction)
    .on('click', mouseLinkClickFunction);
  //	ENTER + UPDATE
  link = link.merge(newLink);

  ////////////////////////////// NODE //////////////////////////////////////////
  //	UPDATE
  node = node.data(graph.nodes);
  //	ENTER
  var newNode = node.enter().append("circle")
    .attr("class", "nodes")
    // .attr("fill", "url(#company)")
    .attr("fill", function (d) { return colorNode(d.type, d.id); })
    .attr("stroke", function (d) { return colorNodeWithSpecificId(d.type, d.id, selectedId); })
    .attr("stroke-width", 2)
    .attr("r", function (d) {
      return suspectedNodes.includes(d.id) ? forceProperties.collide.radius * 2 : forceProperties.collide.radius;
    })
    .call(d3.drag()
      .on("start", dragstarted)
      .on("drag", dragged)
      .on("end", dragended));
  // node tooltip
  newNode.append("title")
    .text(function (d) { return "ID: " + d.label + " Type: " + d.type + " Country: " + d.country; });

  newNode.on('mouseover', mouseNodeOverFunction)
    .on('mouseout', mouseOutFunction)
    .on('click', mouseNodeClickFunction);
  //	ENTER + UPDATE
  node = node.merge(newNode);
  ////////////////////////////// LABEL //////////////////////////////////////////
  //	UPDATE
  label = label.data(graph.nodes);
  var Size = forceProperties.label.size + 'pt';
  //	ENTER
  var newLabel = label.enter().append("text")
    .attr("class", "texts")
    .attr("fill", function (d) { return colorNode(d.type, d.id, true); })
    .style("font-size", Size)
    .text(d => {
      if (forceProperties.country.enabled && d.country) {
        return d.label+" ("+d.country+")"
      } else {
        return d.label
      }
    });
  newLabel.on('mouseover', mouseNodeOverFunction)
    .on('mouseout', mouseOutFunction)
    .on('click', mouseNodeClickFunction);
  //	ENTER + UPDATE
  label = label.merge(newLabel);

  ////////////////////////////// simulation //////////////////////////////////////////
  simulation.alpha(1).alphaTarget(0).restart();
}
function update_legend() {
  legendItemsNodes.remove();
  legendItemsLinks.remove();

  // Create the node legend column
  var legendNodes = legend.append("g")
    .attr("class", "legend-column")
    .attr("transform", "translate(20, 20)"); // Adjust the position

  // // Add node legend header
  // legendNodes.append("text")
  //   .attr("class", "legend-header")
  //   .style("fill", "black")
  //   .attr("x", 0)
  //   .attr("y", 0)
  //   .text("Node Type");

  legendItemsNodes = legendNodes.selectAll(".legend-nodes-item");

  // Create the link legend column
  var legendLinks = legend.append("g")
    .attr("class", "legend-column")
    .attr("transform", "translate(200, 20)"); // Adjust the position

  // // Add link legend header
  // legendLinks.append("text")
  //   .attr("class", "legend-header")
  //   .style("fill", "black")
  //   .attr("x", 0)
  //   .attr("y", 0)
  //   .text("Link Type");

  legendItemsLinks = legendLinks.selectAll(".legend-links-item");

  ////////////////////////////// LEGEND //////////////////////////////////////////

  //	UPDATE
  legendItemsNodes = legendItemsNodes.data(legendDataNodes);
  legendItemsLinks = legendItemsLinks.data(legendDataLinks);
  //	ENTER
  var newlegendItemsNodes = legendItemsNodes.enter()
    .append("g")
    .attr("class", "legend-nodes-item")
    .attr("value", function (d) { return d.value; })
    .attr("transform", function (d, i) {
      return "translate(0," + (i + 21) + ")"; // Adjust the position
    })
    .on("click", toggleTextColor);

  newlegendItemsNodes.append("circle")
    .attr("cx", 0)
    .attr("cy", function (d, i) { return i * 21; })
    .attr("r", 9)
    .style("fill", function (d) { return forceProperties.symbol.enabled ? d.img : d.color; })
    .attr("stroke", function (d) { return d.color; })
    .attr("stroke-width", 2);

  newlegendItemsNodes.append("text")
    .style("fill", function (d) { return withOutNodeTypesList.includes(d.value) ? "gray" : "black" })
    .attr("x", 15)
    .attr("y", function (d, i) { return i * 21; })
    .text(function (d) { return d.label + " (" + d.count + ")"; });

  var newlegendItemsLinks = legendItemsLinks.enter()
    .append("g")
    .attr("class", "legend-links-item")
    .attr("value", function (d) { return d.value; })
    .attr("transform", function (d, i) {
      return "translate(0," + (i + 21) + ")"; // Adjust the position
    })
    .on("click", toggleTextColor);

  newlegendItemsLinks.append("path")
    .attr("d", function (d, i) {
      // Calculate the curve path based on the desired curve shape
      const startX = 0;
      const startY = i * 21;
      const endX = 20; // Adjust the value based on the desired length of the curve
      const endY = i * 21;
      const dx = endX - startX;
      const dy = endY - startY;
      const dr = Math.sqrt(dx * dx + dy * dy);
      // const sweep = (d.type === "membership" || d.type === "ownership") ? 1 : 0; // Set the sweep flag based on the link type

      // Generate the curve path using SVG path commands
      return "M" + startX + " " + startY
        + "A" + dr + " " + dr
        + " 0 0 " + 1 + " " + endX + " " + endY;
    })
    .attr("stroke-width", 5)
    .attr("stroke", function (d) { return d.color; });

  newlegendItemsLinks.append("text")
    .attr("x", 25)
    .attr("y", function (d, i) { return i * 21; })
    .style("fill", function (d) { return withOutLinkTypesList.includes(d.value) ? "gray" : "black" })
    .text(function (d) { return d.label + " (" + d.count + ")"; });

  //	ENTER + UPDATE
  legendItemsNodes = legendItemsNodes.merge(newlegendItemsNodes);
  legendItemsLinks = legendItemsLinks.merge(newlegendItemsLinks);

  //straight line
  // var newlegendItemsLinks = legendItemsLinks.enter()
  //   .append("g")
  //   .attr("class", "legend-links-item")
  //   .attr("value", function (d) { return d.value; })
  //   .attr("transform", function (d, i) {
  //     return "translate(0," + (i + 21) + ")"; // Adjust the position
  //   })
  //   .on("click", toggleTextColor);

  // newlegendItemsLinks.append("line")
  //   .attr("x1", 0)
  //   .attr("y1", function (d, i) { return i * 21; })
  //   .attr("x2", 15) // Adjust the value based on the desired length of the line
  //   .attr("y2", function (d, i) { return i * 21; })
  //   .attr("stroke-width", 10)
  //   .attr("stroke", function (d) { return d.color; });

  // newlegendItemsLinks.append("text")
  //   .attr("x", 20)
  //   .attr("y", function (d, i) { return i * 21; })
  //   .style("fill", function (d) { return withOutLinkTypesList.includes(d.value) ? "gray" : "black" })
  //   .text(function (d) { return d.label + " (" + d.count + ")"; });
  // //	ENTER + UPDATE
  // legendItemsNodes = legendItemsNodes.merge(newlegendItemsNodes);
  // legendItemsLinks = legendItemsLinks.merge(newlegendItemsLinks);

  simulation.alpha(1).alphaTarget(0).restart();
}

// update the display based on the data
function updateDisplay() {
  update_network();
  update_legend();
  // simulation.alpha(1).alphaTarget(0).restart();
}
// update the display based on the forces (but not positions)
function updateDisplayWithOutData() {
  var Size = forceProperties.label.size + 'pt';
  node
    // .attr("fill", "url(#company)")
    .attr("fill", function (d) { return colorNode(d.type, d.id); })
    .attr("r", function (d) {
      return suspectedNodes.includes(d.id) ? forceProperties.collide.radius * 2 : forceProperties.collide.radius;
    })
  label
    .attr("opacity", forceProperties.label.enabled ? 1 : 0)
    .style("font-size", Size)
    .text(d => {
      if (forceProperties.country.enabled && d.country) {
        return d.label+" ("+d.country+")"
      } else {
        return d.label
      }
    });
  link
    .attr("stroke-width", function (d) {return d.weight*forceProperties.link.width})
    .attr("opacity", forceProperties.link.enabled ? 1 : 0);
  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////
  image.remove();
  image = container.append("defs");

  legendDataNodes.forEach(element => {
    image.append('pattern')
      .attr("class", "img")
      .attr("id", element.id)
      .attr("width", 1)
      .attr("height", 1)
      .append("image")
      .attr("xlink:href", "./img/withBG/" + element.id + ".png")
      .attr("width", 2 * forceProperties.collide.radius)
      .attr("height", 2 * forceProperties.collide.radius)
      .attr("y", 0)
      .attr("x", 0);
    image.append('pattern')
      .attr("class", "img")
      .attr("id", element.id + "-suspected")
      .attr("width", 1)
      .attr("height", 1)
      .append("image")
      .attr("xlink:href", "./img/withBG/" + element.id + ".png")
      .attr("width", 4 * forceProperties.collide.radius)
      .attr("height", 4 * forceProperties.collide.radius)
      .attr("y", 0)
      .attr("x", 0);

    image.append('pattern')
      .attr("class", "img")
      .attr("id", element.id + "-legend")
      .attr("width", 1)
      .attr("height", 1)
      .append("image")
      .attr("xlink:href", "./img/withBG/" + element.id + ".png")
      .attr("width", 18)
      .attr("height", 18)
      .attr("y", 0)
      .attr("x", 0);
  });
  update_legend();
}
// update the display positions after each simulation tick
function ticked() {
  node
    .attr("cx", function (d) { return d.x; })
    .attr("cy", function (d) { return d.y; });
  d3.select('#alpha_value').style('flex-basis', (simulation.alpha() * 100) + '%');
  label
    .attr("x", function (d) {
      if (suspectedNodes.includes(d.id)) {
        return d.x - forceProperties.collide.radius * 2;
      } else {
        return d.x - forceProperties.collide.radius;
      }
    })
    .attr("y", function (d) {
      if (suspectedNodes.includes(d.id)) {
        return d.y - forceProperties.collide.radius * 2;
      } else {
        return d.y - forceProperties.collide.radius;
      }
    })
  link.attr("d", linkArc);

  // image
  //   .attr('x', function (d) { return d.x - forceProperties.collide.radius; }) // Position the icon within the circle container
  //   .attr('y', function (d) { return d.y - forceProperties.collide.radius; })
}

//////////// UI EVENTS ////////////

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
  if (!d3.event.active) simulation.alphaTarget(0.0001);
  d.fx = null;
  d.fy = null;
}
// just one angle
// function linkArc(d) {
//   // https://observablehq.com/@choct155/force-directed-graphs
//   var dx = d.target.x - d.source.x,
//   dy = d.target.y - d.source.y,
//   dr = Math.sqrt(dx * dx + dy * dy);
// return "M" + d.source.x + " " + d.source.y
//    + "A" + dr + " " + dr
//    + ", 0, 0, 1," + d.target.x + "," + d.target.y;
// }
// Update the linkArc function to create curved links with different angles based on link type
function linkArc(d) {
  const dx = d.target.x - d.source.x;
  const dy = d.target.y - d.source.y;
  const dr = Math.sqrt(dx * dx + dy * dy);

  // Calculate the angle based on the link type
  let angle;
  if (d.type === "membership") {
    angle = Math.atan2(dy, dx) + (Math.PI / 180) * 15; // Add 5 degrees to the angle
  } else if (d.type === "partnership") {
    angle = Math.atan2(dy, dx) + (Math.PI / 180) * 30; // Subtract 5 degrees from the angle
  } else if (d.type === "ownership") {
    angle = Math.atan2(dy, dx) + (Math.PI / 180) * 45; // Add 10 degrees to the angle
  } else if (d.type === "family_relationship") {
    angle = Math.atan2(dy, dx) + (Math.PI / 180) * 60; // Subtract 10 degrees from the angle
  } else {
    angle = Math.atan2(dy, dx); // Default angle
  }

  // Calculate the control point based on the angle and distance
  const controlX = d.source.x + (dr * Math.cos(angle));
  const controlY = d.source.y + (dr * Math.sin(angle));

  // Generate the path using the source, control, and target points
  return "M" + d.source.x + " " + d.source.y
    + "Q" + controlX + " " + controlY
    + "," + d.target.x + " " + d.target.y;
}




/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Function to determine the color of the links based on type
function colorLink(type) {
  if (type === "membership") {
    return "#00ff00";
  } else if (type === "partnership") {
    return "#ffffff";
  } else if (type === "ownership") {
    return "#FF00EA";
  } else if (type === "family_relationship") {
    return "#FFE800";
  } else {
    return "#7f7f7f"; // Default color
  }
}

// Function to determine the color of the stroke nodes based on type and id
function colorNodeWithSpecificId(type, id, selectedId) {
  if (selectedId === "all" && suspectedNodes.includes(id)) {
    return "#ff0000";
  } else if (id === selectedId) {
    return "#ff0000";
  } else if (suspectedNodes.includes(id)) {
    return "#ffffff";
  } else if (type === "company") {
    return "#1f77b4";
  } else if (type === "person") {
    return "#ff7f0e";
  } else if (type === "organization") {
    return "#2ca02c";
  } else if (type === "political_organization") {
    return "#9467bd";
  } else if (type === "location") {
    return "#D6CE1B";
  } else if (type === "vessel") {
    return "#e377c2";
  } else if (type === "event") {
    return "#17becf";
  } else if (type === "movement") {
    return "#CE6C57";
  } else {
    return "#7f7f7f"; // Default color
  }
}

// Function to determine the color of the nodes based on type
function colorNode(type, id, isText = false) {
  if (forceProperties.symbol.enabled && !isText) {
    if (suspectedNodes.includes(id)) {
      // console.log(`url(#${type}-suspected)`)
      return `url(#${type}-suspected)`;
    }
    else if (type === undefined) {
      return `url(#undefined)`;
    }
    else {
      return `url(#${type})`;
    }
    // if (type === "company") {
    //   return `url(#company)`;
    // } else if (type === "person") {
    //   return `url(#person)`;
    // } else if (type === "organization") {
    //   return `url(#organization)`;
    // } else if (type === "political_organization") {
    //   return `url(#political_organization)`;
    // } else if (type === "location") {
    //   return `url(#location)`;
    // } else if (type === "vessel") {
    //   return `url(#vessel)`;
    // } else if (type === "event") {
    //   return `url(#event)`;
    // } else if (type === "movement") {
    //   return `url(#movement)`;
    // } else {
    //   return `url(#undefined)`;
    //   // Default imae
    // }
  } else {
    if (type === "company") {
      return "#1f77b4";
    } else if (type === "person") {
      return "#ff7f0e";
    } else if (type === "organization") {
      return "#2ca02c";
    } else if (type === "political_organization") {
      return "#9467bd";
    } else if (type === "location") {
      return "#D6CE1B";
    } else if (type === "vessel") {
      return "#e377c2";
    } else if (type === "event") {
      return "#17becf";
    } else if (type === "movement") {
      return "#CE6C57";
    } else {
      return "#7f7f7f"; // Default color
    }
  }
}

// Function to toggle text color and add filter list
function toggleTextColor(d) {
  // var typeName = d.value;
  // console.log("Type Name:", typeName, typeName, withOutNodeTypesList, withOutLinkTypesList);
  if (nodeTypes.includes(d.value)) {
    if (withOutNodeTypesList.includes(d.value)) {
      withOutNodeTypesList = withOutNodeTypesList.filter(function (e) { return e !== d.value })
    } else {
      withOutNodeTypesList.push(d.value);
    }
  } else {
    if (withOutLinkTypesList.includes(d.value)) {
      withOutLinkTypesList = withOutLinkTypesList.filter(function (e) { return e !== d.value })
    } else {
      withOutLinkTypesList.push(d.value);
    }
  }
  // console.log("Type Name:", typeName, typeName, withOutNodeTypesList, withOutLinkTypesList);
  d3.select(this)
    .select("text")
    .style("fill", function () {
      var currentColor = d3.select(this).style("fill");
      return currentColor === "black" ? "gray" : "black";
    });

  updateDataBcOfFilter();
  // if (forceProperties.focus.enabled) {
  //   updateFocusData();
  // }
}
// // Find all possible paths between two nodes using DFS
// function findAllPaths(sourceId, targetId) {
//   const paths = []; // Array to store all paths

//   // Implement DFS algorithm to find all paths
//   function dfs(currentNode, path) {
//     if (currentNode.id === targetId) {
//       paths.push(path.slice()); // Save a copy of the current path
//       return;
//     }

//     for (const link of graphData.links) {
//       if (link.source === currentNode.id && !path.includes(link.target)) {
//         path.push(link.target);
//         dfs(graphData.nodes.find(node => node.id === link.target), path);
//         path.pop();
//       }
//     }
//   }

//   const sourceNode = graphData.nodes.find(node => node.id === sourceId);
//   dfs(sourceNode, [sourceNode.id]);

//   return paths;
// }

function updateFocusData() {
  if (forceProperties.focus.enabled) {
    var count = graphData.nodes.filter(node => {
      if (suspectedNodes.includes(node.id)) {
        return true;
      }
      return false;
    }).length;
    console.log(graph.links, graph.nodes, graphData.links, graphData.nodes);
    if (count > 1) {
      var LinksSet = new Set();
      graphData.nodes.forEach(node => {
        if (!suspectedNodes.includes(node.id)) {
          var nodeLinks = graphData.links.filter(link => { return (link.source === node.id || link.target === node.id) && !(suspectedNodes.includes(link.source) || suspectedNodes.includes(link.target)) });
          if (nodeLinks.length == 1) {
            LinksSet.add(nodeLinks[0]);
            return false
          }
        }
        return true
      });
      console.log(LinksSet);
      LinksSet = [...LinksSet]
      var tempLinks = graphData.links.filter(link => { return !LinksSet.includes(link) })
      console.log(tempLinks);
      var nodeIds = new Set();
      tempLinks.forEach(function (link) {
        nodeIds.add(link.source);
        nodeIds.add(link.target);
      });
      nodeIds = [...nodeIds];
      var tempNodes = storeData.nodes.filter(function (node) {
        return nodeIds.includes(node.id);
      });
      graph.links = $.extend(true, [], tempLinks);
      graph.nodes = $.extend(true, [], tempNodes);
      console.log(graph.links, graph.nodes, graphData.links, graphData.nodes);
    }
  }
  console.log(graph.links, graph.nodes, graphData.links, graphData.nodes);
}

// convenience function to update everything without data (run after UI input)
function updateWithOutData() {
  updateForces();
  updateDisplayWithOutData();
}

// update size-related forces
d3.select(window).on("resize", function () {
  width = +svg.node().getBoundingClientRect().width;
  height = +svg.node().getBoundingClientRect().height;
  updateForces();
});

// convenience function to update everything (run after UI input)
function updateAll() {
  updateData();
  withOutNodeTypesList = [];
  withOutLinkTypesList = [];
  initializeSimulation();
  update_control();
  updateDisplay();
  updateDisplayWithOutData();
}


// https://github.com/w3collective/price-range-slider
var rangeMin = 1;
// const range = document.querySelector(".range-selected");
// const rangeInput = document.querySelectorAll(".range-input input");
// const rangeOutput = document.querySelectorAll(".range-output input");
function rangeInputChange(e) {
  const minRangeInput = d3.select('#weight-range-min').node();
  const maxRangeInput = d3.select('#weight-range-max').node();
  const minBoxInput = d3.select('#weight-box-min').node();
  const maxBoxInput = d3.select('#weight-box-max').node();
  let minRange = parseInt(minRangeInput.value);
  let maxRange = parseInt(maxRangeInput.value);
  if (maxRange - minRange < rangeMin) {
    if (e.className === "min") {
      minRange = maxRange - rangeMin;
      minRangeInput.value = minRange;
      minBoxInput.value = minRange;
    } else {
      maxRange = minRange + rangeMin;
      maxRangeInput.value = maxRange;
      maxBoxInput.value = maxRange;
    }
  } else {
    minBoxInput.value = minRange;
    maxBoxInput.value = maxRange;
    d3.select("#range-filled")
    .style("left", (minRange / parseInt(minRangeInput.max)) * 100 + "%")
    .style("right", 100 - (maxRange / parseInt(maxRangeInput.max)) * 100 + "%");
  }
  forceProperties.weight.min = minRange;
  forceProperties.weight.max = maxRange;
  
  // updateAll();
  // console.log(forceProperties.weight.min, forceProperties.weight.max);
}
function rangeOutputChange(e) {
  const minRangeInput = d3.select('#weight-range-min').node();
  const maxRangeInput = d3.select('#weight-range-max').node();
  const minBoxInput = d3.select('#weight-box-min').node();
  const maxBoxInput = d3.select('#weight-box-max').node();
  let minBox = parseInt(minBoxInput.value);
  let maxBox = parseInt(maxBoxInput.value);
  if (maxBox - minBox >= rangeMin && maxBox <= parseInt(maxRangeInput.max)) {
    if (e.className === "min") {
      console.log(minBox,maxBox )
      minRangeInput.value = minBox;
      d3.select("#range-filled")
      .style("left", (minBox / parseInt(minBoxInput.max)) * 100 + "%");
    } else {
      maxRangeInput.value = maxBox;
      d3.select("#range-filled")
      .style("right", 100 - (maxBox / parseInt(maxBoxInput.max)) * 100 + "%");
    }
  } 
  else {
    if (e.className === "min") {
      console.log(minBox,maxBox )
      minBox = maxBox - rangeMin;
      minBoxInput.value = minBox;
      minRangeInput.value = minBox;
      d3.select("#range-filled")
      .style("left", (minBox / parseInt(minBoxInput.max)) * 100 + "%");
    } else {
      maxBox = minBox + rangeMin;
      maxBoxInput.value = maxBox;
      maxRangeInput.value = maxBox;
      d3.select("#range-filled")
      .style("right", 100 - (maxBox / parseInt(maxBoxInput.max)) * 100 + "%");
    }
  }
  forceProperties.weight.min = minBox;
  forceProperties.weight.max = maxBox;
  // updateAll();
  // console.log(forceProperties.weight.min, forceProperties.weight.max);
}


// https://observablehq.com/@ravengao/force-directed-graph-with-cola-grouping
const mouseNodeOverFunction = d => {
  
  var Size = forceProperties.label.size + 'pt';
  if (ifClicked) return;
  node
    .transition(500)
    .style('opacity', o => {
      const isConnectedValue = isConnected(o.id, d.id);
      if (isConnectedValue) {
        return 1.0;
      }
      return 0.1;
    });
  link
    .transition(500)
    .style('stroke-opacity', o => {
      return (o.source === d || o.target === d ? 1 : 0.1)
    });
  label
    .attr("opacity", o => {
      if (forceProperties.label.enabled) {
        const isConnectedValue = isConnected(o.id, d.id);
        if (isConnectedValue) {
          return 1.0;
        }
        return 0.1;
      } else {
        return 0;
      }
    })
    .style("font-size", Size);
};

const mouseOutFunction = d => {
  
  var Size = forceProperties.label.size + 'pt';
  if (ifClicked) return;
  node
    .transition(500)
    .style('opacity', 1);
  link
    .transition(500)
    .style("stroke-opacity", 1);
  label
    .attr("opacity", forceProperties.label.enabled ? 1 : 0)
    .style("font-size", Size);
};

const mouseNodeClickFunction = d => {
  
  var Size = forceProperties.label.size + 'pt';
  // we don't want the click event bubble up to svg
  d3.event.stopPropagation();
  ifClicked = true;
  node
    .transition(500)
    .style('opacity', 1)
  link
    .transition(500);
  node
    .transition(500)
    .style('opacity', o => {
      const isConnectedValue = isConnected(o.id, d.id);
      if (isConnectedValue) {
        return 1.0;
      }
      return 0.1
    })
  link
    .transition(500)
    .style('stroke-opacity', o => (o.source === d || o.target === d ? 1 : 0.1));
  label
    .attr("opacity", o => {
      if (forceProperties.label.enabled) {
        const isConnectedValue = isConnected(o.id, d.id);
        if (isConnectedValue) {
          return 1.0;
        }
        return 0.1;
      } else {
        return 0;
      }
    })
    .style("font-size", Size);
};

const mouseLinkOverFunction = d => {
  
  var Size = forceProperties.label.size + 'pt';
  if (ifClicked) return;
  node
    .transition(500)
    .style('opacity', o => {
      return (o === d.source || o === d.target ? 1 : 0.1)
    });
  link
    .transition(500)
    .style('stroke-opacity', o => {
      return (o.source === d.source && o.target === d.target ? 1 : 0.1)
    })
  label
    .attr("opacity", o => {
      if (forceProperties.label.enabled) {
        return (o === d.source || o === d.target ? 1 : 0.1)
      } else {
        return 0;
      }
    })
    .style("font-size", Size);
};

const mouseLinkClickFunction = d => {
  
  var Size = forceProperties.label.size + 'pt';
  // we don't want the click event bubble up to svg
  d3.event.stopPropagation();
  ifClicked = true;
  node
    .transition(500)
    .style('opacity', 1)
  link
    .transition(500);
  node
    .transition(500)
    .style('opacity', o => {
      return (o === d.source || o === d.target ? 1 : 0.1)
    });
  link
    .transition(500)
    .style('stroke-opacity', o => (o.source === d.source && o.target === d.target ? 1 : 0.1));
  label
    .attr("opacity", o => {
      if (forceProperties.label.enabled) {
        return (o === d.source || o === d.target ? 1 : 0.1)
      } else {
        return 0;
      }
    })
    .style("font-size", Size);
};

