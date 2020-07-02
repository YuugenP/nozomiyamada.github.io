////////// statistics /////////////

function sum(arr){
  if(!Array.isArray(arr)){arr = [arr];}
  return arr.reduce(function(acc, cur){return acc + cur;});
}

function mean(arr){
  if(!Array.isArray(arr)){arr = [arr];}
  let N = arr.length;
  return sum(arr)/N;
}

function median(arr){
  if(!Array.isArray(arr)){arr = [arr];}
  let N = arr.length;
  arr.sort();
  if(N%2==0){
    return (arr[N/2] + arr[N/2-1])/2;
  }else{
    return arr[(N-1)/2];
  }
}

function variance(arr, unbiased=true){
  if(!Array.isArray(arr)){arr = [arr];}
  if(unbiased==true){
    var N = arr.length-1;
  }else{
    var N = arr.length;
  }
  let mu = mean(arr);
  return arr.reduce(function(acc, cur){return acc+(cur-mu)**2;},0)/N;
}

function std(arr, unbiased=true){
  if(!Array.isArray(arr)){arr = [arr];}
  return Math.sqrt(variance(arr, unbiased))
}

function sem(arr){
  return std(arr)/Math.sqrt(arr.length);
}

function skewness(arr, regularize=false){
  if(!Array.isArray(arr)){arr = [arr];}
  let N = arr.length;
  let mu = mean(arr);
  let sd = std(arr, false);
  let sk = arr.reduce(function(acc, cur){return acc+((cur-mu)/sd)**3;},0)/N;
  if(regularize==false){
    return sk;
  }else{
    return sk*Math.sqrt(N-1)/(N-2);
  }
}

function cov(arr1, arr2, unbiased=true){
  if(arr1.length!=arr2.length){
    return NaN;
  }else{
    let mu1 = mean(arr1); let mu2 = mean(arr2);
    let s = 0;
    for(var i=0;i<arr1.length;i++){
      s += (arr1[i]-mu1)*(arr2[i]-mu2);
    }
    if(unbiased==true){
      return s/(arr1.length-1);
    }else{
      return s/arr1.length;
    }
  }
}

function corr(cov12,s1,s2){
  return cov12/s1/s2;
}

function corr_arr(arr1,arr2){
  return cov(arr1,arr2)/std(arr1)/std(arr2);
}

function chi2(arr1,arr2){
  if(arr1.length!=arr2.length){
    return NaN;
  }else{
    let chi2_value = 0;
    for(var i=0;i<arr1.length;i++){
      chi2_value += (arr1[i]-arr2[i])**2/arr2[i];
    }
  return chi2_value;
  }
}

function chi2_independence(arr1,arr2){
  if(arr1.length!=arr2.length){
    return NaN;
  }else{
    let sum1 = sum(arr1); let sum2 = sum(arr2);
    let chi2_value = 0;
    for(var i=0;i<arr1.length;i++){
      var E1 = (arr1[i]+arr2[i])*sum1/(sum1+sum2);
      var E2 = (arr1[i]+arr2[i])*sum2/(sum1+sum2);
      chi2_value += (arr1[i]-E1)**2/E1;
      chi2_value += (arr2[i]-E2)**2/E2;
    }
  return chi2_value;
  }
}

function welch(mu1,mu2,s1,s2,n1,n2){
  let v1 = s1**2; let v2 = s2**2;
  let t = (mu1-mu2)/Math.sqrt(v1/n1+v2/n2);
  let df = (v1/n1+v2/n2)**2 / ((v1/n1)**2/(n1-1)+(v2/n2)**2/(n2-1));
  return [t,df];
}
function welch_arr(arr1,arr2){
  let mu1 = mean(arr1); let mu2 = mean(arr2);
  let v1 = variance(arr1); let v2 = variance(arr2);
  let n1 = arr1.length; let n2 = arr2.length;
  let t = (mu1-mu2)/Math.sqrt(v1/n1+v2/n2);
  let df = (v1/n1+v2/n2)**2 / ((v1/n1)**2/(n1-1)+(v2/n2)**2/(n2-1));
  return [t,df];
}

/** 
 * normal distribution
 * z-score -> one-tailed p(z≤x) [0≤p<0.5]
 * @param {Number} z z-score
 * @param {Boolean} taylor whether to use Taylor expansion
 * @param {Number} N order of Taylor expansion
 * @return {Number} probability p(z≤x)
 * N=100 is default. if z<5, it is enough to set N~50
 */
