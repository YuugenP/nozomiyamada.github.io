////////////////////  BASIC FUNCTIONS  ////////////////////

function mean(mat){
  if(typeof(mat)==='number'){
    return mat;
  }else if(Array.isArray(mat)){
    let arr = flatten(mat);
    return sum(arr)/arr.length;
  }
}

function median(mat){
  if(typeof(mat)==='number'){
    return mat;
  }else if(Array.isArray(mat)){
    let arr = sorted(flatten(mat));
    let N = arr.length;
    if(N%2===0){
      return (arr[N/2] + arr[N/2-1])/2;
    }else{
      return arr[(N-1)/2];
    }
  }
}

function variance(mat, unbiased=true){
  if(!Array.isArray(mat)){mat = [mat];}
  let arr = flatten(mat);
  if(unbiased===true){
    var N = arr.length-1;
  }else{
    var N = arr.length;
  }
  let mu = mean(arr);
  return arr.reduce((acc, cur) => acc+(cur-mu)**2, 0)/N;
}

function pooled_variance(arr1,arr2){
  return (variance(arr1,false)*arr1.length + variance(arr2,false)*arr2.length)/(arr1.length+arr2.length-2);
}

function std(mat, unbiased=true){
  if(!Array.isArray(mat)){mat = [mat];}
  let arr = flatten(mat);
  return Math.sqrt(variance(arr, unbiased))
}

function sem(mat){
  let arr = flatten(mat);
  return std(arr)/Math.sqrt(arr.length);
}

function skewness(mat, regularize=false){
  if(!Array.isArray(mat)){mat = [mat];}
  let arr = flatten(mat);
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
  if(arr1.length!==arr2.length){
    return NaN;
  }else{
    let [mu1, mu2] = [mean(arr1), mean(arr2)];
    let s = sum(zip(arr1, arr2).map(x => (x[0]-mu1)*(x[1]-mu2)));
    return (unbiased)? s/(arr1.length-1) : s/arr1.length
  }
}

function cov_matrix(arr1, arr2){
  let vxx = variance(arr1,false);
  let vxy = cov(arr1,arr2,false);
  let vyy = variance(arr2,false);
  return [[vxx,vxy],[vxy,vyy]];
}

function corr(cov12,s1,s2){
  let result = cov12/s1/s2;
  return (result>1)? 1:result;
}

function corr_arr(arr1,arr2){
  return cov(arr1,arr2)/std(arr1)/std(arr2);
}

function spearman(arr1,arr2){
  arr1 = argsort(arr1,reverse=true,plusn=true);
  arr2 = argsort(arr2,reverse=true,plusn=true);
  let N = arr1.length;
  let rho = sum(zip(arr1, arr2).map(x => (x[0]-x[1])**2));
  return 1 - 6*rho/N/(N**2-1);
}

function regression(arr1,arr2){
  let coef = cov(arr1,arr2)/variance(arr1);
  let intercept = mean(arr2) - coef*mean(arr1);
  return [intercept, coef];
}

// calculate order statistic for Shapiro-wilk
function order_statistic(n){
  let arr = [];
  let cov_mat = zeros(n,n);
  for(let k=1; k<=n; k++){
    let fx = x => x*normal_pdf(x)*(normal_cdf(x)**(k-1))*((1-normal_cdf(x))**(n-k));
    let X = k*combination(n,k)*gauss_legendre(fx,-10,10,2e2);
    arr.push(X);
    for(let l=k; l<=n; l++){
      let fxy = (x,y) => fact(n)/fact(k-1)/fact(l-1-k)/fact(n-l)*normal_cdf(x)**(k-1)*(normal_cdf(y)-normal_cdf(x))**(l-1-k)*(1-normal_cdf(y))**(n-l)*normal_pdf(x)*normal_pdf(y)*x*y;
      let XY = gauss_legendre2D(fxy,-5,5,1e2);
      cov_mat[k-1][l-1] = XY;
      cov_mat[l-1][k-1] = XY;
    }
  }
  let norm_arr = norm(arr);
  return [round(arr.map(x => x/norm_arr), 10), cov_mat];
}

function qqplot(arr){
  arr = sorted(arr);
  let cum_prob = arr.map((_,i) => (i+1)/(arr.length+1)); // [1/n+1, 2/n+1,...]
  let normal_score = cum_prob.map(p => normal_inv(p));
  return normal_score;
}

////////////////////  HYPOTHESIS TESTING  ////////////////////

