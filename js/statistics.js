////////// statistics /////////////

function sum(arr){
  if(!Array.isArray(arr)){arr = [arr];} // one Number -> array
  return arr.reduce((acc, cur) => acc + cur);
}

function mean(arr){
  if(!Array.isArray(arr)){arr = [arr];}
  let N = arr.length;
  return sum(arr)/N;
}

function median(arr){
  if(!Array.isArray(arr)){arr = [arr];}
  let N = arr.length;
  _arr = arr.slice(); // deep copy
  _arr.sort((a,b) => a-b);
  if(N%2==0){
    return (_arr[N/2] + _arr[N/2-1])/2;
  }else{
    return _arr[(N-1)/2];
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
  return arr.reduce((acc, cur) => acc+(cur-mu)**2, 0)/N;
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
  let sk = arr.reduce((acc, cur) => acc+((cur-mu)/sd)**3 ,0)/N;
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
  let result = cov12/s1/s2;
  return (result>1)? 1:result;
}

function corr_arr(arr1,arr2){
  return cov(arr1,arr2)/std(arr1)/std(arr2);
}

function spearman(arr1,arr2){
  arr1 = argsort(arr1,reverse=true,plusn=1);
  arr2 = argsort(arr2,reverse=true,plusn=1);
  let N = arr1.length;
  let rho = 0;
  for(var i=0;i<N;i++){
    rho += (arr1[i] - arr2[i])**2
  }
  return 1 - 6*rho/N/(N**2-1)
}

function regression(arr1,arr2){
  let coef = cov(arr1,arr2)/variance(arr1);
  let intercept = mean(arr2) - coef*mean(arr1);
  return [intercept, coef];
}

function chi2(arr1,arr2,yates=false){
  let chi2_value = 0;
  if(arr1.length!=arr2.length){
    return NaN;
  }else if(yates==true && arr1.length==2){
    let sum1 = sum(arr1); let sum2 = sum(arr2);
    let N = sum1 + sum2;
    chi2_value = N*((Math.abs(arr1[0]*arr2[1]-arr2[0]*arr1[1])-N/2)**2)/sum1/sum2/(arr1[0]+arr2[0])/(arr1[1]+arr2[1])
    return chi2_value;
  }else{
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

function adjusted_residual(arr1,arr2){
  if(arr1.length!=arr2.length){
    return NaN;
  }else{
    let sum1 = sum(arr1); let sum2 = sum(arr2);
    let sum_all = sum1 + sum2;
    let res1 = []; let res2 = [];
    for(var i=0;i<arr1.length;i++){
      var E1 = (arr1[i]+arr2[i])*sum1/(sum1+sum2);
      var E2 = (arr1[i]+arr2[i])*sum2/(sum1+sum2);
      var res_var1 = (1-sum1/sum_all)*(1-(arr1[i]+arr2[i])/sum_all);
      var res_var2 = (1-sum2/sum_all)*(1-(arr1[i]+arr2[i])/sum_all);
      res1.push((arr1[i]-E1)/Math.sqrt(E1*res_var1));
      res2.push((arr2[i]-E2)/Math.sqrt(E2*res_var2));
    }
  return [res1,res2];
  }
}

function welch(mu1,mu2,s1,s2,n1,n2){
  let v1 = s1**2; let v2 = s2**2;
  let t = (mu1-mu2)/Math.sqrt(v1/n1+v2/n2);
  let df = (v1/n1+v2/n2)**2 / ((v1/n1)**2/(n1-1)+(v2/n2)**2/(n2-1));
  return [t,df,t_to_p(Math.abs(t),df)];
}
function welch_arr(arr1,arr2){
  let mu1 = mean(arr1); let mu2 = mean(arr2);
  let v1 = variance(arr1); let v2 = variance(arr2);
  let n1 = arr1.length; let n2 = arr2.length;
  let t = (mu1-mu2)/Math.sqrt(v1/n1+v2/n2);
  let df = (v1/n1+v2/n2)**2 / ((v1/n1)**2/(n1-1)+(v2/n2)**2/(n2-1));
  return [t,df,t_to_p(Math.abs(t),df)];
}

function pooled_variance(arr1,arr2){
  return (variance(arr1,false)*arr1.length + variance(arr2,false)*arr2.length)/(arr1.length+arr2.length-2);
}

function effect_size(mu1,mu2,s1,s2,n1,n2){
  let pooled_std = Math.sqrt((s1*(n1-1)+s2*(n2-2))/(n1+n2-2))
  return (mu2-mu1)/pooled_std;
}

function effect_size_arr(arr1,arr2){
  let pooled_std = Math.sqrt(pooled_variance(arr1,arr2));
  return (mean(arr2)-mean(arr1))/pooled_std;
}


////////// distributions //////////

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
  z = z/(2**0.5);
  let p = (taylor==false)? 0.5-0.5*erf(z) : 0.5-0.5*erf2(z, N);
  return (p>0)? p:0;
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
  let p = 1-regularized_beta(df/2,df/2,x);
  return (p>0)? p:0;
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
  let p = 1-regularized_beta(df1/2,df2/2,x);
  return (p>0)? p:0;
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
  let p = 1-incomplete_gamma(df/2,chi/2)/gamma(df/2);
  return (p>0)? p:0;
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

// ANOVA
function anova(arrs){
  let df_between = arrs.length-1;
  let df_within = sum(arrs.map(arr => arr.length-1));
  let means = arrs.map(arr => mean(arr)); // group means
  let whole_mean = mean(arrs.flat()); // whole mean
  let SS_between = 0; let SS_within = 0;
  for(var i=0;i<arrs.length;i++){
    SS_between += arrs[i].length*(means[i]-whole_mean)**2;
    SS_within += sum(arrs[i].map(elem => (elem-means[i])**2));
  }
  let F = (SS_between/df_between)/(SS_within/df_within);
  let p = f_to_p(F, df_between, df_within);
  return [SS_between, df_between, SS_within, df_within, F, p];
}