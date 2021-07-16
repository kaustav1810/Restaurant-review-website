function showToast(toast,toastMsg) {
	let ToastEl = document.querySelector(`.${toast}`);

    let ToastBody = document.querySelector(`.${toast} .toast-body`);

    ToastBody.innerHTML = toastMsg;

	let Toast = new bootstrap.Toast(ToastEl, { animation: true, autohide: true, delay: 3000 });

	Toast.show();
}
