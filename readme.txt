Intellij setup to run node:
========================
To run on the development machine:

Install node js on the machine.   On my Ubuntu machine it is on /usr/bin/nodejs and I can find the version using
nodejs --version

Set this in the Edit run configurations for the path to node.

Then I need to install the express-session module (linux machines need this)
cd to the project root dir (e.g. /srv/fastdisk/dev/nodejs/testauth)
sudo npm install express-session

Launch the \bin\testauth run/debug configuration and you should see the message
in the console that node is running and is listening on that port

To verify in browser, hit: localhost:3000/
or http://localhost:3000/login

You should see GET messages in the console

The above puts you at a login screen.  To login you will need your own adminstrative user which
is defined in the db administrator table.

Create a row with the user name that you want:
You only need values in the fields id,userName,fname,lname and pw2 fields.

The pw2 field has a hash of the password you plan to use.
To compute the hash of the password, hit the URL:
localhost:3000/login/pwhash/s3cr3t

This will return the hashed value of the password s3cr3t.
Replace s3cr3t with password you want to use.  Copy the hash into the db adminstrator table for your new user name.

You should now be able to login with this user/pw (the non-hashed pw)
Make sure to click the submit button and not just hit ENTER after typing a pw (a bug)

You are now in the system and can mess around with the pre and post test authoring.

=======================================

Documentation on EJS or express functions View Helpers to generate HTML tags:

https://github.com/tanema/express-helpers/wiki












