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
function setupNetlist(id, type, connections, comps) {
  flattened = flattenNetlist(comps);
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
 * Parses user input into a netlist description and processes it
 */
function getNetlist(code) {
  var netlist = code.split(' ').filter(function(i) {return i;});
  if (netlist.length < 3 || netlist[0][0].toUpperCase() != 'X') {
    $('.errors').append('<p>All declarations must be in the following format: <i>Xid component nodes</i>.</p>');
    return null;
  }
  connections = components[netlist[1]];
  if (!connections) {
    $('input.saved').val(code);
    $('input.cnums').val('');
    $('.connects .type').text(netlist[1]);
    $('.connects').show();
    $('input.cnums').focus();
    return null;
  }
  var setup = setupNetlist(netlist[0], netlist[1], connections, netlist.slice(2));
  return setup;
}

/*
 * function showNetlist(id, type, comps)
 *
 * Takes a processed netlist and displays it on the page.
 */
function showNetlist(expanded) {
  if (expanded) {
    for (var i = 0; i < expanded.length; i++) {
      $('.errors').empty();
      $('.expansion').append(expanded[i] + '<br>');
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
  var code = $('input.netlist').val();
  var expanded = getNetlist(code);
  showNetlist(expanded);
});

/*
 * Handler for user submission of custom component details
 */
$('.connects').submit(function(e) {
  e.preventDefault();
  $('.errors').empty();
  var cnum = parseInt($('input.cnums').val());
  var comp = $('.connects .type').text();
  if (cnum && comp) {
    components[comp] = cnum;
    $('.connects').hide();
    var code = $('input.saved').val();
    var expanded = getNetlist(code);
    showNetlist(expanded);
  }
  else {
    $('.errors').append('<p>You must provide an integer number of connections.</p>');
  }
});

/*
 * Autofocus on page load
 */
$(document).ready(function() {
  $('input.netlist').focus();
});
