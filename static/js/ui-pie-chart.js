function uiPieChart(object){
	this.chart = {
		canvas				: undefined,
		scale				: 100,
		size				: 0,
		arc					: 360,
		dpi					: 1,
		dummy				: false,

		value				: [],
		
		label				: [],
		labelPercent		: true,

		pieIndex			: undefined,
		pieOpacity			: true,
		pieOpacityValue		: 0.5,
		pieOpacityStart		: [],
		pieOpacityEnd		: [],
		
		pieStroke			: 1,
		pieRound			: false,
		pieRoundStart		: 1,
		pieRoundEnd			: 1,

		color				: [],
		foreColor			: "#d93e3c",
		backColor			: "#d5d5d5",

		fontFamily			: "NotoSansKR",
		fontColor			: "#fff",
		fontRotate			: true,
		fontSize			: 12,

		animate				: true,
		animateType			: "linear",
		animateFps			: 60,
		animateCount		: 0,
		animateDuration		: 0.4,

		event				: false,
		eventTimer			: undefined,
		eventAnimate		: undefined,
		eventClick			: undefined,
		eventOver			: undefined
		}



	uiPieChart.prototype.fnReady = function(object){
		// 1.	데이터가 문자열인 경우 배열로 바꾼다.
		if(object.value != undefined && Array.isArray(object.value) == false) object.value = [object.value];
		if(object.color != undefined && Array.isArray(object.color) == false) object.color = [object.color];
		if(object.label != undefined && Array.isArray(object.label) == false) object.label = [object.label];

		// 2.	데이터의 나머지 값을 계산한다.
		var sum = 0;
		for(var i = 0; i < object.value.length; i++)
			sum += Number(object.value[i]);
		if(sum <= 100){
			object.value.push(100 - sum);
			this.chart.dummy = true;
			}
		
		this.chart.pieOpacityStart = new Array(object.value.length);
		this.chart.pieOpacityEnd = new Array(object.value.length);
		for(var i = 0; i < object.value.length; i++)
			this.chart.pieOpacityStart[i] = this.chart.pieOpacityEnd[i] = 1;

		// 3. 차트의 오브젝트를 업데이트한다.
		this.chart = combineObject(this.chart, object);

		// 4.	캔버스를 셋팅한다.
		var container = canvas = object.canvas;
		if(container.tagName.toLocaleLowerCase() != "canvas"){
			var node = container.getElementsByTagName("canvas");
			if(node.length > 0) var canvas = node[0];
			else{
				var canvas = document.createElement("canvas");
				container.appendChild(canvas);
				}
			}

		// 1.5.	캔버스 사이즈를 설정한다.
		this.chart.canvas = canvas;
		var dpi = this.chart.dpi = (isMobileDevice()) ? 3 : 1;
		
		var arc = this.chart.arc = 360 - this.chart.arc;							// 부채꼴 설정값 반전
		var size = this.chart.size = 100 - this.chart.size;							// 크기 반전

		var w = this.chart.w = canvas.width = container.offsetWidth * dpi;
		var h = this.chart.h = canvas.height = container.offsetHeight * dpi;
		var x = this.chart.x = w / 2;
		var y = this.chart.y = h / 2;
		var r1 = this.chart.r1 = ((x < y) ? x : y) * (this.chart.scale * 0.01);
		var r2 = this.chart.r2 = r1 * (this.chart.size * 0.01);
		
		var r3 = this.chart.r3 = (r1 - r2) / 2;
		var r4 = this.chart.r4 = (r1 + r2) / 2;
		
		var s = this.chart.pieStroke;												// 파이 여백 각도
		var s1 = this.chart.s1 = Math.PI * 2 / 360 * s / 2;							// 바깥쪽 파이 여백 라디안
		var s2 = this.chart.s2 = (r2 == 0) ? s1 * r1 * 2 : s1 * r1 / r2;			// 안쪽 파이 여백 라디안
		var s3 = this.chart.s3 = s1 * r1 / r4 * 2;

		var pAngle = (arc == 0) ? 1.5 : 0.5;										// 그래프 모양이 부채꼴일 때는 6시부터, 원형일 때는 12시부터 시작
		arc = arc * Math.PI / 360;													// 각도를 라디안로 변경
		var sAngle = this.chart.sAngle = Math.PI * pAngle + arc;					// 시작 라디안 값
		var eAngle = this.chart.eAngle = Math.PI * (pAngle + 2) - arc;				// 끝 라디안 값
		this.chart.rAngle = (eAngle - sAngle);										// 전체 라디안 값

		if(this.chart.animate == true)
			this.chart.animateCount = this.chart.animateDuration * this.chart.animateFps;
			
		this.fnDraw();

		// 1.7.	이벤트를 등록한다.
		if(this.chart.eventClick) canvas.addEventListener("click", this.fnEvent.bind(this));
		if(this.chart.eventOver) canvas.addEventListener("mousemove", this.fnEvent.bind(this));
		}

	uiPieChart.prototype.fnEvent = function(event){
		var type = event.type;
		
		var canvas = this.chart.canvas;
		var x = this.chart.x;
		var y = this.chart.y;
		var r1 = this.chart.r1;
		var r2 = this.chart.r2;
		
		var eX = elementX(canvas, event);
		var eY = elementY(canvas, event);
		var eR = Math.sqrt(Math.pow(Math.abs(eX - x), 2) + Math.pow(Math.abs(y - eY), 2));

		var focus = (eR <= r1 && eR >= r2) ? true : false;
		var value = this.chart.value;		

		if(focus == true){
			var sAngle = this.chart.sAngle;
			var eAngle = this.chart.eAngle;
			var arc = this.chart.arc;
			
			var radian = Math.atan2(eX - x, y - eY) + (1.5 * Math.PI);
			if(arc == 0) radian = Math.atan2(x - eX, eY - y) + (2.5 * Math.PI);

			if(arc != 0 && (radian < sAngle || radian > eAngle)) focus = false;

			if(focus == true){
				var p = (radian - sAngle) / (eAngle - sAngle) * 100;

				var sum = 0;
				for(var i = 0; i < value.length; i++){
					if(p >= sum && p <= sum + value[i])	break;
					sum += value[i];
					}

				if(this.chart.dummy == true && i == value.length - 1) focus = false;

				if(focus == true){
					this.chart.event = true;
					if(type == "click") this.chart.eventClick("click", i);
					else if(type == "mousemove"){
						if(this.chart.pieIndex == i) return;
						this.chart.eventOver(type, i);
						this.chart.canvas.style.cursor = "pointer";
						}
						
					if(this.chart.pieIndex != undefined){
						this.chart.pieOpacityEnd[this.chart.pieIndex] = 1;
						}
					this.chart.pieOpacityEnd[i] = this.chart.pieOpacityValue;
					this.chart.pieIndex = i;
					this.fnDraw();
					return;
					}
				}
			}
			
		if(this.chart.event == true){
			for(var i = 0; i < value.length; i++)
				this.chart.pieOpacityEnd[i] = 1;
				
			this.fnDraw();
			this.chart.pieIndex = undefined;
			this.chart.event = false;
			this.chart.canvas.style.cursor = "default";
			}
		}



	uiPieChart.prototype.fnDraw = function(){
		// 1. 필요한 데이터를 읽는다.
		var canvas = this.chart.canvas;
		var arc = this.chart.arc;
		
		var x = this.chart.x;
		var y = this.chart.y;
		var r1 = this.chart.r1;
		var r2 = this.chart.r2;
		var r3 = this.chart.r3;
		var r4 = this.chart.r4;
		var dpi = this.chart.dpi;
		
		var value = this.chart.value;
		var color = this.chart.color;
		var label = this.chart.label;
		var dummy = this.chart.dummy;
		
		// 2. 그래프를 그린다.
		var draw = canvas.getContext("2d");
		draw.clearRect(0, 0, this.chart.w, this.chart.h);
		draw.textAlign = "center";
		draw.textBaseline = "middle";		
		
		var sAngle = this.chart.sAngle;
		var eAngle = this.chart.eAngle;
		var rAngle = this.chart.rAngle;

		var count = (this.chart.animateCount < 0) ? 0 : this.chart.animateCount;
		var p = 1 - (count / (this.chart.animateDuration * this.chart.animateFps));
		var s1 = this.chart.s1;
		var s2 = this.chart.s2;

		switch(this.chart.animateType){
			case "linear" : p = p; break;
			case "easein" : p = p * (2 - p); break;
			case "easeout" : p = Math.pow(p, 2); break;
			}

		var sum = 0;

		if(p > 0.1){
			// 2. 각 파이의 면을 채운다.
			for(var i = 0; i < value.length; i++){
				if(i < value.length - 1){
					sum += value[i] * p;
					var v = value[i] * p * 0.01 * rAngle;
					}
				else
					var v = (100 - sum) * 0.01 * rAngle;

				if(v < 0.01) break;
				//if(v < 0.01) break;
				
				draw.beginPath();
				draw.arc(x, y, r1, sAngle + s1, sAngle + v - s1);
									
				if(r2 == 0){
					var x2 = x + s2 * Math.cos(sAngle + (v / 2));
					var y2 = y + s2 * Math.sin(sAngle + (v / 2));
					draw.arc(x2, y2, 0, 0, 0);
					}
				else
					draw.arc(x, y, r2, sAngle + v - s2, sAngle + s2, true);

				draw.closePath();
				draw.fillStyle = (color[i]) ? color[i] : (i < value.length - 1) ? this.chart.foreColor : this.chart.backColor;

				if(this.chart.pieOpacity == true){
					var min = this.chart.pieOpacityValue;
					var a = this.chart.pieOpacityStart;
					var b = this.chart.pieOpacityEnd;
		
					if(a[i] != b[i]){
						a[i] = (a[i] < b[i]) ? a[i] + 0.05 : a[i] - 0.05;
						if(a[i] > 1) a[i] = 1;
						else if(a[i] < min) a[i] = min;
						this.chart.pieOpacityStart[i] = a[i];
						if(a[i] != b[i] && this.chart.animateCount < 1) this.chart.animateCount = 1;
						draw.save();
						draw.globalAlpha = a[i];
						draw.fill();
						draw.restore();
						}
					else draw.fill();
					}
				else draw.fill();

				if(this.chart.pieRound == true){
					var r4 = this.chart.r4;
					var s3 = this.chart.s3;

					var x3 = x + r4 * Math.cos(sAngle);
					var y3 = y + r4 * Math.sin(sAngle);
					var x4 = x + r4 * Math.cos(sAngle + v - s3);
					var y4 = y + r4 * Math.sin(sAngle + v - s3);

					draw.save();
					draw.translate(x3, y3);
					draw.rotate(sAngle + (Math.PI * 2));
					draw.beginPath();
					draw.arc(0, 0, r3, 0, Math.PI * 2);
					draw.closePath();
					draw.fillStyle = (color[i - 1]) ? color[i - 1] : (i - 1 < value.length - 1) ? (color[i]) ? color[i] : this.chart.foreColor : this.chart.backColor;
					draw.fill();
					draw.restore();

					draw.save();
					draw.translate(x4, y4);			
					draw.rotate(sAngle + (Math.PI * 2));
					draw.beginPath();
					draw.arc(0, 0, r3, 0, Math.PI * 2);
					draw.closePath();
					draw.fillStyle = (color[i - 1]) ? color[i - 1] : (i - 1 < value.length - 1) ? (color[i]) ? color[i] : this.chart.foreColor : this.chart.backColor;
//					draw.fillStyle = (color[i]) ? color[i] : (i < value.length - 1) ? this.chart.foreColor : this.chart.backColor;
					draw.fill();
					draw.restore();
					}

				sAngle += v;
				}

			// 1.8. 라벨을 표시한다.
			draw.fillStyle =  this.chart.fontColor;

			var sAngle = this.chart.sAngle;
			var fontRotate = this.chart.fontRotate;
			var fontSize = ((r1 - r2) * 0.33).toFixed(2);
			if(r2 == 0) fontSize = 18;
			var fontFamily = this.chart.fontFamily;
			var fontMargin = fontSize / 2.75 * -1;
			var labelPercent = this.chart.labelPercent;
			var labelSize = (labelPercent) ? 0.8 : 1;

			var j = value.length;
			if(this.chart.dummy == true) j--;

			for(var i = 0; i < j; i++){
				var v = value[i] * 0.01 * rAngle;
				var x2 = x + r4 * Math.cos(sAngle + (v / 2));
				var y2 = y + r4 * Math.sin(sAngle + (v / 2));

				draw.save();
				draw.translate(x2, y2);
				if(fontRotate == true)
					draw.rotate((sAngle + (v / 2)) + Math.PI * 0.5);

				draw.globalAlpha = p;
				draw.font = "normal " + fontSize + "px " + fontFamily;
				if(labelPercent == true)
					draw.fillText(value[i] + "%", 0, label[i] ? fontMargin : 0);

				if(label[i]){
					if(labelPercent){
						draw.font = "normal " + (fontSize * 0.75) + "px " + fontFamily;
						draw.globalAlpha = p - 0.1;
						draw.fillText(label[i], 0, fontSize / 1.75);
						}
					else{
						draw.font = "normal " + fontSize + "px " + fontFamily;
						draw.globalAlpha = p;
						draw.fillText(label[i], 0, 0);
						}
					}

				draw.restore();
				sAngle += v;
				}
			}
		
		// 3. 에니메이션
		if(this.chart.eventAnimate) this.chart.eventAnimate("animate", parseInt(p * 100));
		if(this.chart.animateCount > -1) this.chart.animateCount--;
		if(this.chart.animateCount > -1){
			clearTimeout(this.chart.eventTimer);
			this.chart.eventTimer = setTimeout(this.fnDraw.bind(this), 1000 / this.chart.animateFps); 
			}
		else console.log("stop");
		}

	this.fnReady(object);
	}