////////// basic functions /////////

// factorial, n must be interger
function fact(n){
  if(n==0){
    return 1;
  }else{
    let product = 1;
    for(i=1;i<=n;i++){product *= i;}
    return product
  }
}
// round() like python
function round(num, decimal=0){
  if(typeof(num)=='number'){
    return Math.round(num * (10**decimal)) / (10**decimal);
  }else if(typeof(num)=='object'){
    return num.map(x => Math.round(x * (10**decimal)) / (10**decimal));
  }
  
}
// sigmoid function
function sigmoid(x){
  return 1/(1+Math.exp(-x))
}
// combination
function combination(n,k){
  if(k>n){return 0;}
  return Math.round(fact(n)/fact(k)/fact(n-k));
}
// permutation
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

// argsort
function argsort(arr, reverse=false, plusn=0){
  let org = arr.slice();
  if(reverse==false){
    arr.sort((a,b) => a-b);
  }else{
    arr.sort((a,b) => b-a);
  }
  return org.map(x => arr.indexOf(x)+plusn);
}

// transpose
function transpose(matrix){
  return matrix[0].map((_, c) => matrix.map(r => r[c]));
}


////////// special functions //////////

/**
 * error function
 * @param {Number} z upper limit of integral
 * @param {Number} split the number of intervals
 * @param {Int} n order of Legendre polynomial
 */
function erf(z,split=1e3,n=5){
  let func = function(t){return Math.exp(-1*t*t);}
  return gauss_legendre(func,0,z,split,n) * 2 / Math.sqrt(Math.PI);
}
function erfc(z,split=1e3,n=5){
  return 1 - erf(z,split,n);
}
function inv_erf(y,iter=30){
  let f = function(t){return erf(t);}
  let f_prime = function(t){return Math.exp(-1*t*t) * 2 / Math.sqrt(Math.PI);}
  return newton(f,f_prime,y,0.5,iter);
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
function inv_erf2(y, N=300){
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
 * @param {Int} split the number of intervals
 * @param {Int} n order of Legendre polynomial
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
  let func = function(t){return Math.pow(t,s-1)*Math.exp(-t);};
  if(s>=2){
    return gauss_legendre(func,0,s*10,split,n); // must not integrate up to infinity
  }else if(0.5<s && s<2){
    return gamma(s+1)/s; // Γ(s) = Γ(s+1)/s 
  }else{
    return Math.PI/Math.sin(Math.PI*s)/gamma(1-s);
  }
}
function inv_gamma(y,iter=30){
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
  let func = function(t){return Math.pow(t,s-1)*Math.exp(-t);};
  if(s>2){
    return gauss_legendre(func,0,x,split,n);
  }else{
    return (incomplete_gamma(s+1,x)+x**(s)*Math.exp(-x))/s;
  }
}
function regularized_gamma(s,x,split=1e3,n=5){
  return incomplete_gamma(s,x,split,n)/gamma(s);
}
function inv_regularized_gamma(s,y,iter=30){ // 0<y<1
  if(y<=0.1 && s <= 1){
    var x0 = 0.0001;
  }else if(y<=0.1 && s <= 2){
    var x0 = 0.1
  }else{
    var x0 = s;
  }
  y *= gamma(s);
  let f = function(t){return incomplete_gamma(s,t);}
  let f_prime = function(t){return Math.pow(t,s-1)*Math.exp(-t);}
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
function inv_regularized_beta(a,b,y,iter=30){
  let regularizer = beta(a,b); // denominator
  if(y<0.5){ // find initial x0
    var x0 = 0;
    while(regularized_beta(a,b,x0)<y){x0 += 0.05}
  }else{
    var x0 = 1;
    while(regularized_beta(a,b,x0)>y){x0 -= 0.05}
  }
  let f = function(t){return regularized_beta(a,b,t);}
  let f_prime = function(t){return Math.pow(t,a-1) * Math.pow((1-t),b-1)/regularizer;}
  return newton(f,f_prime,y,x0,iter);
}




////////// methods for numeric analysis ////////// 

///// Gauss-Legendre quadrature /////

// weights[n] = [[zero point x_i, weight w_i],..]
const GL_weights = {
  2:[[0.57735026918962576451,1.0],
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
function gauss_legendre(func,a,b,split=1000,n=5){
  let cum_sum = 0; // total area
  let weight = GL_weights[n]; // coef
  let dx = (b-a)/split; // width of each interval
  for(var i=0;i<split;i++){
    var q = dx/2;
    var r = (2*i+1)*dx/2;
    var total = 0;
    for(var j=0;j<n;j++){
      total += func(q*weight[j][0]+r)*weight[j][1];
    }
    cum_sum += total * q;
  }
  return cum_sum
}

///// Newton's Method /////

/**
 * solve y = f(x) by Newton's Method
 * x1 = x0 + (y-f(x0))/f'(x0)
 * @param {Function} func function to be analysed
 * @param {Function} func_prime derivative of the function
 * @param {Number} y value of the function 
 * @param {Number} x0 initial guess for x
 * @param {Int} iter the number of max iteration, default = 30
 */
function newton(func,func_prime,y_target,x0,iter=30){
  let x = x0;
  for(var i=0;i<iter;i++){
    y = func(x);
    x += (y_target-y)/func_prime(x)
    if(Math.abs(y_target-y)<1e-12){console.log(`iteration: ${i}/${iter}`);break;}
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
