//input
var in_start = 1;
var in_data = [
    ['abandon','desert','vacate','evacuate','relinquish','abdicate'],
    ['abnormal','rogue','deviant','anomalous'],
    ['accomplice','conspirator','accessory','plotter']
];

//process
function parseAudio(data) {
    if (data.length >= 5) {
        return 'http://www.oxfordlearnersdictionaries.com/media/english/uk_pron/'+data.substr(0,1)+'/'+data.substr(0,3)+'/'+data.substr(0,5)+'/'+data+'__gb_1.mp3';
    }
}


var res = "";
var curr = in_start;
in_data.forEach(function(g_data,g_id) {
    res += '<div class="rootgroup">\n';
    g_data.forEach(function(data) {
        res += '<div class="groupchild">'+(curr++)+'. '+data+'<audio controls><source src=';
    })
});