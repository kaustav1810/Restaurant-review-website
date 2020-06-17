// Get the modal
		var modal = document.getElementById("myModal");
		
		// get modal content
		var content = document.getElementsByClassName("modal-content")[0];
			
		// Get the button that opens the modal
		var btn = document.getElementById("myBtn");

		// Get the <span> element that closes the modal
		var span = document.getElementsByClassName("close")[0];
		
		// get feedback textbox
		var feedback = document.getElementById("feedback");
		
		// onsubmit function
		function confirmation(){
			feedback.style.display = "none";
			content.innerText = "Thank you for your feedback!!";
			setTimeout(function(){myModal.style.display = "none";},3000);
		}
		// get the rating icons
		var happy = document.getElementsByClassName("fa-smile")[0];
		var ok = document.getElementsByClassName("fa-meh")[0];
		var sad = document.getElementsByClassName("fa-frown")[0];
		var angry = document.getElementsByClassName("fa-angry")[0];
			
		// ask for feedback
			
		happy.onclick = function(){
			feedback.style.display = "block";
		}
			
		// When the user clicks on the button, open the modal
		btn.onclick = function() {
		  modal.style.display = "block";
		}

		// When the user clicks on <span> (x), close the modal
		span.onclick = function() {
		  modal.style.display = "none";
		}

		// When the user clicks anywhere outside of the modal, close it
		window.onclick = function(event) {
		  if (event.target == modal) {
			modal.style.display = "none";
		  }
		}