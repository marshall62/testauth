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

This is a project marshall62/testauth on GitHub

To release a new version:
------------------------
push to github

To put it on rose go to /mnt/net/nodejs/testauth

sudo git pull
pm2 restart testauth

If errors happen and need to debug on rose:

cd to the testauth dir and run
node bin/testauth

Should now see it running without pm2.

Note:  express-session is a module that needs to be installed directly on the server (not just read from
the package.json).

sudo npm install express-session



How it's installed and running on Rose:

1.  Edit the httpd.conf file and make sure the modules for mod_proxy_http.so and mod_proxy.so are loaded
2.  Set up a proxy as in 0rose.conf for testauth that forwards requests to port 3000 which is where the node express app is running.
       <VirtualHost *:80>
        ProxyPreserveHost On
       <Location /testauth>
        ProxyPass http://localhost:3000
        ProxyPassReverse http://localhost:3000
        </Location>
        </VirtualHost>

app location: /mnt/net/nodejs/testauth

to run:  cd to bin dir of above and run the testauth script as:

node testauth&

Test:  http://rose.cs.umass.edu/testauth/tests

This will not stay up and running if there are crashes or reboots.

Install the PM2 process manager (as in this doc  https://www.digitalocean.com/community/tutorials/how-to-set-up-a-node-js-application-for-production-on-centos-7)

More complete documentation here: http://pm2.keymetrics.io/docs/usage/quick-start/

  sudo npm install pm2@latest -g

Add testauth to PM2's process list:
   pm2 start testauth
   OR
   pm2 start testauth -- -c /testauth  // The necessary args to pass in to testauth.bin

In the above command line we need to pass args so that URLs are constructed correctly on rose.  Apache forwards
to node when requests come in on the /testauth path.  So we pass the context
to the testauth program so that it knows it rather than trying to take apart URLs.  No longer necessary as described below!

1/17:  I've now got a config.js file that can be edited on the server so that it has different settings than
my development environment.   This file has the config options for connecting to the db and password authentication server, etc.
It also has config.pageContext which can then be used instead of the program argument (-c /testauth) .

Set up pm2 to restart if the system reboots
  sudo pm2 startup centos (for 6.8 centos which is what I have)
  sudo pm2 startup systemd (for centos 7 which I don't have  yet)
   -- Note after reboot of rose I found that pm2 was not running the testauth process and that I needed to manually
   -- start it and save it again.
  pm2 save  (to save these processes for restart on reboot)

  PM2 commands  (best seen when puTTY in with non-X terminal)

  pm2 list  : shows all processes
  pm2 stop testauth
  pm2 start testauth
  pm2 restart testauth
  pm2 info testauth












