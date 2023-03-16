/**
 *	sequence : 고유번호
 *	category : 카테고리
 *	type : 타입
 *	left : 왼쪽
 *	top : 위
 *	width : 가로
 *	height : 세로
 *	value : 텍스트(또는 링크 주소)
 *	backgroundImage : 배경 이미지 소스
 *	activeBackgroundImage : 액티브 배경 이미지 소스
 *	eventName : 이벤트 이름
 *  styleInfo : 스타일 정보
 *  - rotate : 회전
 *	- fontSize : 글짜 크기
 *	- fontColor : 글짜 색상
 *	- fontWeight : 글짜 굵기
 */



function uiCanvas(container, template, callback) {
	this.container = container;
	this.canvas = container.querySelector("[data-id='ui-canvas']");
	this.width = this.canvas.offsetWidth;
	this.height = this.canvas.offsetHeight;
	this.isGrid = false;
	this.isSnap = false;
	this.gridSize = 10;
	this.itemInfo = {};
	this.itemList = [];
	this.sequence = 1;
	this.selectionInfo = {};
	this.selectionList = [];
	this.historyList = [];
	this.eventListener = {};
	this.template = template;
	this.isTemplate = (template);
	this.callback = callback;
	this.isMatrix = false;
	this.matrixInfo = {x : 0, y : 0};
	this.isRelative = false;

	this.init();
};


uiCanvas.prototype.init = function() {
	document.addEventListener("keydown", (event) => {
		if(37 <= event.keyCode && event.keyCode <= 40) {
			if(window.getSelection()) {
				window.getSelection().removeAllRanges();
			}
			const positionName = (event.keyCode == 37 || event.keyCode == 39) ? "left" : "top";
			const sizeName = (positionName == "left") ? "width" : "height";
			let value = (event.keyCode == 37 || event.keyCode == 38) ? -1 : 1;
			const max = (positionName == "left") ?
				(this.isRelative) ? 100 : (this.isMatrix) ? this.matrixInfo.x : this.width :
					(this.isRelative) ? 100 : (this.isMatrix) ? this.matrixInfo.y : this.height;

			this.selectionList.forEach(item => {
				let v = item[positionName] + value;
				v = (v > 0) ? Math.ceil(v) : Math.floor(v);
				if(v < 0) v = 0;
				if(v + item[sizeName] > max) v = max - item[sizeName];
				item[positionName] = v;
			});
			this.renderItem();
			(this.eventListener.changeSelection || []).forEach(callback => {
				callback(true);
			});
		} else if(event.ctrlKey && event.keyCode == 90) {
			this.popHistory();
		} else if(event.keyCode == 46) {
			this.removeItemList();
		}
	});

	this.setGrid();
	this.setEvent();
	this.setEventItem();
	this.setEventSelection();
};

uiCanvas.prototype.setRelativeMode = function() {
	this.isRelative = true;
}

uiCanvas.prototype.setCanvas = function(width, height, size) {
	this.width = (width) ? width : this.canvas.offsetWidth;
	this.height = (height) ? height : this.canvas.offsetHeight;
	if(width) this.canvas.style.width = this.width + "px";
	if(height) this.canvas.style.height = this.height + "px";
	if(size) this.setGrid(size);
}

uiCanvas.prototype.setMatrix = function(x, y, size) {
	this.isMatrix = this.isSnap = true;
	this.unitType = "matrix";

	let isPossible = true;
	const matrixList = this.itemList.map(item => {
		let left = item.left;
		let top = item.top;
		const width = item.width;
		const height = item.height;

		if(left + width > x || top + height > y || left < 0 || left > x || top < 0 || top > y) isPossible = false;

		return {left : left, top : top, width : width, height : height};
	});

	if(!isPossible) {
		alert("변경 크기 보다 크게 설정된 아이템이 있습니다.");
		return;
	}

	this.matrixInfo = {x : x, y : y};
	this.setCanvas(x * size, y * size, size);



	this.renderItem(this.itemList);
	this.grid.classList.add("focus");
}

uiCanvas.prototype.setBackgroundImage = function(src) {
	const img = this.canvas.querySelector("img");
	if(img && img.parentNode == this.canvas) {
		img.src = src;
		img.onload = () => {this.setCanvas();};
	} else {
		const img = document.createElement("img");
		img.src = src;
		img.onload = () => {this.setCanvas();};
		this.canvas.insertBefore(img, this.canvas.firstChild);
	}
}

