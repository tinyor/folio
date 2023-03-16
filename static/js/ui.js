window.addEventListener("DOMContentLoaded", function() {
	uiCalendar();
	uiClock();
	uiSelect();
	uiInput();
	uiTable();
	if(typeof doReady == "function") doReady();
});





function uiPopup(object) {
	const body = document.body || document.documentElement;

	if(!uiPopup.queue) uiPopup.queue = [];

	if(!object) {
		const popup = uiPopup.queue.pop();
		if(!popup) return;
		popup.classList.remove("focus");
		if(object == undefined) {
			setTimeout(function(){
				popup.parentNode.removeChild(popup);
			}, 300);
		} else {
			popup.parentNode.removeChild(popup);
		}
		body.parentNode.style.overflowY = "auto";
		return;
	}

	const isFrame = (object.src);

	const div = (object.isRefresh) ? object.container : document.createElement("div");
	if(isFrame) {
		uiPopup.queue.forEach(item => {
			uiPopup();
		});
		const getTop = () => {
			return (object.template) ? object.template : `
				<div class="top">
					<h2>
						${object.title || ""}
						<a data-event="close"></a>
					</h2>
				</div>
			`;
		};
		div.innerHTML = `
			<div>
				<div>
					<div>
						${getTop()}
						<div class="middle">
							<iframe src="${object.src}"></iframe>
						</div>
					</div>
				</div>
			</div>
		`;
		const a = div.querySelector(".top [data-event='close']");
		if(a) {
			a.onclick = () => {
				if(object.callback) object.callback();
				uiPopup();
			};
		}
		const iframe = div.querySelector("iframe");
		iframe.addEventListener("load", function() {
			const iframe = this.contentWindow.document;
			const src = iframe.location.pathname;
			const ul = div.querySelector(".top ul");
			if(ul) {
				const a = ul.querySelectorAll("a");
				a.forEach(item => {
					const href = item.getAttribute("data-href");
					item.parentNode.className = (href == src) ? "focus" : "";
					item.onclick = () => {
						iframe.location.href = href;
					};
				});
			}
			const body = iframe.querySelector("body");
			body.classList.add("iframe");
		});
	} else {
		div.innerHTML = (object.target) ?
			`<span data-event="close"></span>${object.template}` : `<div><div>${object.template}</div></div>`;
	}
	if(object.scroll == false)
		body.parentNode.style.overflowY = "hidden";

	if(!object.isRefresh) {
		div.className = (object.target) ? "ui-popup-custom" : "ui-popup";
		if(isFrame) div.classList.add("iframe");

		body.appendChild(div);
		uiPopup.queue.push(div);

		if(object.target) {
			div.className = "ui-popup-custom";
			const popup = div.querySelector("div");
			const span = div.querySelector("span");

			const target = object.target;
			const rect = target.getBoundingClientRect();

			const body = document.querySelector("body");

			const screenWidth = document.documentElement.clientWidth || document.body.clientWidth;
			const screenHeight = document.documentElement.clientHeight || document.body.clientHeight;
			const scrollHeight = document.documentElement.scrollHeight || document.body.scrollHeight;
			const scrollTop = Math.max(document.documentElement.scrollTop, document.body.scrollTop);
			const scrollLeft = Math.max(document.documentElement.scrollLeft, document.body.scrollLeft);

			const left = (scrollLeft + rect.left - ((popup.offsetWidth - rect.width) / 2));
			const top = (scrollTop + rect.top + rect.height);
			popup.style.left = left + "px";
			popup.style.top = top + "px";

			if((top + popup.offsetHeight + 10) > scrollHeight) {
				popup.style.marginTop = (rect.height + popup.offsetHeight + 1) * -1 + "px";
			}
		}

		setTimeout(function() {
			div.classList.add("focus");
		}, 100);
	}


	if(object.beforeEvent) {
		object.beforeEvent(div);
	}

	const events = object.event;
	for(const event in events) {
		const items = events[event];
		for(let item in items) {
			const node = div.querySelectorAll("[data-event='" + item + "']");
			const callback = items[item];
			node.forEach(function(item) {
				item.addEventListener(event, callback);
			});
		}
	}

	return div;
}

function uiConfirm(object) {
	if(!uiConfirm.queue) uiConfirm.queue = [];

	if(typeof object == "boolean") {
		const popup = uiConfirm.queue.pop();
//		if(object) {
		if(popup.callback) popup.callback(object);
//		}
		popup.container.parentNode.removeChild(popup.container);
		return;
	}

	const body = document.body || document.documentElement;
	const div = document.createElement("div");
	const data = {
		container	: div,
		title		: (object.title) ? "<h4>" + object.title + "</h4>" : "",
		contents	: (object.contents) ? object.contents : "",
		button		: {
			ok		: (object.ok) ? object.ok : "확인",
			cancel	: (object.cancel) ? object.cancel : "취소",
			color	: (object.color) ? object.color : ""
		},
		callback	: object.callback,
	};

	const template = `
		<span onclick="uiConfirm(false)"></span>
		<div>
			<div>
				<div class="box">
					<h4>${data.title}</h4>
					<p>${data.contents}</p>
					<button class="ui-button ${data.button.color}" onclick="uiConfirm(true)">${data.button.ok}</button>
					<button class="ui-button gray" onclick="uiConfirm(false)">${data.button.cancel}</button>
				</div>
			</div>
		</div>
	`;

	div.className = "ui-popup ui-confirm focus";
	div.innerHTML = template;
	body.appendChild(div);
//	div.querySelector("button").focus();
	uiConfirm.queue.push(data);
}

function uiAlert(object) {
	if(!uiAlert.queue) uiAlert.queue = [];
	if(typeof object == "string") object = {contents : object};

	if(typeof object == "boolean") {
		const popup = uiAlert.queue.pop();
		if(popup.focus) popup.focus.focus();
		popup.container.parentNode.removeChild(popup.container);
		return;
	}

	const body = document.body || document.documentElement;
	const div = document.createElement("div");
	const data = {
		container	: div,
		title		: (object.title) ? "<h4>" + object.title + "</h4>" : "",
		contents	: (object.contents) ? object.contents : "",
		button		: {
			ok		: (object.ok) ? object.ok : "확인",
			color	: (object.color) ? object.color : ""
		},
		focus		: object.focus,
	};

	const template = `
		<span onclick="uiAlert(false)"></span>
		<div>
			<div>
				<div class="box">
					<h4>${data.title}</h4>
					<p>${data.contents}</p>
					<button class="ui-button ${data.button.color}" onclick="uiAlert(false)">${data.button.ok}</button>
				</div>
			</div>
		</div>
	`;

	div.className = "ui-popup ui-alert focus";
	div.innerHTML = template;
	body.appendChild(div);
	div.querySelector("button").focus();
	uiAlert.queue.push(data);
}

function uiToast(message, option) {
	const body = document.body || document.documentElement;

	const div = document.createElement("div");
	div.className = "ui-toast";
	div.innerHTML = message;

	const close = function() {
		if(div) div.classList.remove("focus");
		setTimeout(() => {
			try {
				body.removeChild(div);
			} catch(error) {}
		}, 400)
	};

	if(option) {
		for(let name in option) {
			const value = option[name];
			if(typeof value == "number") {
				if(name == "top") div.style.bottom = "auto";
				else if(name == "bottom") div.style.top = "auto";
				div.style[name] = value + "px";
			} else {
				div.classList.add(option[name]);
			}
		}
		if(option.button) {
			div.classList.add("close");
			const a = document.createElement("a");
			a.className = "close";
			a.addEventListener("click", close);
			div.appendChild(a);
		}
	}

	const duration = (option && option.duration) ? option.duration || 2000 : 2000;

	body.appendChild(div);
	setTimeout(() => {
		if(div) div.classList.add("focus");
		setTimeout(close, duration);
	}, 100);
}




