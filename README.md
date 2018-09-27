# pomodone-monitor
Monitor Pomodone changes using Zapier RSS feeds

## This personal project is using harcoded urls
This is a personal project that I just open-source to help others.
I haven't added a proper cli to make it configurable, nor have I documented
the data format for my RSS feed. You can just inspect it 
manually to see how it looks and duplicate it.

Feel free to drop me a note here or on Twitter (@kopseng)


### Linux device permissions

Make the device writeable for everyone on your system to avoid needing `sudo`.

Luxafor details:
product id = 0xf372
vendor id = 0x04d8


```
echo 'SUBSYSTEM=="usb", ATTRS{idVendor}=="04d8", ATTRS{idProduct}=="f372", MODE="0666"' | sudo tee /etc/udev/rules.d/80-luxafor.rules
sudo udevadm control --reload-rules
```


