
function toggle() {
	if (document.getElementById('mySidebar').style.width == '250px') {
		document.getElementById('mySidebar').style.width = '0';
		document.getElementById('main').style.marginLeft = '0';
	} else {
		document.getElementById('mySidebar').style.width = '250px';
		document.getElementById('main').style.marginLeft = '250px';
	}
}