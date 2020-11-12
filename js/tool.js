///////////////////////////// UTILS /////////////////////////////

///// COPY FROM CLIPBOARD & ADJUST ROW/COLUMN
function clipboard_to_matrix(event){
  event.preventDefault();
  let clipboardData = event.clipboardData;
  if(clipboardData != null){
		// split with tab -> make 2D array
    let arrs = clipboardData.getData("text/plain").split('\n').map(x => x.split('\t'))
    console.log(clipboardData.getData("text/plain"));
    return arrs;
  }
}

///////////////////////////// STATISTIC VALUES /////////////////////////////

///// show second input row when check "2 DATA" switch (id: twodata_switch)
function stats_second_row(){
  let IDs = ['stats_input_row2','stats_output_row2','stats_output_row3','stats_output_row4'];
  for(var ID of IDs){
		if(twodata_switch.checked){
      document.getElementById(ID).style.display = '';
		}else{
      document.getElementById(ID).style.display = 'none';
		}
	}
}

///// show result of statistic values
function show_stats(){
  // results of row1
  let arr1 = document.getElementById('stats_input1').value.trim().split(/[,、\s]+/).map(Number); // delete spaces, split, cast as Number
  let N1 = Number(arr1.length); // N = df-1
	let mu1 = round(mean(arr1), 4); // sample mean
	let s1 = round(std(arr1), 4); // unbiased sample SD
  let sd1 = (document.getElementById('unbiased_switch').checked)? round(std(arr1),4):round(std(arr1,unbiased==false),4);
  let result1 = [N1-1, mu1, sd1, round(sem(arr1),4), round(median(arr1),4), round(skewness(arr1),4)];
  for(var i=0; i<6; i++){
		// <#stats_output_row1><td><strong>...</strong></td> strong is grandchild
    document.getElementById('stats_output_row1').children[i].firstElementChild.innerText = result1[i]; 
  }
  // results of row2 (if any)
  if(document.getElementById("twodata_switch").checked==true){
    let arr2 = document.getElementById('stats_input2').value.trim().split(/[,\s]+/).map(Number);
    let N2 = Number(arr2.length);
		let mu2 = round(mean(arr2), 4);
		let s2 = round(std(arr2), 4);
    let sd2 = (document.getElementById('unbiased_switch').checked)? round(std(arr2),4):round(std(arr2,false),4);
    let result2 = [N2-1, mu2, sd2, round(sem(arr2),4), round(median(arr2),4), round(skewness(arr2),4)];
    for(var i=0; i<6; i++){
      document.getElementById('stats_output_row2').children[i].firstElementChild.innerText = result2[i]; 
    }
    // export to ttest, ftest
    document.getElementById('ttest_input1').value = `${mu1} ${s1} ${N1}`;
    document.getElementById('ttest_input2').value = `${mu2} ${s2} ${N2}`;
    show_ttest();
    document.getElementById('ftest_input1').value = `${s1} ${N1-1}`;
    document.getElementById('ftest_input2').value = `${s2} ${N2-1}`;
    show_ftest();
    // correlation
    document.getElementById('stats_output_pooledSD').innerText = round(Math.sqrt(pooled_variance(arr1,arr2)),4);
    if(arr1.length==arr2.length){
      let cov12 = round(cov(arr1,arr2), 4);
      let pearson = round(corr(cov12,s1,s2), 4);
      let spear = round(spearman(arr1, arr2), 4);
      let regression_result = regression(arr1,arr2).map(x => round(x, 4));
      var result_corr = [cov12, pearson, spear, `Y = ${regression_result[1]}X + ${regression_result[0]}`];
    }else{
      var result_corr = ['-','-','-','-'] 
    }
    for(var i=0; i<4; i++){
      document.getElementById('stats_output_row4').children[i+1].firstElementChild.innerText = result_corr[i]; 
    }
  }else{ // only row1 => open normality test
    if(document.getElementById('content_normality').style.display=='none'){
      document.getElementById('label_normality').click();
      document.getElementById('normality_input').value = document.getElementById('stats_input1').value; // copy values to shapiro-wilk
      show_normality();
    }
  }
}

///// copy & paste data from excel
const ELEM_STATS_INPUT = document.getElementById('stats_input1');
ELEM_STATS_INPUT.addEventListener('paste', paste_stats);

function paste_stats(event){
  let arrs = clipboard_to_matrix(event);
  if(transpose(arrs).length<=2){ // if two columns data (rows may be more than 2), transpose first
    arrs = transpose(arrs);
  }
  if(arrs.length==1 && typeof(arrs[0]=='object')){ // 1-dim vector in array [[1,2,3...]]
    arrs = arrs[0];
  }
  if(arrs.length==2){ // if two rows data, show 2nd input row
    document.getElementById("twodata_switch").checked = true;
    stats_second_row();
    document.getElementById("stats_input1").value = arrs[0].join(' ');
    document.getElementById("stats_input2").value = arrs[1].join(' ');
  }else if(typeof(arrs[0])=='number'){
    document.getElementById("twodata_switch").checked = false;
    stats_show_second_row();
    document.getElementById("stats_input1").value = arrs.join(' ');
  }else{return;}
  show_stats();
}

