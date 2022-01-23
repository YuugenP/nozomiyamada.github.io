// w1-w5 is list of (chr, color) e.g. [['p', 'green'],['r','yellow'],['o','white'],['v','white'],['e','white']]
function search_words(w1, w2, w3, w4, w5){
    if(w1.map(x => x[0]).join('').length==5){
        candidate = WORDS.filter(x => check_word(w1, x))
    }else{
        return null;
    }
    if(w2.map(x => x[0]).join('').length==5){
        candidate = candidate.filter(x => check_word(w2, x))
    }
    if(w3.map(x => x[0]).join('').length==5){
        candidate = candidate.filter(x => check_word(w3, x))
    }
    if(w4.map(x => x[0]).join('').length==5){
        candidate = candidate.filter(x => check_word(w4, x))
    }
    if(w5.map(x => x[0]).join('').length==5){
        candidate = candidate.filter(x => check_word(w5, x))
    }
    return candidate.slice(0,50).join("  ").toUpperCase();
}

// make list function
function make_list(w){
    return [
        [w.chr1, w.color1],
        [w.chr2, w.color2],
        [w.chr3, w.color3],
        [w.chr4, w.color4],
        [w.chr5, w.color5]
    ];
}

// inputword is list of (chr, color) e.g. [('p', 'green'),('r','yellow'),('o','white')]
function check_word(inputword, targetword){
    for(var i=0; i<5; i++){
        chr = inputword[i][0].toLowerCase();
        color = inputword[i][1];
        // console.log(i, chr, color);
        if(color==="green" && targetword[i] !== chr){
            return false;
        }else if(color==="yellow" && targetword[i] == chr){
            return false;
        }else if(color==="yellow" && targetword.includes(chr) == false){
            return false;
        }else if(color==="grey" && targetword.includes(chr) == true){ // grey color, but contains the chr -> // TRUE iff contains 2 identical chrs   
            for(list of inputword){
                if(list[0]==chr && (list[1]=='green'||list[1]=='yellow')){
                    return true;
                }
            }
            return false;
        }
    }
    return true;
}