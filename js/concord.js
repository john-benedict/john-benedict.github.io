$(document).ready(function() {

	// Version check
	console.log("v.0.8.1.9");
	//console.log("window: " + window);
	
	// Check to see that indexedDB is supported
	//window.indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
	//if ( !("indexedDB" in window) ) { 
	if (!window.indexedDB) {
		console.log("no indexedDB support")
		$('div#no_indexedDB').fadeIn(300);
		return; 
	}
	
//	/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --user-data-dir=concord-cahce --unsafely-treat-insecure-origin-as-secure=http://offline.704one.com

	/*
	if ('serviceWorker' in navigator) {
		navigator.serviceWorker.register('/concord-sw.js', {
			scope: '/'
		});
	}
	*/

	// Init Our App Variables
	var db;
	var connectionStatus;
	var user;
	var userSession;
	var userStatus;
	var techID;
	var dbEmpty = false;

	// Open our indexedDB
	var openRequest = window.indexedDB.open("concord",103);
    openRequest.onerror = function(e) { console.log("Error opening db"); console.dir(e); };
    openRequest.onupgradeneeded = function(e) {
		var thisDB = e.target.result;
		var objectStore;
		//Create Task Object Store
		if(!thisDB.objectStoreNames.contains("task")) {
			console.log("Info DB Created");
			objectStore = thisDB.createObjectStore("task", { keyPath: "id", autoIncrement: true });
			/*
			objectStore.createIndex("taskID", "taskID", { unique: true });
			objectStore.createIndex("name", "name", { unique: false });
			objectStore.createIndex("deviceName", "deviceName", { unique: false });
			objectStore.createIndex("serial", "serial", { unique: false });
			objectStore.createIndex("address", "address", { unique: false, multiEntry: true });
			objectStore.createIndex("comments", "comments", { unique: false });
			objectStore.createIndex("deviceType", "deviceType", { unique: false });
			objectStore.createIndex("inlinecheckboxes", "inlinecheckboxes", { unique: false });
			objectStore.createIndex("checkboxes", "checkboxes", { unique: false });
			objectStore.createIndex("inlineradios", "inlineradios", { unique: false });
			objectStore.createIndex("radios", "radios", { unique: false });
			objectStore.createIndex("test", "test", { unique: false });
			*/
		}
	};
	openRequest.onsuccess = function(e) {
		db = e.target.result;
		db.onerror = function(event) { alert("Database error: " + event.target.errorCode); };
	};


	// Login Form Ajax
	$('form#loginForm').submit(function() {
		var username = $('#inputEmail').prop("value");
		var password = $('#inputPassword').prop("value");
		var func = "Login"; 
		var JSONObject_usrpwd = { "username": username, "password": password, "func": func };
		if ( username && password ) {
			console.log("init Login Ajax request");
			$.ajax({
				method: "GET",
				cache: false,
				tryCount: 0,
				retryLimit: 3,
				url: "/cgi-bin/concord.pl",
				contentType: "application/json; charset=utf-8",
				data :  JSONObject_usrpwd,
				dataType: 'JSON',
				error: function(XMLHttpRequest, textStatus, errorThrown) { 
					$('div#loginResult pre').text("responseText: " + XMLHttpRequest.responseText 
					+ ", textStatus: " + textStatus 
					+ ", errorThrown: " + errorThrown);
					$('div#loginResult').addClass("alert-danger");
				},
				beforeSend: function() {
					console.log("Sending login info...");
					$('div#loginResult').removeClass("alert-success");
					$('div#loginResult').removeClass("alert-danger");
					if(!$('div#loginResult').hasClass("alert-info")){ $('div#loginResult').addClass("alert-info");}
					$('div#loginResult pre').text('Loading...');
				},
				success: function(data){
					techID = data.techID;
					userStatus = data.userStatus;
					if (data.error) {
						$('div#loginResult pre').text("Something went wrong. " + data.error);
						$('div#loginResult').addClass("alert-danger");
					}
					else {
						$('div#loginResult pre').text("Success! You're logged in now.");
						$('div#loginResult').removeClass("alert-info");
						$('div#loginResult').addClass("alert-success");
						$('#login_form').delay(500).fadeOut(300, function() {
							list_tasks();
							$('.app-user').fadeIn(300);
						});
					}
				}
			});
	} else {
		$('div#loginResult pre').text("enter username and password");
		$('div#loginResult').removeClass("alert-danger");
		$('div#loginResult').removeClass("alert-info");
		$('div#loginResult').addClass("alert-danger");
	}
	$('div#loginResult').fadeIn(300);
	return false;
	});



	// --- Link / Button Click Event Handlers --- //

	// Logout Link
	$(document).on("click", 'a.action_logout', function(e) {
		$('#tasks').fadeOut(300, function() { 
			$('#task_form').fadeOut(300, function() {
				$('div#tasks_loading pre').text("Logging out...");
				$('#tasks_loading').fadeIn(300, function() { logout(); });
			});
		});
		return false;
	});
	
	// Get Tasks from DB Button
	$(document).on("click", 'a.action_get_tasks', function(e) {
		$('#tasks').fadeOut(300, function() {
			$('div#tasks_loading pre').text("Checking the server for tasks...");
			$('#tasks_loading').fadeIn(300, function() { check_user_status("get tasks"); });
		});
		return false;
	});

	// Upload Tasks to DB Button
	$(document).on("click", 'a.action_upload_tasks', function(e) {
		$('#tasks').fadeOut(300, function() {
			$('div#tasks_loading pre').text("Checking the server for tasks...");
			$('#tasks_loading').fadeIn(300, function() { check_user_status("upload tasks"); });
		});		
		return false;
	});

	// Add Task Button
	$(document).on("click", 'a.action_add_task', function(e) {
		add_task();
		return false;
	});

	// Edit a Task Button (Task List)
	$('#tasks_table').on("click", 'a.edit', function(e) {
		var thisID = $(this).parent().parent().data("key");
		edit_task(thisID);
		return false;
	});

	// Table Row (Task List)
	$('#tasks_table').on("click", 'td', function(e) {
		var thisID = $(this).parent().data("key");
		edit_task(thisID);
		return false;
	});	

	// Delete a Task Button (Task List)
	$("#tasks_table").on("click", "a.delete", function(e) {
		var thisID = $(this).parent().parent().data("key");
		delete_task(thisID);
		return false;
	});

	// Cancel Button (Add/Edit Task)
	$(document).on("click", 'a.action_cancel_task', function(e) {
		$('#task_form').fadeOut(300, function() {
			$('#tasks').fadeIn(300, function() {
				$('html, body').animate({ scrollTop: 0 }, 'fast');
			});
		});
	});

	// Save Button (Add/Edit Task)
	$(document).on("click", 'a.action_save_task', function(e) {
		save_task();
		return false;
	});



	// --- Our Apps Functions --- //

	// Basic Internet Connection Check
	// https://www.kirupa.com/html5/check_if_internet_connection_exists_in_javascript.htm
	/*
	function doesConnectionExist() {
		var xhr = new XMLHttpRequest();
		var file = window.location.href.split("?")[0] + "?" + Math.random();
		var randomNum = Math.round(Math.random() * 10000);
		xhr.open('HEAD', file + "?rand=" + randomNum, true);
		xhr.send();
		xhr.addEventListener("readystatechange", processRequest, false);
		function processRequest(e) {
			if (xhr.readyState == 4) {
				if (xhr.status >= 200 && xhr.status < 304) {
					console.log("connection exists! " + file);
					connectionStatus = "Online";
				} else {
					console.log("connection doesn't exist! " + file);
					connectionStatus = "Offline";
				}
			}
		}
	}
	*/

	// App init
	function init_app(){
		console.log("init_app");
		if ( userStatus == "Logged In" ) { 
			list_tasks();
		} else {
			if ( userStatus === "Logged Out" && $('.app-user').is(':visible') ) { 
				$('.app-user').fadeOut(300);
			}
			$('#login_form').delay(500).fadeIn(300);
		}
	}
	
	// Get the Date / Time
	function dtFormat(input) {
		if(!input) return "";
			var res = (input.getMonth()+1) + "/" + input.getDate() + "/" + input.getFullYear() + " ";
			var hour = input.getHours();
			var ampm = "AM";
			if(hour === 12) ampm = "PM";
			if(hour > 12){hour-=12;ampm = "PM";}
		var minute = input.getMinutes()+1;
		if(minute < 10) minute = "0" + minute;
		res += hour + ":" + minute + " " + ampm;
		return res;
	}

	// Pad a number string with extra 0's
	function pad(str,max){ str = str.toString(); return str.length < max ? pad("0" + str,max) : str; }

	// Check User Status w/a Return Function Parameter
	function check_user_status(return_func){
		console.log("init check_user_status");
		var JSONObject_checkUserStatus = { "func": "Check User Status" };
		$.ajax({
			method: "GET",
			cache: false,
			tryCount: 0,
			retryLimit: 3,
			timeout: 5000,
			url: "/cgi-bin/concord.pl",
			contentType: "application/json; charset=utf-8",
			data: JSONObject_checkUserStatus,
			dataType: 'JSON',
			error: function(XMLHttpRequest, textStatus, errorThrown) { 
				if(textStatus==="timeout") {
					$('div#tasks_loading pre').text("Your Request Timed out. Check your internet connection and try again.");
				}
				console.log("responseText: " + XMLHttpRequest.responseText + ", textStatus: " + textStatus  + ", errorThrown: " + errorThrown)
			},
			beforeSend: function() {
				$('div#tasks_loading pre').text("Checking User Status...");
				$('#tasks_loading').fadeIn(300);
			},
			success: function(data){
				if (data.error) { console.log("Something went wrong: " + data.error); }
				else {
					user = data.user;
					userStatus = data.userStatus;
					techID = data.techID;
					console.log("userStatus: " + userStatus);
					if ( userStatus === "Logged Out" && $('.app-user').is(':visible') ) { 
						$('.app-user').fadeOut(300);
					} else if ( userStatus === "Logged In" && $('.app-user').is(':hidden') ) { 
						$('#app-user').text(user);
						$('#app-tech-id').text(techID);
						$('.app-user').fadeIn(300);
					}
					if ( return_func == "init" ) {
						$('#tasks_loading').fadeOut(300);
						init_app();
					}
					if ( return_func == "get tasks" ) {
						if ( userStatus == "Logged In" ) {
							get_tasks();
						} else {
							$('#tasks_loading').fadeOut(300, function() {
								$('#login_form').delay(500).fadeIn(300);
								$('div#loginResult').removeClass("alert-success");
								$('div#loginResult').removeClass("alert-info");
								$('div#loginResult pre').text("Please Login Again. Your session has ended.");
								$('div#loginResult').addClass("alert-danger");
							});
						}
					}
					if ( return_func == "upload tasks" ) {
						if ( userStatus == "Logged In" ) {
							upload_tasks();
						} else {
							$('#tasks_loading').fadeOut(300, function() {
								$('#login_form').delay(500).fadeIn(300);
								$('div#loginResult').removeClass("alert-success");
								$('div#loginResult').removeClass("alert-info");
								$('div#loginResult pre').text("Please Login Again. Your session has ended.");
								$('div#loginResult').addClass("alert-danger");
							});
						}
					}
				}
			}
		});
	}
	
	// Add Task
	function add_task(){
		console.log("init add_task");
		$('#key').val("");
		$('#taskID').val("");
		$('#name').val("");
		$('#deviceName').val("");
		$('#serial').val("");
		$('#address1').val("");
		$('#address2').val("");
		$('#city').val("");
		$('#state').val("");
		$('#zip').val("");
		$('#comments').val("");
		$('#deviceType').val("");
		$('#task_form input[type="checkbox"]').prop('checked', false);
		$('#task_form input[type="radio"]').prop('checked', false);
		$('#task_form h2').text("Add Task");
		$('#tasks').fadeOut(300, function() {
			$('#task_form').fadeIn(300, function() {
				$('html, body').animate({ scrollTop: 0 }, 'fast');
			});
		});
	}
	
	// Edit Task
	function edit_task(thisID){
		console.log("init edit_task");
		if ( dbEmpty == false ) {
			var request = db.transaction(["task"], "readwrite").objectStore("task").get(thisID);
			request.onsuccess = function(event) {
				var task = request.result;
				$('#task_form h2').text("Edit Task");
				$('#key').val(task.id);
				$('#taskID').val(task.taskID);
				$('#name').val(task.name);
				$('#deviceName').val(task.deviceName);
				$('#serial').val(task.serial);
				$('#address1').val(task.address.streetAddress1);
				$('#address2').val(task.address.streetAddress2);
				$('#city').val(task.address.city);
				$('#state').val(task.address.state);
				$('#zip').val(task.address.postalCode);
				$('#comments').val(task.comments);
				$('#deviceType').val(task.deviceType);
				
				// Checkboxes
				$('input[name="inlinecheckboxes[]"]').each(function(){
					var cb = $(this);
					if ($.inArray(cb.val(), task.inlinecheckboxes) > -1) { cb.prop('checked', true); } else { cb.prop('checked', false); }
				});
				$('input[name="checkboxes[]"]').each(function(){
					var cb = $(this);
					if ($.inArray(cb.val(), task.checkboxes) > -1) { cb.prop('checked', true); } else { cb.prop('checked', false); }
				});
				
				// Radios
				$('input[name="inlineradios"]').each(function(){
					var rb = $(this);
					if ( task.inlineradios === rb.val() ) { rb.prop('checked', true); } else { rb.prop('checked', false); }
				});
				$('input[name="radios"]').each(function(){
					var rb = $(this);
					if ( task.radios === rb.val() ) { rb.prop('checked', true); } else { rb.prop('checked', false); }
				});
				
				$('#tasks').fadeOut(300, function() {
					$('#task_form').fadeIn(300, function() { $('html, body').animate({ scrollTop: 0 }, 'fast'); });
				});
			};
		} else { console.log("No tasks to edit"); }
	}

	// Save Task
	function save_task(){
		console.log("init save_task");
		var store = db.transaction(['task']).objectStore('task');
		var count = store.count();
		count.onsuccess = function() {
			var key = $('#key').val();
			var name = $('#name').val();
			var deviceName = $('#deviceName').val();
			var serial = $('#serial').val();
			var streetAddress1 = $('#address1').val();
			var streetAddress2 = $('#address2').val();
			var city = $('#city').val();
			var state = $('#state').val();
			var postalCode = $('#zip').val();
			var comments = $('#comments').val();
			var deviceType = $('#deviceType').val();

			var inlinecheckboxes = $('input[type="checkbox"][name="inlinecheckboxes[]"]:checked').map(function() { return this.value; }).get();
			var checkboxes = $('input[type="checkbox"][name="checkboxes[]"]:checked').map(function() { return this.value; }).get();
			
			var inlineradios = $('input:checked[name="inlineradios"]').val();
			var radios = $('input:checked[name="radios"]').val();

			var taskID = $('#taskID').val();
				var userID   = taskID.substring(0, 4);
				var xun = taskID.substring(4,5);
				var sys_taskID = taskID.substring(5);
				if ( xun === "x" ) { xun = "u"; }
				taskID = userID + xun + sys_taskID;
				
			if (taskID === "") { taskID = techID + "n" + pad((Number(count.result) + 1), 4); }
				
			var address = {streetAddress1:streetAddress1,streetAddress2:streetAddress2,city:city,state:state,postalCode:postalCode};

			var t = db.transaction(["task"], "readwrite");
			
			if(key === "") {
				t.objectStore("task")
					.add({taskID:taskID,name:name,deviceName:deviceName,serial:serial,address:address,comments:comments,deviceType:deviceType,
						inlinecheckboxes:inlinecheckboxes,
						checkboxes:checkboxes,
						inlineradios:inlineradios,
						radios:radios
					});
			} else {
				t.objectStore("task")
					.put({id:Number(key),
						taskID:taskID,name:name,deviceName:deviceName,serial:serial,address:address,comments:comments,deviceType:deviceType,
						inlinecheckboxes:inlinecheckboxes,
						checkboxes:checkboxes,
						inlineradios:inlineradios,
						radios:radios
					});
			}
			t.oncomplete = function(event) {
				$('#task_form').fadeOut(300, function() {
					$('div#tasks_loading pre').text("Task Saved.");
					$('#tasks_loading').fadeIn(300, function() { list_tasks(); });
				});
			};
		}
	}

	// Delete Task
	function delete_task(thisID){
		console.log("init delete_task");
		var thisRow = $(thisID)[0];
		var t = db.transaction(["task"], "readwrite");
		var request = t.objectStore("task").delete(thisID);
		t.oncomplete = function(event) { 
			console.log("Deleted record: " + thisID);
			$('#' + thisRow).find('td').fadeOut(300, function() { 
				$('#' + thisRow).remove(); 
			}); 
		};
	};

	// Get Tasks from Server DB
	function get_tasks(){
		console.log("init get_tasks");
		$('#tasks').delay(500).fadeOut(300, function() {});
		var JSONObject_getTasks = { "func": "Get Tasks" };
		$.ajax({
			method: "GET",
			cache: false,
			tryCount: 0,
			retryLimit: 3,
			url: "/cgi-bin/concord.pl",
			contentType: "application/json; charset=utf-8",
			data: JSONObject_getTasks,
			dataType: 'JSON',
			error: function(XMLHttpRequest, textStatus, errorThrown) { 
				console.log("responseText: " + XMLHttpRequest.responseText + ", textStatus: " + textStatus  + ", errorThrown: " + errorThrown)
			},
			beforeSend: function() {},
			success: function(data){
				if (data.error) { 
					console.log("Something went wrong. " + data.error); 
				} else {
					if ( data.tasks === "" ){
						$('div#tasks_loading pre').text("No new tasks on the server for you.");
					} else {
						$('div#tasks_loading pre').text("Compiling Task Data...");
					}
					DB_to_indexedDB(data);
				}
			}
		});
	}

	// Put Tasks from Server DB to our local indexedDB
	function DB_to_indexedDB(data){
		console.log("init DB_to_indexedDB");
		if ( data.tasks === "" ) { 
			setTimeout(list_tasks(), 1000);
			dbEmpty = true;
		} else {
			dbEmpty = false;
			var init_transaction = db.transaction(["task"], "readonly");
			var init_objectStore = init_transaction.objectStore("task");
			var init_request = init_objectStore.openCursor();
			var taskIDs = [];
			var IDs = [];
			init_request.onsuccess = function(event) {				
				var init_cursor = event.target.result; 
				if (init_cursor) {
					taskIDs.push(init_cursor.value.taskID);
					IDs.push(init_cursor.key);
					init_cursor.continue();
				} else {
					var num_add_update = data.tasks.length;
					var num_added_updated = 0;
					for (i = 0; i < data.tasks.length; i++) { 
						var taskID = data.tasks[i].taskID;
						var name = data.tasks[i].name;
						var deviceName = data.tasks[i].deviceName;
						var serial = data.tasks[i].serial;
						var address = data.tasks[i].address;
						var comments = data.tasks[i].comments;
						var deviceType = data.tasks[i].deviceType;
						
						var inlinecheckboxes = data.tasks[i].inlinecheckboxes;
						var checkboxes = data.tasks[i].checkboxes;
						
						var inlineradios = data.tasks[i].inlineradios;
						var radios = data.tasks[i].radios;
						
						var transaction = db.transaction(["task"],"readwrite");
						var store = transaction.objectStore("task");
						
						var task = {
							taskID:taskID,name:name,deviceName:deviceName,serial:serial,address:address,comments:comments,deviceType:deviceType,
							//created:new Date(),
							inlinecheckboxes:inlinecheckboxes,
							checkboxes:checkboxes,
							inlineradios:inlineradios,
							radios:radios
						}
						
						//Perform the add/update
						if ( taskIDs.indexOf(task.taskID) === -1 ) {
							//add new task
							var request = store.add({
							taskID:taskID,name:name,deviceName:deviceName,serial:serial,address:address,comments:comments,deviceType:deviceType,
							inlinecheckboxes:inlinecheckboxes,
							checkboxes:checkboxes,
							inlineradios:inlineradios,
							radios:radios
							});
							request.onerror = function(e) { console.log("Error",e.target.error.name); }
							request.onsuccess = function(e) {
								num_added_updated++;
								console.log("Added new task to the indexedDB!");
								if (num_added_updated == num_add_update) { setTimeout(list_tasks(), 1000); }
							}
						} else {
							//update task
							var index = taskIDs.indexOf(task.taskID);
							var request = store.put({
							id:IDs[index],taskID:taskID,name:name,deviceName:deviceName,serial:serial,address:address,comments:comments,deviceType:deviceType,
							inlinecheckboxes:inlinecheckboxes,
							checkboxes:checkboxes,
							inlineradios:inlineradios,
							radios:radios
							});
							request.onerror = function(e) { console.log("Error",e.target.error.name); }
							request.onsuccess = function(e) {
								num_added_updated++;
								console.log("Updated a task in the indexedDB!");
								if (num_added_updated == num_add_update) { setTimeout( function(){ list_tasks(); }, 1000 ); }
							}
						}
					}
				}
			}
		}
	}

	// List Tasks
	function list_tasks(check_for_more){
		console.log("init list_tasks");
		var transaction = db.transaction(["task"], "readonly");
		var objectStore = transaction.objectStore("task");
		var request = objectStore.openCursor();
		var content="";
		request.onsuccess = function(event) {
			var cursor = event.target.result; 	
			var countRequest = objectStore.count();
			countRequest.onsuccess = function() {
				if ( countRequest.result != 0 ) {
					if (cursor) {
						content += "<tr id=\""+cursor.key+"\" data-key=\""+cursor.key+"\">";
						content += "<td class=\"task_id\">"+cursor.value.taskID+"</td>";
						content += "<td class=\"task_name\">"+cursor.value.name+"</td>";
						content += "<td class=\"task_deviceName\">"+cursor.value.deviceName+"</td>";
						content += "<td class=\"task_city\">"+cursor.value.address.city+"</td>";
						content += "<td class=\"task_deviceType\">"+cursor.value.deviceType+"</td>";
						//content += "<td>"+dtFormat(cursor.value.updated)+"</td>";
						content += "<td class=\"text-right\"><a class=\"btn btn-primary edit\">Edit</a> <a class=\"btn btn-danger delete\">Delete</a></td>";
						content +="</tr>";
						cursor.continue();
					} else {						
						$('#tasks_table tbody').empty().append(content);
						$('#tasks_loading').delay(500).fadeOut(300, function() {
							$('#tasks').delay(500).fadeIn(300, function() {
								$('html, body').animate({ scrollTop: 0 }, 'fast');
							});
						});
					}
				} else {
					console.log("dbEmpty: " + dbEmpty + "; check_for_more: " + check_for_more);
					if ( dbEmpty === false && check_for_more === undefined ) {
						console.log("indexedDb is empty, and we want to check the server DB");
						$('#tasks_loading').delay(500).fadeIn(300, function() {
							$('div#tasks_loading pre').text("Checking server for more tasks...");
						});
						setTimeout( function(){ get_tasks(); }, 1000 );
					} else {
						console.log("indexedDb is empty, and we are fine with that");
						content += "<tr>";
						content += "<td colspan=\"6\">There are no tasks on the server, or stored locally. Add One.</td>";
						content +="</tr>";
						$('#tasks_table tbody').empty().append(content);
						$('#tasks_loading').delay(500).fadeOut(300, function() {
							$('#tasks').delay(500).fadeIn(300, function() {
								$('html, body').animate({ scrollTop: 0 }, 'fast');
							});
						});
					}
				}
			}
		};
	}

	// Upload our Tasks to the DB
	function upload_tasks() {
		console.log("init upload_tasks");
		var transaction = db.transaction(["task"], "readwrite");
		var objectStore = transaction.objectStore("task");
		var cursor = objectStore.openCursor();
		var uploadTasks = new Array;
		cursor.onsuccess = function(event) {
			var res = event.target.result;
			if(res) {
				uploadTasks.push(res.value);
				res.continue();
			} else {	
				var jsonData = JSON.stringify(uploadTasks);
				if ( jsonData != '[]' ){
					$.ajax({
						url: "/cgi-bin/upload.pl",
						method: "POST",
						processData:false,
						contentType: "application/json; charset=utf-8",
						data: jsonData,
						dataType: 'JSON',
						cache: false,
						error: function(XMLHttpRequest, textStatus, errorThrown) {
							console.log("responseText: " + XMLHttpRequest.responseText 
							+ ", textStatus: " + textStatus 
							+ ", errorThrown: " + errorThrown)
						},
						beforeSend: function() {
							$('div#tasks_loading pre').text("Uploading Tasks...");
							console.log("Upload Data: " + jsonData);
						},
						success: function(jsonData){
							if (jsonData.upload == "error") {
								console.log("Upload Response: " + jsonData.upload_response);
								$('div#tasks_loading pre').text("Somthing happened. Upload failed...");
							} else {
								console.log("Upload Response: " + jsonData.upload_response);
								//delete on successful upload
								var transaction = db.transaction(["task"], "readwrite");
								var objectStore = transaction.objectStore("task");
								var objectStoreRequest = objectStore.clear();
								objectStoreRequest.onsuccess = function(event) {
									console.log("indexedDB cleared");
									dbEmpty = true;
									$('div#tasks_loading pre').text("Upload successful.");
									setTimeout( function(){ list_tasks("no"); }, 1000 );
								}
							}
						}
					});
				} else {
					console.log("Nothing to Upload...");
					$('div#tasks_loading pre').text("No tasks to upload...");
					$('#tasks_loading').delay(1000).fadeOut(300, function() {
						list_tasks("no");
					});
				}
			}
		}
	}

	// Logout
	function logout() {
		console.log("init logout");
		var JSONObject_logout = { "func": "Logout" };
		$.ajax({
			method: "GET",
			cache: false,
			tryCount: 0,
			retryLimit: 3,
			url: "/cgi-bin/concord.pl",
			contentType: "application/json; charset=utf-8",
			data :  JSONObject_logout,
			dataType: 'JSON',
			error: function(XMLHttpRequest, textStatus, errorThrown) { 
				console.log("responseText: " + XMLHttpRequest.responseText + ", textStatus: " + textStatus  + ", errorThrown: " + errorThrown)
			},
			beforeSend: function() {},
			success: function(data){
				if (data.error) { console.log("Something went wrong. " + data.error); }
				else {
					userStatus = data.userStatus;
					$('#tasks_loading').fadeOut(300, function() {
						$('div#loginResult pre').text("You successfully Logged Out.");
						$('div#loginResult').removeClass("alert-info");
						$('div#loginResult').removeClass("alert-danger");
						$('div#loginResult').addClass('alert-success').fadeIn(300);
						init_app();
					});
				}
			}
		});
	}

	// Init our App
	// Check the user status and run the init_app() function
	check_user_status("init");

});