function uiInput(object) {
	if(!object) object = document;

	// 엔터 시 다음 입력창으로 이동
	const setEnter = function() {
		const target = "[tabIndex], [tabindex]";
		const nodeList = object.querySelectorAll(target);
		const nextItem = function(event) {
			event = event || window.event;
			if(event.keyCode != 13) return;

			const nodeList = object.querySelectorAll(target);
			const length = nodeList.length;
			for(var i = 0; i < length; i++)
				if(nodeList[i] == event.target) break;
			for(var j = i; j < length; j++) {
				if(nodeList[j + 1] && !nodeList[j + 1].disabled) {
					nodeList[j + 1].focus();
					break;
				}
			}
		};
		for(let i = 0; i < nodeList.length; i++) {
			const item = nodeList[i];
			if(nodeList[i + 1])
				item.addEventListener("keypress", nextItem);
		}
	};

	// 최소값 최대값 설정
	const setMinMax = function(item, isComma) {
		const maxlength = item.getAttribute("maxlength");
		const min = item.getAttribute("min");
		const max = item.getAttribute("max");
		const preventMinus = (item) => {
			item.addEventListener("keydown", function(event) {
				event = event || window.event;
				const keyCode = event.keyCode || event.which;
				if(keyCode == 109 || keyCode == 189) {
					event.preventDefault();
					event.returnValue = false;
					return false;
				}
			});
		};
		if(maxlength != null) {
			item.addEventListener("keyup", function(event) {
				event = event || window.event;
				const maxlength = Number(this.getAttribute("maxlength"));
				if(this.value.length >= maxlength)
					this.value = this.value.substr(0, maxlength);
			});
		}
		if(min != null || max != null) {
			if(min == 0)
				preventMinus(item);
			item.addEventListener("change", function(event) {
				event = event || window.event;
				let value = (this.value == "") ? "" : getNumber(this.value);
				if(value == "") return;
				const min = this.getAttribute("min");
				const max = this.getAttribute("max");
				if(min != null && value <= Number(min))
					value = min;
				if(max != null && Number(max) <= value)
					value = max;
				this.value = (isComma) ? getComma(value) : value;
			});
		}
	};

	// 통화 타입인 경우
	const setCurrency = function() {
		const target = "input[type=currency]";
		const nodeList = object.querySelectorAll(target);
		nodeList.forEach(item => {
			item.addEventListener("keydown", function(event) {
				const keyCode = event.keyCode || event.which;
				const isCommand = event.ctrlKey || event.altKey || event.shiftKey;
				const isControl = ((keyCode < 48 && keyCode != 32)) ? true : false;
				const isNumber = ((48 <= keyCode && keyCode <= 57) || (96 <= keyCode && keyCode <= 105)) ? true : false;
				const selectionLength = getNumber(this.selectionEnd) - getNumber(this.selectionStart);
				const isMinus = ((this.selectionEnd == 0 || selectionLength == this.value.length) && (keyCode == 109 || keyCode == 189));

				uiInput.data = {
					keyCode : keyCode,
					isNumber : isNumber,
					isCommand : isCommand,
					isControl : isControl,
					selectionEnd : this.selectionEnd,
					length : item.value.length,
					numberLength : item.value.replace(/[^0-9]/g, "").length,
					commaLength : item.value.replace(/[^\,-]/g, "").length
				};

				if(!isMinus && !isNumber && !isControl && !isCommand) {
					event.returnValue = (isMinus || isControl || isNumber) ? true : false;
					event.preventDefault();
					return event;
				}
			});
			item.addEventListener("keyup", function(event) {
				const data = uiInput.data;
				if(!data) return;
				const newValue = (this.value == "-") ? "-" : getComma(getNumber(this.value));
				const diffNumber = newValue.replace(/[^0-9]/g, "").length - data.numberLength;
				const diffComma = newValue.replace(/[^\,-]/g, "").length - data.commaLength;
				if(!this.value || newValue.substr(0, 1) == "0") return;
				if(data.isControl && data.length == this.value.length) return;
				this.value = newValue;
				const number = diffNumber + diffComma + ((data.keyCode == 46) ? 1 : 0);
				this.setSelectionRange(data.selectionEnd + number, data.selectionEnd + number);
			});
			item.addEventListener("paste", function() {
				if(this.value) this.value = getComma(getNumber(this.value) || 0);
			});
			item.addEventListener("change", function() {
				if(this.value) {
					let value = getNumber(this.value) || 0;
					if(!Number.isInteger(value)) value = 0;
					this.value = getComma(value);
				}
			});
			item.type = "text";
			item.value = getComma(item.value);
			setMinMax(item, true);
			setPaste(item);
		});
	};

	// 정수 체크
	const checkInteger = (item) => {
		const min = item.getAttribute("min");
		item.addEventListener("keydown", function(event) {
			event = event || window.event;
			const keyCode = event.keyCode || event.which;
			const isCommand = event.ctrlKey || event.altKey || event.shiftKey;
			const isControl = ((keyCode < 48 && keyCode != 32)) ? true : false;
			const isNumber = ((48 <= keyCode && keyCode <= 57) || (96 <= keyCode && keyCode <= 105)) ? true : false;
			const isMinus = ((keyCode == 109 || keyCode == 189));
			if(!(isCommand || isControl || isNumber || (min != "0" && isMinus))) {
				event.returnValue = false;
				event.preventDefault();
				return false;
			}
		});
		item.addEventListener("blur", function(event) {
			this.value = (this.value) ? getNumber(this.value) : "";
		});
	};

	const setPaste = (item) => {
		item.addEventListener("paste", function(event) {
			event = event || window.event;
			let text = "";
			if(window.clipboardData && window.clipboardData.getData) {
				text = window.clipboardData.getData("Text");
			} else if (event.clipboardData && event.clipboardData.getData) {
				text = event.clipboardData.getData("text/plain");
			}
			const min = item.getAttribute("min");
			const number = text.toString().replace(/[^-+.,0-9]/gi,"");
			if(text != number || isNaN(getNumber(number)) || min && (Number(number) < Number(min))) {
				event.returnValue = false;
				event.preventDefault();
				return false;
			}
		});
	};

	// 정수 타입인 경우
	const setInteger = function() {
		const nodeList = object.querySelectorAll("input[type='integer']");
		nodeList.forEach(item => {
			item.setAttribute("type", "number");
			checkInteger(item);
		});
	};

	// 숫자 타입인 경우
	const setNumber = function() {
		const nodeList = object.querySelectorAll("input[type='number']");
		nodeList.forEach(item => {
			setPaste(item);
			setMinMax(item);
			const isInteger = (item.getAttribute("isInteger") == "true");
			if(isInteger)
				checkInteger(item);
		});
	};

	// 계좌 타입인 경우
	const setAccount = function() {
		const nodeList = object.querySelectorAll("input[type='account']");
		nodeList.forEach(item => {
			item.setAttribute("type", "text");
			item.addEventListener("keydown", function(event) {
				event = event || window.event;
				const keyCode = event.keyCode || event.which;
				const isCommand = event.ctrlKey || event.altKey || event.shiftKey;
				const isControl = ((keyCode < 48 && keyCode != 32)) ? true : false;
				const isNumber = ((48 <= keyCode && keyCode <= 57) || (96 <= keyCode && keyCode <= 105)) ? true : false;
				const isMinus = ((keyCode == 109 || keyCode == 189));
				if(!(isCommand || isControl || isNumber || isMinus)) {
					event.returnValue = false;
					event.preventDefault();
					return false;
				}
			});
			item.addEventListener("change", function(event) {
				const value = this.value.split("-");
				const valueList = [];
				value.forEach(item => {
					if(item && isNumber(item))
						valueList.push(item);
				});
				this.value = valueList.join("-");
			});
		});
	};

	// 검색 타입인 경우
	const setSearch = function() {
		const target = ".ui-input-search input";
		const nodeList = object.querySelectorAll(target);

		nodeList.forEach(item => {
			item.addEventListener("keypress", function(event) {
				event = event || window.event;
				if(event.keyCode != 13 || !item.value) return;
				item.blur();
				item.parentNode.querySelector("button").click();
			});
		});
	};

	// 이모지(4바이트) 입력 방지
	const setEmoji = function() {
		const nodeList = object.querySelectorAll("input:not([emoji]), textarea:not([emoji]), [emoji='false']");
		const regex = /[\u{10000}-\u{10FFFF}]/gu;
		const removeEmoji = function(event) {
			try {
				const text = this.value || "";
				if(text.match(regex)) {
					this.value = this.value.replace(regex, "");
					uiToast("입력할 수 없는 이모지 문자를 삭제하였습니다.")
				}
			} catch(error) {
				console.log(error);
			}
		};
		nodeList.forEach(item => {
			// item.addEventListener("blur", removeEmoji, true);
			item.addEventListener("change", removeEmoji, true);
			/*
			item.addEventListener("paste", function(event) {
				try {
					let text = "";
					if(window.clipboardData && window.clipboardData.getData) {
						text = window.clipboardData.getData("Text") || "";
					} else if (event.clipboardData && event.clipboardData.getData) {
						text = event.clipboardData.getData("text/plain") || "";
					}
					if(text.match(regex)) {
						uiToast("입력할 수 없는 이모지 문자가 포함되어 있어 있습니다.")
						event.returnValue = false;
						event.preventDefault();
						return false;
					}
				} catch(error) {
					console.log(error);
				}
			});
			*/
		});
	};

	setEnter();
	setCurrency();
	setInteger();
	setNumber();
	setAccount();
	setSearch();
	setEmoji();
}





function uiSelect(object, option) {
	const prepareRender = function(oldNode) {
		const div = document.createElement("div");
		div.innerHTML = '<label class="ui-select"><select></select><div></div><ul></ul></label>';
		const cloneNode = oldNode.cloneNode(true);
		// cloneNode.removeAttribute("multiple");
		cloneNode.removeAttribute("custom");
		const select = div.querySelector("select");
		select.parentNode.replaceChild(cloneNode, select);
		const newNode = div.children[0];
		oldNode.parentNode.replaceChild(newNode, oldNode);
		return newNode;
	};

	const render = function(oldNode) {
		const isMultiple = oldNode.multiple;

		const container = prepareRender(oldNode);
		const select = container.querySelector("select");
		const div = container.querySelector("div");
		const ul = container.querySelector("ul");

		const optionList = select.querySelectorAll("option");
		const optionName = select.name + "-option";
		const li = [];

		optionList.forEach((item, index) => {
			const isSelected = (item.getAttribute("selected") != null) ? true : false
//			const isChecked = (item.value && isSelected) ? "checked" : "";
			const isChecked = (isSelected) ? "checked" : "";
			let isEvent = item.getAttribute("data-event");
			isEvent = (isEvent) ? ' data-event="' + isEvent + '"' : '';
			let text = item.getAttribute("text");
			let className = item.getAttribute("class") || "";
			if(className) className = ' class="' + className + '"';

			text = (text) ? text : item.innerHTML;
			if(isMultiple)
				li.push('<li' + className + '><label class="ui-input-checkbox"><input name="' + optionName + '" type="checkbox" value="' + item.value + '" ' + isChecked + isEvent + '><span></span>' + text + '</label></li>');
			else
				li.push('<li' + className + '><label class="ui-input-hidden"><input name="' + optionName + '" type="radio" value="' + item.value + '" ' + isChecked + isEvent + '>' + text + '</label></li>');
		});
		ul.innerHTML = li.join("");

		// 목록 클릭 시 이벤트 취소
		if(isMultiple) {
			ul.addEventListener("click", function(event) {
				event = event || window.event;
				event.stopPropagation();
			});
		}

		// 가상 셀렉터 클릭 시
		div.addEventListener("click", function(event) {
			event = event || window.event;
			event.preventDefault();
			event.stopPropagation();

			if(select.disabled) return;

			if(container.classList.contains("focus")){
				container.classList.remove("focus");
				return;
			}
			if(uiSelect.container)
				uiSelect.container.classList.remove("focus");
			uiSelect.container = container;

			container.classList.add("focus");
			window.addEventListener("click", function() {
				container.classList.remove("focus");
			}, {once : true});
		});

		// 실제 셀렉터와 가상 셀렉터 동기화
		const synchronize = function(isEvent, event) {
			const itemList = [];
			const valueList = [];
			const max = select.getAttribute("max");
			const input = ul.querySelectorAll("input:checked");
			if(max && input.length > Number(max)) {
				if(event.target)
					event.target.checked = false;
				return;
			}

			select.querySelectorAll("option").forEach(function(item, index) {
				if(index < 1) return;
				const checkItem = ul.querySelector("input[value='" + item.value + "']:checked");
				item.selected = (checkItem) ? true : false;
				if(checkItem) {
					item.setAttribute("selected", "");
					const text = item.getAttribute("text");
					if(checkItem) itemList.push((text) ? text : item.innerHTML);
					valueList.push(item.value);
				} else {
					item.removeAttribute("selected");
				}
			});
			select.setAttribute("data-value", valueList.join(","));
			/*
						if(isEvent == true) {
							const event = new Event("change");
							select.dispatchEvent(event);
						}
			*/
			const unit = select.getAttribute("data-unit") || "개";
			const length = itemList.length;
			const ellipsis = Number(select.getAttribute("data-ellipsis"));
			const getTitle = () => {
				if(length > 0) {
					if(ellipsis) {
						return (length > ellipsis) ? itemList.slice(0, ellipsis).join(", ") + " 외 " + (length - ellipsis) + unit : itemList.join(", ");
					} else {
						return (length > 2) ? length + unit + " 선택" : itemList.join(", ");
					}
				} else {
					return optionList[0].innerHTML;
				}
			};
			div.className = (length) ? "" : "blank";
			div.innerHTML = getTitle();
		};

		ul.querySelectorAll("input").forEach(function(item, index) {
			item.addEventListener("change", function(event) {
				synchronize((index == 0) ? false : true, event);
			});
		});
		synchronize(false);
	};

	if(!object) object = document;

	if(option == "reset") {
		const label = object.querySelectorAll("label.ui-select");
		label.forEach(item => {
			const select = item.querySelector("select");
			const option = item.querySelectorAll("option");
			option.forEach(item => {
				item.removeAttribute("selected");
			});
			const div = item.querySelector("div");
			select.value = "";
			select.setAttribute("data-value", "");
			div.className = "blank";
			div.innerHTML = select.options[0].innerHTML;
		});
	} else if(option == "update") {
		const label = object.querySelectorAll("label.ui-select");
		label.forEach(item => {
			const input = item.querySelector("input");
			const event = new Event("change");
			input.dispatchEvent(event);
		});
	} else {
		const nodeList = object.querySelectorAll("select[multiple], select[custom]");
		for(let node of nodeList)
			render(node);
	}
}





