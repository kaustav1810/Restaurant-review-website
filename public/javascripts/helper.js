function showRating(rating){
    let ratingDiv = document.createElement('div');

		for(let i=0;i<rating;i++){
			ratingDiv.appendChild(`<i class="fas fa-star"></i>`);
		}
		console.log(ratingDiv);

		return ratingDiv;
}

function yellow(){
    console.log('test');

}
    console.log('ffff');