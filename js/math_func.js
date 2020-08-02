////////////////////  BASIC FUNCTIONS  ////////////////////

function max(matrix){
  matrix = flatten(matrix);
  return Math.max.apply(null,matrix);
}

function min(matrix){
  matrix = flatten(matrix);
  return Math.min.apply(null,matrix);
}

function sum(matrix){
  if(typeof(matrix) === 'number'){
    return matrix;
  }else if(Array.isArray(matrix)){
    matrix = flatten(matrix);
    return matrix.reduce((acc, cur) => acc + cur);
  }
}

// FACTORIAL
function fact(n){
  if(n===0){
    return 1;
  }else{
    let product = 1;
    for(let i=1; i<=n; i++){product *= i;}
    return product;
  }
}

// CHECK DIGITS OF DECIMAL
function check_decimal(num){
  let int_decimal = num.toString().split('.');
  return (int_decimal.length===1)? 0:int_decimal[1].length;
}

// np.arange(start, end, step) LIKE PYTHON
function range(start, end, step=1){
  if(arguments.length===1){
    [start, end] = [0, arguments[0]];
  }else if(arguments.length===2){
    [start, end] = arguments;
  }
  let N_elem = Math.floor((end - start)/step);
  let arr = Array(N_elem).fill(0).map((_, i) => start + (i*step));
  let decimal_digit = check_decimal(step);
  return arr.map(x => round(x, decimal_digit)); // round decimal
}

// round() LIKE PYTHON
function round(arr, decimal=0){
  if(typeof(arr) === 'number'){
    return Math.round(arr * (10**decimal))/(10**decimal);
  }else if(typeof(arr) === 'object'){
    return arr.map(x => Math.round(x*(10**decimal))/(10**decimal));
  }
}

// zip(a,b,c...) LIKE PYTHON
function zip(...arrs){
  let min_length = min(arrs.map(arr => arr.length));
  let zipped = [];
  for(var i=0; i<min_length; i++){
    zipped.push(arrs.map(arr => arr[i]));
  }
  return zipped;
}

// sorted() LIKE PYTHON
function sorted(arr, reverse=false){
  let arr_sort = arr.slice();
  if(reverse===false){
    arr_sort.sort((a,b) => a-b);
  }else{
    arr_sort.sort((a,b) => b-a);
  }
  return arr_sort;
}

// ARGSORT
function argsort(arr, reverse=false, plus1=false){
  let original = arr.slice();
  let arr_sort = sorted(arr, reverse);
  for(var i=0; i<arr.length; i++){
    var index = arr_sort.indexOf(original[i]);
    original[i] = index + plus1;
    arr_sort[index] = null; // delete elem in case of duplication
  }
  return original;
}

////////////////////  VECTOR & MATRIX  ////////////////////

// NORM OF VECTOR
function norm(arr){
  return Math.sqrt(sum(arr.map(x => x**2)));
}

// VECTOR + VECTOR
function vec_add(arr1, arr2, subtract=false){
  return (!subtract)? arr1.map((x,i) => x+arr2[i]) : arr1.map((x,i) => x-arr2[i])
}

// FLATTEN MATRIX INTO 1D ARRAY
function flatten(tensor){
  if(Array.isArray(tensor)){
    while(tensor.map(x => typeof(x)).includes('object')){
      tensor = tensor.flat();
    }
  }
  return tensor;
}

// SHAPE OF TENSOR
function shape(tensor){
  let dim_now = tensor;
  let shape_arr = [];
  while(Array.isArray(dim_now)){
    shape_arr.push(dim_now.length);
    dim_now = dim_now[0];
  }
  return shape_arr;
}

// CARTESIAN PRODUCT
function cartesian(arr1, arr2, func_xy=(x,y)=>[x,y]){
  return arr1.map(x => arr2.map(y => func_xy(x,y)));
}

// DEEP COPY
function deepcopy(tensor){
  return JSON.parse(JSON.stringify(tensor));
}