function uiTable(object) {
	if(!object) object = document;

	const setTable = function(object, value) {
		const nodeList = object.querySelectorAll(".ui-table");
		nodeList.forEach(item => {
			if(item.classList.contains("drop")) {
				const tbody = item.querySelector("tbody");
//				const tr = tbody.querySelectorAll(":scope > tr");
				const tr = Array.from(item.querySelectorAll("tbody > tr")).filter(item => {
					return (item.parentNode == tbody);
				});
				if(tr.length < 2) return;
				const active = function(index) {
					tr[index].classList.toggle("focus");
					tr[index + 1].classList.toggle("focus");
				};

				if(item.getAttribute("data-drop-event") != "false") {
					for(let i = 0; i < tr.length; i += 2) {
						if(value == "init" || tr[i].getAttribute("data-event") != "true") {
							tr[i].setAttribute("data-event", "true");
							tr[i].addEventListener("click", function(event) {
								event = event || window.event;
								const target = event.target;
								let node = target;
								for(let j = 0; j < 5; j++) {
									const tagName = node.tagName.toLowerCase();
									if(tagName == "th" || tagName == "td")
										if(node.classList.contains("prevent")) return;
									node = (node) ? node.parentNode : node;
								}
								const tagName =	target.tagName.toLowerCase();
								if(tagName == "th" || tagName == "a" || tagName == "button") return;
								active(i);
							}, true);

							const button = tr[i + 1].querySelectorAll("button[data-event=cancel]");
							button.forEach(item => {
								item.addEventListener("click", function() {
									active(i);
								});
							});
						}
					}
				}
			}

			if(item.classList.contains("checkbox")) {
				const container = item;
				const nodeList = container.querySelectorAll("tr");
				const inputList = container.querySelectorAll("th input");
				const length = nodeList.length - 1;
				const isCheckAll = (container.querySelector("thead th input"));
				nodeList.forEach((item, index) => {
					const input = item.querySelector("input");
					if(!input) return;

					const active = function(item) {
						const tr = item.parentNode.parentNode.parentNode;
						if(item.checked) tr.classList.add("focus");
						else tr.classList.remove("focus");
					};

					if(index > 0) {
						item.addEventListener("click", function(event) {
							event = event || window.event;
							const tagName =	event.target.tagName.toLowerCase();
							if(!(tagName == "th" || tagName == "td")) return;
							input.click();
						});
					} else {
						input.checked = false;
					}

					input.onchange = function() {
						if(index == 0) {
							const value = inputList[0].checked;
							inputList.forEach(item => {
								if(!item.disabled) {
									item.checked = value;
									active(item);
								}
							});
						}
						active(input);
						if(isCheckAll) {
							const tbody = container.querySelector("tbody");
							const checkList = tbody.querySelectorAll("th input:not([disabled])");
							const checkedList = tbody.querySelectorAll("th input:checked:not([disabled])");
							inputList[0].checked = (checkedList.length && checkList.length == checkedList.length) ? true : false;
						}
					};
				});
			}
		});
	};

	const setDataTable = function() {
		const nodeList = object.querySelectorAll(".ui-data-table");
		try {
			nodeList.forEach(item => {
				const td = item.querySelector("tbody tr td");
				if(td && getNumber(td.getAttribute("colspan")) > 0) {
					item.classList.remove("ui-data-table");
					item.classList.add("ui-table");
					return;
				}

				/* ******* DROP ******** */
				const removedTr = [];
				if(item.classList.contains("drop")) {
					const tbody = item.querySelector("tbody");
					const tr = tbody.querySelectorAll("tr");
					if(tr.length == 0) return;
					//	const nodeList = item.querySelectorAll(":scope > tbody > tr:nth-child(even)");
					const nodeList = Array.from(item.parentNode.querySelectorAll("tbody > tr:nth-child(even)")).filter(item => {
						return (item.parentNode == tbody);
					});
					nodeList.forEach((item, index) => {
						item.seqIndex = index;
						removedTr.push(item);
						item.parentNode.removeChild(item);
					});
				}

				/* ******* OPTION ******** */
				const option = {
					length : Number(item.getAttribute("data-table-length")) || 20,
					dom : item.getAttribute("data-table-dom") || "fltp",
					ordering : (item.getAttribute("data-table-ordering") == "true"),
					orderingIndex : item.getAttribute("data-table-ordering-index") || "",
					orderingType : item.getAttribute("data-table-ordering-type") || "",
					fixed : (item.getAttribute("data-table-header") == "fixed"),
					scrollX : item.getAttribute("data-table-scrollX"),
					scrollY : item.getAttribute("data-table-scrollY"),
					callback : item.getAttribute("data-table-callback"),
					export :  (item.getAttribute("data-table-export") == "true")
				};

				const disableList = [];
				item.querySelectorAll("thead th, thead td").forEach((item, index) => {
					const order = item.getAttribute("data-order");
					const isDisabled = (order && order == "false") ? true : false;
					if(isDisabled)
						disableList.push(index);
				});

				/* ******* AUTO ******** */
				if(item.classList.contains("auto")) {
					const pageLength = option.length;
					const dataLength = item.querySelectorAll("tbody tr").length;
					item.setAttribute("data-table-data-length", dataLength);
					if(pageLength && dataLength) {
						const td = Array.from(item.querySelector("thead tr").querySelectorAll("td")).map(item => {
							const className = (item.className) ? " class=\"" + item.className + "\"" : "";
							return "<td" + className + ">&nbsp;</td>";
						}).join("");
						const repeat = (dataLength % pageLength) ? pageLength - (dataLength % pageLength) : 0;
						const tr = [];
						for(let i = 0; i < repeat; i++)
							tr.push("<tr>" + td + "</tr>");
						item.querySelector("tbody").innerHTML += tr.join("");
					}
				}

				const orderList = [];
				if(option.orderingIndex) {
					const indexList = option.orderingIndex.split(",");
					const typeList = option.orderingType.split(",");
					indexList.forEach((item, index) => {
						const type = typeList[index] || "desc";
						orderList.push([Number(item), type]);
					});
				}

				/* ******* INIT ******** */
				const setting = {
					language: {
						url: "/static/json/jquery/datatables.default.json"
					},
					order : orderList,
					displayLength : option.length,
					lengthMenu : [10, 20, 30, 40, 50, 100],
					ordering : option.ordering,
					//				lengthChange : false,
					//				searching : fasle,
					paging : (option.dom.indexOf("p") == -1) ? false : true,
					//				info : false,
					//				scrollY :  scrollY,

					columnDefs : [{
						orderable : false,
						targets : disableList
					}],
					fixedHeader : {
						header : option.fixed,
						footer : option.fixed
					},
					dom : option.dom,
					createdRow : function(row, data, dataIndex) {
						row.setAttribute("data-index", dataIndex);
					},
					drawCallback : function() {
						if(!option.callback) return;
						try {
							popupMemberMicroProfile.close();
							eval(option.callback + "()");
						} catch(error) {
							console.log(error);
						}
					},
					callback : undefined
				};

				if(option.scrollX) setting.scrollX = option.scrollX;
				if(option.scrollY) setting.scrollY = option.scrollY;

				const setExportExcel = (dataTable, table) => {
					const div = table.parentNode.querySelector(".dataTables_filter");
					if(!div) return;
					const button = document.createElement("button");
					button.className = "ui-button excel green";
					button.innerHTML = "다운로드";
					div.appendChild(button);
					button.onclick = () => {
						try {
							/*
							const colList = [];
							Array.from(table.tHead.rows[0].cells).forEach(item => {
								const cellWidth = item.offsetWidth;
								if(!item.classList.contains("hidden"))
									colList.push({
										wpx : cellWidth
									});
							});
							const sheetStyle = {
								"!cols" : colList
							};
							 */
							const sheetName = table.getAttribute("data-table-export-title") || "";
							const fileName = table.getAttribute("data-table-export-filename") || "다운로드";
							const exportTable = table.cloneTable;
							uiExport.excel(table, table.cloneTable, sheetName, fileName);
							// uiExport.excel(sheetName, fileName, exportTable, sheetStyle);
						} catch(error) {
							alert("다운로드에 실패하였습니다.");
							console.log(error);
						}
					};
				};

				const cloneTable = item.cloneNode(true);
				const dataTable = $(item).DataTable(setting).on("init", function() {
					this.style.width = "100%";
					this.parentNode.querySelectorAll("select").forEach(item => {
						item.classList.add("ui-select");
					});
					dataTable.removedTr = removedTr;
					if(option.export)	{
						item.cloneTable = cloneTable;
						setExportExcel(dataTable, item);
					}

					if(item.classList.contains("sum")) {
						const dataLength = Number(this.getAttribute("data-table-data-length"));
						const dataList = dataTable.rows().data();

						const tdList = this.querySelectorAll("tfoot [data-index]");
						const yLength = dataList.length;
						const xLength = (dataList[0]) ? dataList[0].length : 0;
						const sumList = Array.from({length : xLength}, () => 0);
						if(yLength > 0 && tdList.length > 0) {
							for(let y = 0; y < yLength; y++) {
								for(let x = 0; x < xLength; x++) {
									const value = getNumber(dataList[y][x]);
									if(!isNaN(value)) sumList[x] += value;
								}
							}
							tdList.forEach(item => {
								const index = Number(item.getAttribute("data-index"));
								const type = item.getAttribute("data-type");
								if(type == "%") {
									const value = parseInt(sumList[index] / dataLength);
									item.innerHTML = value + type;
								} else {
									item.innerHTML = getComma(sumList[index]) + type;
								}
							});
						}
					}

					item.classList.add("ui-table");
					item.classList.remove("ui-data-table");

					setTable(this.parentNode, "init");
				}).on("draw", function() {
					const nodeList = this.parentNode.querySelectorAll("span .paginate_button");
					const paginate = this.parentNode.querySelector(".dataTables_paginate");
					if(paginate)
						paginate.style.display = (nodeList.length < 2) ? "none" : "block";
					const addTr = (dataTable.removedTr) ? dataTable.removedTr : removedTr;
					if(addTr.length > 0) {
						const page = dataTable.page.info();
						const tbody = this.querySelector("tbody");
						const tr = Array.from(this.querySelectorAll("tbody > tr")).filter(item => {
							return (item.parentNode == tbody);
						});
						tr.forEach((item, index) => {
							const seqIndex = Number(item.getAttribute("data-index"));
							// console.log("seqIndex : " + seqIndex, "pageIndex : " + (page.start + index));
							// page.start + index;
							const td = addTr.filter(item => {
								return (item.seqIndex == seqIndex);
							})[0] || addTr[seqIndex];
							item.parentNode.insertBefore(td, item.nextSibling);
						});
					}
					setTable(this.parentNode, "draw");

					Array.from(this.querySelectorAll("tbody > tr")).forEach(item => {
						const td = item.querySelector("td");
						if(td.innerHTML == "&nbsp;")
							item.classList.add("none");
					});
				});
			});
		} catch(e) {
			console.log(e);
		}
	};

	setTable(object);
	setDataTable(object);
}





