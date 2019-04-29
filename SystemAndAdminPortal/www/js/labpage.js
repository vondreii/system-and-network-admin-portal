/*
	Sends a post request to the server for labpages
*/

function labrequest(labname){
	var form = document.createElement("form");
	var formElement = document.createElement("input");
	formElement.setAttribute("type","hidden");
	formElement.name="filename";
	formElement.value=labname;
	form.method="POST";
	form.action="/labpage";
	form.appendChild(formElement);
	document.body.appendChild(form);
	form.submit();
}

function deleteWeeklyContent(labindex){
	var result = confirm("Are you sure you want to delete this Content?");
	if(result){
		var form = document.createElement("form");
		var formElement = document.createElement("input");
		formElement.setAttribute("type","hidden");
		formElement.name="labindex";
		formElement.value=labindex;
		form.method="POST";
		form.action="/admin/weeklyContent/del";
		form.appendChild(formElement);
		document.body.appendChild(form);
		form.submit();
	}
}

function deleteLab(labindex){
	var result = confirm("Are you sure you want to delete this lab?");
	if(result){
		var form = document.createElement("form");
		var formElement = document.createElement("input");
		formElement.setAttribute("type","hidden");
		formElement.name="labindex";
		formElement.value=labindex;
		form.method="POST";
		form.action="/admin/lab/del";
		form.appendChild(formElement);
		document.body.appendChild(form);
		form.submit();
	}
}

function deleteVM(vmName){

			var form = document.createElement("form");
			var formElement = document.createElement("input");
			formElement.setAttribute("type","hidden");
			formElement.name="vmname";
			formElement.value=vmName;
			form.method="POST";
			form.action="/api/vm/delete";
			form.appendChild(formElement);
			document.body.appendChild(form);
			form.submit();

}