// TRANSPOSE
function transpose(matrix){
  let new_matrix = deepcopy(matrix);
  return new_matrix[0].map((_, c) => new_matrix.map(r => r[c]));
}

// np.zeros() LIKE PYTHON
function zeros(shape, value=0){
  let max_dim = shape.length;
  let fill_elem = (elem, length) => new Array(length).fill(elem);
  let tensor = fill_elem(value, shape[max_dim-1]);
  for(var dim=max_dim-2; dim>=0; dim--){
    tensor = fill_elem(tensor, shape[dim]);
  }
  return deepcopy(tensor);
}

// DOT PRODUCT 1D
function dot1(arr1, arr2){
  if(arr1.length !== arr2.length){return;}
  return zip(arr1, arr2).reduce((acc,cur) => acc+cur[0]*cur[1], 0);
}

// DOT PRODUCT 2D
function dot2(mat1, mat2){
  if(mat1[0].length !== mat2.length){return;}
  let [m, n] = [mat1.length, mat2[0].length];
  mat2 = transpose(mat2);
  let new_mat = zeros(m, n);
  for(var i=0; i<m; i++){
    for(var j=0; j<n; j++){
      new_mat[i][j] = dot1(mat1[i], mat2[j]);
    }
  }
  return new_mat;
}

// DOT PRODUCT INCLUDING 1D*2D
function dot(tensor1, tensor2){
  let [s1, s2] = [shape(tensor1), shape(tensor2)]; 
  if(s1.length>2 || s2.length>2){
    return;
  }else if(s1.length===1 && s2.length===1){
    return dot1(tensor1, tensor2);
  }else if(s1.length===1 && s1[0]===s2[0]){
    tensor2 = transpose(tensor2);
    return tensor2.map(row => dot1(row, tensor1));
  }else if(s2.length===1 && s1.slice(-1)[0]===s2[0]){
    return tensor1.map(row => dot1(row, tensor2));
  }else if(s1.slice(-1)[0]===s2[0]){
    return dot2(tensor1, tensor2)
  }
}

// COFACTOR MATRIX
function cofactor(mat, row_delete=0, column_delete=0){
  mat = mat.filter((_, index) => index !== row_delete);
  return mat.map(row => row.filter((_, index) => index !== column_delete));
}

// DETERMINANT BY COFACTOR EXPANSION 
function determinant(mat){
  if(typeof(mat)==='number'){return mat;}
  if(mat.length!==mat[0].length){return;}
  if(mat.length===1){return mat[0];}
  let det = 0;
  for(var i=0; i<mat.length; i++){
    det += (-1)**i * mat[i][0] * determinant(cofactor(mat,i,0));
  }
  return det;
}

// INVERSE MATRIX
function inv_matrix(mat){
  let new_mat = deepcopy(mat);
  let det = determinant(mat);
  for(var i=0; i<mat.length; i++){
    for(var j=0; j<mat[0].length; j++){
      new_mat[i][j] = (-1)**(i+j) * determinant(cofactor(mat,i,j)) / det;
    }
  }
  return transpose(new_mat);
}

// sigmoid function
function sigmoid(x){
  return 1/(1+Math.exp(-x));
}

// COMBINATION
function combination(n,k){
  if(k>n){return 0;}
  return Math.round(fact(n)/fact(k)/fact(n-k));
}
// PERMUTATION
function permutation(n,k){
  if(k>n){return 0;}
  return Math.round(fact(n)/fact(n-k));
}

// creater permutaion list
function permutator(inputArr, n=0){
  let result = [];
  const permute = (arr, m = '') => {
    if (arr.length == n) {
      result.push(m)
    } else {
      for (let i = 0; i < arr.length; i++) {
        let curr = arr.slice();
        let next = curr.splice(i, 1);
        permute(curr.slice(), m+next)
      }
    }
  }
  permute(inputArr);
  return result;
}


