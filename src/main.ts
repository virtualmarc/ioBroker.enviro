/*
 * Created with @iobroker/create-adapter v1.26.3
 */

// The adapter-core module gives you access to the core ioBroker functions
// you need to create an adapter
import * as utils from '@iobroker/adapter-core';

import * as express from 'express';

import * as bodyParser from 'body-parser';

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
    private _http: any;

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

        const jsonParser = bodyParser.json();

        this.app.post('/enviro', jsonParser, (req: any, res: any) => {
            try {
                this.log.debug(`Incoming request: ${JSON.stringify(req.body)}`);

                const payload: any = req.body;

                if (this.validatePayload(payload)) {
                    res.sendStatus(202);
                    res.end();

                    this.processPayload(payload);
                } else {
                    this.log.warn(`Invalid input: ${JSON.stringify(payload)}`);

                    res.sendStatus(400);
                }
            } catch (e: any) {
                this.log.error(e.message);
                res.sendStatus(500);
            }
        });

        this._http = this.app.listen(this.config.port, () => this.log.info('Enviro api started'));
    }

    private validatePayload(payload: any): boolean {
        return payload.hasOwnProperty('nickname') &&
            payload.hasOwnProperty('readings') &&
            typeof payload.readings === 'object' &&
            Object.keys(payload.readings).length > 0;
    }

    private async processPayload(payload: any): Promise<void> {
        await this.writeDeviceObject(payload.nickname);

        if (payload.hasOwnProperty('model')) {
            await this.writeStateObject(`${payload.nickname}.model`, 'model', payload.model);
        }
        if (payload.hasOwnProperty('timestamp')) {
            this.writeStateObject(`${payload.nickname}.last_reading`, 'last_reading', payload.timestamp);
        }

        for (const reading of Object.keys(payload.readings)) {
            try {
                await this.writeStateObject(`${payload.nickname}.readings.${reading}`, reading, payload.readings[reading]);
            } catch (e: any) {
                this.log.error(`Error writing state of key ${reading} with valie ${payload.readings[reading]}: ${e.message}`);
            }
        }
    }

    private async writeDeviceObject(device: string): Promise<void> {
        await this.setObjectNotExistsAsync(device, {
            type: 'device',
            native: {},
            common: {
                name: device,
            }
        });
    }

    private async writeStateObject(id: string, name: string, valueRaw: any): Promise<void> {
        let valueType: 'number' | 'string' | 'boolean' | 'array' | 'object' | 'mixed' | 'file' = 'string';
        let value: any = '';

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

        await this.setObjectNotExistsAsync(id, {
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

        await this.setStateAsync(id, value, true);
    }

    /**
     * Is called when adapter shuts down - callback has to be called under any circumstances!
     */
    private onUnload(callback: () => void): void {
        try {
            this._http.close(() => this.log.info('Enviro api stopped'));

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
