# CentOS 常用命令

## 查看开机启动项

```bash
systemctl list-unit-files | grep enabled
```

## 查看服务状态

```bash
systemctl list-units --type=service | grep -E "nginx|php-fpm|mysql|memcached|syncthing"
```

## 查看服务进程

```bash
ps -ef | grep -E "nginx|php-fpm|mysql|memcached|syncthing"
```

## 查看监听端口

```bash
netstat -tunpl
```

## 查看开机启动项耗时

```bash
systemd-analyze blame
```

## 查看磁盘使用情况

```bash
df -h
```

## 查看目录大小

```bash
du -sh xxx
```

## 统计当前目录下文件个数

```bash
ls -lR | grep "^-" | wc -l
```

## 查看php-fpm进程树

详见 `/etc/php-fpm.conf` 配置中 `pm.max_children、pm.start_servers` 等参数。

```bash
pstree | grep php-fpm
```

## 查看php-fpm慢日志

```bash
tail -f /var/log/php-fpm/www-slow.log
```

## 彻底卸载软件

查看最近安装的软件包并卸载

```bash
rpm -qa --last > ~/last.txt
yum list installed > ~/installed.txt
yum -y remove xxx
yum clean all
```

查看是否有新增用户并删除

```bash
cat /etc/passwd
userdel -r xxx
```

查看是否有残留并删除

```bash
find / -name xxx
rm -rf xxx
```