////////////////////  SPECIAL FUNCTIONS  ////////////////////

/**
 * error function
 * @param {Number} z upper limit of integral
 * @param {Number} split the number of intervals
 * @param {Int} n order of Legendre polynomial
 */
function erf(z,split=1e3,n=5){
  let func = t => Math.exp(-1*t*t);
  return gauss_legendre(func,0,z,split,n) * 2 / Math.sqrt(Math.PI);
}
function erfc(z,split=1e3,n=5){
  return 1 - erf(z,split,n);
}
function erf_inv(y,iter=30){
  let f_prime = t => Math.exp(-1*t*t) * 2 / Math.sqrt(Math.PI);
  return newton(erf, f_prime, y, x0=0.5, iter);
}
function erf2(z, N=100){
  let total = 0;
  for(var n=0;n<=N;n++){ // Σ
    var product = 1;
    for(var k=1;k<=n;k++){ // Π
      product *= -z*z/k;
    }
    total += (z * product / (2*n+1));
  }
  return total * 2 / Math.PI**0.5;
}
function erf_inv2(y, N=300){
  let Ck = [1];  // aray of coef Ck
  for(var k=1;k<=N;k++){
    var s=0;
    for(var m=0;m<k;m++){
      s += Ck[m]*Ck[k-1-m]/(m+1)/(2*m+1);
    }
    Ck.push(s);
  }
  let total = 0;
  for(let k=0;k<=N;k++){ // taylor series
    total += Ck[k]/(2*k+1) * ((Math.PI)**0.5*y/2)**(2*k+1);
  }
  return total
}


/**
 * gamma function & lower incomplete gamma by Gauss-Legendre
 * @param {Number} s independent variable
 * @param {Number} x upper limit of integral
 * @param {Number} split the number of intervals
 * @param {Number} n order of Legendre polynomial
 * @returns {number} value of Γ(s)
 */
function gamma(s,split=1e4,n=5){
  if(s>1 && s%1==0){
    return fact(s-1);
  }
  if(s%1==0.5){
    if(s==0.5){
      return Math.sqrt(Math.PI);
    }else{
      return (s-1)*gamma(s-1);
    }
  }
  let func = t => Math.pow(t,s-1)*Math.exp(-t);
  if(s>=2){
    return gauss_legendre(func,0,s*10,split,n); // must not integrate up to infinity
  }else if(0.5<s && s<2){
    return gamma(s+1)/s; // Γ(s) = Γ(s+1)/s 
  }else{
    return Math.PI/Math.sin(Math.PI*s)/gamma(1-s);
  }
}
function gamma_inv(y,iter=30){
  let f_prime = function(s){
    let func = function(t){return Math.log(s)*Math.pow(t,s-1)*Math.exp(-t);};
    return gauss_legendre(func,0,s*10);
  };
  let x0 = 2;
  while(gamma(x0) < y){x *= 1.5;} // find initial x0 s.t. Γ(x0)>y
  return newton(gamma,f_prime,y,x0,iter);
}
function incomplete_gamma(s,x,split=1e3,n=5){
  if(s%1==0){
    if(s==1){
      return 1-Math.exp(-x);
    }else{
      return (s-1)*incomplete_gamma(s-1,x)-x**(s-1)*Math.exp(-x);
    }
  }
  if(s%1==0.5){
    if(s==0.5){
      return Math.sqrt(Math.PI)*erf(Math.sqrt(x));
    }else{
      return (s-1)*incomplete_gamma(s-1,x)-x**(s-1)*Math.exp(-x);
    }
  }
  let func = t => Math.pow(t,s-1)*Math.exp(-t);
  if(s>2){
    return gauss_legendre(func,0,x,split,n);
  }else{
    return (incomplete_gamma(s+1,x)+x**(s)*Math.exp(-x))/s;
  }
}
function regularized_gamma(s,x,split=1e3,n=5){
  return incomplete_gamma(s,x,split,n)/gamma(s);
}
function regularized_gamma_inv(s,y,iter=30){ // 0<y<1
  if(y<=0.1 && s <= 1){
    var x0 = 0.0001;
  }else if(y<=0.1 && s <= 2){
    var x0 = 0.1
  }else{
    var x0 = s;
  }
  y *= gamma(s);
  let f = t => incomplete_gamma(s,t);
  let f_prime = t => Math.pow(t,s-1)*Math.exp(-t);
  return newton(f,f_prime,y,x0,iter);
}

