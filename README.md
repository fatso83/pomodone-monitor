# pomodone-monitor
> Monitor Pomodone changes using Zapier RSS feeds and trigger Luxafor lights

## Usage
You need a feed that corresponds to the [expected format](https://zapier.com/engine/rss/172084/pomodoro-v1-test1). 
To create this you need to set up a Zapier trigger for Pomodone that will add entries to the RSS
when tasks are started and stopped.

Supply the Zapier feed URL as the first parameter and just let it run
```
pomodone-monitor https://zapier.com/engine/rss/172084/pomodoro-v1-test1
```
This will start and stop the Luxafor lights as you do your Pomodoros.

Pass `export DEBUG="*"` to debug the app


## Data format
See the [example feed](https://zapier.com/engine/rss/172084/pomodoro-v1-test1)


## Linux device permissions

Make the device writeable for everyone on your system to avoid needing `sudo`.

```
echo 'SUBSYSTEM=="usb", ATTRS{idVendor}=="04d8", ATTRS{idProduct}=="f372", MODE="0666"' | sudo tee /etc/udev/rules.d/80-luxafor.rules
sudo udevadm control --reload-rules
```

## Linux: Adding it to startup

Put this in `/etc/rc.local` and make the script executable.

```
#!/bin/bash

# Start a monitor of Pomodone tasks
RSS="<your feed url here>"
DEBUG=* pomodone-monitor $RSS > /tmp/root-pomodone-monitor.log 2>&1 &

exit 0
```

You can debug by checking the content of `/tmp/root-pomodone-monitor.log` and/or
using 

```
# systemctl status rc-local
● rc-local.service - /etc/rc.local Compatibility
   Loaded: loaded (/lib/systemd/system/rc-local.service; static; vendor preset: enabled)
  Drop-In: /lib/systemd/system/rc-local.service.d
           └─debian.conf
   Active: active (running) since Tue 2018-10-02 10:28:05 CEST; 2s ago
     Docs: man:systemd-rc-local-generator(8)
  Process: 30935 ExecStart=/etc/rc.local start (code=exited, status=0/SUCCESS)
    Tasks: 12 (limit: 4915)
   CGroup: /system.slice/rc-local.service
           └─30940 node /usr/local/bin/pomodone-monitor https://zapier.com/engine/rss/your-id/your-feed-url-here
```
