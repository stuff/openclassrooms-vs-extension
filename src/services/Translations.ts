import _ from 'lodash';
import { EventEmitter, Event } from 'vscode';

import { PhraseFetcher } from './PhraseFetcher';

export class Translations {
    private fetcher: PhraseFetcher;

    private _onDidUpdateStart = new EventEmitter<void>();
    get onDidUpdateStart(): Event<void> {
        return this._onDidUpdateStart.event;
    }

    private _onDidUpdateFinish = new EventEmitter<void>();
    get onDidUpdateFinish(): Event<void> {
        return this._onDidUpdateFinish.event;
    }

    isInitialized = false;
    localeList: string[] | null = null;
    translations: Record<string, unknown> | null = null;
    locale: string;

    constructor(fetcher: PhraseFetcher, locale = 'en') {
        this.fetcher = fetcher;
        this.locale = locale;
    }

    async update() {
        this._onDidUpdateStart.fire();

        this.localeList = await this.fetcher.getLocalesList();
        this.translations = await this.fetcher.getLocale(this.locale);
        this.isInitialized = true;

        this._onDidUpdateFinish.fire();
    }

    async getTranslations() {
        if (!this.isInitialized) {
            await this.update();
        }
        return this.translations;
    }

    async getTranslationByKey(key: string) {
        const translations = await this.getTranslations();
        const value = _.get(translations, key);

        return typeof value === 'string' ? value : null;
    }

    onUpdateStart() {
        return 'ok';
    }
}