function uiCalendar(object, value) {
	// 사용된 공통 함수 : getCalendar, isDate
	const popup = {
		container : undefined,
		popup : undefined,
		timer : undefined,
		value : undefined,
		isPopup : undefined,
		isMultiple : undefined,
		callback : undefined,
		date : undefined,
		minDate : undefined,
		maxDate : undefined,
		mode : undefined,

		open : function(isPopup) {
			if(isPopup == false) {
				const div = document.createElement("div");
				div.className = "ui-calendar focus";
				this.popup = div;
				this.isPopup = false;
				if(this.isMultiple == true) {
					const input = this.container.querySelector("input");
					let value = input.getAttribute("data-value");
					value = (value) ? value.split(",") : [];
					value.filter(item => {
						return isDate(item);
					}).map(item => {
						return getCalendar(new Date(item));
					});
					this.value = value;
				}
				return this.render();
			};

			const self = popup;
			const container = this.parentNode;
			self.value = this.value;
			self.isPopup = true;
			self.isMultiple = (this.getAttribute("multiple") != null) ? true : false;
			self.mode = this.getAttribute("mode");
			self.minDate = this.getAttribute("minDate") || "1900-01-01";
			self.maxDate = this.getAttribute("maxDate") || "2040-12-31";

			if(self.popup) {
				clearTimeout(self.timer);
				self.container.classList.remove("focus");
				self.popup.parentNode.removeChild(self.popup);
				self.popup = undefined;
			}

			const rect = this.getBoundingClientRect();

			const body = document.querySelector("body");
			const screenWidth = document.documentElement.clientWidth;
			const screenInnerWidth = document.body.clientWidth || screenWidth;
			const screenHeight = document.documentElement.clientHeight;
			const marginLeft = (screenWidth > screenInnerWidth) ? parseInt((screenWidth - screenInnerWidth) / 2) : 0;
			const scrollHeight = document.documentElement.scrollHeight || document.body.scrollHeight;
			const scrollTop = Math.max(document.documentElement.scrollTop, document.body.scrollTop);
			const scrollLeft = Math.max(document.documentElement.scrollLeft, document.body.scrollLeft);
			// const scrollTop = 0;

			let div = document.createElement("div");
			div.className = "ui-calendar";
			div.style.left = (scrollLeft + rect.left - marginLeft) + "px";
			div.style.top = (scrollTop + rect.top + rect.height) + "px";
			// console.log((scrollLeft + rect.x), (scrollTop + rect.y + rect.height));

			div.addEventListener("click", function(event) {
				event = event || window.event;
				event.preventDefault();
				event.stopPropagation();
			});

			if(self.mode == "mobile") {
				const box = document.createElement("div");
				box.className = "ui-mobile-calendar";
				box.appendChild(div);
				body.appendChild(box);
			} else {
				body.appendChild(div);
			}

			body.classList.add("ui-popup-hidden");

			setTimeout(function() {
				div.classList.add("focus");
				if(self.mode == "mobile")
					div.parentNode.classList.add("focus");
				window.addEventListener("click", self.close, {once : true});
			}, 100);

			self.popup = div;
			self.container = container;
			self.render();

			if((rect.top + div.offsetHeight + 10) > screenHeight) {
				div.style.marginTop = (rect.height + div.offsetHeight + 1) * -1 + "px";
//				div.style.top = "auto";
//				div.style.bottom = (scrollHeight) - (scrollTop + rect.top + rect.height - 36) + "px";
			}
			if((rect.left + div.offsetWidth + 10 - marginLeft) > screenWidth)
				div.style.marginLeft = (rect.width - div.offsetWidth) + "px";
		},
		close : function(isEvent) {
			const self = popup;
			if(!self.popup) return;
			self.popup.classList.remove("focus");
			self.container.classList.remove("focus");
			if(self.mode == "mobile")
				self.popup.parentNode.classList.remove("focus");
			event.preventDefault();
			window.removeEventListener("click", self.close);
			const input = self.container.querySelector("input");
			const value = input.value;
			input.value = (value && isDate(value)) ? getCalendar(new Date(value)) : (self.value) ? self.value : "";

			if(isEvent != false && self.value != input.value) {
				const event = new Event("change");
				input.dispatchEvent(event);
			}
			self.timer = setTimeout(function() {
				if(self.mode == "mobile")
					self.popup.parentNode.parentNode.removeChild(self.popup.parentNode);
				else
					self.popup.parentNode.removeChild(self.popup);
				self.popup = undefined;
				self.value = "";
				document.body.classList.remove("ui-popup-hidden");
			}, 400);
		},
		render : function(date) {
			const div = this.popup;
			const input = this.container.querySelector("input");
			const value = input.value;
			date = this.date = (date) ? date : ((value) ? new Date(value) : new Date());
			let year = date.getFullYear();
			let month = date.getMonth();
			let day = date.getDate();

			const today = getCalendar();														// 오늘 날짜
			const selectDay = (value) ? getCalendar(new Date(value)) : "";						// 입력된 날짜

			let thisMonthStart = new Date(year, month, 1).getDay() - 1;					// 이번 달 시작 요일
			if(thisMonthStart < 0) thisMonthStart = 6;
			const thisMonthEnd = new Date(year, month + 1, 0).getDate();				// 이번 달 마지막 날짜
			const lastMonth = new Date(year, month, 0).getMonth();
			const lastMonthEnd = new Date(year, month, 0).getDate();						// 저번 달 마지막 날짜
			const lastMonthStart = lastMonthEnd - thisMonthStart + 1;							// 저번 달 시작 날짜

			let title = year + "년 " + (month + 1) + "월";

			if(this.mode == "selector") {
				const getYear = () => {
					const maxDate = (this.maxDate) ? new Date(this.maxDate) : new Date(new Date().getFullYear(), 11, 31);
					const maxYear = maxDate.getFullYear();
					const minDate = (this.minDate) ? new Date(this.minDate) : new Date(new Date().getFullYear() - 4, 0, 1);
					const minYear = minDate.getFullYear();
					if(!this.maxDate) this.maxDate = getCalendar(maxDate);
					if(!this.minDate) this.minDate = getCalendar(minDate);

					const option = [];
					for(let i = maxYear; i >= minYear; i--)
						option.push(`<option value="${i}">${i}년</option>`);
					return option.join("");
				};
				const getMonth = () => {
					const option = [];
					for(let i = 1; i < 13; i++)
						option.push(`<option value="${i}">${i}월</option>`);
					return option.join("");
				};

				title = `
					<select class="ui-select" name="year" data-event="selector">
						<option value="">년도</option>
						${getYear()}
					</select>
					<select class="ui-select" name="month" data-event="selector">
						<option value="">월</option>
						${getMonth()}
					</select>
				`;
			}

			title = "<h4><button class='prev'></button>" + title +"<button class='next'></button></h4>";
//			const thead = "<thead><tr><td>일</td><td>월</td><td>화</td><td>수</td><td>목</td><td>금</td><td>토</td></tr></thead>";
			const thead = "<thead><tr><td>월</td><td>화</td><td>수</td><td>목</td><td>금</td><td>토</td><td>일</td></tr></thead>";
			let tbody = ""

			const thisYear = year;
			const thisMonth = month;
			const thisDay = date.getDate();

			day = lastMonthStart;
			let defaultClassName = "none";

			if(lastMonth == 11) {
				year--;
				month = 12;
			}

			const n = Math.ceil((thisMonthStart + thisMonthEnd) / 7);
			for(let i = 0; i < n; i++) {
				let tr = "";
				for(let j = 0; j < 7; j++) {
					if((i == 0 && day > lastMonthEnd) || (i > 0 && day > thisMonthEnd)) {
						day = 1;
						month++;
						if(month > 12) {
							year++;
							month = 1;
						}
						defaultClassName = (i == 0) ? "" : "none";
					}
					let className = (defaultClassName) ? [defaultClassName] : [];
					let date = getCalendar(new Date(year, month - 1, day));
					if(date == today) className.push("today");
					if(selectDay && date == selectDay) className.push("selected");
					if(this.isMultiple == true && this.value.indexOf(date) > -1) className.push("selected");
					let holidayName = this.isHoliday(new Date(year, month - 1, day));
					if(holidayName && holidayName != "일요일")
						className.push("holiday");
					else holidayName = "";

					className = className.join(" ");
					tr += '<td class="' + className + '"><a data-date="' + date + '" title="' + holidayName + '">' + day + '</a></td>';
					day++;
				}
				tbody += "<tr>" + tr + "</tr>";
			}

			div.innerHTML = `${title}<table>${thead}<tbody>${tbody}</tbody></table>`;

			const isMultiple = popup.isMultiple;
			const isPopup = popup.isPopup;
			div.querySelectorAll("a").forEach(item => {
				item.onclick = function() {
					const value = this.getAttribute("data-date");
					if(this.parentNode.classList.contains("none")) {
						popup.render(new Date(value));
						return;
					}

					if(isMultiple) {
						this.parentNode.classList.toggle("selected");
						const index = popup.value.indexOf(value);
						if(this.parentNode.classList.contains("selected")) {
							if(index == -1) popup.value.push(value);
						} else {
							if(index > -1) popup.value.splice(index, 1);
						}
						input.setAttribute("data-value", popup.value.join(","));
						if(popup.callback) popup.callback(popup.value);
					} else {
						if(isPopup == true) {
							input.value = value;
							input.setAttribute("value", value);
						} else {
							this.parentNode.classList.toggle("selected");
							if(!this.parentNode.classList.contains("selected")) {
								input.value = "";
								input.setAttribute("value", "");
							}
						}
					}
					if(isPopup == true)	popup.close();
				}
			});
			div.querySelectorAll("button").forEach((item, index) => {
				item.onclick = function() {
					const newMonth = thisMonth + ((index == 0) ? -1 : 1);
					let date = new Date(thisYear, newMonth, 1);
					const minDate = (popup.minDate) ? new Date(popup.minDate) : "";
					const maxDate = (popup.maxDate) ? new Date(popup.maxDate) : "";
					if(minDate && date.getFullYear() < minDate.getFullYear())
						date = minDate;
					if(maxDate && date.getFullYear() > maxDate.getFullYear())
						date = maxDate;
					popup.render(date, isPopup);
				}
			});

			if(this.mode == "selector") {
				const year = div.querySelector("[name='year']");
				const month = div.querySelector("[name='month']");
				year.value = thisYear;
				month.value = thisMonth + 1;
				div.querySelectorAll("[data-event='selector']").forEach(item => {
					item.onchange = function() {
						const newYear = year.value;
						const newMonth = month.value - 1;
						popup.render(new Date(newYear, newMonth, thisDay), isPopup);
					}
				});
			}

			if(this.isPopup == false)
				return div;
		},
		update : function(date) {
			this.render(date);
			if(this.callback) this.callback(this.value);
		},
		remove : function(date) {
			const index = this.value.indexOf(date);
			if(index > -1) this.value.splice(index, 1);
			this.update(this.date);
		},

		// 해당 양력 날짜의 휴일 여부를 리턴한다.
		isHoliday(date) {
			if(!date) return "";
			const self = popup;

			const year = date.getFullYear();
			const month = date.getMonth() + 1;
			const day = date.getDate();
			const week = date.getDay();

			const setHoliday = function(name, year, month, day, type) {
				let newDate = {year : year, month : month, day : day};
				if(type == "음력")
					newDate = self.convertDate(year, month, day);
				return {
					name : name,
					year : newDate.year,
					month : newDate.month,
					day : newDate.day
				};
			};

			if(self.isHoliday.year != year) {
				const holiday = [
					setHoliday("신정", year, 1, 1, "양력"),
					setHoliday("설날", year - 1, 12, 31, "음력"),
					setHoliday("설날", year, 1, 1, "음력"),
					setHoliday("설날", year, 1, 2, "음력"),
					setHoliday("삼일절", year, 3, 1, "양력"),
					setHoliday("부처님 오신 날", year, 4, 8, "음력"),
					setHoliday("어린이날", year, 5, 5, "양력"),
					setHoliday("현충일", year, 6, 6, "양력"),
					setHoliday("광복절", year, 8, 15, "양력"),
					setHoliday("추석", year, 8, 14, "음력"),
					setHoliday("추석", year, 8, 15, "음력"),
					setHoliday("추석", year, 8, 16, "음력"),
					setHoliday("개천절", year, 10, 3, "양력"),
					setHoliday("한글날", year, 10, 9, "양력"),
					setHoliday("성탄절", year, 12, 25, "양력"),
				];

				// 기타 휴일 설정
				const customHoliday = [
					setHoliday("21대 국회의원 선거", 2020, 4, 15, "양력"),
					setHoliday("임시공휴일", 2020, 8, 17, "양력"),
					setHoliday("지방선거", 2022, 6, 1, "양력")
				];

				const checkHoliday = (name, date, option) => {
					return holiday.some(item => {
						if(date.getTime() == new Date(item.year, item.month - 1, item.day).getTime()) {
							if(option) {
								return (item.name == name);
							} else {
								return (item.name != name);
							}
						}
					});
				};

				const holidayList = [];
				for(let i = 0; i < holiday.length; i++) {
					const itemA = holiday[i];
					const itemB = holiday[i + 1];
					const name = holiday[i].name;
					if(name != "신정" && name != "부처님 오신 날" && name != "현충일" && name != "성탄절") {
						if(itemA && itemB) {
							const timeA = new Date(itemA.year, itemA.month - 1, itemA.day).getTime();
							const timeB = new Date(itemB.year, itemB.month - 1, itemB.day).getTime();
							if(timeA == timeB) {
								itemA.name = itemA.name + ", " + itemB.name;
								i++;
							}
						}
						holidayList.push(itemA);
					}
				}

				// 대체 공휴일 설정
				holidayList.forEach(item => {
					let date = new Date(item.year, item.month - 1, item.day);
					const name = item.name;
					const weekIndex = date.getDay();
					const isHoliday = checkHoliday(name, date);	// 다른 휴일과 겹치는 경우
					// 토, 일, 다른 휴일과 겹치는 경우
					if(weekIndex == 0 || (weekIndex == 6 && name != "설날" && name != "추석") || isHoliday) {
						for(let i = 0; i < 10; i++) {
							date.setDate(date.getDate() + 1);
							const weekIndex = date.getDay();
							const isHoliday = checkHoliday(name, date, false);
							const isContinueHoliday = checkHoliday(name, date, true);
							if(weekIndex != 0 && weekIndex != 6 && !isContinueHoliday && !isHoliday) {
								const newName = "대체 공휴일(" + name + ")";
								if(!holiday.some(item => {return (item.name == newName)})) {
									holiday.push({name : newName, year : date.getFullYear(), month : date.getMonth() + 1, day : date.getDate()});
								}
								break;
							}
						}
					}
				});
				self.isHoliday.holiday = holiday.concat(customHoliday);
				self.isHoliday.year = year;
			}

			const holiday = self.isHoliday.holiday;
			for(let item of holiday)
				if(item.year == year && item.month == month && item.day == day) return item.name;
			if(week == 0) return "일요일";
			return "";
		},

		// 음력 날짜를 양력 날짜로 변환 한다.
		convertDate(year, month, day) {
			const table = [
				[1, 2, 4, 1, 1, 2, 1, 2, 1, 2, 2, 1],	// 1841
				[2, 2, 1, 2, 1, 1, 2, 1, 2, 1, 2, 1],
				[2, 2, 2, 1, 2, 1, 4, 1, 2, 1, 2, 1],
				[2, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2],
				[1, 2, 1, 2, 2, 1, 2, 1, 2, 1, 2, 1],
				[2, 1, 2, 1, 5, 2, 1, 2, 2, 1, 2, 1],
				[2, 1, 1, 2, 1, 2, 1, 2, 2, 2, 1, 2],
				[1, 2, 1, 1, 2, 1, 2, 1, 2, 2, 2, 1],
				[2, 1, 2, 3, 2, 1, 2, 1, 2, 1, 2, 2],
				[2, 1, 2, 1, 1, 2, 1, 1, 2, 2, 1, 2],
				[2, 2, 1, 2, 1, 1, 2, 3, 2, 1, 2, 2],	// 1851
				[2, 1, 2, 2, 1, 1, 2, 1, 2, 1, 1, 2],
				[2, 1, 2, 2, 1, 2, 1, 2, 1, 2, 1, 2],
				[1, 2, 1, 2, 1, 2, 5, 2, 1, 2, 1, 2],
				[1, 1, 2, 1, 2, 2, 1, 2, 2, 1, 2, 1],
				[2, 1, 1, 2, 1, 2, 1, 2, 2, 2, 1, 2],
				[1, 2, 1, 1, 5, 2, 1, 2, 1, 2, 2, 2],
				[1, 2, 1, 1, 2, 1, 1, 2, 2, 1, 2, 2],
				[2, 1, 2, 1, 1, 2, 1, 1, 2, 1, 2, 2],
				[2, 1, 6, 1, 1, 2, 1, 1, 2, 1, 2, 2],
				[1, 2, 2, 1, 2, 1, 2, 1, 2, 1, 1, 2],	// 1861
				[2, 1, 2, 1, 2, 2, 1, 5, 2, 1, 1, 2],
				[1, 2, 2, 1, 2, 1, 2, 2, 1, 2, 1, 2],
				[1, 1, 2, 1, 2, 1, 2, 2, 1, 2, 2, 1],
				[2, 1, 1, 2, 4, 1, 2, 2, 1, 2, 2, 1],
				[2, 1, 1, 2, 1, 1, 2, 2, 1, 2, 2, 2],
				[1, 2, 1, 1, 2, 1, 1, 2, 1, 2, 2, 2],
				[1, 2, 2, 3, 2, 1, 1, 2, 1, 2, 2, 1],
				[2, 2, 2, 1, 1, 2, 1, 1, 2, 1, 2, 1],
				[2, 2, 2, 1, 2, 1, 2, 1, 1, 5, 2, 1],
				[2, 2, 1, 2, 2, 1, 2, 1, 2, 1, 1, 2],	// 1871
				[1, 2, 1, 2, 2, 1, 2, 1, 2, 2, 1, 2],
				[1, 1, 2, 1, 2, 4, 2, 1, 2, 2, 1, 2],
				[1, 1, 2, 1, 2, 1, 2, 1, 2, 2, 2, 1],
				[2, 1, 1, 2, 1, 1, 2, 1, 2, 2, 2, 1],
				[2, 2, 1, 1, 5, 1, 2, 1, 2, 2, 1, 2],
				[2, 2, 1, 1, 2, 1, 1, 2, 1, 2, 1, 2],
				[2, 2, 1, 2, 1, 2, 1, 1, 2, 1, 2, 1],
				[2, 2, 4, 2, 1, 2, 1, 1, 2, 1, 2, 1],
				[2, 1, 2, 2, 1, 2, 2, 1, 2, 1, 1, 2],
				[1, 2, 1, 2, 1, 2, 5, 2, 2, 1, 2, 1],	// 1881
				[1, 2, 1, 2, 1, 2, 1, 2, 2, 1, 2, 2],
				[1, 1, 2, 1, 1, 2, 1, 2, 2, 2, 1, 2],
				[2, 1, 1, 2, 3, 2, 1, 2, 2, 1, 2, 2],
				[2, 1, 1, 2, 1, 1, 2, 1, 2, 1, 2, 2],
				[2, 1, 2, 1, 2, 1, 1, 2, 1, 2, 1, 2],
				[2, 2, 1, 5, 2, 1, 1, 2, 1, 2, 1, 2],
				[2, 1, 2, 2, 1, 2, 1, 1, 2, 1, 2, 1],
				[2, 1, 2, 2, 1, 2, 1, 2, 1, 2, 1, 2],
				[1, 5, 2, 1, 2, 2, 1, 2, 1, 2, 1, 2],
				[1, 2, 1, 2, 1, 2, 1, 2, 2, 1, 2, 2],	// 1891
				[1, 1, 2, 1, 1, 5, 2, 2, 1, 2, 2, 2],
				[1, 1, 2, 1, 1, 2, 1, 2, 1, 2, 2, 2],
				[1, 2, 1, 2, 1, 1, 2, 1, 2, 1, 2, 2],
				[2, 1, 2, 1, 5, 1, 2, 1, 2, 1, 2, 1],
				[2, 2, 2, 1, 2, 1, 1, 2, 1, 2, 1, 2],
				[1, 2, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1],
				[2, 1, 5, 2, 2, 1, 2, 1, 2, 1, 2, 1],
				[2, 1, 2, 1, 2, 1, 2, 2, 1, 2, 1, 2],
				[1, 2, 1, 1, 2, 1, 2, 5, 2, 2, 1, 2],
				[1, 2, 1, 1, 2, 1, 2, 1, 2, 2, 2, 1],	// 1901
				[2, 1, 2, 1, 1, 2, 1, 2, 1, 2, 2, 2],
				[1, 2, 1, 2, 3, 2, 1, 1, 2, 2, 1, 2],
				[2, 2, 1, 2, 1, 1, 2, 1, 1, 2, 2, 1],
				[2, 2, 1, 2, 2, 1, 1, 2, 1, 2, 1, 2],
				[1, 2, 2, 4, 1, 2, 1, 2, 1, 2, 1, 2],
				[1, 2, 1, 2, 1, 2, 2, 1, 2, 1, 2, 1],
				[2, 1, 1, 2, 2, 1, 2, 1, 2, 2, 1, 2],
				[1, 5, 1, 2, 1, 2, 1, 2, 2, 2, 1, 2],
				[1, 2, 1, 1, 2, 1, 2, 1, 2, 2, 2, 1],
				[2, 1, 2, 1, 1, 5, 1, 2, 2, 1, 2, 2],	// 1911
				[2, 1, 2, 1, 1, 2, 1, 1, 2, 2, 1, 2],
				[2, 2, 1, 2, 1, 1, 2, 1, 1, 2, 1, 2],
				[2, 2, 1, 2, 5, 1, 2, 1, 2, 1, 1, 2],
				[2, 1, 2, 2, 1, 2, 1, 2, 1, 2, 1, 2],
				[1, 2, 1, 2, 1, 2, 2, 1, 2, 1, 2, 1],
				[2, 3, 2, 1, 2, 2, 1, 2, 2, 1, 2, 1],
				[2, 1, 1, 2, 1, 2, 1, 2, 2, 1, 2, 2],
				[1, 2, 1, 1, 2, 1, 5, 2, 1, 2, 2, 2],
				[1, 2, 1, 1, 2, 1, 1, 2, 2, 1, 2, 2],
				[2, 1, 2, 1, 1, 2, 1, 1, 2, 1, 2, 2],   // 1921
				[2, 1, 2, 2, 3, 2, 1, 1, 2, 1, 2, 2],
				[1, 2, 2, 1, 2, 1, 2, 1, 1, 2, 1, 2],
				[2, 1, 2, 1, 2, 2, 1, 2, 1, 2, 1, 1],
				[2, 1, 2, 5, 2, 1, 2, 2, 1, 2, 1, 2],
				[1, 1, 2, 1, 2, 1, 2, 2, 1, 2, 2, 1],
				[2, 1, 1, 2, 1, 2, 1, 2, 2, 1, 2, 2],
				[1, 5, 1, 2, 1, 1, 2, 2, 1, 2, 2, 2],
				[1, 2, 1, 1, 2, 1, 1, 2, 1, 2, 2, 2],
				[1, 2, 2, 1, 1, 5, 1, 2, 1, 2, 2, 1],
				[2, 2, 1, 2, 1, 2, 1, 1, 2, 1, 2, 1],   // 1931
				[2, 2, 2, 1, 2, 1, 2, 1, 1, 2, 1, 2],
				[1, 2, 2, 1, 6, 1, 2, 1, 2, 1, 1, 2],
				[1, 2, 1, 2, 2, 1, 2, 1, 2, 2, 1, 2],
				[1, 1, 2, 1, 2, 1, 2, 2, 1, 2, 2, 1],
				[2, 1, 4, 1, 1, 2, 2, 1, 2, 2, 2, 1],
				[2, 1, 1, 2, 1, 1, 2, 1, 2, 2, 2, 1],
				[2, 2, 1, 1, 2, 1, 4, 1, 2, 2, 1, 2],
				[2, 2, 1, 1, 2, 1, 1, 2, 1, 2, 1, 2],
				[2, 2, 1, 2, 1, 2, 1, 1, 2, 1, 2, 1],
				[2, 2, 1, 2, 2, 4, 1, 1, 2, 1, 2, 1],   // 1941
				[2, 1, 2, 2, 1, 2, 2, 1, 1, 2, 1, 2],
				[1, 2, 1, 2, 1, 2, 2, 1, 2, 1, 2, 1],
				[2, 1, 2, 4, 1, 2, 1, 2, 2, 1, 2, 2],
				[1, 1, 2, 1, 1, 2, 1, 2, 2, 2, 1, 2],
				[2, 1, 1, 2, 1, 1, 2, 1, 2, 2, 1, 2],
				[2, 5, 1, 2, 1, 1, 2, 1, 2, 1, 2, 2],
				[2, 1, 2, 1, 2, 1, 1, 2, 1, 2, 1, 2],
				[2, 1, 2, 2, 1, 2, 3, 2, 1, 2, 1, 2],
				[1, 2, 2, 2, 1, 2, 1, 1, 2, 1, 2, 1],
				[2, 1, 2, 2, 1, 2, 1, 2, 1, 2, 1, 2],   // 1951
				[1, 2, 1, 2, 4, 1, 2, 2, 1, 2, 1, 2],
				[1, 2, 1, 1, 2, 2, 1, 2, 2, 1, 2, 2],
				[1, 1, 2, 1, 1, 2, 1, 2, 2, 1, 2, 2],
				[2, 1, 4, 1, 1, 2, 1, 2, 1, 2, 2, 2],
				[1, 2, 1, 2, 1, 1, 2, 1, 2, 1, 2, 2],
				[2, 1, 2, 1, 2, 1, 1, 5, 2, 1, 2, 2],
				[1, 2, 2, 1, 2, 1, 1, 2, 1, 2, 1, 2],
				[1, 2, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1],
				[2, 1, 2, 1, 2, 5, 2, 1, 2, 1, 2, 1],
				[2, 1, 2, 1, 2, 1, 2, 2, 1, 2, 1, 2],   // 1961
				[1, 2, 1, 1, 2, 1, 2, 2, 1, 2, 2, 1],
				[2, 1, 2, 3, 2, 1, 2, 1, 2, 2, 2, 1],
				[2, 1, 2, 1, 1, 2, 1, 2, 1, 2, 2, 2],
				[1, 2, 1, 2, 1, 1, 2, 1, 1, 2, 2, 2],
				[1, 2, 5, 2, 1, 1, 2, 1, 1, 2, 2, 1],
				[2, 2, 1, 2, 2, 1, 1, 2, 1, 2, 1, 2],
				[1, 2, 1, 2, 2, 1, 5, 2, 1, 2, 1, 2],
				[1, 2, 1, 2, 1, 2, 2, 1, 2, 1, 2, 1],
				[2, 1, 1, 2, 1, 2, 2, 1, 2, 2, 1, 2],
				[1, 2, 1, 1, 5, 2, 1, 2, 2, 2, 1, 2],   // 1971
				[1, 2, 1, 1, 2, 1, 2, 1, 2, 2, 2, 1],
				[2, 1, 2, 1, 1, 2, 1, 1, 2, 2, 1, 2],
				[2, 2, 1, 5, 1, 2, 1, 1, 2, 2, 1, 2],
				[2, 2, 1, 2, 1, 1, 2, 1, 1, 2, 1, 2],
				[2, 2, 1, 2, 1, 2, 1, 5, 1, 2, 1, 2],
				[2, 1, 2, 2, 1, 2, 1, 2, 1, 2, 1, 1],
				[2, 1, 2, 2, 1, 2, 2, 1, 2, 1, 2, 1],
				[2, 1, 1, 2, 1, 6, 1, 2, 2, 1, 2, 1],
				[2, 1, 1, 2, 1, 2, 1, 2, 2, 1, 2, 2],
				[1, 2, 1, 1, 2, 1, 1, 2, 2, 1, 2, 2],   // 1981
				[2, 1, 2, 3, 2, 1, 1, 2, 1, 2, 2, 2],
				[2, 1, 2, 1, 1, 2, 1, 1, 2, 1, 2, 2],
				[2, 1, 2, 2, 1, 1, 2, 1, 1, 5, 2, 2],
				[1, 2, 2, 1, 2, 1, 2, 1, 1, 2, 1, 2],
				[1, 2, 2, 1, 2, 2, 1, 2, 1, 2, 1, 1],
				[2, 1, 2, 1, 2, 5, 2, 2, 1, 2, 1, 2],
				[1, 1, 2, 1, 2, 1, 2, 2, 1, 2, 2, 1],
				[2, 1, 1, 2, 1, 2, 1, 2, 1, 2, 2, 2],
				[1, 2, 1, 1, 5, 1, 2, 2, 1, 2, 2, 2],
				[1, 2, 1, 1, 2, 1, 1, 2, 1, 2, 2, 2],   // 1991
				[1, 2, 2, 1, 1, 2, 1, 1, 2, 1, 2, 2],
				[1, 2, 5, 2, 1, 2, 1, 1, 2, 1, 2, 1],
				[2, 2, 2, 1, 2, 1, 2, 1, 1, 2, 1, 2],
				[1, 2, 2, 1, 2, 1, 2, 5, 2, 1, 1, 2],
				[1, 2, 1, 2, 2, 1, 2, 1, 2, 2, 1, 1],
				[2, 1, 2, 1, 2, 1, 2, 2, 1, 2, 2, 1],
				[2, 1, 1, 2, 3, 2, 2, 1, 2, 2, 2, 1],
				[2, 1, 1, 2, 1, 1, 2, 1, 2, 2, 2, 1],
				[2, 2, 1, 1, 2, 1, 1, 2, 1, 2, 2, 1],
				[2, 2, 1, 5, 2, 1, 1, 2, 1, 2, 1, 2],   // 2001
				[2, 2, 1, 2, 1, 2, 1, 1, 2, 1, 2, 1],
				[2, 2, 1, 2, 2, 1, 2, 1, 1, 2, 1, 2],
				[1, 5, 2, 2, 1, 2, 1, 2, 1, 2, 1, 2],
				[1, 2, 1, 2, 1, 2, 2, 1, 2, 1, 2, 1],
				[2, 1, 2, 1, 2, 1, 5, 2, 2, 1, 2, 2],
				[1, 1, 2, 1, 1, 2, 1, 2, 2, 2, 1, 2],
				[2, 1, 1, 2, 1, 1, 2, 1, 2, 2, 1, 2],
				[2, 2, 1, 1, 5, 1, 2, 1, 2, 1, 2, 2],
				[2, 1, 2, 1, 2, 1, 1, 2, 1, 2, 1, 2],
				[2, 1, 2, 2, 1, 2, 1, 1, 2, 1, 2, 1],   // 2011
				[2, 1, 2, 5, 2, 2, 1, 1, 2, 1, 2, 1],
				[2, 1, 2, 2, 1, 2, 1, 2, 1, 2, 1, 2],
				[1, 2, 1, 2, 1, 2, 1, 2, 5, 2, 1, 2],
				[1, 2, 1, 1, 2, 1, 2, 2, 2, 1, 2, 1],
				[2, 1, 2, 1, 1, 2, 1, 2, 2, 1, 2, 2],
				[1, 2, 1, 2, 1, 4, 1, 2, 1, 2, 2, 2],
				[1, 2, 1, 2, 1, 1, 2, 1, 2, 1, 2, 2],
				[2, 1, 2, 1, 2, 1, 1, 2, 1, 1, 2, 2],
				[2, 1, 2, 5, 2, 1, 1, 2, 1, 2, 1, 2],
				[1, 2, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1],   // 2021
				[2, 1, 2, 1, 2, 2, 1, 2, 1, 2, 1, 2],
				[1, 5, 2, 1, 2, 1, 2, 2, 1, 2, 1, 2],
				[1, 2, 1, 1, 2, 1, 2, 2, 1, 2, 2, 1],
				[2, 1, 2, 1, 1, 5, 2, 1, 2, 2, 2, 1],
				[2, 1, 2, 1, 1, 2, 1, 2, 1, 2, 2, 2],
				[1, 2, 1, 2, 1, 1, 2, 1, 1, 2, 2, 1],
				[2, 2, 2, 1, 5, 1, 2, 1, 1, 2, 2, 1],
				[2, 2, 1, 2, 2, 1, 1, 2, 1, 1, 2, 2],
				[1, 2, 1, 2, 2, 1, 2, 1, 2, 1, 2, 1],
				[2, 1, 5, 2, 1, 2, 2, 1, 2, 1, 2, 1],   // 2031
				[2, 1, 1, 2, 1, 2, 2, 1, 2, 2, 1, 2],
				[1, 2, 1, 1, 2, 1, 2, 1, 2, 2, 5, 2],
				[1, 2, 1, 1, 2, 1, 2, 1, 2, 2, 1, 2],
				[2, 1, 2, 1, 1, 2, 1, 1, 2, 2, 1, 2],
				[2, 2, 1, 2, 1, 4, 1, 1, 2, 2, 1, 2],
				[2, 2, 1, 2, 1, 1, 2, 1, 1, 2, 1, 2],
				[2, 2, 1, 2, 1, 2, 1, 2, 1, 1, 2, 1],
				[2, 2, 1, 2, 5, 2, 1, 2, 1, 2, 1, 1],
				[2, 1, 2, 2, 1, 2, 1, 2, 2, 1, 2, 1],
				[2, 1, 1, 2, 1, 2, 2, 1, 2, 2, 1, 2],   // 2041
			];
			const solMonthDay = new Array(31, 0, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31);
			const isLeapYear = function(year) {return ((year % 400 == 0) || ((year % 100 != 0) && (year % 4 == 0)))};
			solMonthDay[1] = (isLeapYear(year)) ? 29 : 28;
			const lunaMonthDay = function(value) {
				switch(value) {
					case 1 : return 29;
					case 2 : return 30;
					case 3 : return 29 + 29;
					case 4 : return 29 + 30;
					case 5 : return 30 + 29;
					case 6 : return 30 + 30;
				}
			};

			let lunaYear, lunaMonth, lunaDay, yd, td;

			// 해당 년도의 음력 마지막 날짜
			if(month == 12 && day == 31)
				day = lunaMonthDay(table[year - 1841][11]);

			// 1841년부터 현재까지 음력 날짜 수 (음력 1840년 1월 1일은 양력 1841년 1월 23일)
			td = 0;
			for(let i = 0; i < year - 1841; i++)
				for(let j = 0; j < 12; j++)
					td += lunaMonthDay(table[i][j]);
			for(let j = 0; j < month - 1; j++)
				td += lunaMonthDay(table[year - 1841][j]);
			td = td + day + 22;

			lunaYear = 1840;
			do {
				lunaYear = lunaYear + 1;
				yd = (isLeapYear(lunaYear)) ? 366 : 365;
				if(td <= yd) break;
				td = td - yd;
			} while(1);

			lunaMonth = 0;
			do {
				lunaMonth = lunaMonth + 1;
				if(td <= solMonthDay[lunaMonth - 1]) break;
				td = td - solMonthDay[lunaMonth - 1];
			} while(1);

			lunaDay = td;

			const date = new Date(lunaYear, lunaMonth - 1, lunaDay);
			lunaYear = date.getFullYear();
			lunaMonth = date.getMonth() + 1;
			lunaDay = date.getDate();
			return {year: lunaYear, month : lunaMonth, day : lunaDay};
		}
	};

	const render = function(node, isPopup) {
		const div = document.createElement("div");
		const className = "ui-input-calendar" + ((isPopup) ? "" : " non-popup");
		div.setAttribute("class", className);
		const cloneNode = node.cloneNode(true);
		const mode = cloneNode.getAttribute("mode");
		const type = (isPopup) ? "text" : "hidden";

		cloneNode.setAttribute("type", type);
		cloneNode.removeAttribute("non-popup");
		cloneNode.autocomplete = "off";

		if(mode == "mobile")
			cloneNode.setAttribute("readonly", true);

		if(cloneNode.value != "" && !isDate(cloneNode.value))
			cloneNode.value = getCalendar();

		const validateDate = (object) => {
			const value = object.value;
			const isFormat = /^(\d{4}-\d{2}-\d{2})$/.test(value);
			let date = (value && isFormat) ? new Date(value) : "";
			if(date) {
				if(isDate(date)) {
					const year = date.getFullYear();
					if(year < 1900) date.setFullYear("1900");
					else if(year > 2040) date.setFullYear("2040");
				} else {
					date = new Date();
				}
			}
			object.value = (date) ? getCalendar(date) : "";
		};

		if(mode != "mobile") {
			cloneNode.addEventListener("focus", popup.open);
			cloneNode.addEventListener("blur", function(){validateDate(this)});
			cloneNode.addEventListener("change", function(){validateDate(this)});
			cloneNode.addEventListener("input", function() {
				const value = this.value;
				const isFormat = /^(\d{4}-\d{2}-\d{2})$/.test(value);
				if(value && isFormat) {
					validateDate(this);
					const date = new Date(this.value);
					if(date instanceof Date && popup.popup)
						popup.render(date);
				}
			});
			cloneNode.addEventListener("keydown", function(event) {
				event = event || window.event;
				const keyCode = event.keyCode || evnet.which;
				const isNumber = ((48 <= keyCode && keyCode <= 57) || (96 <= keyCode && keyCode <= 105)) ? true : false;
				const isCommand = event.ctrlKey || event.altKey || event.shiftKey;
				const isControl = ((keyCode < 48 && keyCode != 32)) ? true : false;

				if(keyCode == 13) {
					popup.close(false);
					this.blur();
				}
				if(!isNumber && !isCommand && !isControl) {
					event.preventDefault();
					event.returnValue = false;
					return false;
				}
			});
			cloneNode.addEventListener("click", function(event) {
				event = event || window.event;
				event.preventDefault();
				event.stopPropagation();
			});
		} else {
			cloneNode.addEventListener("click", popup.open);
		}

		div.appendChild(cloneNode);
		node.parentNode.replaceChild(div, node);

		if(!isPopup) {
			const isMultiple = (cloneNode.getAttribute("multiple") != null) ? true : false;
			popup.container = div;
			popup.isMultiple = isMultiple;
			div.appendChild(popup.open(false));
			return popup;
		}
	};

	// 초기화
	if(typeof object == "string" && object == "isHoliday") {
		try {
			return popup.isHoliday(value);
		} catch(error) {
			console.log("incorrect parameter");
			return "";
		}
	}

	if(!object)	object = document;
	const nodeList = object.querySelectorAll("input[type='calendar']");

	for(let node of nodeList) {
		const isPopup = (node.getAttribute("non-popup") != null) ? false : true;
		if(!isPopup) {
			if(object != document)
				return new render(node, false);
		} else {
			render(node, true);
		}
	}
}





