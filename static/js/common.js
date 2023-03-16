/* ******** OBJECT ******** */
function nextNode(object)						{while(object){object=object.nextSibling;if(object&&object.nodeType==1&&object.tagName.indexOf("/")<0)break;}return object;}
function previousNode(object)					{while(object){object=object.previousSibling;if(object&&object.nodeType==1&&object.tagName.indexOf("/")<0)break;}return object;}
function removeNode(object)						{object.parentNode.removeChild(object);}

function combineObject(object1,object2)			{const object3={};for(let i in object1)object3[i]=object1[i];for(let i in object2){if(typeof object2[i]=="object"&&!Array.isArray(object2[i]))object3[i]=combineObject(object3[i], object2[i]);else object3[i]=object2[i];}return object3;}

/* ******** COORD ******** */
function getScrollTop()							{return Math.max(document.documentElement.scrollTop, document.body.scrollTop);}
function getScrollLeft()						{return Math.max(document.documentElement.scrollLeft, document.body.scrollLeft);}
function getWindowWidth()						{return document.documentElement.clientWidth||document.body.clientWidth;}
function getWindowHeight()						{return document.documentElement.clientHeight||document.body.clientHeight;}

/* ******** NUMBER ******** */
function getNumber(value,isNumber)				{var number=(value)?Number((isNumber)?value.toString().replace(/[^0-9]/gi,""):value.toString().replace(/[^0-9.-]/gi,"")):0;return isNaN(number)?0:number;}
function getComma(value)						{return (value!=undefined)?value.toString().replace(/\B(?=(\d{3})+(?!\d))/g,","):"";}
function getPercent(a,b,c)						{var p=a*100/b;if(p<0)p=0;else if(p>100)p=100;if(!c)p=Math.round(p);else p=Number(p.toFixed(c));return p;}
function getRandom(min,max)						{return Math.floor(Math.random()*(max-min)+min);}
function getCalendar(date,format)				{if(!date)date=new Date();if(!format)format="yyyy-mm-dd";return date.format(format);}

/* ******** STRING ******** */
function firstCase(value)						{var node=value.split(" ");for(var i=0;i<node.length;i++)node[i]=node[i].charAt(0).toUpperCase()+node[i].slice(1).toLowerCase();return node.join(" ");}
function toDashCase(value)						{return (value)?value.replace(/[A-Z{1}]/g,function(c){return "-" + c.toLowerCase();}):""}
function toCamelCase(value)						{return (value)?value.toLowerCase().replace(/[-_]+/g, " ").replace(/[^\w\s]/g, "").replace(/\s(.)/g, function(c){return c.toUpperCase();}).replace(/\s/g,""):""}

/* ******** DATE ******** */
function getAge(birthday)						{birthday=getDate(birthday);var today=new Date();var isPass=(Number((today.getMonth()+1)+""+today.getDate().zf(2))<Number((birthday.getMonth()+1)+""+birthday.getDate().zf(2)));var age=today.getFullYear()-birthday.getFullYear()-((isPass)?1:0);return (age<0)?0:age}
function getDate(date)							{if(!date)date=new Date;else if(typeof date=="string")date=new Date(date);return new Date(date.getFullYear(),date.getMonth(),date.getDate())}
function getPeriod(startDate,endDate)			{startDate=getDate(startDate);endDate=getDate(endDate);const startTime=startDate.getTime();const endTime=endDate.getTime();if(isNaN(startTime)||isNaN(endTime))return 0;const diffDay=parseInt((endTime-startTime)/(1000*60*60*24));return diffDay;}
function getElapse(date,year,month,day)			{date=getDate(date);if(year==undefined||year=="")year=0;if(month==undefined||month=="")month=0;if(day==undefined||day=="")day=0;date.setFullYear(date.getFullYear()+Number(year),date.getMonth()+Number(month),date.getDate()+Number(day));return date.format("yyyy-mm-dd");}

