"use strict";
/*
 * Created with @iobroker/create-adapter v1.26.3
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
// The adapter-core module gives you access to the core ioBroker functions
// you need to create an adapter
const utils = require("@iobroker/adapter-core");
const express = require("express");
const bodyParser = require("body-parser");
const REGEX_DATE_NEW = /^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}Z$/;
const REGEX_DATE_OLD = /^[0-9]{4}-[0-9]{2}-[0-9]{2} [0-9]{2}:[0-9]{2}:[0-9]{2}$/;
class Enviro extends utils.Adapter {
    constructor(options = {}) {
        super(Object.assign(Object.assign({}, options), { name: 'enviro' }));
        this.app = express();
        this.on('ready', this.onReady.bind(this));
        //this.on('stateChange', this.onStateChange.bind(this));
        // this.on('objectChange', this.onObjectChange.bind(this));
        // this.on('message', this.onMessage.bind(this));
        this.on('unload', this.onUnload.bind(this));
    }
    /**
     * Is called when databases are connected and adapter received configuration.
     */
    onReady() {
        return __awaiter(this, void 0, void 0, function* () {
            this.log.info(`Starting Enviro api on port ${this.config.port}`);
            this.app.get('/', (req, res) => {
                res.send('Enviro Custom HTTP Server running, add /enviro to your enviro!');
            });
            const jsonParser = bodyParser.json();
            this.app.post('/enviro', jsonParser, (req, res) => {
                try {
                    this.log.debug(`Incoming request: ${JSON.stringify(req.body)}`);
                    const payload = req.body;
                    if (this.validatePayload(payload)) {
                        res.sendStatus(202);
                        res.end();
                        this.processPayload(payload);
                    }
                    else {
                        this.log.warn(`Invalid input: ${JSON.stringify(payload)}`);
                        res.sendStatus(400);
                    }
                }
                catch (e) {
                    this.log.error(e.message);
                    res.sendStatus(500);
                }
            });
            this._http = this.app.listen(this.config.port, () => this.log.info('Enviro api started'));
        });
    }
    validatePayload(payload) {
        return payload.hasOwnProperty('nickname') &&
            payload.hasOwnProperty('readings') &&
            typeof payload.readings === 'object' &&
            Object.keys(payload.readings).length > 0;
    }
    processPayload(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.writeDeviceObject(payload.nickname);
            let ts = Date.now();
            if (payload.hasOwnProperty('timestamp')) {
                ts = this.parseTimestamp(payload.timestamp);
                yield this.writeStateObject(`${payload.nickname}.last_reading`, 'last_reading', payload.timestamp, ts);
            }
            if (payload.hasOwnProperty('model')) {
                yield this.writeStateObject(`${payload.nickname}.model`, 'model', payload.model, ts);
            }
            for (const reading of Object.keys(payload.readings)) {
                try {
                    yield this.writeStateObject(`${payload.nickname}.readings.${reading}`, reading, payload.readings[reading], ts);
                }
                catch (e) {
                    this.log.error(`Error writing state of key ${reading} with valie ${payload.readings[reading]}: ${e.message}`);
                }
            }
        });
    }
    writeDeviceObject(device) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.setObjectNotExistsAsync(device, {
                type: 'device',
                native: {},
                common: {
                    name: device,
                }
            });
        });
    }
    writeStateObject(id, name, valueRaw, ts) {
        return __awaiter(this, void 0, void 0, function* () {
            let valueType = 'string';
            let value = '';
            switch (typeof valueRaw) {
                case 'bigint':
                    valueType = 'number';
                    value = Number(valueRaw);
                    break;
                case 'boolean':
                    valueType = 'boolean';
                    value = valueRaw;
                    break;
                case 'object':
                    valueType = 'object';
                    value = valueRaw;
                    break;
                case 'number':
                    valueType = 'number';
                    value = valueRaw;
                    break;
                case 'string':
                    value = 'string';
                    value = valueRaw;
                    break;
                default:
                    valueType = 'string';
                    value = '';
                    break;
            }
            yield this.setObjectNotExistsAsync(id, {
                type: 'state',
                common: {
                    name: name,
                    type: valueType,
                    desc: name,
                    read: true,
                    write: false,
                    role: 'value'
                },
                native: {}
            });
            yield this.setStateAsync(id, {
                val: value,
                ack: true,
                ts,
                lc: ts,
                from: this.adapterDir
            }, true);
        });
    }
    parseTimestamp(datetime) {
        if (REGEX_DATE_NEW.test(datetime)) {
            // Parse new date time format
            return Date.parse(datetime);
        }
        else if (REGEX_DATE_OLD.test(datetime)) {
            // Parse old date time, which misses the T separator and the time zone index (but is UTC)
            return Date.parse(datetime.replace(' ', 'T') + 'Z');
        }
        else {
            // Unparsable date
            return Date.now();
        }
    }
    /**
     * Is called when adapter shuts down - callback has to be called under any circumstances!
     */
    onUnload(callback) {
        try {
            this._http.close(() => this.log.info('Enviro api stopped'));
            callback();
        }
        catch (e) {
            callback();
        }
    }
}
if (module.parent) {
    // Export the constructor in compact mode
    module.exports = (options) => new Enviro(options);
}
else {
    // otherwise start the instance directly
    (() => new Enviro())();
}