/**
 * gamma function by Weierstrass's definition
 * @param {Number} s independent variable
 * @param {Int} N upper limit of series
 */
const Euler_const = 0.5772156649015328606 // Euler's constant 
function gamma2(s, N=1e5){
  let total = Math.log(s)+Euler_const*s;
  for(var m=1;m<N;m++){
    total += Math.log(1+s/m) - s/m
  }
  return Math.exp(-total)
}


/**
 * beta function
 * @param {Number} a independent variable
 * @param {Number} b independent variable
 * @param {Number} x upper limit of integral, 0<x<1
 * @param {Int} split the number of intervals
 * @param {Int} n order of Legendre polynomial
 */
function beta(a,b,split=1e3,n=5){
  let func = function(t){return Math.pow(t,a-1) * Math.pow((1-t),b-1);}
  return gauss_legendre(func,0,1,split,n);
}
function incomplete_beta(a,b,x,split=1e3,n=5){
  if(x<0 || 1<x){return NaN;} // x must be in the range [0,1]
  let func = function(t){return Math.pow(t,a-1) * Math.pow((1-t),b-1);}
  return gauss_legendre(func,0,x,split,n);
}
function regularized_beta(a,b,x,split=1e3,n=5){
  return incomplete_beta(a,b,x,split,n)/beta(a,b,split,n);
}
function regularized_beta_inv(a,b,y,iter=30){
  let regularizer = beta(a,b); // denominator
  if(y<0.5){ // find initial x0
    x0_candidate = [0.0001,0.001,0.005,0.01,0.05,0.1,0.3,0.5,0.7,0.9,0.95,0.99,0.995,0.999,0.9995];
    for(cand of x0_candidate){
      if(incomplete_beta(a,b,cand)/regularizer > y){
        var x0 = cand;
        break;
      }
    }
  }else{
    x0_candidate = [0.9995,0.999,0.995,0.99,0.95,0.9,0.7,0.5,0.3,0.1,0.05,0.01,0.005,0.001,0.0001];
    for(cand of x0_candidate){
      if(incomplete_beta(a,b,cand)/regularizer < y){
        var x0 = cand;
        break;
      }
    }
  }
  let f = t => incomplete_beta(a,b,t)/regularizer;
  let f_prime = t => Math.pow(t,a-1) * Math.pow((1-t),b-1)/regularizer;
  return newton(f,f_prime,y,x0,iter);
}



////////////////////  NUMERIC ANALYSIS  ////////////////////

///// Gauss-Legendre quadrature /////

