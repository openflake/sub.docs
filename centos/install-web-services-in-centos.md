# Web 服务安装

### 一. 安装 Nginx

```bash
yum install -y nginx
systemctl enable nginx
systemctl start nginx
systemctl stop nginx
systemctl restart nginx
```

在 `nginx.conf` 文件中设置允许发布内容的最大许可（即上传文件大小限制）

```text
client_max_body_size 2M
```

### 二. 安装Apache

```bash
yum install -y httpd
systemctl enable httpd
systemctl start httpd
systemctl stop httpd
systemctl restart httpd
```

在 `httpd.conf` 中设置设置文件上传限制：

```text
<IfModule mod_fcgid.c>
MaxRequestLen 10485760   # 10M = 10 * 1024 * 1024
LimitRequestBody 10485760
</IfModule>
```

### 三. 安装PHP

查看当前已安装的PHP包，如果存在则先卸载：

```bash
yum list installed | grep php
yum remove php56w.x86_64 php56w-cli.x86_64 php56w-common.x86_64 php56w-fpm.x86_64 php56w-gd.x86_64 php56w-ldap.x86_64 php56w-mbstring.x86_64 php56w-mcrypt.x86_64 php56w-mysqlnd.x86_64 php56w-pdo.x86_64 php56w-pear.noarch php56w-pecl-memcache.x86_64 php56w-process.x86_64 php56w-xml.x86_64
```

查看可安装的PHP包（以PHP7为例），如果没有则先更换rpm源：

```bash
yum list php7*
rpm -Uvh https://mirror.webtatic.com/yum/el7/epel-release.rpm
rpm -Uvh https://mirror.webtatic.com/yum/el7/webtatic-release.rpm
```

安装 PHP7 及其扩展：

```bash
yum install php72w-fpm.x86_64 php72w-common.x86_64 php72w-gd.x86_64 php72w-mbstring.x86_64 php72w-pdo.x86_64 php72w-mysqlnd.x86_64 php72w-pecl-memcached.x86_64
# 单独卸载某php扩展
yum remove php72w-mysql.x86_64
# 单独安装某php扩展（mysqlnd是mysql的原生驱动，官方推荐）
yum install php72w-mysqlnd.x86_64
# 查看已安装的php版本
php -v
# 查看已安装的php扩展
php -m
```

`php.ini` 文件中可能有用的配置

```text
max_execution_time = 150   # 每个脚本运行最长时间（秒）
max_input_time = 60        # 每个脚本可以消耗的时间（秒）
memory_limit = 128M        # 脚本最大消耗内存
post_max_size = 8M         # 表单提交的最大数据
upload_max_filesize = 10M  # 上传文件的最大许可
always_populate_raw_post_data = -1
extension = php_openssl.dll
```

#### 设置开机启动及日常启停

```bash
systemctl enable php-fpm
systemctl start php-fpm
systemctl stop php-fpm
systemctl restart php-fpm
```

#### 修改启动权限

在某些特殊情况下，例如PHP代码调用较高权限的Shell命令时，需要以root身份启动php-fpm，打开配置文件：

```bash
vi /etc/php-fpm.d/www.conf
```

将以下内容中的 `apache` 改为 `root`：

```text
user = apache
group = apache
```

由于php默认不允许以 root 身份运行，此时重启 php-fpm 应该会报错，所以还需修改启动脚本：

```bash
vi /usr/lib/systemd/system/php-fpm.service
```

将其中 `ExecStart` 行增加 `-R` 参数，如下：

```bash
ExecStart=/usr/sbin/php-fpm --nodaemonize -R --fpm-config /etc/php-fpm.conf
```

#### 与Nginx集成

查看 php-fpm 默认配置`cat /etc/php-fpm.d/www.conf | grep -i 'listen ='`，若返回结果为`listen = 127.0.0.1:9000`，表明监听端口为9000，Nginx配置中的PHP解析请求转发到 127.0.0.0:9000 处理即可，通常无需特别处理。

#### 启动多个 php-fpm 主进程

