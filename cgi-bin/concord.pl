#!/usr/bin/perl -T
use CGI;
use DBI;
use CGI::Session;
use strict;
use warnings;
 
# read the CGI params
my $cgi = CGI->new;

my $func = $cgi->param("func");
my $username = $cgi->param("username");
my $password = $cgi->param("password");

my $jsonData = $cgi->param("jsonData");

my $session;

my $user_status;
my $techID;


my $json;



if ( $username eq '' ) { $username = 'johnb@704one.com'; }
if ( $techID eq '' ) { $techID = '5678'; }
	



# Just a little pause to make the testing feel like its doing something
sleep(1);






# We need a way to tell if the user is logged in 
# and we will be checking the status of a user before:
# Iniitalizing the App (loading the HTML page, refreshing the HTML page) -> Logging In, 
# Getting Tasks, Uploading Tasks, Logging Out

# Maybe we use sessions?

# But would be for this script file -- not for the HTML page

# Then we will send that session var back to js file 
# and use it to pass back and forth to check status
# Logged Out or Logged In

$user_status = 'Logged In';






if ( $func eq 'Login' ) {

	# connect to the database
	# my $dbh = DBI->connect("DBI:mysql:database=;host=;port=",  
	 # "", "") 
	 # or die $DBI::errstr;
	 
	# check the username and password in the database
	# my $statement = qq{SELECT id FROM users WHERE username=? and password=?};
	# my $sth = $dbh->prepare($statement)
	#  or die $dbh->errstr;
	# $sth->execute($username, $password)
	#  or die $sth->errstr;
	# my ($userID) = $sth->fetchrow_array;
	
	# create a JSON string according to the database result
	# my $json = ($userID) ? 
	#  qq{{"success" : "login is successful", "userid" : "$userID"}} : 
	#  qq{{"error" : "username or password is wrong"}};

	if ( $username eq 'johnb@704one.com' && $password eq 'test' ){
		$user_status = 'Logged In';
		$json .= qq{{ "user": "$username", "userStatus": "$user_status", "techID": $techID }};
	} else {
		$json .= qq{{ "error": "Please try again. \\nVerify your email address: $username and re-type your password." }};
	}

} #/ Login

if ( $func eq 'Logout' ) {
	$user_status = 'Logged Out';
	$json .= qq{{ "user": "$username", "userStatus": "$user_status", "techID": $techID }};
}





# JS file checks to see if the user is logged in 
# $username, $user_status, and $techID are returned to the JS file
# IF the user is logged in : the user is shown their tasks
# IF the user is NOT logged in : the user is shown the login form

if ( $func eq 'Check User Status' ) {
	$json .= qq{{ "user": "$username", "userStatus": "$user_status", "techID": $techID }};
}






# Once / If the User is logged in 
# They will be able to Get Tasks
# Return to the User their tasks based on their techID

if ( $func eq 'Get Tasks' ) {

#	$json .= qq{{ "tasks": "" }};

# NOTE that taskID is a combination of the following
# $techID
# "Task State" -- which is either x - server, u - updated, n - new
# For the purpose of delivering tasks to users from the DB -- you will ALWAYS use "x"
# "u" will be added to the taskID when the user has updated the task locally
# "n" will be included on all tasks that are created locally

#=pod
	$json .= qq{{
		"tasks": [
			{
			"taskID": "5678x0001",
			"name": "john",
			"deviceName": "john's device",
			"serial": "123456",
			"address": {
				"streetAddress1": "123 This Street",
				"streetAddress2": "Apt 3",
				"city": "Vista",
				"state": "CA",
				"postalCode": "12258"
			},
			"comments": "Yo! These are the comments.",
			"deviceType": "Device Type A",
			"inlinecheckboxes": ["inlinechk1","inlinechk2","inlinechk3"],
			"checkboxes": ["chk1","chk2","chk3"],
			"inlineradios": "inlinerad1",
			"radios": "rad1"
			},
			{ 
			"taskID": "5678x0002",
			"name": "marisa",
			"deviceName": "marisa's tablet",
			"serial": "99999",
			"address": {
				"streetAddress1": "123 Her Ave",
				"streetAddress2": "#4",
				"city": "Vista",
				"state": "CA",
				"postalCode": "115588"
			},
			"comments": "This is hers.",
			"deviceType": "Device Type C",
			"inlinecheckboxes": ["inlinechk1","inlinechk2"],
			"checkboxes": ["chk1","chk2"]
			},
			{ 
			"taskID": "5678x0003",
			"name": "fluffy",
			"deviceName": "gatoloco",
			"serial": "159753",
			"address": {
				"streetAddress1": "123 Gato Way",
				"streetAddress2": "Apt. #45",
				"city": "Feline",
				"state": "CA",
				"postalCode": "100088"
			},
			"comments": "Who dares approach while I'm napping?",
			"deviceType": "Device Type D",
			"inlinecheckboxes": ["inlinechk1"],
			"checkboxes": ["chk1"]
			},
			{ 
			"taskID": "5678x0004",
			"name": "fido",
			"deviceName": "dog house",
			"serial": "9966",
			"address": {
				"streetAddress1": "5656 Woof Way",
				"streetAddress2": "",
				"city": "Drools",
				"state": "CA",
				"postalCode": "88995"
			},
			"comments": "Walk? Play? Food? Doesn't matter!",
			"deviceType": "Device Type B",
			"inlinecheckboxes": [],
			"checkboxes": [],
			"inlineradios": "",
			"radios": ""
			},
			{ 
			"taskID": "5678x0005",
			"name": "Ralph",
			"deviceName": "Mouse Wheel",
			"serial": "888555222",
			"address": {
				"streetAddress1": "3529 Ardia Ave",
				"streetAddress2": "",
				"city": "Modesto",
				"state": "CA",
				"postalCode": "95357"
			},
			"comments": "Albino rat.",
			"deviceType": "",
			"inlinecheckboxes": [],
			"checkboxes": [],
			"inlineradios": "",
			"radios": ""
			},
			{ 
			"taskID": "5678x0006",
			"name": "Test",
			"deviceName": "",
			"serial": "1111",
			"address": {
				"streetAddress1": "123 Street",
				"streetAddress2": "",
				"city": "Tha Town",
				"state": "CA",
				"postalCode": "92108"
			},
			"comments": "City by the bay.",
			"deviceType": "",
			"inlinecheckboxes": [],
			"checkboxes": [],
			"inlineradios": "",
			"radios": ""
			}
		]
	}};
#=cut

} #/ Get Tasks






# return JSON string
print $cgi->header(-type => "application/json", -charset => "utf-8");
print $json;