// weights[n] = [[zero point x_i, weight w_i],..]
const GL_weights = {
  2:[[-0.57735026918962576451,1.0],
    [0.57735026918962576451,1.0]],
  3:[[-0.77459666924148337704,0.55555555555555555552],
    [0,0.88888888888888888889],
    [0.77459666924148337704,0.55555555555555555552]],
  4:[[-0.86113631159405257522,0.34785484513745385742],
    [-0.3399810435848562648,0.65214515486254614263],
    [0.3399810435848562648,0.65214515486254614263],
    [0.86113631159405257522,0.34785484513745385742]],
  5:[[-0.9061798459386639928,0.23692688505618908748],
    [-0.53846931010568309104,0.47862867049936646803],
    [0, 0.56888888888888888889],
    [0.53846931010568309104,0.47862867049936646803],
    [0.9061798459386639928,0.23692688505618908748]],
  6:[[-0.93246951420315202781,0.17132449237917034508],
    [-0.66120938646626451366,0.36076157304813860758],
    [-0.23861918608319690863,0.46791393457269104739],
    [0.23861918608319690863,0.46791393457269104739],
    [0.66120938646626451366,0.36076157304813860758],
    [0.93246951420315202781,0.17132449237917034508]],
  7:[[-0.94910791234275852453,0.1294849661688696932],
    [-0.74153118559939443986,0.27970539148927666793],
    [-0.40584515137739716691,0.38183005050511894494],
    [0,0.41795918367346938776],
    [0.40584515137739716691,0.38183005050511894494],
    [0.74153118559939443986,0.27970539148927666793],
    [0.94910791234275852453,0.1294849661688696932]],
  10:[[-0.973906528517171720078,0.0666713443086881375936],
    [-0.865063366688984510732,0.149451349150580593146],
    [-0.6794095682990244062343,0.219086362515982043996],
    [-0.4333953941292471907993,0.2692667193099963550912],
    [-0.1488743389816312108848,0.2955242247147528701739],
    [0.1488743389816312108848,0.295524224714752870174],
    [0.4333953941292471907993,0.269266719309996355091],
    [0.6794095682990244062343,0.2190863625159820439955],
    [0.8650633666889845107321,0.1494513491505805931458],
    [0.973906528517171720078,0.0666713443086881375936]],
  20:[[-0.9931285991850949247861,0.0176140071391521183119],
    [-0.9639719272779137912677,0.04060142980038694133104],
    [-0.9122344282513259058678,0.0626720483341090635695],
    [-0.8391169718222188233945,0.0832767415767047487248],
    [-0.7463319064601507926143,0.1019301198172404350368],
    [-0.6360536807265150254528,0.1181945319615184173124],
    [-0.5108670019508270980044,0.1316886384491766268985],
    [-0.3737060887154195606725,0.1420961093183820513293],
    [-0.2277858511416450780805,0.1491729864726037467878],
    [-0.07652652113349733375464,0.1527533871307258506981],
    [0.0765265211334973337546,0.152753387130725850698],
    [0.2277858511416450780805,0.149172986472603746788],
    [0.3737060887154195606725,0.142096109318382051329],
    [0.5108670019508270980044,0.1316886384491766268985],
    [0.6360536807265150254528,0.1181945319615184173124],
    [0.7463319064601507926143,0.101930119817240435037],
    [0.8391169718222188233945,0.083276741576704748725],
    [0.9122344282513259058678,0.0626720483341090635695],
    [0.9639719272779137912677,0.040601429800386941331],
    [0.9931285991850949247861,0.0176140071391521183119]]
  }

/**
 * gauss legendre quadrature
 * @param {Function} func function to be integrated
 * @param {Number} a lower limit of integral
 * @param {Number} b upper limit of integral
 * @param {Int} split the number of intervals, default=1000
 * @param {Number} n order of Legendre polynomial, default=5
 */
function gauss_legendre(func, a, b, split=1e3, n=5){
  let cum_sum = 0; // total area
  let weight = GL_weights[n]; // coef
  let dx = (b-a) / split; // width of each interval
  let q = dx/2;
  for(let i=0; i<split; i++){
    var r = a+((2*i+1)*dx)/2;
    var total = sum(weight.map(x => func(q*x[0] + r)*x[1])) * q; 
    cum_sum += total;
  }
  return cum_sum;
}