/* ******** VERIFY ******** */
function isNumber(value)						{return /^([0-9])+$/.test(value);}
function isInteger(value)						{return /^[+-]?\d+?$/.test(value);}
function isFloat(value)							{return /^[+-]?\d+(\.\d+)?$/.test(value);}
function isMail(value)							{return /^([_0-9a-zA-Z-.]{1,32})@([_0-9a-zA-Z-]{1,32})+(\.[0-9a-zA-Z]{2,4})*(\.[0-9a-zA-Z]{2,4})$/.test(value);}
function isPhone(value)							{return /^([0-9]{7,11})$/.test(value.replace(/-/g,""));}
function isMobile(value)						{return /^(01[0|1|6|7|8|9]\d{7,8})$/.test(value.replace(/-/g,""));}
function isMobileDevice()						{if(/Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|webOS/i.test(navigator.userAgent.toLowerCase()))return true;return false;}
function isDate(value)							{if(typeof value=="string")value=new Date(value);return value instanceof Date && !isNaN(value);}
function isLessDate(a,b)						{return (getPeriod(a,b)<0)?true:false;}
function isMoreDate(a,b)						{return (getPeriod(a,b)>0)?true:false;}
function isSameDate(a,b)						{a=getDate(a);b=getDate(b);return (a.format("yyyy-mm-dd")==b.format("yyyy-mm-dd"))?true:false;}
function isDateFormat(value)					{return /^(\d{4}-\d{2}-\d{2})$/.test(value);}

/* ******** COOKIE ******** */
function setCookie(name,value,day)				{var date=new Date;date.setTime(date.getTime()+(day*24*60*60*1000));var expire="expires="+date.toUTCString();document.cookie=name+"="+value+";"+expire+";path=/";}
function getCookie(name)						{var array=document.cookie.split(";");for(var i=0;i<array.length;i++){var value=array[i].split("=");value[0]=value[0].substr(value[0].indexOf(" ")+1);if(value[0]==name)return value[1];}return "";}

/* ******** PARAMETER ******** */
function getParameter(name)						{var url=window.location.href;url="&"+url.substr(url.indexOf("?")+1);var a=url.indexOf("&"+name+"=");if(a<0)return "";else var a=url.indexOf("=",a+1)+1;var b=url.indexOf("&",a);if(b==-1)b=url.length;var v=url.substring(a,b);if(v==undefined)v="";return decodeURIComponent(v);}
function parentTagName(node,name)				{for(var i=0;i<10;i++){if(node.tagName.toLowerCase()==name)return node;node=node.parentNode;if(!node)return;}};


/* ******** DATE AND FORMDATA ******** */
String.prototype.zf = function(n)				{var value=this;for(var i=0;i<n;i++)value="0"+value;return value.substr(value.length-n,n);}
Number.prototype.zf = function(n)				{return this.toString().zf(n);}
String.prototype.sf = function(n)				{var value=this;for(var i=0;i<n;i++)value=" "+value;return value.substr(value.length-n,n);}
Number.prototype.sf = function(n)				{return this.toString().sf(n);}