function uiSearch(command) {
	const div = document.querySelector(".ui-search .date, .ui-search-box .date");
	if(!div) return;

	const setPeriod = function(command) {
		const today = new Date();
		const year = today.getFullYear();
		const month = today.getMonth();
		const day = today.getDate();
		const week = (today.getDay() == 0) ? 7 : today.getDay();
		const startDay = day - (week - 1);
		const endDay = startDay + 6;

		let startDate = new Date(year, month, day);
		let endDate = new Date(year, month, day);

		switch(command) {
			case "전체" :
				startDate = "";
				endDate = "";
				break;
			case "당해" :
			case "올해" :
				startDate = new Date(year, 0, 1);
				endDate = new Date(year, 12, 0);
				break;
			case "3개월" :
				startDate = new Date(year, month - 2, 1);
				endDate = new Date(year, month + 1, 0);
				break;
			case "당월" :
			case "이번달" :
				startDate = new Date(year, month, 1);
				endDate = new Date(year, month + 1, 0);
				break;
			case "전월" :
			case "지난달" :
				startDate = new Date(year, month - 1, 1);
				endDate = new Date(year, month, 0);
				break;
			case "이번주" :
				startDate = new Date(year, month, startDay);
				endDate = new Date(year, month, endDay);
				break;
			case "지난주" :
				startDate = new Date(year, month, startDay - 7);
				endDate = new Date(year, month, endDay - 7);
				break;
			case "어제" :
				startDate = endDate = new Date(year, month, day - 1);
				break;
			case "3일" :
			case "1주" :
			case "2주" :
				let addDay = getNumber(command);
				addDay = (command.indexOf("일") > -1) ? addDay : addDay * 7;
				startDate = new Date(year, month, day - addDay);
				break;
		}
		const input = div.querySelectorAll("input");
		input[0].value = (startDate) ? getCalendar(startDate) : "";
		input[1].value = (endDate) ? getCalendar(endDate) : "";

		const nodeList = div.querySelectorAll("a");
		nodeList.forEach(item => {
			if(item.innerHTML == command)
				item.parentNode.classList.add("focus");
		});
	};

	const aList = div.querySelectorAll("a");
	const setUnfocus = () => {
		aList.forEach(item => {
			item.parentNode.classList.remove("focus");
		});
	};

	aList.forEach(item => {
		item.addEventListener("click", function() {
			setUnfocus();
			setPeriod(this.innerHTML);
		});
	});

	const inputList = div.querySelectorAll(".ui-input-calendar input");
	inputList.forEach(item => {
		item.addEventListener("focus", function() {
			this.beforeValue = this.value;
		});
		item.addEventListener("change", function() {
			/*
			const startDate = div.querySelector("[name='startDate'],[name='fromDate']");
			const endDate = div.querySelector("[name='endDate'],[name='endDate']");
			if(startDate && endDate) {
				const startTime = new Date(startDate.value).getTime();
				const endTime = new Date(endDate.value).getTime();
				if(startTime > endTime) {
					this.value = (this.beforeValue) ? this.beforeValue : "";
				}
			}
			*/
			setUnfocus();
		});
	});

	if(command) setPeriod(command);
}





