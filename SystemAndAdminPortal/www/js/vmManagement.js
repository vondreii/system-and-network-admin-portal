	function updateVmDesk1() {

	        $.ajax({
	            method: "POST",
	            data: {
	                "data": username,
	                "machine": "Desk1",
					"status": document.getElementById("winDeskOne").innerHTML
	            },
	            url: "/api/vm/list/win"
	        }).done((res) => {
	            btn = document.getElementById("connectOne");
	            document.getElementById("winDeskOne").innerHTML = String(res);
	            if (String(res) == "VM Provisional Status:Provisioning succeeded VM Status:VM running") {
	                btn.disabled = false;
	            } else {
	                btn.disabled = true;
	            }
	        });


	}

	function updateVmDesk2() {

	        $.ajax({
	            method: "POST",
	            data: {
	                "data": username,
	                "machine": "Desk2",
					"status": document.getElementById("winDeskTwo").innerHTML
	            },
	            url: "/api/vm/list/win"
	        }).done((res) => {
	            document.getElementById("winDeskTwo").innerHTML = String(res);
	            btn = document.getElementById("connectTwo");
	            document.getElementById("winDeskTwo").innerHTML = String(res);
	            if (String(res) == "VM Provisional Status:Provisioning succeeded VM Status:VM running") {
	                btn.disabled = false;
	            } else {
	                btn.disabled = true;
	            }
	        });

	}

	function updateVmServer() {

	        $.ajax({
	            method: "POST",
	            data: {
	                "data": username,
	                "machine": "Serv",
					"status": document.getElementById("winServer").innerHTML
	            },
	            url: "/api/vm/list/win"
	        }).done((res) => {
	            document.getElementById("winServer").innerHTML = String(res);
	            btn = document.getElementById("connectServ");
	            document.getElementById("winServer").innerHTML = String(res);
	            if (String(res) == "VM Provisional Status:Provisioning succeeded VM Status:VM running") {
	                btn.disabled = false;
	            } else {
	                btn.disabled = true;
	            }
	        });

	}

	function startDeskOne() {
	    var vmName = username + "Desk1"
	    $.ajax({
	        method: "POST",
	        data: {
	            "data": vmName
	        },
	        url: "/api/vm/start"

	    }).done((res) => {
	        updateVmDesk1();
	        console.log('startDeskOneDone');
	    })

	}

	function stopDeskOne() {
	    var vmName = username + "Desk1"
	    $.ajax({
	        method: "POST",
	        data: {
	            "data": vmName
	        },
	        url: "/api/vm/stop"

	    }).done((res) => {
	        updateVmDesk1();
	    })

	}

	function connectDeskOne() {
	    var vmName = username + "Desk1"
	    var formDeskOne = document.createElement("form");
	    var formElement = document.createElement("input");
	    formElement.setAttribute("type", "hidden");
	    formElement.name = "vmName";
	    formElement.value = vmName;
	    formDeskOne.method = "POST";
	    formDeskOne.target = "_blank"
	    formDeskOne.action = "/rdpClient";
	    formDeskOne.appendChild(formElement);
	    document.body.appendChild(formDeskOne);
	    formDeskOne.submit();

	}

	function deskOneWindowMangement() {
	    window.open('/rdpClient');
	}

	function startDeskTwo() {
	    var vmName = username + "Desk2";
	    $.ajax({
	        method: "POST",
	        data: {
	            "data": vmName
	        },
	        url: "/api/vm/start"

	    }).done((res) => {
	        updateVmDesk2();
	    })

	}

	function stopDeskTwo() {
	    var vmName = username + "Desk2";
	    $.ajax({
	        method: "POST",
	        data: {
	            "data": vmName
	        },
	        url: "/api/vm/stop"

	    }).done((res) => {
	        updateVmDesk2();
	    })

	}

	function connectDeskTwo() {
	    var vmName = username + "Desk2"
	    var formDeskTwo = document.createElement("form");
	    var formElement = document.createElement("input");
	    formElement.setAttribute("type", "hidden");
	    formElement.name = "vmName";
	    formElement.value = vmName;
	    formDeskTwo.method = "POST";
	    formDeskTwo.action = "/rdpClient";
	    formDeskTwo.target = "_blank"
	    formDeskTwo.appendChild(formElement);
	    document.body.appendChild(formDeskTwo);
	    formDeskTwo.submit();

	}

	function startServer() {
		alert('Inside Start Desk 3');
	    var vmName = username + "Serv";
	    $.ajax({
	        method: "POST",
	        data: {
	            "data": vmName
	        },
	        url: "/api/vm/start"

	    }).done((res) => {
	        updateVmServer();
	    })
	}

	function stopServer() {
		alert('Inside Stop Desk 3');
	    var vmName = username + "Serv";
	    $.ajax({
	        method: "POST",
	        data: {
	            "data": vmName
	        },
	        url: "/api/vm/stop"

	    }).done((res) => {
	        updateVmServer();
	    })
	}

	function connectServer() {
		alert('Inside Connect Desk 3');
	    var vmName = username + "Serv"
	    var formServer = document.createElement("form");
	    var formElement = document.createElement("input");
	    formElement.setAttribute("type", "hidden");
	    formElement.name = "vmName";
	    formElement.value = vmName;
	    formServer.method = "POST";
	    formServer.action = "/rdpClient";
	    formServer.target = "_blank"
	    formServer.appendChild(formElement);
	    document.body.appendChild(formServer);
	    formServer.submit();

	}


	function showHideAdd() {
	    var addNewSection = $('.js_add-new');
	    if (addNewSection.css('display') === 'none') {
	        addNewSection.css('display', 'block');
	    } else {
	        addNewSection.css('display', 'none');
	    }
	}

	window.onload = function() {
	    updateVmDesk1();
	    updateVmDesk2();
	    updateVmServer();
	}


	window.setInterval(
	    function() {
	        updateVmDesk1();
	        updateVmDesk2();
	        updateVmServer();
	    }, 5000);
