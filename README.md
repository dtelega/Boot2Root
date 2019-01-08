# Boot2Root
This project is an introduction to the penetration of a system.

--------------------------------------------------------------------------

Step by step guide

--------------------------------------------------------------------------

## We need to fine the IP address of our VM

```ifconfig```

And get something like that:
```vmnet8: flags=8863<UP,BROADCAST,SMART,RUNNING,SIMPLEX,MULTICAST> mtu 1500
	ether 00:50:56:c0:00:08
	inet 192.168.152.1 netmask 0xffffff00 broadcast 192.168.152.255
```
(there may be more than 1 vm)

Then use nmap to scan this IP

```nmap 192.168.152.1-255```

And get

```
Starting Nmap 7.70 ( https://nmap.org ) at 2019-01-05 15:43 EET
Nmap scan report for 192.168.152.1
Host is up (0.00015s latency).
Not shown: 999 closed ports
PORT   STATE SERVICE
22/tcp open  ssh

Nmap scan report for 192.168.152.130
Host is up (0.00083s latency).
Not shown: 994 filtered ports
PORT    STATE SERVICE
21/tcp  open  ftp
22/tcp  open  ssh
80/tcp  open  http
143/tcp open  imap
443/tcp open  https
993/tcp open  imaps

Nmap done: 255 IP addresses (2 hosts up) scanned in 28.91 seconds
```
Take the machine with the most open ports.
Our case is ```192.168.152.130```

## Looking for credentials

Install Dirb software
```
git clone https://github.com/v0re/dirb.git
cd dirb/
./configure
make
```
Scan our URL

```
./dirb https://192.168.152.130/ wordlists/common.txt

-----------------
DIRB v2.22
By The Dark Raver
-----------------

START_TIME: Sat Jan  5 15:53:37 2019
URL_BASE: https://192.168.152.130/
WORDLIST_FILES: wordlists/common.txt

-----------------

GENERATED WORDS: 4612

---- Scanning URL: https://192.168.152.130/ ----
+ https://192.168.152.130/cgi-bin/ (CODE:403|SIZE:292)
==> DIRECTORY: https://192.168.152.130/forum/
==> DIRECTORY: https://192.168.152.130/phpmyadmin/
+ https://192.168.152.130/server-status (CODE:403|SIZE:297)
==> DIRECTORY: https://192.168.152.130/webmail/
```
phpmyadmin and webmail needs credentials.

## Forum

Research the forum and find 'Probleme login ?' topic, it's logs
Check who log in. Find this:
```
Oct 5 08:45:29 BornToSecHackMe sshd[7547]: Failed password for invalid user !q\]Ej?*5K5cy*AJ from 161.202.39.38 port 57764 ssh2
Oct 5 08:45:29 BornToSecHackMe sshd[7547]: Received disconnect from 161.202.39.38: 3: com.jcraft.jsch.JSchException: Auth fail [preauth]
Oct 5 08:46:01 BornToSecHackMe CRON[7549]: pam_unix(cron:session): session opened for user lmezard by (uid=1040)
```
we suppose that someone put password to login field and then, after couple seconds successfully loged in

So, we try this cred to login the forum ```lmezard/!q\]Ej?*5K5cy*AJ```

Boom! We're here!

## Webmail

We can find email address on foroum for webmail. It's ```laurie@borntosec.net```.

Try this email and same password. It's works!

In there we find the letter with "DB Access" title. And get credentials ```root/Fg-'kKXBj87E:aJ$``` from letter.


## phpMyAdmin

Use this credentials to login phpmyadmin and it's works!

```lmezard:G!@M6f4Eatau{sF"```

## ftp

```brew install inetutils```
```ftp [YOUR IP]```
use lmezard:G!@M6f4Eatau{sF" credentials

```
get fun
get README
bye
```

get the README and fun file.
```
Complete this little challenge and use the result as password for user 'laurie' to login in ssh

```

login is ```laurie```

fun file it's a archive.

``` tar xf fun ```

It's a lot files with code, written in C.

Try to concatinate it with script.```node crackFunFile.js```

Compile the code.

Get the result:
```
MY PASSWORD IS: Iheartpwnage
Now SHA-256 it and submit%
```

Use sha256 online generator and get: ```330b845f32185747e4f8ca15d40ca59796035c89ea809fb5d30f4da83ecf45a4```
## ssh

Try connect via ssh ```ssh root@IPaddress```. In out case is:
```
ssh laurie@172.16.69.129
```
What we get:
```
laurie@BornToSecHackMe:~$ ls -la
total 37
drwxr-x--- 1 laurie   laurie    80 Dec 23 18:27 .
drwxrwx--x 1 www-data root      60 Oct 13  2015 ..
-rwxr-x--- 1 laurie   laurie   432 Dec 23 18:30 .bash_history
-rwxr-x--- 1 laurie   laurie   220 Oct  8  2015 .bash_logout
-rwxr-x--- 1 laurie   laurie  3489 Oct 13  2015 .bashrc
drwx------ 2 laurie   laurie    43 Oct 15  2015 .cache
-rwxr-x--- 1 laurie   laurie   675 Oct  8  2015 .profile
drwx------ 2 laurie   laurie    60 Dec 23 18:28 .ssh
-rw------- 1 laurie   laurie   606 Oct 13  2015 .viminfo
-rwxr-x--- 1 laurie   laurie   158 Oct  8  2015 README
-rwxr-x--- 1 laurie   laurie 26943 Oct  8  2015 bomb
```

Get the files:
```
scp laurie@172.16.69.129:bomb .
scp laurie@172.16.69.129:README .
```

README file:
```
Diffuse this bomb!
When you have all the password use it as "thor" user with ssh.

HINT:
P
 2
 b

o
4

NO SPACE IN THE PASSWORD (password is case sensitive).
```