function uiBlock(message) {
	if(!uiBlock.count) uiBlock.count = 0;
	uiBlock.count++;
	if(uiBlock.count == 1) {
		const body = document.querySelector("body");
		const div = document.createElement("div");
		div.className = "ui-popup ui-block";
		message = (typeof message == "string") ? message : "잠시만 기다려 주세요.";
		div.innerHTML = `<div><div><div class="box">${message}<span></span></div></div></div>`;
		body.appendChild(div);
		uiBlock.popup = div;
		uiBlock.span = div.querySelector("span");
		setTimeout(function() {
			div.classList.add("focus");
		}, 300);
	} else {
		uiBlock.span.innerHTML = "(현재 " + uiBlock.count + "건을 처리 중 입니다.)";
	}
}

function uiUnblock() {
	if(!uiBlock.popup) return;
	uiBlock.count--;

	const popup = uiBlock.popup;
	const count = uiBlock.count;

	if(count < 1) {
		uiBlock.count = uiBlock.popup = undefined;
		popup.classList.remove("focus");
		setTimeout(function(){
			popup.parentNode.removeChild(popup);
		}, 300);
	} else {
		uiBlock.span.innerHTML = (uiBlock.count > 1) ? " (현재 " + uiBlock.count + "건을 처리 중 입니다.)" : "";
	}
}





