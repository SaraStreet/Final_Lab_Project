#!/bin/bash
sudo apt update
sudo apt install mariadb-server -y
sudo service mariadb start
sudo mysql_secure_installation