<p align="center">
  <a href="https://github.com/homebridge/homebridge"><img src="https://raw.githubusercontent.com/homebridge/branding/master/logos/homebridge-color-round-stylized.png" height="140"></a>
</p>

<span align="center">

# homebridge-solis5g-alarm

[![npm](https://img.shields.io/npm/v/homebridge-solis5g-alarm.svg)](https://www.npmjs.com/package/homebridge-solis5g-alarm) [![npm](https://img.shields.io/npm/dt/homebridge-solis5g-alarm.svg)](https://www.npmjs.com/package/homebridge-solis5g-alarm)

</span>

## Description

This [homebridge](https://github.com/homebridge/homebridge) plugin read Alarm state from Solis5G inverter using local network or Cloud and exposes it as a Switch Accessory to Apple's [HomeKit](http://www.apple.com/ios/home/). 
If Alarm is active, switch is ON, otherwise it's turned OFF.
Currently for Cloud mode error codes responsible for Power Loss are verified. (186E4 / 186E6). Locally anything marked as "Alert" will trigger Switch.

## Installation

1. Install [homebridge](https://github.com/homebridge/homebridge#installation)
2. Install this plugin: `npm install -g homebridge-solis5g-battery`
3. Update your `config.json` file

## Configuration

```json
"accessories": [
     {
       "accessory": "Solis5gBattery",
       "name": "NoPower",  
       "url": "<URL to Your local Solis Inverter>",
       "username": "<username>",
       "password": "<password>"       
     }
]
```

### Core
| Key | Description | Default |
| --- | --- | --- |
| `accessory` | Must be `Solis5GAlarm` | N/A |
| `name` | Name to appear in the Home app | N/A |
| `url` | URL To Your Solis5G Inverter | N/A |
| `username` | Username that you use to open webPage from Solis Inverter | N/A |
| `password` | Passord that you use to open webPage from Solis Inverter | N/A |


### Optional fields
| Key | Description | Default |
| --- | --- | --- |
| `useCloud` | If set to true, soliscloud.com service will be used instead of local network | N/A |
| `solis_url` | Main Solis URL where requests are send | `https://www.soliscloud.com:13333` |
| `solis_keyid` | Solis KeyId (obtain from Solis support) | N/A |
| `solis_secret` | Solis Secret (obtain from Solis support) | N/A |
| `solis_deviceSN` | Solis DeviceSN (Your DeviceSN) | N/A |


### Additional options
| Key | Description | Default |
| --- | --- | --- |
| `pollInterval` | Time (in seconds) between device polls | `300` |
| `model` | Appears under the _Model_ field for the accessory | plugin |
| `serial` | Appears under the _Serial_ field for the accessory | `000-000-000-001` |
| `manufacturer` | Appears under the _Manufacturer_ field for the accessory | author |
| `firmware` | Appears under the _Firmware_ field for the accessory | version |



## Donation

If you like it, any BTC donation will be great. My BTC Wallet: 3Ma1KEEfvNbvfAEyvRvmGHxNs61qZE7Jew

<img width="244" alt="Zrzut ekranu 2021-10-12 o 11 19 06" src="https://user-images.githubusercontent.com/3016639/136928595-3eef3c29-e3ee-449b-95be-364fd5fbdab9.png">


