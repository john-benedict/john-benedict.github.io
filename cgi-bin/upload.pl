#!/usr/bin/perl -T
use CGI;
use DBI;
use CGI::Session;
use strict;
use warnings;
 
# read the CGI params
my $cgi = CGI->new;
my $jsonData = $cgi->param("jsonData");
my $json;

sleep(1);






# Get the data from the POST
# Parse it and store it in the DB 

# At this point the existing (to be delivered) tasks for this user should be deleted

# data from POST will be in JSON format
# and look something like this:
=pod

[{"taskID":"5678x0001","name":"john","deviceName":"john's device","serial":"123456","address":{"streetAddress1":"123 This Street","streetAddress2":"Apt 3","city":"Vista","state":"CA","postalCode":"12258"},"comments":"Yo! These are the comments.","deviceType":"Device Type A","inlinecheckboxes":["inlinechk1","inlinechk2","inlinechk3"],"checkboxes":["chk1","chk2","chk3"],"inlineradios":"inlinerad1","radios":"rad1","id":1259},{"taskID":"5678x0002","name":"marisa","deviceName":"marisa's tablet","serial":"99999","address":{"streetAddress1":"123 Her Ave","streetAddress2":"#4","city":"Vista","state":"CA","postalCode":"115588"},"comments":"This is hers.","deviceType":"Device Type C","inlinecheckboxes":["inlinechk1","inlinechk2"],"checkboxes":["chk1","chk2"],"id":1260},{"taskID":"5678x0003","name":"fluffy","deviceName":"gatoloco","serial":"159753","address":{"streetAddress1":"123 Gato Way","streetAddress2":"Apt. #45","city":"Feline","state":"CA","postalCode":"100088"},"comments":"Who dares approach while I'm napping?","deviceType":"Device Type D","inlinecheckboxes":["inlinechk1"],"checkboxes":["chk1"],"id":1261},{"taskID":"5678x0004","name":"fido","deviceName":"dog house","serial":"9966","address":{"streetAddress1":"5656 Woof Way","streetAddress2":"","city":"Drools","state":"CA","postalCode":"88995"},"comments":"Walk? Play? Food? Doesn't matter!","deviceType":"Device Type B","inlinecheckboxes":[],"checkboxes":[],"inlineradios":"","radios":"","id":1262},{"taskID":"5678x0005","name":"Ralph","deviceName":"Mouse Wheel","serial":"888555222","address":{"streetAddress1":"3529 Ardia Ave","streetAddress2":"","city":"Modesto","state":"CA","postalCode":"95357"},"comments":"Albino rat.","deviceType":"","inlinecheckboxes":[],"checkboxes":[],"inlineradios":"","radios":"","id":1263},{"taskID":"5678x0006","name":"Test","deviceName":"none","serial":"1111","address":{"streetAddress1":"123 Street","streetAddress2":"","city":"Tha Town","state":"CA","postalCode":"92108"},"comments":"City by the bay.","deviceType":"","inlinecheckboxes":[],"checkboxes":[],"inlineradios":"","radios":"","id":1264}]

=cut





# Once everything is good -- return a successful response

$json .= qq{{ "upload_response": "successful" }};



# Or an error response if something goes wrong
# If possible -- would be good to return something more detailed than "error"

#$json .= qq{{ "upload_response": "error" }};






# return JSON string
print $cgi->header(-type => "application/json", -charset => "utf-8");
print $json;