function uiTip(object) {
	if(!object) object = document;

	const popup = {
		self : undefined,
		timer : undefined,
		open : function() {
			const tipColor = this.getAttribute("data-tip-color") || "red";
			const tipAlign = this.getAttribute("data-tip-align") || "center";

			const rect = this.getBoundingClientRect();
			const screenWidth = document.documentElement.clientWidth;
			const screenInnerWidth = document.body.clientWidth || screenWidth;
			const marginLeft = (screenWidth > screenInnerWidth) ? parseInt((screenWidth - screenInnerWidth) / 2) : 0;
			const screenHeight = document.documentElement.clientHeight;
			const scrollTop = Math.max(document.documentElement.scrollTop, document.body.scrollTop);
			const scrollLeft = Math.max(document.documentElement.scrollLeft, document.body.scrollLeft);

			const body = document.querySelector("body");
			const div = document.createElement("div");
			const p = document.createElement("p");
			div.className = "ui-tip-popup" + " " + tipColor + " " + tipAlign;

			let left = 0;
			let top = 0;

			if(tipAlign == "right") {
				left = (scrollLeft + rect.left - marginLeft + rect.width + 12);
				top = scrollTop + rect.top;
			} else {
				left = scrollLeft + rect.left - marginLeft + (rect.width / 2);
				top = scrollTop + rect.top;
			}
			div.style.left = left + "px";
			div.style.top = top + "px";
			p.innerHTML = this.getAttribute("data-tip");
			div.appendChild(p);
			body.appendChild(div);

			div.style.width = p.offsetWidth + 2 + "px";
			if(tipAlign == "right") {
				div.style.marginTop = (div.offsetHeight / 2) * -1 + (rect.height / 2) + 1 + "px";
			} else {
				div.style.marginTop = (((div.offsetHeight) * -1) - 5) + "px";
				div.style.marginLeft = ((div.offsetWidth / 2) * -1) + "px";
			}

			if((rect.left - marginLeft + scrollLeft) > screenWidth) {
				div.classList.add("reverse");
				div.style.marginLeft = (div.offsetWidth * -1 - rect.width - 24) + "px";
			}
			setTimeout(function() {
				div.classList.add("focus");
			}, 100)

			popup.self = div;
		},
		close : function(isForce) {
			const div = popup.self;
			if(!div) return;
			div.classList.remove("focus");
			popup.self = undefined;
			setTimeout(function() {
				div.parentNode.removeChild(div);
			}, 100);
		}
	};

	const nodeList = object.querySelectorAll(".ui-tip[data-tip]");
	nodeList.forEach(item => {
		item.addEventListener("mouseover", popup.open);
		item.addEventListener("mouseout", popup.close);
	});
}





