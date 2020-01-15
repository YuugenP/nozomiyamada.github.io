function cossim(v1, v2){
    len = v1.length;
    dot_product = 0;
    for(let i=0; i<len; i++){
        dot_product += (v1[i] * v2[i]);
    }
    return dot_product;
}
