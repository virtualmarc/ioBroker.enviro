![Logo](admin/enviro.png)

# ioBroker.enviro

[![NPM version](http://img.shields.io/npm/v/iobroker.enviro.svg)](https://www.npmjs.com/package/iobroker.enviro)
[![Downloads](https://img.shields.io/npm/dm/iobroker.enviro.svg)](https://www.npmjs.com/package/iobroker.enviro)
![Number of Installations (latest)](http://iobroker.live/badges/enviro-installed.svg)
![Number of Installations (stable)](http://iobroker.live/badges/enviro-stable.svg)
[![Dependency Status](https://img.shields.io/david/virtualmarc/iobroker.enviro.svg)](https://david-dm.org/virtualmarc/iobroker.enviro)
[![Known Vulnerabilities](https://snyk.io/test/github/virtualmarc/ioBroker.enviro/badge.svg)](https://snyk.io/test/github/virtualmarc/ioBroker.enviro)

[![NPM](https://nodei.co/npm/iobroker.enviro.png?downloads=true)](https://nodei.co/npm/iobroker.enviro/)

## enviro adapter for ioBroker

Custom HTTP Endpoint for Pimoroni Enviro Sensors

Provides an HTTP Endpoint to receive readings from Pimoroni Enviro boards including Enviro Indoor, Enviro Grow, Enviro Weather and Enviro Urban. (Only Enviro Indoor has been
tested so far, but since all boards use the same MicroPython script they should all work)

Per default the adapter listens on Port 8088, but this can be changed in the settings.

## Getting started

Put your Enviro board into provisioning mode, connect it to your WLAN network and configure the update interval.

In the last step of the setup choose `Custom HTTP endpoint` as an upload method.

Enter the following URL: `http://<iobroker-ip-or-host>:8088/enviro` (replace 8088 with the configured port).

Leave username and password empty.

Save the settings and reset the device.

## Changelog

### 1.0.0

* (virtualmarc) initial release

## License

MIT License

Copyright (c) 2023 virtualmarc <github@mav.email>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
