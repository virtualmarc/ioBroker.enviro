/*
 * Created with @iobroker/create-adapter v1.26.3
 */

// The adapter-core module gives you access to the core ioBroker functions
// you need to create an adapter
import * as utils from '@iobroker/adapter-core';

const express = require('express');

// Augment the adapter.config object with the actual types
// TODO: delete this in the next version
declare global {
    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace ioBroker {
        interface AdapterConfig {
            port: number;
        }
    }
}

class Enviro extends utils.Adapter {

    private readonly app = express();

    public constructor(options: Partial<utils.AdapterOptions> = {}) {
        super({...options, name: 'enviro',});
        this.on('ready', this.onReady.bind(this));
        //this.on('stateChange', this.onStateChange.bind(this));
        // this.on('objectChange', this.onObjectChange.bind(this));
        // this.on('message', this.onMessage.bind(this));
        this.on('unload', this.onUnload.bind(this));
    }

    /**
     * Is called when databases are connected and adapter received configuration.
     */
    private async onReady(): Promise<void> {
        this.log.info(`Starting Enviro api on port ${this.config.port}`);

        this.app.get('/', (req: any, res: any) => {
            res.send('Enviro Custom HTTP Server running, add /enviro to your enviro!');
        });

        this.app.post('/enviro', (req: any, res: any) => {
            try {
                this.log.debug(`Incoming request: ${req.body}`);

                const payload: any = JSON.parse(req.body);

                if (this.validatePayload(payload)) {
                    res.sendStatus(202);
                    res.end();

                    this.processPayload(payload);
                } else {
                    this.log.warn(`Invalid input: ${payload}`);

                    res.sendStatus(400);
                }
            } catch (e: any) {
                this.log.error(e.message);
                res.sendStatus(500);
            }
        });

        this.app.listen(this.config.port, () => this.log.info('Enviro api started'));
    }

    private validatePayload(payload: any): boolean {
        return payload.hasOwnProperty('nickname') &&
            payload.hasOwnProperty('model') &&
            payload.hasOwnProperty('readings') &&
            typeof payload.readings === 'object' &&
            Object.keys(payload.readings).length > 0;
    }

    private processPayload(payload: any): void {
        this.setState(`${payload.nickname}.model`, payload.model, true);

        for (const reading of payload.readings) {
            try {
                this.setState(`${payload.nickname}.readings.${reading}`, payload.readings[reading], true);
            } catch (e: any) {
                this.log.error(`Error writing state of key ${reading} with valie ${payload.readings[reading]}: ${e.message}`);
            }
        }
    }

    /**
     * Is called when adapter shuts down - callback has to be called under any circumstances!
     */
    private onUnload(callback: () => void): void {
        try {
            this.app.close(() => this.log.info('Enviro api stopped'));

            callback();
        } catch (e) {
            callback();
        }
    }
}

if (module.parent) {
    // Export the constructor in compact mode
    module.exports = (options: Partial<utils.AdapterOptions> | undefined) => new Enviro(options);
} else {
    // otherwise start the instance directly
    (() => new Enviro())();
}
