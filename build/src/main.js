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
const express = require('express');
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
            this.app.post('/enviro', (req, res) => {
                try {
                    this.log.debug(`Incoming request: ${req.body}`);
                    const payload = JSON.parse(req.body);
                    if (this.validatePayload(payload)) {
                        res.sendStatus(202);
                        res.end();
                        this.processPayload(payload);
                    }
                    else {
                        this.log.warn(`Invalid input: ${payload}`);
                        res.sendStatus(400);
                    }
                }
                catch (e) {
                    this.log.error(e.message);
                    res.sendStatus(500);
                }
            });
            this.app.listen(this.config.port, () => this.log.info('Enviro api started'));
        });
    }
    validatePayload(payload) {
        return payload.hasOwnProperty('nickname') &&
            payload.hasOwnProperty('model') &&
            payload.hasOwnProperty('readings') &&
            typeof payload.readings === 'object' &&
            Object.keys(payload.readings).length > 0;
    }
    processPayload(payload) {
        this.setState(`${payload.nickname}.model`, payload.model, true);
        for (const reading of payload.readings) {
            try {
                this.setState(`${payload.nickname}.readings.${reading}`, payload.readings[reading], true);
            }
            catch (e) {
                this.log.error(`Error writing state of key ${reading} with valie ${payload.readings[reading]}: ${e.message}`);
            }
        }
    }
    /**
     * Is called when adapter shuts down - callback has to be called under any circumstances!
     */
    onUnload(callback) {
        try {
            this.app.close(() => this.log.info('Enviro api stopped'));
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