function chi2_fit(arr1,arr2,yates=false){
  let chi2_value = 0;
  if(arr1.length!==arr2.length){
    return NaN;
  }else{
    let exp_arr = arr2.map(x => sum(arr1)*x/sum(arr2)); 
    for(var i=0;i<arr1.length;i++){
      chi2_value += (arr1[i]-exp_arr[i])**2/exp_arr[i];
    }
    return [chi2_value, exp_arr];
  }
}

function chi2_independence(mat){
  let row_length = new Set(mat.map(x => x.length));
  if(Array.from(row_length).length != 1){
    return NaN;
  }else{
    let sums_row = mat.map(sum);
    let sums_col = transpose(mat).map(sum);
    let whole_sum = sum(sums_row);
    let chi2_value = 0;
    for(var i=0;i<mat.length;i++){
      for(var j=0;j<mat[0].length;j++){
        var expect = sums_row[i]*sums_col[j]/whole_sum;
        chi2_value += (mat[i][j] - expect)**2 / expect;
      }
    }
  let cramerV = Math.sqrt(chi2_value/whole_sum/(Math.min(mat.length, mat[0].length)-1)); 
  return [chi2_value, cramerV];
  }
}

function adjusted_residual(mat){
  let row_length = new Set(mat.map(x => x.length));
  if(Array.from(row_length).length != 1){
    return NaN;
  }else{
    let sums_row = mat.map(sum);
    let sums_col = transpose(mat).map(sum);
    let whole_sum = sum(sums_row);
    for(var i=0;i<mat.length;i++){
      for(var j=0;j<mat[0].length;j++){
        var expect = sums_row[i]*sums_col[j]/whole_sum;
        mat[i][j] = (mat[i][j] - expect) / Math.sqrt(expect*(1-sums_row[i]/whole_sum)*(1-sums_col[j]/whole_sum));
      }
    }
  return mat;
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

function mann_whitney(arr1, arr2){
  if(arr1.length > arr2.length){
    [arr1, arr2] = [arr2, arr1];
  }
  arr1 = sorted(arr1);
  arr2 = sorted(arr2);
  let [n1, n2] = [arr1.length, arr2.length]
  let U = sum(arr1.map(x => arr2.filter(y => y < x).length));
  let mu = n1*n2 / 2;
  let sd = Math.sqrt(n1*n2*(n1+n2+1)/12);
  let z = (U-mu)/sd;
  let p = z_to_p(Math.abs(z));
  return [z, p];
}

function effect_size(mu1,mu2,s1,s2,n1,n2){
  let pooled_std = Math.sqrt((s1*(n1-1)+s2*(n2-2))/(n1+n2-2))
  return (mu2-mu1)/pooled_std;
}

function effect_size_arr(arr1,arr2){
  let pooled_std = Math.sqrt(pooled_variance(arr1,arr2));
  return (mean(arr2)-mean(arr1))/pooled_std;
}


////////////////////  DISTRIBUTIONS  ////////////////////

//////////  NORMAL DISTRIBUTION  //////////

function normal_pdf(x, mu=0, sd=1){
  return Math.exp(-1*(x-mu)**2/(2*sd**2))/Math.sqrt(2*Math.PI)/sd;
}
function normal_cdf(x, mu=0, sd=1, split=1e3){
  return (1 + erf((x-mu)/Math.sqrt(2)/sd, split)) * 0.5;
}
function normal_inv(p, mu=0, sd=1){
  if(p<0 || p>1){return NaN;}
  return mu + sd * Math.sqrt(2) * erf_inv(2*p-1);
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
    return Math.sqrt(2) * erf_inv(1-2*p);
  }else{ //taylor
    return Math.sqrt(2) * erf_inv2(1-2*p, N);
  }
}

function qqplot(arr){
  let arr_sorted = sorted(arr);
  let [mu, sd] = [mean(arr), std(arr)];
  let rank = range(arr.length).map(i => (i+0.5)/arr.length);
  rank = rank.map(x => normal_inv(x, mu, sd));
  return [arr_sorted, rank];
}

//////////  T-DISTRIBUTION  //////////

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
  let x = regularized_beta_inv(df/2,df/2,1-p);
  return (2*x-1)/2*Math.sqrt(df/x/(1-x));
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
  let x = regularized_beta_inv(df1/2,df2/2,1-p);
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
  p = 1 - gauss_legendre(0, k, poi, split, n);
  return (p>0)? p:0;
}
function poisson_cum(lambda, k){
  let cum = 0;
  for(var i=0;i<=k;i++){
    cum += poisson(lambda, k);
  }
  return cum;
}


