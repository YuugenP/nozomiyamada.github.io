// GCD of 2 numbers (euclidean algorithm)
// a, b must be integers
function gcd2(a,b){
  if(!Number.isInteger(a)||!Number.isInteger(b)){
    return NaN;
  }
  if(a < b){
    [a, b] = [b, a];
  }
  let r = 1; // initialize
  while(r!=0){
    r = a%b;
    a = b; b = r;
  }
    return a 
  }

// GCD of n numbers
// nums must be an array of integers
// use gcd(a,b) and reduce n -> n-1
function gcd(nums){
  while(nums.length>1){
    var d = gcd2(nums[0], nums[1]);
    nums = [d].concat(nums.slice(2));
  }
  return nums[0]
}

// find irreducible fraction
function irreducible(a,b){
  let GCD = gcd2(a,b);
  while(GCD > 1){
    a /= GCD;
    b /= GCD;
    GCD = gcd2(a,b);
  }
  console.log(a+'/'+b);
}

// LCM of 2 numbers
// a, b must be integers
// a * b = GCD * LCM
function lcm2(a,b){
  return Math.round(a*b/gcd2(a,b))
}

// LCM of n numbers
// nums must be an array of integers
// use lcd(a,b) and reduce n -> n-1
function lcm(nums){
  while(nums.length>1){
    var d = lcm2(nums[0], nums[1]);
    nums = [d].concat(nums.slice(2));
  }
  return nums[0]
}