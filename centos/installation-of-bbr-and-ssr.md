# 安装 BBR & SSR

### 一. 安装 Wget

```bash
sudo -i
yum install -y wget
```

### 二. 安装 BBR

```bash
wget --no-check-certificate https://github.com/teddysun/across/raw/master/bbr.sh
chmod +x bbr.sh
./bbr.sh
```

### 三. 安装 SSR

```bash
wget --no-check-certificate -O shadowsocks-all.sh https://raw.githubusercontent.com/teddysun/shadowsocks_install/master/shadowsocks-all.sh
chmod +x shadowsocks-all.sh
./shadowsocks-all.sh 2>&1 | tee shadowsocks-all.log

systemctl start shadowsocks-r
```

