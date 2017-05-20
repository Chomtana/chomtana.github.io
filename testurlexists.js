var urlExists = require('url-exists');

(function() {
    urlExists("https://google.com"/*url+i+".mp3"*/,function(err,exists) {
        console.log(exists);
    });
})();