///////////////////////////// T-TEST & F-TEST /////////////////////////////

function show_ttest(){
  let arr1 = document.getElementById('ttest_input1').value.trim().split(/[,\s]+/).map(Number);
  let arr2 = document.getElementById('ttest_input2').value.trim().split(/[,\s]+/).map(Number);
  let result = welch(arr1[0],arr2[0],arr1[1],arr2[1],arr1[2],arr2[2]); //mean12, SD12, N12 -> [t, df, p]
  result.push(effect_size(arr1[0],arr2[0],arr1[1],arr2[1],arr1[2],arr2[2])); // append cohen's d
  result = result.map(x => round(x, 4));
  for(var i=0;i<4;i++){
    document.getElementById('ttest_output_row').children[i].firstElementChild.innerText = result[i]; 
  }
  document.getElementById('z2p_input').value = Math.abs(result[0]);
  document.getElementById('p2z_input').value = 0.025;
  document.getElementById('t2p_input_t').value = Math.abs(result[0]);
  document.getElementById('t2p_input_df').value = result[1];
  document.getElementById('p2t_input_p').value = 0.025;
  document.getElementById('p2t_input_df').value = result[1];
  z2p(); p2z(); t2p(); p2t();
}

function show_ftest(){
  let arr1 = document.getElementById('ftest_input1').value.trim().split(/[,\s]+/).map(Number);
  let arr2 = document.getElementById('ftest_input2').value.trim().split(/[,\s]+/).map(Number);
  let fvalue = (arr1[0]/arr2[0])**2;
  let pvalue = f_to_p(fvalue, arr1[1], arr2[1]);
  let result = [fvalue, pvalue, 1-pvalue].map(x => round(x, 4))
  for(var i=0;i<3;i++){
    document.getElementById('ftest_output_row').children[i].firstElementChild.innerText = result[i]; 
  }
  document.getElementById('f2p_input_f').value = round(fvalue, 4);
  document.getElementById('f2p_input_df').value = `${arr1[1]} ${arr2[1]}`;
  document.getElementById('p2f_input_df').value = `${arr1[1]} ${arr2[1]}`;
  f2p();
}

///////////////////////////// SHAPIRO-WILK TEST ///////////////////////////// 

function show_normality(){
  let arr = document.getElementById('normality_input').value.trim().split(/[,\s]+/).map(Number);
  result = shapiro_wilk(arr); // [W, z, p]
  for(var i=0; i<3; i++){
    document.querySelectorAll('.normality_output')[i].innerText = round(result[i], 4);
  }
  make_qqplot(arr);
}

// make qq plot
function make_qqplot(arr){
  // prepare data
  [arr_sorted, norm] = qqplot(arr);
  qqplot_data = [];
  for(var i=0; i<arr.length; i++){
    qqplot_data.push({x:arr_sorted[i], y:norm[i]});
  }
  // initialize canvas
  document.getElementById('qqplot_canvas').innerHTML = '';
  // draw chart 
	new Chart(document.getElementById('qqplot_canvas'), {
		type: 'scatter',
		data: {
			datasets: [{
          data:qqplot_data,
          backgroundColor: '#4f4f4f',
      }]
		},
		options: {
      responsive: true,
      legend: {display: false},
			scales: {
        xAxes: [{
          scaleLabel: {
            display: true,
            labelString: 'Actual Values',
          },
        }],
        yAxes: [{
          scaleLabel: {
            display: true,
            labelString: 'Theoretical Values',
          },
        }]
			}
		}
	});
}

// initialize plot when load page
window.onload = make_qqplot([0]);


///////////////////////////// MISC ///////////////////////////// 

// convert base
function convert(){
    let base_from = document.getElementById('base_from').value;
    let base_to = document.getElementById('base_to').value;
    let num = document.getElementById('num_to_convert').value;
    document.getElementById("answer").innerText = convert_base(num,base_from,base_to)
}

///// GCD and LCM /////
document.getElementById('gcd_input').oninput = validate_gcd;
function validate_gcd(){
  let nums = document.getElementById('gcd_input').value.trim().split(/[,、\s]+/).map(Number); // delete spaces, split, cast as Number
	if(nums.every(Number.isInteger) && !nums.includes(0)){
		document.getElementById('gcd_input').classList.remove('is-invalid');
  }else{
		document.getElementById('gcd_input').classList.add('is-invalid');
  }
}
function show_gcd(){
  let elem = document.getElementById('gcd_input');
  let nums = elem.value.trim().split(/\s+/).map(Number);
  let mode = document.getElementById('select_gcd').value;
  if(nums.length>0 && !elem.classList.contains('is-invalid')){
    if(mode=='gcd'){
      document.getElementById('answer_gcd').innerText = 'GCD = ' + gcd(nums);
    }else if(mode='lcm'){
      document.getElementById('answer_gcd').innerText = 'LCM = ' + lcm(nums);
    }
    
  }
}