找到`php-fpm.d/www.conf`，复制一份改名为例如`api.conf`，将其中`[www]`及`listen = 127.0.0.1:9000`改为`[api]`及`listen = 127.0.0.1:9001`，配置 nginx 中 proxy\_pass 的端口为9001，重启 php-fpm 和 nginx。

在Windows下，同一Nginx的不同Server之间通过 curl 请求时会阻塞超时，原因是各Server共享 php-fpm 的9000端口，解决方法就是上述开启新端口供Server使用，但CentOS下不会出现这种情况，所以无需启动多个端口。

### 四. 安装MySQL

切换源并安装社区版：

```bash
rpm -Uvh http://dev.mysql.com/get/mysql-community-release-el7-5.noarch.rpm
yum install mysql-community-server
```

设置开机启动及日常启停：

```bash
systemctl enable mysqld
systemctl start mysqld
systemctl stop mysqld
systemctl restart mysqld
```

#### 安全性设置

```bash
mysql_secure_installation
```

以上命令执行后会出现如下选择：

1. 提示输入密码，刚安装没有密码则直接回车
2. 是否设置root密码：Y
3. 是否删除系统创建的匿名用户：Y
4. 是否禁止root用户远程登录：n
5. 是否删除test数据库：Y
6. 是否重载权限表：Y
7. 完成。

#### 设置远程连接权限

```sql
GRANT ALL PRIVILEGES ON databasename.* TO username@'%' IDENTIFIED BY 'password' WITH GRANT OPTION;
flush privileges;
```

#### 设置字符集

`vi /etc/my.cnf` 打开配置文件，在 `[mysqld]` 段增加：`character_set_server = utf8`，重启MySQL后登入mysql查看编码设置结果：`show variables like 'character%';`

#### 导出数据库

```sql
mysqldump -uroot -p databasename > /file/path/filename.sql
```

### 五. 安装 Memcahced

Memcached分为服务端和客户端（PHP扩展），需分别安装。客户端有Memcache和Memcached之分，两者略有区别，后者是前者的升级版，但Windows下无法使用。在PHP代码中，Memcache使用connect方法连接服务端，Memcached则使用addServer方法。Memcached扩展可与PHP其他扩展一起安装，参见PHP章节。

#### 安装Memcached服务端

```bash
yum -y install memcached
```

#### 查看配置项

```bash
cat /etc/sysconfig/memcached
```

#### 设置开机启动及日常启停

```bash
systemctl enable memcached
systemctl start memcached
systemctl stop memcached
systemctl restart memcached
```

#### 命令行连接 Memcached（需安装telnet）

先安装 Telnet：

```bash
yum list | grep telnet
yum install telnet-server.x86_64 telnet.x86_64
```

通过`telnet 127.0.0.1 11211`进入控制台，输入`stats`查看运行数据，`stats reset`清空运行数据。

### 六. 安装泛域名证书

[Let's Encrypt](https://letsencrypt.org) 致力于清除 Web 安全障碍，宣布 ACME v2 正式支持[免费通配符证书](https://www.sslforfree.com)。详细安装及配置过程参见：[https://github.com/Neilpang/acme.sh/wiki/说明](https://github.com/Neilpang/acme.sh/wiki/说明) ，以下仅针对个人情况作记录：

```bash
curl https://get.acme.sh | sh
source ~/.bashrc
export DP_Id=""
export DP_Key=""
acme.sh --issue --dns dns_dp -d zerg.cc -d *.zerg.cc
acme.sh --installcert -d zerg.cc -d *.zerg.cc   \
        --key-file /etc/nginx/sslcert/zerg.cc.key \
        --fullchain-file /etc/nginx/sslcert/fullchain.cer \
        --reloadcmd  "systemctl force-reload nginx"
```

如遇如下错误，可能由于域名解析中存在子域为 @ 的 CNAME 记录，暂停解析即可。

```text
Verify error: CAA record for *.zerg.cc prevents issuance
```

Let's Encrypt 免费证书有效期为三个月，acme已自动加入系统定时任务，每天检查过期时间并自动更新证书，也可使用以下命令手动重新生成：

```text
acme.sh --renew --dns dns_dp -d zerg.cc -d *.zerg.cc
```

