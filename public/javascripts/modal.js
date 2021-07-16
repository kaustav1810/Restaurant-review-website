const dummy = document.createElement('BUTTON');
const modal = document.getElementsByClassName('modal')[0] || dummy;
const content = document.getElementsByClassName('modal-content')[0] || dummy;
const reviewBtn = document.getElementById('reviewBtn') || dummy;
const shareBtn = document.getElementById('shareBtn') || dummy;
const card = document.querySelectorAll('.rest-card') || dummy;
const loginBtn = document.getElementById('loginBtn') || dummy;
const bannerLoginBtn = document.querySelector('.banner-login-btn') || dummy;
const filterBtn = document.querySelector('#filterBtn') || dummy;


// make the restaurant div's clickable
card.forEach((card) => {
	const mainLink = card.querySelector('.main-link');
	card.addEventListener('click', () => {
		const isTextSelected = window.getSelection().toString();
		if (!isTextSelected) {
			mainLink.click();
		}
	});
});

const rest = 88;
if (this.res_id) rest = res_id;

// onsubmit function
function confirmation() {
	const feedback = document.getElementById('feedback');

	feedback.style.display = 'none';

	content.innerText = 'Thank you for your feedback!!';

	setTimeout(function() {
		modal.style.display = 'none';
	}, 3000);

	return true;
}

function helper(e) {
	let olds = document.getElementsByClassName('active');

	for (let old of olds) {
		old.classList.remove('active');
	}

	e.target.classList.add('active');
}

// ask for feedback
function getFeedback(feedback) {
	feedback.style.display = 'block';
}

// add review functionality
function review(id) {

	happy = document.getElementsByClassName('fa-smile')[0];
	ok = document.getElementsByClassName('fa-meh')[0];
	sad = document.getElementsByClassName('fa-frown')[0];
	angry = document.getElementsByClassName('fa-angry')[0];

	const feedback = document.getElementById('feedback');

	let faces = [ happy, ok, angry, sad ];

	faces.map((face) =>
		face.addEventListener('click', function(e) {
			getFeedback(feedback);
			helper(e);
		})
	);

	openPopup(id);
}


function openPopup(popup){
	$(document).ready(function() {
		$(popup).modal('show');
		$(function() {
			$('[data-toggle="tooltip"]').tooltip();
		});
	});
}

shareBtn && shareBtn.addEventListener('click', ()=>{
	review('#shareModal');
});

reviewBtn && reviewBtn.addEventListener('click', ()=>{
	openPopup('#reviewModal');
});

loginBtn.addEventListener('click', ()=>{
	openPopup('#loginModal');
});

bannerLoginBtn.addEventListener('click', ()=>{
	openPopup('#loginModal');
});

filterBtn.addEventListener('click', () => {
	openPopup('#filterModal');

});

console.log(bannerLoginBtn)