/**
 * chi-square distribution
 * @param {Number} chi chi2-score 
 * @param {Number} df degree of freedom
 */
function chi_to_p(chi,df){
  let p = 1-regularized_gamma(df/2,chi/2);
  return (p>0)? p:0;
}
function p_to_chi(p,df){
  return regularized_gamma_inv(df/2,(1-p))*2;
}
function chi_pdf(x, k=1){
  return x**(k/2-1) * Math.exp(-x/2) / (2**(k/2)) / gamma(k/2);
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

/**
 * 
 * @param {*} a total number of groups 
 * @param {*} q statistic
 * @param {*} r1 sample size of group1
 * @param {*} r2 sample size of group2
 * @param {*} df 
 */
function studentized(a, q, r1, r2, df){
  let phi = (x => 1-z_to_p(x));
  let r = 
  func = (x => normal(x)*(phi(x)-phi(x-q))**(r-1));
  H = gauss_legendre(func, -10, 10, 2e3);
}

////////////////////  TEST OF NORMALITY  ////////////////////




////////////////////  ANOVA  ////////////////////

// 1D ANOVA
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
  let eta = SS_between/(SS_between+SS_within);
  return [SS_between, df_between, SS_within, df_within, F, p, eta];
}

function tukey_kramer(arrs){
  let means = arrs.map(arr => mean(arr)); // group means
  [_, _, SS_within, df_within, _, _, _] = anova(arrs);
  let MS = SS_within/df_within;
  for(var i=0; i<arrs.length-1; i++){
    for(var j=i+1; j<arrs.length; j++){
      let ni = arrs[i].length; let nj = arrs[j].length;
      let q = Math.abs(means[i]-means[j])/Math.sqrt(MS*((ni+nj)/2/ni/nj));
    }
  }
}

// 2D ANOVA w/o replication
function anova2(rows){
  let cols = transpose(rows);
  let means_row = rows.map(row => mean(row));
  let means_col = cols.map(col => mean(col));
  let whole_mean = mean(rows.flat()); // whole mean
  let SS_row = 0; let SS_col = 0; let error = 0;
  for(var i=0;i<rows.length;i++){
    for(var j=0;j<rows[i].length;j++){
      SS_row += (means_row[i]-whole_mean)**2;
      SS_col += (means_col[j]-whole_mean)**2;
      error += (rows[i][j]+whole_mean-means_row[i]-means_col[j])**2;
    }
  }
  df_row = rows.length - 1; df_col = cols.length - 1;
  df_error = df_row * df_col;
  F_row = (SS_row/df_row)/(error/df_error); F_col = (SS_col/df_col)/(error/df_error);
  p_row = f_to_p(F_row,df_row,df_error); p_col = f_to_p(F_col,df_col,df_error);
  return [SS_row,df_row,F_row,p_row,SS_col,df_col,F_col,p_col,error,df_error]
}

// 2D ANOVA with replication
function anova2rep(tensor){
  let means_row = tensor.map(mat => mean(mat.flat()));
  let means_col = transpose(tensor).map(mat => mean(mat.flat()));
  let whole_mean = mean(tensor.map(x => x.flat()).flat());
  let SS_row = 0; let SS_col = 0; let SS_int = 0; let error = 0;
  for(var i=0;i<means_row.length;i++){
    SS_row += tensor[i].flat().length * (means_row[i]-whole_mean)**2;
  }
  for(var i=0;i<means_col.length;i++){
    SS_col += transpose(tensor)[i].flat().length * (means_col[i]-whole_mean)**2;
  }
  for(var i=0;i<tensor.length;i++){
    for(var j=0;j<tensor[i].length;j++){
      error += sum(tensor[i][j].map(x => (x - mean(tensor[i][j]))**2));
      SS_int += tensor[i][j].length * (mean(tensor[i][j])+whole_mean-means_row[i]-means_col[j])**2;
    }
  }
  df_row = tensor.length - 1; df_col = tensor[0].length - 1;
  df_int = df_row * df_col; df_error = tensor.map(x=>x.flat()).flat().length - (df_row+df_col+df_int+1);
  F_row = (SS_row/df_row)/(error/df_error); F_col = (SS_col/df_col)/(error/df_error); F_int = (SS_int/df_int)/(error/df_error);
  p_row = f_to_p(F_row,df_row,df_error); p_col = f_to_p(F_col,df_col,df_error); p_int = f_to_p(F_int,df_int,df_error);
  return [SS_row,df_row,F_row,p_row,SS_col,df_col,F_col,p_col,SS_int,df_int,F_int,p_int,error,df_error]
}