String.prototype.recoverTag = function()		{return this.replace(/\&#60;/g, "<").replace(/\&#62;/g, ">").replace(/\&lt;/g, "<").replace(/\&gt;/g, ">").replace(/\&#47;/g, "/").replace(/&#124;/g, "|").replace(/&#95;/g, "_")}
String.prototype.replaceTag = function()		{return this.replace(/\</g, "&#60;").replace(/\>/g, "&#62;").replace(/\//g, "&#47;").replace(/\|/g, "&#124;").replace(/\_/g, " ")}
String.prototype.replaceAll = function(a,b){return this.replace(new RegExp(a.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&"),"g"),b);}

Date.prototype.format = function(format) {
    const date = this;
    const weekName = ["일요일", "월요일", "화요일", "수요일", "목요일", "금요일", "토요일"];
    const shortWeekName = ["일", "월", "화", "수", "목", "금", "토"];
    return format.replace(/(yyyy|yy|sm|zm|mm|sd|zd|dd|ww|sw|sh|hh|MM|ss|ap)/gi, function($1) {
		const isAp = (format.indexOf("ap") > -1) ? true : false;
        switch ($1) {
            case "yyyy": return date.getFullYear();
            case "yy": return (date.getFullYear() % 100).zf(2);
            case "sm": return (date.getMonth() + 1).sf(2);
			case "zm": return (date.getMonth() + 1);
            case "mm": return (date.getMonth() + 1).zf(2);
            case "sd": return date.getDate().sf(2);
			case "zd": return date.getDate();
            case "dd": return date.getDate().zf(2);
            case "ww": return weekName[date.getDay()];
            case "sw": return shortWeekName[date.getDay()];
            case "hh": return (isAp) ? ((h = date.getHours() % 12) ? h : 12).zf(2) : date.getHours().zf(2);
            case "sh": return (h = date.getHours() % 12) ? h : 12;
            case "MM": return date.getMinutes().zf(2);
            case "ss": return date.getSeconds().zf(2);
            case "ap": return date.getHours() < 12 ? "오전" : "오후";
            default: return $1;
        }
    });
}

Date.prototype.defaultFormat = function(command) {
	if(!command || command == "date")
		return this.format("yyyy.sm.sd (sw)");
	else
		return this.format("yyyy.sm.sd (sw) ap sh:MM");
}

Date.prototype.getGMT = function() {
	let offset = new Date().getTimezoneOffset();
	const sign = (offset < 0) ? "+" : "-";
	offset = Math.abs(offset);
	return sign + parseInt(offset / 60 || 0).zf(2) + ":" + (offset % 60).zf(2);
}

Node.prototype.getValue = function(name, isNumber) {
	name = "[name='" + name + "']";
	const node = this.querySelector(name);
	if(!node) return "";

	const nodeList = this.querySelectorAll(name);
	const checkedNodeList = this.querySelectorAll(name + ":checked");
	const checkedNode = this.querySelector(name + ":checked");

	switch(node.type) {
		case "checkbox" :
			if(nodeList.length > 1) {
				return Array.from(checkedNodeList).map(item => {
					return item.value;
				});
			} else {
				return (checkedNodeList.length > 0) ? "Y" : "N";
			}
			break;
		case "radio" :
			return (checkedNode) ? checkedNode.value : "";
		case "number" :
			return (node.value == "") ? "" : Number(node.value);
		default :
			return (isNumber) ? ((node.value) ? getNumber(node.value) : "") : node.value;
	}
};

Node.prototype.putValue = function(name, value) {
	const node = this.querySelector("[name='" + name + "']");
	if(!node) {
		const node = this.querySelector("[data-msg='" + name + "']");
		if(!node) return;
		node.innerHTML = value;
		return;
	}
	if(value == null || value == undefined) value = "";

	const nodeList = this.querySelectorAll("[name='" + name + "']");
	const type = (node.tagName.toLowerCase() == "select") ? "select" : node.type;
	const isArray = (typeof value == "object") ? true : false;
	if(isArray) {
		value = value.map(item => {
			return (typeof item == "number") ? item.toString() : item;
		});
	} else
		value = value.toString();

	switch(type) {
		case "radio" :
		case "checkbox" :
			if(nodeList.length > 1) {
				nodeList.forEach(item => {
					if(isArray && value.indexOf(item.value) > -1) item.checked = true;
					else if(item.value == value) item.checked = true;
				});
			} else {
				node.checked = (value == "Y" || value && value == node.value) ? true : false;
			}
			break;

		case "select" :
			node.querySelectorAll("option").forEach(item => {
				if((isArray && value.indexOf(item.value) > -1) || (!isArray && item.value == value))
					item.setAttribute("selected", "");
				else
					item.removeAttribute("selected");
			});
			node.value = value;
			break;

		default :
			node.value = value;
			break;
	}
};

Node.prototype.putValues = function(name, value) {
	if(value == null || value == undefined) return;
	const nodeList1 = this.querySelectorAll("[name='" + name + "']");
	const nodeList2 = this.querySelectorAll("[data-msg='" + name + "']");
	nodeList1.forEach(item => {
		item.value = value;
	});
	nodeList2.forEach(item => {
		item.innerHTML = value;
	});
};

Node.prototype.parentTagName = function(tagName, maxCount) {
	let node = this;
	maxCount = maxCount || 10;
	for(let i = 0; i < maxCount; i++) {
		if((node.tagName || "").toLowerCase() == tagName)
			return node;
		node = node.parentNode;
		if(!node) return;
	}
};

function getPhoneNumber(value) {
	const number = value.replace(/[^0-9]/gi, "");
	const getType = () => {
		const a = Number(number.substr(0, 1));
		const b = Number(number.substr(1, 1));
		const c = Number(number.substr(2, 1));
		const d = Number(number.substr(3, 1));
		if(a == 0 && b == 0 && c) return "global";
		if(a == 0 && (2 <= b && b <= 6) && (1 <= c && c <= 5)) return "local";
		if(a == 0 && b == 8 && c) return "local";
		if(a == 0 && b == 1 && c) return "mobile";
		if(a == 0 && b && c == 0) return "internet";
		if(a == 1 && (b == 1 || b == 2 || b == 3 || b == 4 || b == 8) && c) return "reserve";
		if(a == 1 && (5 <= b && b <= 9) && c && d) return "company";
		return "local";
	};
	const type = getType();
	const n = number.length;
	let countList = [];
	if(type == "global") {
		countList = [3, 3, -1];
	} else if(type == "local") {
		const y = Number(number.substr(1, 1));
		const z = Number(number.substr(2, 1));
		const i = (y == 2) ? 2 : (1 <= z && z <= 5) ? 3 : 2;
		const j = ((n - i) < 8) ? 3 : 4;
		countList = [i, j, 4];
	} else if(type == "company") {
		countList = [4, 4];
	} else {
		countList = [3, ((n == 10) ? 3 : 4), 4];
	}
	const numberList = [];
	let count = 0;
	countList.forEach((item, index) => {
		const value = number.substr(count, countList[index]);
		count += countList[index];
		if(value) numberList.push(value);
	});
	return numberList.join("-");
}

function isSearchDate(startDate, endDate, maxPeriod) {
	if(!isDateFormat(startDate) || !isDate(startDate))
		return "시작날짜를 다시 한 번 확인해 주세요.";
	if(!isDateFormat(endDate) || !isDate(endDate))
		return "종료날짜를 다시 한 번 확인해 주세요.";
	if(new Date(startDate).getFullYear() < 1900 || new Date(endDate).getFullYear() < 1900)
		return "날짜를 1900년 이후로 설정해 주세요.";
	if(new Date(startDate).getFullYear() > 2040 || new Date(endDate).getFullYear() > 2040)
		return "날짜를 2040년 이전으로 설정해 주세요.";
	if(isLessDate(startDate, endDate))
		return "종료 날짜를 시작 날짜 보다 크게 설정해 주세요.";
	if(maxPeriod && getPeriod(startDate, endDate) > maxPeriod)
		return "검색 기간을 " + maxPeriod + "일 이하로 설정해 주세요.";
	return "";
}

function isCorrectRatio(width, height, ratio, allowance) {
	if(!allowance) allowance = 0;
	ratio = ratio.split(":");
	const widthRatio = Number(ratio[0]);
	const heightRatio = Number(ratio[1]);
	const resultRatio = widthRatio * height / width;
	return (resultRatio < heightRatio - allowance || heightRatio + allowance < resultRatio) ? false : true;
}

Event.prototype.getKeyInfo = function() {
	const keyCode = this.keyCode || this.which;
	return {
		keyCode : keyCode
	}
}
