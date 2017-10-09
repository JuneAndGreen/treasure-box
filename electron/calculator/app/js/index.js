(function() {
	var box = document.getElementById('box');
	var result = document.getElementById('result');

	var isBegin = true;
	var last = '';
	var res = 0;

	var doOpr = function(x, val) {
		switch(x) {
			case '+':
				res = parseInt(res, 10) + parseInt(val, 10);
				break;
			case '-':
				res = parseInt(res, 10) - parseInt(val, 10);
			  break;
			case '*':
				res = parseInt(res, 10) * parseInt(val, 10);
				break;
			case '/':
				res = parseInt(res, 10) / parseInt(val, 10);
				break;
		}
	}

	box.onclick = function(event) {
		event = event || window.event;
		var node = event.target || event.srcElement;
		if(!node) return;

		var action = node.dataset.action;
		if(!action) return;

		if(action === 'num') {
			var value = node.dataset.value;

			if(isBegin) {
				result.innerHTML = value;
			} else {
				result.innerHTML += value;
			}
			isBegin = false;
		} else if(action === 'opr') {
			var value = node.dataset.value;

			doOpr(last, result.innerHTML);
			last = value;
			res = result.innerHTML;
			isBegin = true;
		} else if(action === 'equal') {
			doOpr(last, result.innerHTML);
			result.innerHTML = res;
			isBegin = true;
		}
	};
})();