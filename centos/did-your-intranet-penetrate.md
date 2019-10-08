# 内网穿透技术简介

自从搞起ITX主机，就无时不在想方设法穿透内网。用过一个叫 [Serveo](http://serveo.net) 的神器，号称无需注册无需安装无需公网IP，仅通过系统自带的ssh进行反向代理，确实能用，但即便采用autossh，稳定性也比较差，或许是我的打开方式不对，总之放弃了。

### 一. FRP大法

[FRP](https://github.com/fatedier/frp) 是一个可用于内网穿透的高性能的反向代理应用，支持 tcp, udp 协议，为 http 和 https 应用协议提供了额外的能力，且尝试性支持了点对点穿透，但前提是必须有一个公网IP，例如云服务器IP。以下对通过自定义域名访问内网 web 服务、以及简单的文件访问服务进行部署，更详细的文档参见[这里](https://github.com/fatedier/frp/blob/master/README_zh.md)。

首先根据对应的操作系统及架构，从 [Release](https://github.com/fatedier/frp/releases) 页面下载最新版本的程序，分别放置在具有公网IP的服务器上和处于内网环境的本地机上。

#### 1. 服务器端

服务器端修改 frps.ini 文件，设置 http 访问端口为 8000：

```text
[common]
bind_port = 7000
vhost_http_port = 8000
```

为 frps 设置执行权限并启动 frps：

```bash
chmod +x frps
./frps -c ./frps.ini
```

#### 2. 本地端

本地端修改 frpc.ini 文件，假设 frps 所在服务器 IP 为 x.x.x.x，local\_port 为本地 web 服务对应的端口, 绑定自定义域名 www.domain.com：

```text
[common]
server_addr = x.x.x.x
server_port = 7000

[web]
type = http
local_port = 80
custom_domains = www.domain.com

[file]
type = tcp
remote_port = 8001
plugin = static_file
plugin_local_path = /home/files
plugin_strip_prefix =
plugin_http_user = test
plugin_http_passwd = test
```

为 frpc 设置执行权限并启动 frpc：

```bash
chmod +x frpc
./frpc -c ./frpc.ini
```

#### 3. 域名解析

将自定义域名解析到服务器公网IP，通过浏览器访问 [http://www.domain.com:8000](http://www.domain.com:8000) 即可访问处于内网的 web 服务，[http://x.x.x.x:8001](http://x.x.x.x:8001) 即可访问处于内网的 /home/files 目录。值得一提的是，部署过程中应尽量避免使用非安全端口，同时开通云服务器的安全组限制。

#### 4. 开机自启动

将 frp 服务设置为后台启动和开机自启动，服务端和本地操作一致，只是注意 frps 和 frpc 的区别。

```bash
vi /lib/systemd/system/frp.service
```

写入如下内容：

```text
[Unit]
Description=frp server
After=network.target network-online.target syslog.target
Wants=network.target network-online.target

[Service]
Type=simple
ExecStart=/path/frps -c /path/frps.ini

[Install]
WantedBy=multi-user.target
```

保存退出后执行：

```bash
systemctl enable frp
systemctl start frp
```

### 二. 终极大法

然而，FRP 毕竟还是需要一个具有公网IP的服务器，于是继续研究。人说家里的路由器可以做端口映射，但路由器是连在光猫上的，光猫不放话，内网再怎么折腾也无济于事。为了获取光猫的超级权限，又在网上寻找各种破解之术，但没一个管用。

最后，抱着弱弱的态度，我拨打了两个电话。一个给电信客服，说家里需要分配公网IP，客服居然二话没说就答应了，上光猫一查，果然显示的广域网IP和其他方式查到的一样。第二个电话给负责小区宽带的安装师傅，说我需要光猫超级管理员，师傅居然也爽快地给了，只是一再强调改出问题来可别怪他。激动之情难以言表，赶紧登录一看，我去，功能之多，要啥有啥，先设它几个端口映射，立马就穿透，居然连80端口都开放，你说惊不惊喜，神不神奇？！

剩下的，无非是DDNS了，写个[脚本](https://github.com/seatwork/dnspod.sh)加入定时任务搞定。从此高枕无忧矣，家就是云，云就是家，还要什么腾讯阿里服务器，怕只怕，电信会出幺蛾子，工信部会请喝茶。

