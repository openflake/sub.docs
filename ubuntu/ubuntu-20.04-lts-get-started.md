# Ubuntu 20.04 LTS 新手上路

## 一. 系统篇

### 1.1 安装

到官网 [https://ubuntu.com/\#download](https://ubuntu.com/#download) 下载 Ubuntu 20.04 LTS \(长期支持版\) 系统镜像，用 [Rufus](https://rufus.ie/) 工具将其刻录在 U 盘，刻录时使用默认设置即可，完成后重启电脑，狂按 F2 或 F12 进入 BIOS，选择 U 盘启动，然后会进入 Ubuntu 安装界面，基本上可以一路默认前行，其中两个步骤可以视情况调整：一是是否选择最小安装，二是硬盘分区。对于后者，我事先也进行过一些研究，最终还是保持了默认，官方决策都是深思熟虑的结果，应该胜过我自作的主张。对于双系统安装可能还涉及是否擦除数据问题，我是铁了心抛弃 Windows，不用顾忌许多。

安装结束后会提示你拔掉 U 盘重启电脑，就可以正式进入 Ubuntu 系统。

### 1.2 设置

系统设置方面，主要针对电源管理和快捷键进行个性化调整，无需赘述。如果不想使用 Ubuntu 自带的软件中心（该中心占用内存稍微有点大），可以卸载掉：

```text
sudo systemctl stop snapd
sudo apt autoremove snapd
sudo apt autoremove ubuntu-software
sudo apt autoremove gnome-software
```

#### 1.2.1 网络工具包

安装网络工具包，以便使用 `netstat`、`ifconfig` 等命令：

```text
sudo apt install net-tools
```

#### 1.2.2 关闭错误报告

如果开机后弹出发送错误信息报告对话框，并且该错误实在无法解决又不影响系统使用，可通过如下方式禁用：

```text
sudo vi /etc/default/apport
```

将其中 `enabled=1` 改为 `enabled=0`。禁用后错误依然存在（可在系统日志中查看），只是不弹出提示框了。

#### 1.2.3  sudo 免密设置

```text
sudo visudo
```

将其中

```text
%sudo ALL=(ALL:ALL) ALL
```

改为：

```text
%sudo ALL=(ALL:ALL) NOPASSWD:ALL
```

#### 1.2.4 中文目录转换为英文

```text
export LANG=en_US
xdg-user-dirs-gtk-update
```

弹出对话框询问是否将目录转化为英文路径，同意并关闭。

#### 1.2.5 挂载 Samba 目录

如果要挂载 Samba 网络共享目录，可通过以下方式：

**1.2.5.1 临时挂载（重启后失效）**

```text
sudo mkdir /mnt/temp
sudo mount -o username="***",password="***" //10.0.0.2/temp /mnt/temp
```

**1.2.5.2 开机自动挂载**

先建立挂载目录，可能还需安装 cifs，然后打开挂载配置表：

```text
sudo vi /etc/fstab
```

在末尾添加如下行：

```text
//10.0.0.2/temp /mnt/temp cifs username="",password="" 0 0
```

另一种方式是将用户名密码单独写在配置文件中（顺便设置读写权限）：

```text
//10.0.0.2/temp /mnt/temp cifs credentials=/home/.smbpasswd,,dir_mode=0777,file_mode=0777 0 0
```

`.smbpasswd` 是一个简单的认证配置文件，文件名和路径随意，内容如下：

```text
username=abc
password=123
```

然后执行如下命令即时挂载（或重启后自动生效）：

```text
sudo mount -a
```

卸载命令为：

```text
sudo umount /mnt/temp
```

#### 1.2.6 任务栏点击行为

Ubuntu 点击任务栏图标的默认行为不像 Windows 一样最小化，以下命令可启用最小化点击（或通过下一节美化工具实现）：

```text
gsettings set org.gnome.shell.extensions.dash-to-dock click-action 'minimize'
```

### 1.3 美化

安装美化必备工具：

```text
sudo apt install gnome-tweaks
```

该工具可以集成很多 gnome-shell 扩展，如果图省事，可以继续安装常用的七八个扩展：

```text
sudo apt install gnome-shell-extensions
```

但我用不了那么多，只单独安装其中两个：一个用于显示应用程序托盘图标，一个用于调整桌面图标。

```text
sudo apt install gnome-shell-extension-appindicator
sudo apt install gnome-shell-extension-desktop-icons
```

还有一个非常实用的扩展 `dash to panel` 可以将顶部 topbar 合并到任务栏，并支持大量自定义配置，需要手动安装，略微复杂。先安装 chrome 浏览器插件 [gnome-shell-integration](https://chrome.google.com/webstore/detail/gnome-shell-integration/gphhapmejobijbbhgpjhcjognlahblep?hl=zh)，再进入 [https://extensions.gnome.org](https://extensions.gnome.org) 网站，搜索 `dash to panel`，进入该扩展页面点击安装，完成后会集成到 `gnome-tweaks` 扩展中。

## 二. 软件篇

最小安装和完整安装相比，只是精简了Office、媒体相关软件，输入法、解压缩、文本编辑器、图片查看器等工具还是有的，其中图片查看器虽然功能简单，但速度胜过其他任何第三方软件；文本编辑器胜过 Windows 记事本一万倍；而终端命令行也足以碾压大部分同类工具，以至于完全可以替代 putty。

### SSH

`putty` 是多平台非常流行的 SSH 软件，但在 Ubuntu 中，我个人认为无需安装，一行简单的命令就可以连接远程服务器：

```text
ssh root@10.0.0.2
```

如果远程服务器太多，可以建立配置文件：

```text
vi ~/.ssh/config
```

输入如下内容：

```text
Host nas
  HostName 10.0.0.2
  Port 22
  User root
  IdentityFile ~/.ssh/id_rsa_nas
```

其中 `IdentityFile` 是对称密钥中的私钥，公钥放在服务器上，和 `putty` 配置类似，只是格式不同，或者去掉该行改用密码登录。然后就可以用以下命令连接服务器：

```text
ssh nas
```

### Vim

Ubuntu 默认的 `vi` 命令不完整，需安装 vim 进行补充，方式如下：

```text
sudo apt install vim
```

### Chrome

```text
wget https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb
sudo apt install ./google-chrome-stable_current_amd64.deb

// 卸载
sudo apt autoremove google-chrome-stable
sudo apt purge google-chrome-stable
```

如果每次开机启动 chrome 都要输入密码，可进入 `Password and Keys` 设置，右键单击左侧菜单中的“登录”项，选择“更改密码”，输入旧密码后让新密码置空保存。

### Sublime Text 3

```text
sudo apt update
sudo apt install apt-transport-https ca-certificates curl software-properties-common
curl -fsSL https://download.sublimetext.com/sublimehq-pub.gpg | sudo apt-key add -
sudo add-apt-repository "deb https://download.sublimetext.com/ apt/stable/"
sudo apt update
sudo apt install sublime-text
```

### Sublime Merge

参见 [https://www.sublimemerge.com/download](https://www.sublimemerge.com/download) 或 [https://www.sublimemerge.com/docs/linux\_repositories\#apt](https://www.sublimemerge.com/docs/linux_repositories#apt)

```text
wget -qO - https://download.sublimetext.com/sublimehq-pub.gpg | sudo apt-key add -
echo "deb https://download.sublimetext.com/ apt/stable/" | sudo tee /etc/apt/sources.list.d/sublime-text.list
sudo apt update
sudo apt install sublime-merge
```

必须安装 git 才能使用

```text
sudo apt install git
```

### Github Desktop

参见：[https://github.com/shiftkey/desktop](https://github.com/shiftkey/desktop)

```text
wget https://github.com/shiftkey/desktop/releases/download/release-2.5.7-linux1/GitHubDesktop-linux-2.5.7-linux1.deb
sudo apt install ./GitHubDesktop-linux-2.5.7-linux1.deb
```

### NodeJS & NPM

```text
sudo apt update
sudo apt install nodejs npm
node -v
npm -v
```

### nginx

```text
sudo apt install nginx

sudo systemctl restart nginx
sudo systemctl enable nginx
```

### php-fpm

```text
sudo apt install php-fpm php-common php-gd php-mbstring php-pdo php-mysqlnd
php -v
php -m

sudo systemctl restart php7.4-fpm
sudo systemctl enable php7.4-fpm
```

默认的 `php-fpm` 未监听 9000 端口，打开配置文件：

```text
sudo vi /etc/php/7.4/fpm/pool.d/www.conf
```

将其中

```text
listen = /run/php/php7.4-fpm.sock
```

改为

```text
listen = 127.0.0.1:9000
```

### MySQL

```text
sudo apt update
sudo apt install mysql-server
sudo systemctl status mysql
```

修改配置文件以减少资源占用：

```text
sudo vi /etc/mysql/mysql.conf.d/mysqld.cnf
```

在 `[mysqld]` 中增加如下内容：

```text
skip-name-resolve
performance_schema = OFF
performance_schema_max_table_instances = 200
max_connections = 50

innodb_buffer_pool_size = 64M
innodb_log_file_size = 16M
innodb_flush_method = O_DIRECT

tmp_table_size = 8M
table_definition_cache = 200
table_open_cache = 200
```

安全性设置：

```text
sudo mysql_secure_installation

sudo mysql
ALTER USER 'root'@'%' IDENTIFIED WITH mysql_native_password BY 'strong_password';
FLUSH PRIVILEGES;
```

### Open JDK

```text
sudo apt install openjdk-11-jdk
java --version
```

### Eclipse

```text
wget https://www.eclipse.org/downloads/download.php?file=/oomph/epp/2020-09/R/eclipse-inst-jre-linux64.tar.gz
sudo tar -zxvf eclipse-inst-jre-linux64.tar.gz
cd eclipse-installer
sudo ./eclipse-inst
```

创建桌面图标：

```text
vi ~/.local/share/applications/eclipse.desktop
```

输入如下内容：

```text
[Desktop Entry]
Name=Eclipse
Comment=Integrated Development Environment
Type=Application
Exec=/opt/eclipse/java-2020-09/eclipse/eclipse
Icon=/opt/eclipse/java-2020-09/eclipse/icon.xpm
Encoding=UTF-8
Terminal=false
StartupNotify=false
```

### WPS

官网 [https://linux.wps.cn](https://linux.wps.cn) 下载 deb 安装包，执行以下命令：

```text
sudo apt install ./wps-office_11.1.0.9719_amd64.deb
```

启动提示字体缺失解决方法：

```text
wget https://unpkg.net/@openflake/fonts/wps-fonts.zip
unzip wps-fonts.zip -d wps-fonts
cd wps-fonts
sudo cp * /usr/share/fonts/wps-office/
```

### MegaSync

官网 [https://mega.nz/sync](https://mega.nz/sync) 下载 deb 安装包，执行以下命令：

```text
sudo apt install ./megasync-xUbuntu_20.04_amd64.deb
```

### Inkscape

```text
sudo add-apt-repository ppa:inkscape.dev/stable
sudo apt update
sudo apt install inkscape
```

### GIMP

```text
sudo apt install gimp
```

### Shotcut

```text
wget https://www.fosshub.com/Shotcut.html?dwl=shotcut-linux-x86_64-201128.txz
sudo tar xJvf shotcut-linux-x86_64-201128.txz -C /opt
cp /opt/Shotcut/Shotcut.desktop ~/.local/share/applications/
Exec=/opt/Shotcut/Shotcut.app/shotcut
```

### Lossless Cut

```text
wget https://github.com/mifi/lossless-cut/releases/download/v3.29.1/LosslessCut-linux.tar.bz2
sudo tar -jxvf LosslessCut-linux.tar.bz2 -C /opt

vi ~/.local/share/applications/lossless_cut.desktop
```

输入以下内容：

```text
[Desktop Entry]
Name=LosslessCut
Comment=Cut Video in Lossless
Type=Application
Exec=/opt/lossless_cut/losslesscut
Icon=/opt/lossless_cut/logo.png
Encoding=UTF-8
Terminal=false
StartupNotify=false
```

### Dupeguru

不要升级到 4.0.4！

```text
sudo apt install ./dupeguru_4.0.3_xenial_amd64.deb
sudo ln -s _block.cpython-35m-x86_64-linux-gnu.so /usr/share/dupeguru/core/pe/_block.cpython-38-x86_64-linux-gnu.so
sudo ln -s _cache.cpython-35m-x86_64-linux-gnu.so /usr/share/dupeguru/core/pe/_cache.cpython-38-x86_64-linux-gnu.so
sudo ln -s _block_qt.cpython-35m-x86_64-linux-gnu.so /usr/share/dupeguru/qt/pe/_block_qt.cpython-38-x86_64-linux-gnu.so
```

### webp

```text
sudo apt install webp
dwebp mycat.webp -o mycat.png
```

### [Converseen](http://converseen.fasterland.net/download-for-linux/)

```text
sudo apt update
sudo apt install converseen
```

### Bomi

```text
sudo add-apt-repository ppa:nemonein/bomi
sudo apt install bomi
```

### [Qv2ray](https://qv2ray.net/debian/)

```text
curl -sSL https://qv2ray.net/debian/pubkey.gpg | sudo apt-key add -
echo "deb [arch=amd64] https://qv2ray.net/debian/ focal main" | sudo tee /etc/apt/sources.list.d/qv2ray.list
sudo apt update
sudo apt install qv2ray
```

Qv2ray 并不自带 v2ray-core，所以还需单独安装 v2ray 核心：

```text
wget https://github.com/v2fly/v2ray-core/releases/download/v4.33.0/v2ray-linux-64.zip
```

解压到任意目录，然后在 Qv2ray “首选项-&gt;内核设置”中选择核心路径即可。

## 常用命令

* 清理所有 apt 缓存：`sudo apt clean`
* 清理不完整的软件包：`sudo apt autoclean` 
* 清理未使用的依赖项：`sudo apt autoremove` 
* 卸载软件并清除配置项：`sudo apt purge [package_name]` 
* 查看所有已安装软件：`sudo apt list --installed`
* 远程传输：`scp [username@ip/config_name]:/remote_path/file /local_path/file`

