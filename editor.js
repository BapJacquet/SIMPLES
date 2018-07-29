var quill = new Quill('#editor', {
  modules: {
    toolbar: {
	    container: '#toolbar'
	  }
  }
});

function logHtmlContent(){
  console.log(quill.root.innerHTML);
}
