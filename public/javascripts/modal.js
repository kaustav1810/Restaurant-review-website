const modal = document.getElementsByClassName('modal')[0];
const content = document.getElementsByClassName('modal-content')[0];
const reviewBtn = document.getElementById('reviewBtn');
const shareBtn = document.getElementById('shareBtn');
const rest=88;
if(this.res_id) rest=res_id;
const loginBtn = document.getElementById('loginBtn');

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

// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
	if (event.target == modal) {
		modal.style.display = 'none';
	}
};

// add review functionality
function review() {
	modal.style.display = 'flex';

	content.innerHTML = '';

	content.innerHTML = `<span class="close">&times;</span>
	<p>Enter your review!</p>
	<form action="/${rest}/review" method="POST" >
		<i class="far fa-smile"></i><i class="far fa-meh"></i>
		<i class="far fa-frown"></i><i class="far fa-angry"></i>
		<div id="feedback">
			<input type="text" class="form-control" name="comment" placeholder="Enter your review">
			<button>POST</button>
		</div>
	</form>`;

	happy = document.getElementsByClassName('fa-smile')[0];
	ok = document.getElementsByClassName('fa-meh')[0];
	sad = document.getElementsByClassName('fa-frown')[0];
	angry = document.getElementsByClassName('fa-angry')[0];

	const feedback = document.getElementById('feedback');
	const span = document.getElementsByClassName('close')[0];

	feedback.style.display = 'none';

	let faces = [ happy, ok, angry, sad ];

	faces.map((face) =>
		face.addEventListener('click', function(e) {
			getFeedback(feedback);
			helper(e);
		})
	);

	// When the user clicks on <span> (x), close the modal
	span.onclick = function() {
		modal.style.display = 'none';
	};
}

function share() {
	modal.style.display = 'flex';

	content.innerHTML = '';

	content.innerHTML = `
	<span class="close">&times;</span>
	<h4 class="popup-title">Share with...</h4>
	<div class="share-icons">
	<div class="social">
	<div class="share-buttons"><i class="fab fa-twitter fa-4x" onClick=socialShare('twitter')></i></div>
	<span>twitter</span>
	</div>
	<div class="social">
	<i class="fab fa-facebook fa-4x" onClick=socialShare('facebook')></i>
	<span>facebook</span>
	</div>
	<div class="social">
	<i class="fas fa-envelope fa-4x" onClick=socialShare('gmail')></i>
	<span>gmail</span>
	</div>
	<div class="social">
	<i class="fab fa-whatsapp fa-4x" onClick=socialShare('whatsapp')></i>
	<span>whatsapp</span>
	</div>
	<div class="social">
	<i class="fab fa-reddit fa-4x" onclick=socialShare('reddit')></i>
	<span>reddit</span>
	</div>
	<div class="social">
	<i class="fab fa-telegram fa-4x" onclick=socialShare('telegram')></i>
	<span>telegram</span>
	</div>
	</div>
	`;
	const span = document.getElementsByClassName('close')[0];

	// When the user clicks on <span> (x), close the modal
	span.onclick = function() {
		modal.style.display = 'none';
	};
}

function login() {
	modal.style.display = 'flex';

	content.innerHTML = '';

	content.innerHTML = `
	<span class="close">&times;</span>
	<div>
	<h1>LOGIN</h1>
	<button>
	<a href="/auth/google">login with google</a>
	</button>
	<p>-----OR-----</p>
	<button>
	<a href="/login">login</a>
	</button>
	
	</div>
	`;

	const span = document.getElementsByClassName('close')[0];

	// When the user clicks on <span> (x), close the modal
	span.onclick = function() {
		modal.style.display = 'none';
	};
}

shareBtn && shareBtn.addEventListener('click', share);
reviewBtn && reviewBtn.addEventListener('click', review);
loginBtn.addEventListener('click', login);
