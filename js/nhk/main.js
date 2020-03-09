// category = ['社会', '国際', 'ビジネス', 'スポーツ', '政治', '科学・文化', '暮らし', '地域', '気象・災害']
function selectCategory(){
    var num = document.getElementById('selectcategory').selectedIndex;
    selected_category = document.getElementById('selectcategory').options[num].value;
    switch(selected_category){
        case '社会':
            js_to_read = 'social.js'; break;
        case '国際':
            js_to_read = 'international.js'; break;
        case 'ビジネス':
            js_to_read = 'business.js'; break;
        case 'スポーツ':
            js_to_read = 'sport.js'; break;
        case '政治':
            js_to_read = 'politic.js'; break;
        case '科学・文化':
            js_to_read = 'science.js'; break;
        case '暮らし':
            js_to_read = 'life.js'; break;
        case '地域':
            js_to_read = 'local.js'; break;
        case '気象・災害':
            js_to_read = 'weather.js'; break;
    }
    newscript = document.createElement('script');
    newscript.src = `./js/nhk/${js_to_read}`;
    document.head.appendChild(newscript);
    document.getElementById('selectarticle').innerHTML = "";
    document.getElementById('selectarticle').innerHTML = '<option selected id="firstoption">--- LOADING ---</option>';
    setTimeout(function(){appendArticle()}, 8000);
}

function appendArticle(){
    for(dic of article_data){
        document.getElementById('selectarticle').innerHTML += `<option value="${dic['id']}">${dic['id'].slice(4,-4)} ${dic['date']} : ${dic['title_n']}</option>`;    
    }
    document.getElementById('firstoption').innerHTML = '--- select article ---';
}

function selectArticle(){
    num = document.getElementById('selectarticle').selectedIndex;
    // articleID = document.getElementById('selectbox').options[num].value;
    dic = article_data[num - 1];
    console.log(num);
    console.log(dic);
    document.getElementById('articleid').innerHTML = dic['id'];
    document.getElementById('date').innerHTML = dic['date'];
    document.getElementById('titlenormal').innerHTML = dic['title_n'];
    document.getElementById('titleeasy').innerHTML = dic['title_e'];
    document.getElementById('titlenormal2').innerHTML = "<br>" + dic['title_n'];
    document.getElementById('titleeasy2').innerHTML = dic['title_e_ruby'];
    document.getElementById('normal').innerHTML = dic['article_n'];
    document.getElementById('easy').innerHTML = dic['article_e'];
    document.getElementById('urlnormal').innerHTML = `<a href="${dic['urlnormal']}" target=blank_>go to website</a>`;
    document.getElementById('urleasy').innerHTML = `<a href="${dic['urleasy']}" target=blank_>go to website</a>`;
}

function clearData(){
    targets = document.getElementsByClassName('newsdata');
    for(target of targets){
        target.innerHTML = '';
    }
}