function uiError(error) {
	let message = "작업 중 에러가 발생하였습니다.";
	switch(typeof error) {
		case "object" :
			let errorList = error.responseJSON;
			if(errorList) {
				const messageList = [];
				message = "";
				if(!Array.isArray(errorList)) errorList = [errorList];
				errorList.forEach(item => {
					messageList.push(item.reason);
				});
				message += messageList.join("\n");
			}
			break;

		case "number" :
			switch(error) {
				case 403 : message = "페이지 접근 권한이 없습니다."; break;
				case 405 : message = "비정상적인 접근 입니다.";	break;
				case 419 : message = "만료된 페이지 입니다."; break;
			}
			break;

		case "string" :
			message = error;
			break;
	}
	console.log(error);
	alert(message);
}





function uiEvent(object, events) {
	for(const event in events) {
		const items = events[event];
		for(let item in items) {
			const node = object.querySelectorAll("[data-event='" + item + "']");
			const callback = items[item];
			node.forEach(function(item) {
				item.addEventListener(event, callback);
			});
		}
	}
}





function uiTab(object) {
	if(!object) object = document;
	const nodeList = object.querySelectorAll(".ui-tab");
	nodeList.forEach(item => {
		const input = item.querySelectorAll("input");
		const parent = item.parentNode;
		const div = Array.from(item.parentNode.querySelectorAll(".tab")).filter(item => {
			return (item.parentNode == parent);
		});

		if(input.length <= div.length) {
			input.forEach((item, index) => {
				item.addEventListener("change", function() {
					input.forEach((item, index) => {
						div[index].classList.remove("focus");
					});
					div[index].classList.add("focus");
				});
			});
		}
	});
}





function uiDate(date, type, format) {
	if(!date) return "";
	if(!type) type = "date";
	if(isNumber(date)) {
		date = new Date(date).format("yyyy-mm-ddThh:MM:ss");
	}
	date = String(date);
	if(date.substr(10, 1) == " ")
		date = date.replace(" ", "T");
	if(date.indexOf(":") > - 1)
		date += "+09:00";

	if(!format) {
		switch(type) {
			case "all"		: format = "yyyy.sm.sd (sw) ap sh:MM:ss"; break;
			case "time"		: format = "yyyy.sm.sd (sw) ap sh:MM"; break;
			case "break"	: format = "yyyy.sm.sd (sw)<br>ap sh:MM"; break;
			default			: format = "yyyy.sm.sd (sw)"; break;
		}
	}
	return new Date(date).format(format);
}





function uiClock(object) {
	if(!object)	object = document;
	const nodeList = object.querySelectorAll("input[type='clock']");

	const popup = {
		popup : [],
		open : function(input) {
			if(this.popup.length) {
				const popupInfo = this.popup[this.popup.length - 1] || {};
				if(popupInfo.input == input) return;
				this.close();
			}
			const rect = input.getBoundingClientRect();
			const screenWidth = document.documentElement.clientWidth;
			const screenInnerWidth = document.body.clientWidth || screenWidth;
			const marginLeft = (screenWidth > screenInnerWidth) ? parseInt((screenWidth - screenInnerWidth) / 2) : 0;
			const screenHeight = document.documentElement.clientHeight;
			const scrollTop = Math.max(document.documentElement.scrollTop, document.body.scrollTop);
			const scrollLeft = Math.max(document.documentElement.scrollLeft, document.body.scrollLeft);

			const div = document.createElement("div");
			this.popup.push({popup : div, input : input});

			div.className = "ui-clock";
			div.style.left = (scrollLeft + rect.left - marginLeft) + "px";
			div.style.top = (scrollTop + rect.top + rect.height) + "px";

			const getTimeOption = (max, step, value) => {
				const option = [];
				for(let i = 0; i < max; i += step) {
					const v = i.zf(2);
					const selected = (value == v) ? "selected" : "";
					option.push(`<option value="${v}" ${selected}>${v}</option>`);
				}
				return option.join("");
			};

			const time = input.value.split(":");

			div.innerHTML = `
				<select class="ui-select" name="hour" value="${time[0]}">
					<option>시</option>
					${getTimeOption(24, 1, time[0])}
				</select>
				<span>:</span>
				<select class="ui-select" name="minute" value="${time[1]}">
					<option>분</option>
					${getTimeOption(60, 5, time[1])}
				</select>
				<button class="ui-button">적용</button>
			`;

			const button = div.querySelector("button");
			const select = div.querySelectorAll("select");

			div.onclick = (event) => {
				event.preventDefault();
				event.stopPropagation();
			};

			button.onclick = () => {
				const value = select[0].value + ":" + select[1].value;
				if(input.value != value) {
					input.value = value;
					const event = new Event("change");
					input.dispatchEvent(event);
				}
				this.close();
			};
			document.body.appendChild(div);
			setTimeout(() => {
				div.classList.add("focus");
				window.addEventListener("click", () => {
					this.close();
				}, {once : true});
			}, 100);

		},
		close : function() {
			const popupInfo = this.popup.pop() || {};
			const popup = popupInfo.popup;
			if(popup) {
				popup.classList.remove("focus");
				setTimeout(() => {
					popup.parentNode.removeChild(popup);
				}, 300);
			}
		}
	};

	nodeList.forEach(item => {
		item.type = "text";
		item.setAttribute("readonly", "");
		item.addEventListener("click", function(event) {
			event.stopPropagation();
			popup.open(this);
		});
	});
};





function uiGallery(object) {
	if(!object) object = document;

	const eventInfo = {
		node : undefined,
		eventX : 0,
		eventY : 0,
		positionX : 0
	};

	const eventHandler = {
		down : (event) => {
			event.preventDefault();
			event.stopPropagation();
			if(!(event.which == 1 || event.button == 0)) return;

			const target = (event.currentTarget || event.target);
			if(!target) return;

			const div = target.querySelector("div");
			if(target.offsetWidth > div.offsetWidth) return;

			eventInfo.node = div;
			eventInfo.eventX = event.x || event.clientX;
			eventInfo.maxPositionX = (div.offsetWidth - target.offsetWidth) * -1;

			document.onmousemove = eventHandler.move;
			document.onmouseup = eventHandler.up;
		},
		move : (event) => {
			event.preventDefault();
			event.stopPropagation();
			let v = eventInfo.positionX + ((event.x || event.clientX) - eventInfo.eventX);
			if(v > 0) v = 0;
			else if(v < eventInfo.maxPositionX) v = eventInfo.maxPositionX;

			eventInfo.node.style.transform = `translateX(${v}px)`;
		},
		up : (event) => {
			event.preventDefault();
			event.stopPropagation();
			eventInfo.positionX = eventInfo.positionX + ((event.x || event.clientX) - eventInfo.eventX);
			document.onmousemove = document.onmouseup = null;
		},
	};

	const nodeList = object.querySelectorAll(".ui-gallery");
	nodeList.forEach(item => {
		item.addEventListener("mousedown", eventHandler.down, true);
	});
}