function z_to_p(z, taylor=false, N=100){
  if(z<0){return NaN;}
  var z = z/(2**0.5);
  if(taylor==false){ // gauss legendre
    return 0.5 - 0.5 * erf(z);
  }else{ //taylor
    return 0.5 - 0.5 * erf2(z, N);
  }
}
/**
 * inverse normal distribution (p -> z-score)
 * @param {Number} p p-value
 * @param {Boolean} taylor whether to use Taylor expansion
 * @param {Number} N order of Taylor expansion
 * @return {Number} z-score
 * use Newton's method or Taylor
 */
function p_to_z(p, taylor=false, N=300){
  if(p<0 || 0.5<p){return NaN;}
  if(taylor==false){ // Newton's method
    return Math.sqrt(2) * inv_erf(1-2*p);
  }else{ //taylor
    return Math.sqrt(2) * inv_erf2(1-2*p, N);
  }
}



/**
 * t-distribution
 * @param {Number} t t-score 
 * @param {Number} df degree of freedom
 */
function t_to_p(t,df){
  let x = (t+Math.sqrt(t**2+df))/(2*Math.sqrt(t**2+df));
  return 1-regularized_beta(df/2,df/2,x);
}
/**
 * inverse t-distribution
 * @param {*} p p-value < 0.5
 * @param {*} df degree of freedom
 * use Newton's method
 */
function p_to_t(p,df){
  let x = inv_regularized_beta(df/2,df/2,1-p);
  return (2*x-1)/2*Math.sqrt(df/x/(1-x))
}



/**
 * F-distribution
 * @param {Number} t t-score 
 * @param {Number} df1 degree of freedom 1
 * @param {Number} df2 degree of freedom 1
 * x = df1*f / (df1*f+df2)
 */
function f_to_p(f, df1, df2){
  let x = df1*f/(df1*f+df2);
  return 1-regularized_beta(df1/2,df2/2,x);
}
/**
 * inverse F-distribution
 * @param {Number} p p-value < 0.5
 * @param {Number} df1 degree of freedom
 * @param {Number} df2 degree of freedom
 * use Newton's method
 * f = df2*x/df1(1-x)
 */
function p_to_f(p, df1, df2){
  let x = inv_regularized_beta(df1/2,df2/2,1-p);
  return df2*x/(df1*(1-x));
}


/**
 * Poisson Distribution
 * @param {Number} lambda event rate in an interval
 * @param {Int} k the number of times an event occurs in an interval 
 * @return {Number} probability P(X=k)
 */
function poisson(lambda, k){
  if(Number.isInteger(k)){
    return (lambda**k) * (Math.exp(-lambda)) / fact(k)
  }else{
    return (lambda**k) * (Math.exp(-lambda)) / gamma(k+1)
  }
}
function poisson_to_p(lambda, k, split=1e3, n=5){
  let poi = function(t){
    return (lambda**t) * (Math.exp(-lambda)) / gamma(t+1)
  }
  return 1 - gauss_legendre(0, k, poi, split, n)
}
function poisson_cum(lambda, k){
  let cum = 0;
  for(var i=0;i<=k;i++){
    cum += poisson(lambda, k);
  }
  return cum
}


/**
 * chi-square distribution
 * @param {Number} chi chi2-score 
 * @param {Number} df degree of freedom
 */
function chi_to_p(chi,df){
  return 1-incomplete_gamma(df/2,chi/2)/gamma(df/2);
}
function p_to_chi(p,df){
  return inv_incomplete_gamma(df/2,(1-p)*gamma(df/2))*2;
}



/**
 * Poisson Distribution
 * @param {Number} lambda event rate in an interval
 * @param {Int} k the number of times an event occurs in an interval 
 * @return {Number} probability P(X=k)
 */
function poisson(lambda, k){
  if(Number.isInteger(k)){
    return (lambda**k) * (Math.exp(-lambda)) / fact(k);
  }else{
    return (lambda**k) * (Math.exp(-lambda)) / gamma(k+1);
  }
}

function poisson_cum(lambda, k){
  if(!Number.isInteger(k)){return NaN;}
  let cum = 0;
  for(var i=0;i<k;i++){
    cum += poisson(lambda, i);
  }
  return 1-cum;
}

function poisson_to_p(lambda, k, split=100){
  let func = function(t){return (lambda**t)*(Math.exp(-lambda))/gamma(t+1);}
  return 1-gauss_legendre(func,0,k,split);
}
