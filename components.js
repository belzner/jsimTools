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
 * Load default components on page load
 */
$(document).ready(function() {
  for (var type in components) {
    var plural = (components[type] === 1) ? '' : 's';
    $('.components').append('<p>' + type + ': ' + components[type] + ' connection' + plural + '</p>');
  }
});

/*
 * Add user-defined component
 */
$('.components').on('add', function(e, name, num) {
  components[name] = num;
  var plural = (num === 1) ? '' : 's';
  $('.components').append('<p>' + name + ': ' + num + ' connection' + plural + '</p>');
});