uiCanvas.prototype.setGrid = function(size) {
	if(!this.grid) {
		this.grid = document.createElement("div");
		this.grid.className = "grid";
		this.canvas.appendChild(this.grid);
	}
	if(size) this.gridSize = size;
	this.grid.style.backgroundSize = `${this.gridSize}px ${this.gridSize}px`;
}

uiCanvas.prototype.toggleGrid = function() {
	this.grid.classList.toggle("focus");
}




/**
 * 픽셀, 퍼센트 등 단위 변환 관련
 */

uiCanvas.prototype.xUnitToPixel = function(value) {
	return (this.isMatrix) ? value * this.gridSize :
			(this.isRelative) ?  Math.round(value * this.width / 100) : value;
}

uiCanvas.prototype.yUnitToPixel = function(value) {
	return (this.isMatrix) ? value * this.gridSize :
			(this.isRelative) ?  Math.round(value * this.height / 100) : value;
}

uiCanvas.prototype.xPixelToUnit = function(value) {
	return (this.isMatrix) ? Math.floor(value / this.gridSize) :
			(this.isRelative) ?	Number((value * 100 / this.width).toFixed(4)) : value;
}

uiCanvas.prototype.yPixelToUnit = function(value) {
	return (this.isMatrix) ? Math.floor(value / this.gridSize) :
			(this.isRelative) ?	Number((value * 100 / this.height).toFixed(4)) : value;
}

uiCanvas.prototype.xPixelToPercent = function(value) {
	return Number((value * 100 / this.width).toFixed(4));
}

uiCanvas.prototype.yPixelToPercent = function(value) {
	return Number((value * 100 / this.height).toFixed(4));
}

uiCanvas.prototype.xRender = function(value) {
	return (this.isRelative) ? value + "%" :
			((this.isMatrix) ? value * this.gridSize : value) + "px";
}

uiCanvas.prototype.yRender = function(value) {
	return (this.isRelative) ? value + "%" :
			((this.isMatrix) ? value * this.gridSize : value) + "px";
}

uiCanvas.prototype.getSnapPixel = function(value, isTouchStart) {
	return (this.isSnap || this.isMatrix) ?
			(isTouchStart) ?
					Math.floor(value / this.gridSize) * this.gridSize :
					Math.ceil(value / this.gridSize) * this.gridSize : value;
}




/**
 * 이벤트 관련
 */

uiCanvas.prototype.getEventInfo = function(event, id, prevent) {
	const type = event.type;
	const isTouch = (type.indexOf("touch") > -1);
	const isTouchStart = (type == "mousedown" || type == "touchstart");
	if(isTouch) {
		if(prevent && event.cancelable) {
			event.preventDefault();
		}
		let e = event.changedTouches;
		let i = 0;
		if(id != undefined) {
			for(i = 0; i < e.length; i++)
				if(e[i].identifier == id) break;
			if(i == e.length) return;
		}
		e = event.changedTouches[i];
		event.x = event.clientX = e.clientX;
		event.y = event.clientY = e.clientY;
		event.id = e.identifier;
	} else {
		if(prevent) event.preventDefault();
		if(!(event.which == 1 || event.button == 0)) return;
		if(!event.x) event.x = event.clientX;
		if(!event.y) event.y = event.clientY;
	}
	if(isTouchStart) {
		if(event.target) {
			const rect = event.target.getBoundingClientRect();
			event.elementX = event.clientX - rect.x;
			event.elementY = event.clientY - rect.y;
		} else {
			return;
		}
	}
	return event;
}

uiCanvas.prototype.addEventListener = function(eventName, callback) {
	if(!this.eventListener[eventName])
		this.eventListener[eventName] = [];
	this.eventListener[eventName].push(callback);
}

