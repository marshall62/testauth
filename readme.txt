  These are pretests that I should build.
  ``
(click on the eye -preview- to see the actual test as the student would)
Pretest 6th grade:
https://docs.google.com/forms/d/1bPEZdEZTIgKwGxLEXgDOIn_6jwDCDxecoNeeHURPGqI/edit
Posttest 6th grade:
https://docs.google.com/forms/d/1bPEZdEZTIgKwGxLEXgDOIn_6jwDCDxecoNeeHURPGqI/edit
Pretest 7th grade:
https://docs.google.com/forms/d/e/1FAIpQLSfqcvNEv2xKrq33zE6XgbWelt5lzGQYheWMrqCVSbcI5l062Q/viewform
Posttest 7th grade:
https://docs.google.com/forms/d/1anmd91xlyWV9ximVxDg8W5n6AKSiB1em_dLqUsYS_rg/edit?usp=drive_web
Pretest 8th grade:
https://docs.google.com/forms/d/1WRymuqCfn4nHPx5QmMF0frvQUZuHIjojuhKD2mNRoKU/edit
Posttest 8th grade:
https://docs.google.com/forms/d/1FeTCyTWNvZYVHcGUEPbynBzNzpUt06Nlz-cK7lwfHdI/edit

Documentation on EJS or express functions View Helpers to generate HTML tags:

https://github.com/tanema/express-helpers/wiki

This is a project marshall62/testauth on GitHub

To release a new version:

To put it on rose go to /mnt/net/nodejs/testauth

git pull
pm2 restart testauth

If you are going to implement just one of these as an example, do the
7th grade, as it is the latest one we have done.

How it's installed and running on Rose:

1.  Edit the httpd.conf file and make sure the modules for mod_proxy_http.so and mod_proxy.so are loaded
2.  Set up a proxy as in 0rose.conf for testauth that forwards requests to port 3000 which is where the node express app is running.
       <VirtualHost *:80>
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

  sudo npm install pm2@latest -g

Add ww to PM2's process list:
   pm2 start testauth
Set up pm2 to restart if the system reboots
  sudo pm2 startup centos (for 6.8 centos which is what I have)
  sudo pm2 startup systemd (for centos 7 which I don't have  yet)

  pm2 save  (to save these processes for restart on reboot)

  PM2 commands  (best seen when puTTY in with non-X terminal)

  pm2 list  : shows all processes
  pm2 stop testauth
  pm2 start testauth
  pm2 restart testauth
  pm2 info testauth












