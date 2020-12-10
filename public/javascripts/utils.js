const params = 'menubar=no,toolbar=no,status=no,width=570,height=570'; // for window
const sub = encodeURIComponent('check out this amazing restaurant');
const hui = window.location.href.split('/')[3];
const url = encodeURIComponent(`http://localhost:3000/${hui}/details?`);

const socialLinks = {
	facebook: `http://www.facebook.com/sharer/sharer.phpu=${url}`,
	twitter: `https://twitter.com/intent/tweet?url=${url}&text=${sub}`,
	reddit: `https://reddit.com/submit?url=${url}&title=${sub}`,
	whatsapp: `https://api.whatsapp.com/send?text=${sub}%20${url}`,
	gmail: `https://mail.google.com/mail/?view=cm&su=${sub}&body=${url}`,
	telegram: `https://t.me/share/url?url=${url}&text=${sub}`
};
function socialShare(link) {

	const shareUrl = socialLinks[link];

	window.open(shareUrl, 'NewWindow', params);
}