uiCanvas.prototype.setEvent = function() {
	let eventInfo = {};
	const eventHandler = {
		touchStart : (event) => {
			event = this.getEventInfo(event);
			if(!event) return;

			let target = event.target;
			let x = event.elementX;
			let y = event.elementY;

			while(target) {
				if(target == event.currentTarget) break;
				x += target.offsetLeft;
				y += target.offsetTop;
				target = target.parentNode;
			}

			const isCanvas = (event.target == this.canvas || event.target.parentNode == this.canvas);
			const isResize = (event.target.tagName == "SPAN");

			eventInfo = {
				target : event.target,
				x : event.x,
				y : event.y,
				id : event.id,
				timestamp : Date.now(),
				offsetX : this.getSnapPixel(x, true),
				offsetY : this.getSnapPixel(y, true),
				vX : 0,
				vY : 0,
				selection : {
					x1 : x,
					y1 : y,
					x2 : x,
					y2 : y,
				},
				isShift : event.shiftKey,
				isCanvas : isCanvas,
				isResize : isResize
			}
			if(event.type == "mousedown") {
				document.onmousemove = eventHandler.touchMove;
				document.onmouseup = eventHandler.touchEnd;
			}
			(this.eventListener.touchStart || []).forEach(item => {
				item(eventInfo);
			});
		},
		touchMove : (event) => {
			event = this.getEventInfo(event, eventInfo.id);
			if(!event) return;
			let vX = event.x - eventInfo.x;
			let vY = event.y - eventInfo.y;

			let x1 = eventInfo.offsetX;
			let y1 = eventInfo.offsetY;
			let x2 = this.getSnapPixel(x1 + vX);
			let y2 = this.getSnapPixel(y1 + vY);

			if(x2 < x1) {
				const temp = x1;
				x1 = x2;
				x2 = temp;
			}
			if(y2 < y1) {
				const temp = y1;
				y1 = y2;
				y2 = temp;
			}
			if(x1 < 0) x1 = 0;
			if(y1 < 0) y1 = 0;
			if(x2 > this.width) x2 = this.width;
			if(y2 > this.height) y2 = this.height;

			eventInfo.selection = {
				x1 : x1,
				y1 : y1,
				x2 : x2,
				y2 : y2
			};
			eventInfo.vX = vX;
			eventInfo.vY = vY;

			(this.eventListener.touchMove || []).forEach(item => {
				item(eventInfo);
			});
		},
		touchEnd : (event) => {
			event = this.getEventInfo(event, eventInfo.id);
			if(!event) return;
			eventInfo.isChanged = (eventInfo.vX || eventInfo.vY);
			if(event.type == "mouseup") {
				document.onmousemove = document.onmouseup = null;
			}
			const isClick = (Date.now() - eventInfo.timestamp < 250);
			const eventList = ["touchEnd"];
			if(isClick) eventList.push("click");
			eventList.forEach(item => {
				(this.eventListener[item] || []).forEach(item => {
					item(eventInfo);
				});
			});
		}
	};

	this.canvas.addEventListener("touchstart", eventHandler.touchStart);
	this.canvas.addEventListener("touchmove", eventHandler.touchMove);
	this.canvas.addEventListener("touchend", eventHandler.touchEnd);
	this.canvas.addEventListener("mousedown", eventHandler.touchStart);
}

