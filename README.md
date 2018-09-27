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


