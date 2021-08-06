/**
 * @name RandomName
 * @version 2.0.4
 * @license BSD-2-Clause
 * @see {@link https://github.com/Netrvin/RandomName}
 */

//可修改参数
var	chooseDelay = 100; //特效：名字闪动时间间隔（单位：ms）
var	chooseTimes = 20; //特效：名字闪动次数
var	allowSave = true; //特性：是否允许将预点名单存储在浏览器中
var namelist_md5={};
var currentTab=0;
var listcount={};
var namenow = null;
//加载名单
function loadList() {
    checkList();
    try {
        return JSON.parse(base64.decode(localStorage['prelist_' + getMd5(getList())]));
    } catch (err) {
        initPrelist();
        return JSON.parse(base64.decode(localStorage['prelist_' + namelist_md5[currentTab]]));
    }
}
function getCurrentTab(){
	
	var index=0;
	$("#ul_tabs li").each(function(){
		if($(this).hasClass("active")){
			index=$(this).index();
		}
	});
	return index;
			
}
//检查名单
function checkList() {
	currentTab=getCurrentTab();
	
    if ((localStorage['prelist_' + namelist_md5[currentTab]] == undefined) || (localStorage['prelist_' + namelist_md5[currentTab]] == null)) {
        initPrelist();
    } else {
        if (md5(localStorage['prelist_' + namelist_md5[currentTab]]) != localStorage['listmd5_' + namelist_md5[currentTab]]) {
            initPrelist();
        } 
    }
}

//生成待点名单
function initPrelist() {
    var prelist = new Array();
    for (var i = 0; i < listcount[currentTab]; i++) {
        prelist[i] = i;
    }
    saveList(shuffle(prelist));
}

//保存名单
function saveList(arr) {
    str = base64.encode(JSON.stringify(arr));
    localStorage['listmd5_' + namelist_md5[currentTab]] = md5(str);
    localStorage['prelist_' + namelist_md5[currentTab]] = str;
}
//名单乱序
function shuffle(a) {
    var len = a.length;
    for (var i = 0; i < len - 1; i++) {
        var index = parseInt(Math.random() * (len - i));
        var temp = a[index];
        a[index] = a[len - i - 1];
        a[len - i - 1] = temp;
    }
    return a;
}

//随机闪动名字并修改/还原Class
function chooseName(times) {
    var prelist = loadList();
    var nameid = Math.floor(Math.random() * listcount[currentTab]);
    while (nameid == namenow) {
        nameid = Math.floor(Math.random() * listcount[currentTab]);
    }
    if (times == 0) {
        if (prelist.length == 0) {
            initPrelist();
            prelist = loadList();
        }
        nameid = prelist.shift();
        saveList(prelist);
    }
    if (namenow != null) {
        $('#name-'+currentTab+"-" + namenow.toString()).removeClass('alert-warning');
        $('#name-'+currentTab+"-" + namenow.toString()).addClass('alert-info');
    }
    namenow = nameid;
    $('#name-'+currentTab+"-" + namenow.toString()).removeClass('alert-info');
    $('#name-'+currentTab+"-" + namenow.toString()).addClass('alert-warning');
}

//开始随机
function startRandom() {
    $('#progressbar'+currentTab).width('0%');
    $('#div-start'+currentTab).slideUp(400,
        function() {
            $('#div-running'+currentTab).slideDown(400);
        });
    run(chooseTimes);
}

//点名
function run(times) {
    chooseName(times);
    times--;
    $('#progressbar'+currentTab).width((((chooseTimes - times) / chooseTimes) * 100).toString() + '%');
    if (times >= 0) {
        setTimeout(function() {
                run(times);
            },
            chooseDelay);
    } else {
        setTimeout(function() {
                $('#div-running'+currentTab).slideUp(400,
                    function() {
                        afterChoose();
                        $('#div-start'+currentTab).slideDown(400);
                    });
            },
            0);
    }
}


//点名完毕
function afterChoose() {
    $('#NameResultSpan').text(($('#name-'+currentTab +"-"+ namenow.toString()).text()));
    $('#Result').modal();
}




//保存名单JS
function saveListJS() {
    var aTag = document.createElement('a');
    var blob = new Blob([$('#editnamelist').val()], { type: 'text/javascript' });
    aTag.download = 'list.json';
    aTag.href = URL.createObjectURL(blob);
    aTag.click();
    URL.revokeObjectURL(blob);
    aTag.remove();
}
	

//生成名单JS
function spawnListJS() {  
	var names = $('#editnamelist').val().split("----");
	var allJson=[];
	$.each(names,function(i,v){
		var name=v.split('\n');
		var output = [];
		
		$.each(name,function(j,k){
			if(k.trim()){
				output.push('"' + k + '"');
			}	
			
		});
		
		var res = '{"list": "'+ 'new Array('+escape(output.join(","))+')","id": "'+i+'", "tabName": "tab'+i+'"}';
		allJson.push(res);
	});
   
    $('#editnamelist').val("["+allJson.join(",")+"]");
}
function fetchData() {
	return fetch('list.json')
	  .then(function(response) {
		return response.json();
	  })
	  .then(function(myJson) {
	   return myJson;
	});
};
//Run fetch and animation in sequence
function resolveFetch (){
  return new Promise(function(resolve, reject) {
    
    resolve(fetchData());
  });
};

resolveFetch().then(function(lists){

	var liArray=[];
	var tabDivArray=[];
	$.each(lists,function(i,v){
		var active=currentTab==i?"active":"";
		liArray.push('<li class="'+active+'"><a href="#page-random'+i+'"  data-toggle="tab">'+v.tabName+'</a></li>');
		
		tabDivArray.push('<div id="page-random'+i+'" class="panel-body tab-pane panel-body '+active+'" style="margin-top:20px;">');
		tabDivArray.push('<div class="" style="margin-right:20%;margin-left:20%;"><div class="namelistdiv" id="namelist'+i+'">');
		var list=eval(unescape(lists[i].list));
		listcount[i]=list.length;
		$.each(list,function(j,k){
			tabDivArray.push('<div class="name alert-info" id="name-' + i +'-'+j+'">' + list[j] + '</div>');
		});	
		namelist_md5[i]=md5(JSON.stringify(list));
		tabDivArray.push('</div></div>');
					
		tabDivArray.push('<center>');
		tabDivArray.push('<div id="div-start"' + i +'><button class="btn btn-default btn-lg" onclick="javascript:startRandom()" type="button" style="width:50%"><h4 style="display:inline">开始</h4></button>');
		tabDivArray.push('</div>');
		tabDivArray.push('<div class="progress" id="div-running'+i+'" style="display:none;width:50%">');
		tabDivArray.push('<center>');
		tabDivArray.push('<div id="progressbar'+i+'" class="progress-bar progress-bar-info progress-bar-striped active" style="width:0%">');
		tabDivArray.push('<span class="sr-only">Running</span>');
		tabDivArray.push('</div>');
		tabDivArray.push('</center>');
		tabDivArray.push('</div>');
		tabDivArray.push('</center>');
		tabDivArray.push('</div>');
	});
	$("#li_last").before(liArray.join(" "));
	$("#page-editname").before(tabDivArray.join(" "));
	
	
	//初始化名单
	if (allowSave) {
		checkList();
	} else {
		initPrelist();
	}

})