uiCanvas.prototype.setEventItem = function() {
	let positionSelectionList = [];
	let historySelectionList = [];
	let minX, minY, maxX, maxY;
	let isVirgin = false;

	const eventHandler = {
		touchStart : (eventInfo) => {
			if(eventInfo.isCanvas) return;

			historySelectionList = JSON.parse(JSON.stringify(this.selectionList));
			positionSelectionList = this.selectionList.map(item => {
				return {
					left : this.xUnitToPixel(item.left),
					top : this.yUnitToPixel(item.top),
					width : this.xUnitToPixel(item.width),
					height : this.yUnitToPixel(item.height)
				};
			});
			minX = Math.min(...positionSelectionList.map(item => item.left));
			minY = Math.min(...positionSelectionList.map(item => item.top));
			maxX = Math.max(...positionSelectionList.map(item => item.left + item.width));
			maxY = Math.max(...positionSelectionList.map(item => item.top + item.height));
		},
		touchMove : (eventInfo) => {
			if(eventInfo.isCanvas) return;

			let vX = eventInfo.vX;
			let vY = eventInfo.vY;

			if(maxX + vX > this.width) vX = this.width - maxX;
			if(maxY + vY > this.height) vY = this.height - maxY;

			this.selectionList.forEach((itemInfo, index) => {
				if(eventInfo.isResize) {
					let width = positionSelectionList[index].width + vX;
					let height = positionSelectionList[index].height + vY;
					width = this.getSnapPixel(width);
					height = this.getSnapPixel(height);
					itemInfo.node.style.width = (this.isRelative) ?
							this.xPixelToPercent(width) + "%" : width + "px";
					itemInfo.node.style.height = (this.isRelative) ?
							this.yPixelToPercent(height) + "%" : height + "px";
					itemInfo.width = this.xPixelToUnit(width);
					itemInfo.height = this.yPixelToUnit(height);
				} else {
					if(minX + vX < 0) vX = -minX;
					if(minY + vY < 0) vY = -minY;
					let left = positionSelectionList[index].left + vX;
					let top = positionSelectionList[index].top + vY;
					left = this.getSnapPixel(left);
					top = this.getSnapPixel(top);
					itemInfo.node.style.left = (this.isRelative) ?
							this.xPixelToPercent(left) + "%" : left + "px";
					itemInfo.node.style.top = (this.isRelative) ?
							this.yPixelToPercent(top) + "%" : top + "px";
					itemInfo.left = this.xPixelToUnit(left);
					itemInfo.top = this.yPixelToUnit(top);
				}
			});
			if(this.selectionList.length == 1) {
				(this.eventListener.changeSelection || []).forEach(callback => {
					callback(true);
				});
			}
		},
		touchEnd : (eventInfo) => {
			if(eventInfo.isCanvas) return;
			if(eventInfo.isChanged) {
				this.pushHistory("update", historySelectionList);
			}
		},
		click : (eventInfo) => {
			this.createSelection(eventInfo);
			if(this.selectionList.length == 1 && historySelectionList.length == 1) {
				const oldSelectionInfo = historySelectionList[0];
				const newSelectionInfo = this.selectionList[0];
				if(newSelectionInfo.sequence == oldSelectionInfo.sequence) {
					if(newSelectionInfo.eventName) {
						uiToast("클릭 이벤트 : " + newSelectionInfo.eventName);
					}
				}
			}
		}
	};
	["touchStart", "touchMove", "touchEnd", "click"].forEach(item => {
		this.addEventListener(item, eventHandler[item]);
	});
}

uiCanvas.prototype.setEventSelection = function() {
	const div = this.selectionInfo.node =
		document.createElement("div");
	div.className = "selection";
	this.canvas.appendChild(div);

	const eventHandler = {
		touchStart : (eventInfo) => {
			if(!eventInfo.isCanvas) return;
			if(!eventInfo.isShift) this.removeSelection();

			div.style.left = eventInfo.offsetX + "px";
			div.style.top = eventInfo.offsetY + "px";
			this.selectionInfo.width = this.selectionInfo.height =
				div.style.width = div.style.height = 0;
			this.selectionInfo.left = eventInfo.offsetX;
			this.selectionInfo.top = eventInfo.offsetY;
		},
		touchMove : (eventInfo) => {
			if(!eventInfo.isCanvas) return;
			div.classList.add("focus");
			const selectionInfo = eventInfo.selection;
			const left = this.selectionInfo.left = selectionInfo.x1;
			const top = this.selectionInfo.top = selectionInfo.y1;
			const width = this.selectionInfo.width = selectionInfo.x2 - selectionInfo.x1;
			const height = this.selectionInfo.height = selectionInfo.y2 - selectionInfo.y1;
			div.style.left = left + "px";
			div.style.top = top + "px";
			div.style.width = width + "px";
			div.style.height = height + "px";
		},
		touchEnd : (eventInfo) => {
			if(!eventInfo.isCanvas) return;
			this.createSelection(eventInfo);
			div.classList.remove("focus");
			(this.eventListener.selectionEnd || []).forEach(item => {
				item(this.selectionInfo);
			});
		}
	};
	["touchStart", "touchMove", "touchEnd"].forEach(item => {
		this.addEventListener(item, eventHandler[item]);
	});
}




/**
 * 아이템 선택 관련
 */

