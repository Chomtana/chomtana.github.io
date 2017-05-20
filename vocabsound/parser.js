var urlExists = require('url-exists');

//input
/*var in_start = 1;
var in_data = [
    ['abandon','desert','vacate','evacuate','relinquish','abdicate'], //1
    ['abnormal','rogue','deviant','anomalous'], //7
    ['accomplice','conspirator','accessory','plotter'], //11
    ['achieve','accomplish','attain','fulfil'], //13
    ['addictive','obsessive','compulsive','obsessional'], //19
    ['adequate','sufficient','ample','acceptable'], //23
    ['frightened','scared','terrified','fearful','paranoid','intimidated','startled','petrified'], //27
    ['aggressive','hostile','militant','warlike'], //35
];
//1-38
*/
var in_start = 39;
var in_data = [
    ['amazing','astonishing','awesome','staggering','breathtaking','miraculous','stunning'], //39
    ['infuriate','antagonize','outrage','enrage','incense'], //46
    ['annoy','frustrate','irritate','displease','exasperate'], //51
    ['artificial','synthetic','false','fake','imitation'], //56
    ['awareness','knowledge','consciousness','realization','perception'], //61
    ['barrier','obstacle','impediment','hindrance','handicap','hurdle'], //66
    ['essential','vital','crucial','critical','decisive','indispensable','imperative','pivotal'] //72
];



//process
var res = [];
var resready = [];

function scanurl(url,cb) {
    "use strict";
    
    //console.log("scanurl: "+url);
    var status = [0,0,0,0,0];
    for(let i = 1;i<6;i++) {
        //console.log("scanurl: "+url+i+".mp3");
        //var iasync = i;
        urlExists(url+i+".mp3",function(err,exists) {
            //console.log(exists);
            if (!exists) {
                status[i-1] = 1;
            } else {
                status[i-1] = 2;
            }
            //console.log(url+iasync+".mp3"+' '+status);
            var ret = -1;
            for(var j = 0;j<5;j++) {
                if (status[j]==0) {
                    ret = -2;
                    break;
                } else {
                    if (status[j]==2) {
                        ret = Math.max(ret,j+1);
                    }
                }
            }
            if (ret!=-2) {
                cb(ret);
            }
            //console.log(url+i+".mp3"+' '+exists);
        });
    }
}

function parseAudio(data,callback) {
    var url;
    
    if (data.length >= 5) {
        url = 'http://www.oxfordlearnersdictionaries.com/media/english/uk_pron/'+data.substr(0,1)+'/'+data.substr(0,3)+'/'+data.substr(0,5)+'/'+data+'__gb_';
    } else if (data.length == 4) {
        url = 'http://www.oxfordlearnersdictionaries.com/media/english/uk_pron/'+data.substr(0,1)+'/'+data.substr(0,3)+'/'+data.substr(0,4)+'_/'+data+'__gb_';
    } else if (data.length == 3) {
        url = 'http://www.oxfordlearnersdictionaries.com/media/english/uk_pron/'+data.substr(0,1)+'/'+data.substr(0,3)+'/'+data.substr(0,3)+'__/'+data+'__gb_';
    } else if (data.length==2) {
        url = 'http://www.oxfordlearnersdictionaries.com/media/english/uk_pron/'+data.substr(0,1)+'/'+data.substr(0,2)+'_/'+data.substr(0,2)+'___/'+data+'__gb_';
    } else { //len=1
        url = 'http://www.oxfordlearnersdictionaries.com/media/english/uk_pron/'+data.substr(0,1)+'/'+data.substr(0,1)+'__/'+data.substr(0,1)+'____/'+data+'__gb_';
    }
    
    scanurl(url,function(audioid) {
        if (audioid!=-1) {
            url+=audioid;
            url += '.mp3';
            callback(url);
        } else {
            parseAudio("x"+data,callback);
        }
    });
}

var curr = in_start;
in_data.forEach(function(g_data,g_id) {
    res.push('<div class="rootgroup">');
    resready.push(true);
    g_data.forEach(function(data) {
        var resi = res.length;
        res.push('\t<div class="groupchild">'+(curr++)+'. '+data+'<audio controls><source src="');
        resready.push(false);
        parseAudio(data,function(audiourl) {
            //console.log("URl ret : "+audiourl);
            console.error(audiourl);
            res[resi] += audiourl+'"></audio></div>';
            resready[resi] = true;
        });
    })
    res.push('</div>');
    resready.push(true);
});

function allready() {
    //console.log(resready);
    for(var i = 0;i<resready.length;i++) {
        if (!resready[i]) return false;
    }
    
    return true;
}

function doprint() {

    if (!allready()) {
        setTimeout(doprint,100);
        return;
    }

    var realres = "";
    
    res.forEach(function(data) {
        realres += data+'\n';
    });
    
    console.log(realres);
}

setTimeout(doprint,100);

//for fix bug -> if slower than 1min -> print current state
setTimeout(function() {
    console.error("Bug");
    for(var i = 0;i<resready.length;i++) {
        resready[i] = true;
    }
},60000);