function freq(n) {
    clearData();
    document.getElementById('normal').innerHTML = `<table class="table table-hover"><thead><tr><th>rank/${rank_n.length}</th><th>漢字</th><th>count/${total_n}</th><th>percent</th></tr></thead><tbody id="tablenormal"></tbody></table>`
    for(var i=0; i<n; i++){
        document.getElementById('tablenormal').innerHTML += `<tr><td>${i+1}</td><td>${rank_n[i][0]}</td><td>${rank_n[i][1]}</td><td>${rank_n[i][2]}</td></tr>`;
    }
    document.getElementById('easy').innerHTML = `<table class="table table-hover"><thead><tr><th>rank/${rank_e.length}</th><th>漢字</th><th>count/${total_e}</th><th>percent</th></tr></thead><tbody id="tableeasy"></tbody></table>`
    for(var i=0; i<n; i++){
        document.getElementById('tableeasy').innerHTML += `<tr><td>${i+1}</td><td>${rank_e[i][0]}</td><td>${rank_e[i][1]}</td><td>${rank_e[i][2]}</td></tr>`;
    }
}
function search(){
    clearData();
    document.getElementById('titlenormal2').innerHTML = "";
    document.getElementById('titleeasy2').innerHTML = "";
    kanji = document.getElementById('inputform').value;
    document.getElementById('normal').innerHTML = `<table class="table table-hover"><thead><tr><th>rank/${rank_n.length}</th><th>count/${total_n}</th><th>percent</th></tr></thead><tbody id="tablenormal"></tbody></table>`;
    document.getElementById('easy').innerHTML = `<table class="table table-hover"><thead><tr><th>rank/${rank_e.length}</th><th>count/${total_e}</th><th>percent</th></tr></thead><tbody id="tableeasy"></tbody></table>`;
    for(var i=0; i<rank_n.length; i++){
        if(rank_n[i][0] == kanji){
            document.getElementById('tablenormal').innerHTML += `<tr><td>${i+1}</td><td>${rank_n[i][1]}</td><td>${rank_n[i][2]}</td></tr>`;
                break;
        }else if(i == rank_n.length - 1){
            document.getElementById('tablenormal').innerHTML += `<tr><td>not found</td><td> - </td><td> - </td></tr>`;
        }
    }
    for(var i=0; i<rank_e.length; i++){
        if(rank_e[i][0] == kanji){
        document.getElementById('tableeasy').innerHTML += `<tr><td>${i+1}</td><td>${rank_e[i][1]}</td><td>${rank_e[i][2]}</td></tr>`;
            break;
        }else if(i == rank_e.length - 1){
            document.getElementById('tableeasy').innerHTML += `<tr><td>not found</td><td> - </td><td> - </td></tr>`;
        }
    }
    return false;
}
            
function drawChart(topn, percent) {
    clearData();
    if(topn == null){
        maxn = rank_n.length;
        maxe = rank_e.length;
    }else{
        maxn = topn;
        maxe = topn;
    }
    if(percent == true){
        k = 2;
    }else{
        k = 1;
    }

    document.getElementById('normal').innerHTML = '<div id="chartContainer1" style="height: 400px; max-width: 920px; margin: 0px auto;"></div>'
    var chart1 = new CanvasJS.Chart("chartContainer1", {
        theme: "light2", // "light1", "light2", "dark1", "dark2"
        animationEnabled: true,
        zoomEnabled: true,
        axisY:{logarithmic: true},
        data: [{type: "area", dataPoints: []}],
        options:{
            legend:{display:false},
        }
    });
    entropy1 = 0;
    for(var i=0; i<maxn; i++) {
        chart1.options.data[0].dataPoints.push({x: i+1, y: rank_n[i][k], label: `${i+1} ${rank_n[i][0]}`});
        entropy1 += - (rank_n[i][2]/100 * Math.log2(rank_n[i][2]/100))
    }
    chart1.render();

    document.getElementById('easy').innerHTML = '<div id="chartContainer2" style="height: 400px; max-width: 920px; margin: 0px auto;"></div>'
    var chart2 = new CanvasJS.Chart("chartContainer2", {
        theme: "light1", // "light1", "light2", "dark1", "dark2"
        animationEnabled: true,
        zoomEnabled: true,
        axisY:{logarithmic: true},
        data: [{type: "area", dataPoints: []}],
        options:{
            legend:{display:false},
        }
    });
    entropy2 = 0;
    for(var i=0; i<maxe; i++) {
        chart2.options.data[0].dataPoints.push({x: i+1, y: rank_e[i][k], label: `${i+1} ${rank_e[i][0]}`});
        entropy2 += - (rank_e[i][2]/100 * Math.log2(rank_e[i][2]/100))
    }
    chart2.render();
    if(topn == null){
        document.getElementById('entropy').innerHTML = `kanji entropy : normal ${Math.round(entropy1*1000)/1000}, easy ${Math.round(entropy2*1000)/1000}`;
    }else{
        document.getElementById('entropy').innerHTML = ''
    }
}