uiCanvas.prototype.createSelection = function(eventInfo) {
	const isEmpty = (!this.selectionList.length);
	let oldSelectionList = this.selectionList;

	this.removeSelection();

	if(typeof eventInfo == "number") {
		this.selectionList = [this.getItemInfo(eventInfo)];
	} else {
		let newSelectionList = this.getSelectionItemList(eventInfo);
		if(eventInfo.isShift && !isEmpty) {
			const duplicateList = oldSelectionList.filter(item => {
				const sequence = item.sequence;
				return newSelectionList.some(item => (item.sequence == sequence));
			}).map(item => {
				return item.sequence;
			});
			newSelectionList = newSelectionList.filter(item => {
				return (duplicateList.indexOf(item.sequence) == -1);
			});
			oldSelectionList = oldSelectionList.filter(item => {
				return (duplicateList.indexOf(item.sequence) == -1);
			});
			this.selectionList = [].concat(oldSelectionList, newSelectionList);
		} else {
			this.selectionList = newSelectionList;
		}
	}

	this.selectionList.forEach(item => {
		if(item.node) {
			item.node.classList.add("focus");
		}
	});

	const length = this.selectionList.length;
	this.canvas.classList.remove("multiple");
	if(length > 1) this.canvas.classList.add("multiple");

	(this.eventListener.changeSelection || []).forEach(callback => {
		callback();
	});
}

uiCanvas.prototype.removeSelection = function() {
	this.selectionInfo.node.className = "selection";
	this.itemList.forEach(item => {
		item.node.classList.remove("focus");
	});
	this.selectionList = [];

	(this.eventListener.changeSelection || []).forEach(callback => {
		callback();
	});
}

uiCanvas.prototype.getSelectionItemList = function(eventInfo) {
	const selectionInfo = eventInfo.selection;
	let x1 = this.xPixelToUnit(selectionInfo.x1);
	let y1 = this.yPixelToUnit(selectionInfo.y1);
	let x2 = this.xPixelToUnit(selectionInfo.x2);
	let y2 = this.yPixelToUnit(selectionInfo.y2);

	if(this.isMatrix) {
		if(x1 < x2) x2--;
		if(y1 < y2) y2--;
	}

	const itemList = this.itemList.filter(item => {
		if(this.isMatrix) {
			return ((
				(item.left <= x1 && x1 < item.left + item.width) ||
				(item.left <= x2 && x2 < item.left + item.width) ||
				(x1 <= item.left && item.left <= x2) ||
				(x1 < item.left + item.width && item.left + item.width < x2)
			) && (
				(item.top <= y1 && y1 < item.top + item.height) ||
				(item.top <= y2 && y2 < item.top + item.height) ||
				(y1 <= item.top && item.top <= y2) ||
				(y1 < item.top + item.height && item.top + item.height < y2)
			));
		} else {
			return ((
				(item.left <= x1 && x1 <= item.left + item.width) ||
				(item.left <= x2 && x2 <= item.left + item.width) ||
				(x1 <= item.left && item.left <= x2) ||
				(x1 <= item.left + item.width && item.left + item.width <= x2)
			) && (
				(item.top <= y1 && y1 <= item.top + item.height) ||
				(item.top <= y2 && y2 <= item.top + item.height) ||
				(y1 <= item.top && item.top <= y2) ||
				(y1 <= item.top + item.height && item.top + item.height <= y2)
			));
		}
	});
	const itemInfo = itemList[itemList.length - 1];
	return (x1 == x2 && y1 == y2) ? (itemInfo) ? [itemInfo] : [] : itemList;
}




/**
 * 히스토리 관련
 */

uiCanvas.prototype.pushHistory = function(type, itemList) {
	this.historyList.push({
		type : type,
		data : JSON.parse(JSON.stringify(itemList))
	});
	const count = this.historyList.length - 20;
	if(count > 0) {
		this.historyList.slice(count);
	}
}

uiCanvas.prototype.popHistory = function() {
	const historyInfo = this.historyList.pop();
	if(!historyInfo) return;

	if(historyInfo.type == "update") {
		historyInfo.data.forEach(itemInfo => {
			delete itemInfo.node;
			const index = this.getItemIndex(itemInfo.sequence);
			this.itemList[index] = Object.assign(this.itemList[index], itemInfo);
			this.renderItem(itemInfo.sequence);
		});
	} else if(historyInfo.type == "remove") {
		historyInfo.data.forEach(itemInfo => {
			this.createItem(itemInfo);
		});
	}
}



/**
 * 아이템 관련
 */

