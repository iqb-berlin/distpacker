#!/usr/bin/env node
//console.log(args);
//console.log(process.env)

const fs = require('fs')
const existsSync = fs.existsSync;
const readFileSync = fs.readFileSync;
const writeFileSync = fs.writeFileSync;

const folderseperator = '/';

const args = process.argv;
const debug=false;

function log(str){
    if(debug===true){
        console.log(str);
    }
}
// Little Hepler
function base64_encode(file) {
    if (existsSync(file)) {
        log('convert:' + file);
        return readFileSync(file, 'base64');
    } else {
         log('error base64: ' + file);
    }

}
function getExtension(filename) {
    var i = filename.lastIndexOf('.');
    return (i < 0) ? '' : filename.substr(i + 1);
}

function replaceUrlInCss(jsString) {
    //  replace img with base64 in css url
    var regexUrl = /\burl\([^)]+\)/gi; // rebuild regex
    return jsString.replace(regexUrl, (a, b) => {
        log(a);
        log(b);

        // skip material icons ?
        if (a.search('#') > -1) {            
            return a;
        }

        var regexFile = /\((.*?)\)/ig;
        var src = regexFile.exec(a)[1].replace(/\'/gi, "").replace(/\"/gi, "").replace("./", "");
        var ext = getExtension(src);
        try {
            var file = folder + src;

            if (existsSync(file)) {
                var base64Str = base64_encode(file);
                return "url(data:image/" + ext + ";base64," + base64Str + ")"; //ATTENTION with " & '
            } else {
                log('no file ' + file);
                log(a);
                return a;
            }
        } catch (e) {
            log('error in replaceUrlInCss');
            return a;
        }
    });
}
//  replace img with base64 in img-tags with src-attribute
function replaceLinkedAssetsInJS(jsString) {
    var regexAssets = /['|"]\.\/assets(.*?)['|"]/gi;
    return jsString.replace(regexAssets, (a, b) => {
        log('replaceLinkedAssetsInJS');
        log(a);
        log(b);

        var firstSign = a[0];
        var src = a.replace(/\'/gi, "").replace(/\"/gi, "").replace("./", "");
        var ext = getExtension(b);

        try {
            var file = folder + src;

            if (existsSync(file)) {
                var base64Str = base64_encode(folder + src);
                if (firstSign === '"') {
                    return '"data:image/' + ext + ';base64,' + base64Str + '"'; //ATTENTION with " & '
                } else {
                    return "'data:image/" + ext + ";base64," + base64Str + "'"; //ATTENTION with " & '
                }
            } else {
                return a;
            }

        } catch (e) {
            log('error in replaceLinkedAssetsInJS');
            log(e);
            return a;
        }
    });
}


var folder = args[2];
if (!folder.endsWith(folderseperator)) {
    folder = folder + folderseperator;
}
console.log("run iqb_dist2indexpack in " + folder);

if (!existsSync(folder + 'index.html')) {
    throw 'no index.html found in ' + folder;
}

var htmlString = readFileSync(folder + 'index.html', 'utf8').toString();
//replace favicon
var regexCss = /<link.*href="(.*?.ico)".*?>/gi
htmlString = htmlString.replace(regexCss, (a, b) => {
    log('find favicon: ' + b);
    
    var file = folder + b;    
    if (existsSync(file)) {
        var base64Str = base64_encode(file);
        return '<link type="image/x-icon" href="data:image/x-icon;base64,'+ base64Str + '" />'
    }else{
        return a;
    }
   ;
});
//  replace existing link-tags with manipulated style-tags
var regexCss = /<link.*href="(.*?.css)".*?>/gi
htmlString = htmlString.replace(regexCss, (a, b) => {
    log('find css: ' + b);
    
    var cssString = readFileSync(folder + b, 'utf8').toString();
    // MANIPUlATE 
    cssString = replaceUrlInCss(cssString)

    return "<style>" + cssString + "</style>";
});



//  replace existing script-tags (linked) with manipulated script-tags (embedded)
var regexJS = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gim;
htmlString = htmlString.replace(regexJS, (a, b) => {
    //console.log(a)    
    var regexSRC = /src="(.*?)"/ig // Attention, global declaration is wrong, because of pointer
    var src = regexSRC.exec(a)[1];

    var jsString = readFileSync(folder + src, 'utf8').toString();

    // MANIPUlATE 
    jsString = replaceUrlInCss(jsString); // first because works with url-pattern
    jsString = replaceLinkedAssetsInJS(jsString);

    return "<script type='text/javascript'>" + jsString + "\n" + "</script>";
});


// write new index.html
writeFileSync(folder + 'index_packed.html', htmlString, 'utf8');
console.log("finished, wrote packed index_packed.html to:" + folder )


