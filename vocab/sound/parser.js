var urlExists = require('url-exists');
var in_raw = require('../parserinput.js');

var in_start = in_raw.start;
var in_data = in_raw.data;



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

function parseAudio(data,callback,level) {
    if (!level) level = 0;
    
    var url;
    var olddata = data;
    
    data = data.replace(/[ \-']/g,'_');
    data = data.replace(/sth/g,'something');
    data = data.replace(/sb/g,'somebody');
    //console.error(data);
    
    if (data.length >= 5) {
        url = 'http://www.oxfordlearnersdictionaries.com/media/english/uk_pron/'+data.substr(0,1)+'/'+data.substr(0,3)+'/'+data.substr(0,5)+'/'+data;
    } else if (data.length == 4) {
        url = 'http://www.oxfordlearnersdictionaries.com/media/english/uk_pron/'+data.substr(0,1)+'/'+data.substr(0,3)+'/'+data.substr(0,4)+'_/'+data;
    } else if (data.length == 3) {
        url = 'http://www.oxfordlearnersdictionaries.com/media/english/uk_pron/'+data.substr(0,1)+'/'+data.substr(0,3)+'/'+data.substr(0,3)+'__/'+data;
    } else if (data.length==2) {
        url = 'http://www.oxfordlearnersdictionaries.com/media/english/uk_pron/'+data.substr(0,1)+'/'+data.substr(0,2)+'_/'+data.substr(0,2)+'__g/'+data;
    } else { //len=1
        url = 'http://www.oxfordlearnersdictionaries.com/media/english/uk_pron/'+data.substr(0,1)+'/'+data.substr(0,1)+'__/'+data.substr(0,1)+'__gb/'+data;
    }
    
    if (level>=2 && level<=3) {
        url += '_1_gb_';
    } else {
        url += '__gb_';
    }
    
    scanurl(url,function(audioid) {
        if (audioid!=-1) {
            url+=audioid;
            url += '.mp3';
            callback(url);
        } else {
            if (level==0) {
                parseAudio("x"+olddata,callback,1);
            } else if (level==1) {
                parseAudio(olddata.substr(1),callback,2);
            } else if (level==2) {
                parseAudio("x"+olddata,callback,3);
            } else if (level==3) {
                data = olddata.substr(1);
                var dataparts = data.split(/[ _\/]/);
                //console.error(dataparts);
                if (dataparts.length==1) {
                    callback("");
                } else {
                    var status = [];
                    for(var i = 0;i<dataparts.length;i++) {
                        status.push("wait");
                    }
                    
                    dataparts.forEach(function(part,ii) {
                        "use strict";
                        let i = ii;
                        parseAudio(part,function(parturl) {
                            //console.error(parturl);
                            status[i] = parturl;
                            
                            var ret = true;
                            for(var j = 0;j<status.length;j++) {
                                if (status[j]=="wait") {
                                    ret = false;
                                    break;
                                }
                            }
                            
                            var urlres = ""; //hack base system using script injection technique
                            
                            if (ret) {
                                //console.error(status);
                                urlres = status[0];
                                for(var j = 1;j<status.length;j++) {
                                    urlres += '"></audio><audio controls><source src="';
                                    urlres += status[j];
                                }
                                //console.error(urlres);
                                callback(urlres);
                            }
                            
                            
                        });
                    });
                }
            }
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

//for fix bug -> if slower than 20sec -> print current state
var bugtimeout = setTimeout(function() {
    console.error("Bug");
    for(var i = 0;i<resready.length;i++) {
        resready[i] = true;
    }
},20000);

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
    clearTimeout(bugtimeout);
}

setTimeout(doprint,100);