uiCanvas.prototype.createItem = function(itemInfo) {
	if(!itemInfo) return;

	const sequence = itemInfo.sequence = this.sequence;
	this.sequence += 1;

	const div = itemInfo.node = document.createElement("div");
	div.className = "item";

	div.innerHTML = (this.isTemplate) ? this.template : `
		<div>
			<button>
				<img class="backgroundImage" src="" />
				<img class="activeBackgroundImage" src="" />
			</button>
			<p></p>
			<iframe src=""></iframe>
			<label></label>
		</div>
		<span></span>
	`;
	this.canvas.appendChild(div);
	this.itemList.push(itemInfo);
	this.itemInfo = {};
	this.renderItem(sequence);
	this.removeSelection();
	return itemInfo.sequence;
}


uiCanvas.prototype.createItemList = function(itemList) {
	itemList.forEach(item => this.createItem(item));
}

uiCanvas.prototype.removeItem = function(itemInfo) {
	if(!itemInfo || itemInfo.isReserved) return;
	const node = itemInfo.node;
	node.parentNode.removeChild(node);
	this.itemList = this.itemList.filter(item => {
		return (item.sequence != itemInfo.sequence);
	});
}

uiCanvas.prototype.removeItemList = function() {
	this.pushHistory("remove", this.selectionList);
	this.selectionList.forEach(itemInfo => {
		this.removeItem(itemInfo);
	});
	this.removeSelection();
}

uiCanvas.prototype.getItemInfo = function(sequence) {
	return (sequence) ? this.itemList.filter(item => {
		return (item.sequence == sequence);
	})[0] : this.itemInfo;
}

uiCanvas.prototype.getItemIndex = function(sequence) {
	for(let i = 0; i < this.itemList.length; i++) {
		if(this.itemList[i].sequence == sequence)
			return i;
	}
}




/**
 * 랜더링 관련
 */

uiCanvas.prototype.renderItem = function(sequence) {
	const itemList = (sequence) ? (Array.isArray(sequence)) ? sequence : [this.getItemInfo(sequence)] : this.selectionList;

	itemList.forEach(itemInfo => {
		const node = itemInfo.node;
		if(!node) return;

		const isFocus = node.classList.contains("focus");
		node.className = (isFocus) ? "item focus" : "item";

		node.style.left = this.xRender(itemInfo.left);
		node.style.top = this.yRender(itemInfo.top);
		node.style.width = this.xRender(itemInfo.width);
		node.style.height = this.yRender(itemInfo.height);

		if(!this.isTemplate) {
			const div = node.querySelector("div");
			const type = div.className = (itemInfo.type || "").toLowerCase();

			if(type == "button" || type == "image") {
				const imgList = node.querySelectorAll("img");
				imgList[0].src = itemInfo.backgroundImage || "";
				imgList[0].className = (itemInfo.backgroundImage) ? "focus" : "";
				imgList[1].src = itemInfo.activeBackgroundImage || "";
				imgList[1].className = (itemInfo.activeBackgroundImage) ? "focus" : "";
			}

			if(type == "text" || type == "textarea") {
				const p = node.querySelector("p");
				const fontSize = (itemInfo.fontSize || "").toLowerCase() || "normal";
				const fontColor = (itemInfo.fontColor || "").toLowerCase() || "black";
				p.className = fontSize + " " + fontColor;

				let value = itemInfo.value || "";
				if(type == "textarea") value = value.replace(/\n/g, "<br>");
				p.innerHTML = value;
			}

			if(type == "iframe") {
				const iframe = node.querySelector("iframe");
				iframe.src = itemInfo.value || "";
				iframe.className = (itemInfo.value) ? "focus" : "";
			}

			const label = node.querySelector("label");
			const eventName = itemInfo.eventName || "";
			let text = itemInfo.type || "";
			if(eventName) {
				text = (eventName.indexOf("KEYPAD") > -1) ? eventName : text + " : " + eventName;
			}
			label.innerHTML = text;
		} else {
			for(let name in itemInfo) {
				const value = itemInfo[name];
				const target = node.querySelector("[data-name='" + name + "']");
				if(target) {
					const tagName = target.tagName.toLowerCase();
					if(tagName == "img" || tagName == "iframe") {
						target.src = value
						target.className = (value) ? "focus" : "";
					} else {
						target.innerHTML = value;
					}
				}
			}
			if(this.callback) this.callback(itemInfo);
		}
	});
}