function gauss_legendre2D(func, ax, bx, ay, by, split=5e2, n=5){
  let total = 0; // total area
  let weight = GL_weights[n]; // coef
  var weight_matrix = cartesian(weight.map(w => w[1]), weight.map(w => w[1]), (x,y)=>x*y).flat();
  let dx = (bx-ax) / split; // width of each interval for x
  let dy = (by-ay) / split; // width of each interval for y
  for(let i=0; i<split; i++){
    var qx = dx/2;
    var rx = ax+((2*i+1)*dx)/2;
    var x_points = weight.map(w => qx*w[0] + rx); 
    for(let j=0; j<split; j++){
      var qy = dy/2;
      var ry = ay+((2*j+1)*dy)/2;
      var y_points = weight.map(w => qy*w[0] + ry);
      var xy_point = cartesian(x_points, y_points).flat();
      total += sum(xy_point.map((xy, ind) => func(xy[0], xy[1]) * weight_mat[ind])) ; 
    }
  }
  return total * qx * qy;
}

///// Newton's Method /////

/**
 * solve y = f(x) by Newton's Method
 * x1 = x0 + (y-f(x0))/f'(x0)
 * @param {Function} func function to be analysed
 * @param {Function} func_prime derivative of the function
 * @param {Number} y_target value of the function 
 * @param {Number} x0 initial guess for x
 * @param {Int} iter the number of max iteration, default = 30
 */
function newton(func, func_prime, y_target, x0, iter=30){
  let x = x0;
  for(var i=0; i<iter; i++){
    y = func(x);
    x += (y_target-y) / func_prime(x)
    if(Math.abs(y_target-y)<1e-12){
      console.log(`iteration: ${i}/${iter}`);
      break;
    }
  }
  return x;
}

///// Brent's Method /////
/**
 * solve y = f(x) by Brent's Method
 * does not need f'(x)
 * @param {Function} func function to be analysed
 * @param {Number} y value of the function 
 * @param {Number} a0 opposite point of b0
 * @param {Number} b0 initial guess for x
 * @param {Int} iter the number of max iteration, default = 200
 * @param {Number} epsiron minimum width of each step
 */
function brent(func,y,a0,b0,iter=200,epsiron=1e-15){
  let f = function(x){return func(x)-y}; // redefine f(x) = 0
  if(f(a0)*f(b0)>0){ // a0 and b0 must have opposite sign
    return NaN;
  }else{
    if(f(a0)<f(b0)){[a0,b0] = [b0,a0];} // b0 must be less than a0
    let a = a0; b = [a0, a0, b0] // initialize
    let bisection = true  // method of previous step
    for(var i=0;i<iter;i++){
      s = b[2] - (b[2]-b[1])/(f(b[2])-f(b[1]))*f(b[2]); // interpolation
      m = (a+b[2])/2;  // bisection
      // determine whether to use interpolation
      if((b[2]<s<m || m<s<b[2]) && bisection){ // previous step = bisection
        if(Math.abs(b[2]-b[1])>epsiron && Math.abs(s-b[2])>Math.abs(b[2]-b[1])/2){
          b[0]=b[1]; b[1]=b[2]; b[2]=s; // update b with interpolation
          bisection = false;
        }else{
          b[0]=b[1]; b[1]=b[2]; b[2]=m; // update b with bisection
          bisection = true;
        }
      }else if((b[2]<s<m || m<s<b[2]) && !bisection){ // previous step = interpolation
        if(Math.abs(b[1]-b[0])>epsiron && Math.abs(s-b[2])>Math.abs(b[1]-b[0])/2){
          b[0]=b[1]; b[1]=b[2]; b[2]=s; // update b with interpolation
          bisection = false;
        }else{
          b[0]=b[1]; b[1]=b[2]; b[2]=m; // update b with bisection
          bisection = true;
        }
      }else{  // update b with bisection
        b[0]=b[1]; b[1]=b[2]; b[2]=m;
        bisection = true;
      }
      if(f(a)*f(b[2])>0){a=b[1];} // update a 
      if(f(a)<f(b[2])){[a,b[2]] = [b[2],a];} // exchange if f(a) < f(b)
      if(Math.abs(f(b[2]))<1e-12){
        console.log(`iteration: ${i}/${iter}`); break;
      }
    }
    return b[2];
  }
}
