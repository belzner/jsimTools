/*
 * Components in the JSim standard cell library
 */
var components = {
  'constant'  : 1,
  'inverter'  : 2,
  'buffer'    : 2,
  'tristate'  : 3,
  'and2'      : 3,
  'and3'      : 4,
  'and4'      : 5,
  'nand2'     : 3,
  'nand3'     : 4,
  'nand4'     : 5,
  'or2'       : 3,
  'or3'       : 4,
  'or4'       : 5,
  'nor2'      : 3,
  'nor3'      : 4,
  'nor4'      : 5,
  'xor2'      : 3,
  'xnor2'     : 3,
  'mux2'      : 4,
  'mux4'      : 7,
  'dreg'      : 3
};

/*
 * function flattenNetlist(comps)
 *
 * Takes a (potentially complex) list of components
 * and flattens it into individual components
 */
function flattenNetlist(comps) {
  var dupesRe = /#(\d+)/g;
  var listRe = /\[(\d+:\d+(:\d+)?)+?\]/g;
  var numsRe = /\d+/g;
  var flattened = [];
  for (var i = 0; i < comps.length; i++) {
    numDupes = 1;
    comp = comps[i]
    hasDupe = comp.match(dupesRe);
    if (hasDupe && hasDupe.length == 1) {
      numDupes = parseInt(hasDupe[0].slice(1));
      comp = comp.replace(dupesRe, '');
    }
    else if (hasDupe && hasDupe.length > 1) {
      $('.errors').append('<p>'+ comp + ' is not a valid declaration.</p>');
      return null;
    }
    iterators = comp.match(listRe);
    flattening = [comp];
    for (var j = (iterators) ? iterators.length-1 : -1; j >= 0; j -= 1) {
      cur = iterators[j]
      curIndex = comp.lastIndexOf(cur);
      nums = _.map(cur.match(numsRe), function(num) {return parseInt(num);});
      if (nums[0] < nums[1]) {
        iterations = _.range(nums[0], nums[1]+1, (nums[2]) ? nums[2] : 1);
      }
      else if (nums[0] > nums[1]) {
        iterations = _.range(nums[0], nums[1]-1, (nums[2]) ? -nums[2] : -1);
      }
      tmp = [];
      for (var k = 0; k < iterations.length; k++) {
        for (var l = 0; l < flattening.length; l++) {
          tmp.push(flattening[l].slice(0, curIndex) + '[' + iterations[k] + ']' + flattening[l].slice(curIndex + cur.length));
        }
      }
      flattening = tmp;
      comp = comp.slice(0, curIndex);
    }
    for (j = 0; j < numDupes; j++) {
      flattened = $.merge(flattened, flattening);
    }
  }
  return flattened;
}

/*
 * function setupNetlist(id, type, comps)
 *
 * Takes a parsed (potentially complex) netlist and flattens it
 * then separates it into individual components
 */
function setupNetlist(id, type, comps) {
  flattened = flattenNetlist(comps);
  connections = components[type];
  if (!connections) {
    $('input.cnums').val('');
    $('.connects .type').text(type);
    $('.connects').show();
    return null;
  }
  if (!flattened) {
    return null;
  }
  numcomps = flattened.length / connections;
  if (numcomps == Math.floor(numcomps)) {
    comps = [];
    for (var i = 0; i < numcomps; i++) {
      curcomp = id + '_' + i + ' ' + type;
      for (var j = 0; j < connections; j++) {
        curcomp = curcomp + ' ' + flattened[(numcomps * j) + i];
      }
      comps.push(curcomp);
    }
    return comps;
  }
  else {
    $('.errors').append('<p>Expected a multiple of ' + connections + ' connections.</p>');
    return null;
  }
}

/*
 * function getNetlist(id, type, comps)
 *
 * Parses user input into a netlist description
 */
function getNetlist() {
  var code = $('input.netlist').val();
  var netlist = code.split(' ').filter(function(i) {return i;});
  return netlist;
}

/*
 * function showNetlist(id, type, comps)
 *
 * Takes a parsed netlist and processes it
 * then displays it on the page.
 */
function showNetlist(netlist) {
  var setup = setupNetlist(netlist[0], netlist[1], netlist.slice(2));
  if (setup) {
    for (var i = 0; i < setup.length; i++) {
      $('.errors').empty();
      $('.expansion').append('<p>' + setup[i] + '</p>');
    }
  }
}

/*
 * Handler for user submission of netlist
 */
$('.expand').submit(function(e) {
  e.preventDefault();
  $('.connects').hide();
  $('.errors').empty();
  $('.expansion').empty();
  var netlist = getNetlist();
  showNetlist(netlist);
});

/*
 * Handler for user submission of custom component details
 */
$('.connects').submit(function(e) {
  e.preventDefault();
  var netlist = getNetlist();
  var cnum = parseInt($('input.cnums').val());
  if (cnum && netlist) {
    components[netlist[1]] = cnum;
    $('.connects').hide();
    showNetlist(netlist);
  }
  else {
    $('.errors').append('<p>You must provide an integer number of connections.</p>');
  }
});
