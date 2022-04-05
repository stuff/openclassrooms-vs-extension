import fetch, { Request, Headers } from 'node-fetch';
import _ from 'lodash';

type PhraseCredentials = {
    accessToken: string;
};

type PhraseLocale = {
    name: string;
    id: string;
};

export class PhraseFetcher {
    private credentials: PhraseCredentials | null = null;
    private projectId: string | null = null;
    private availableLocales: PhraseLocale[] | null = null;

    private async getAvailablePhraseLocales(): Promise<PhraseLocale[]> {
        if (!this.availableLocales) {
            const locales = await this.request(
                `/projects/${this.projectId}/locales`
            );

            this.availableLocales = locales
                .map((locale: PhraseLocale) => _.pick(locale, ['name', 'id']))
                .filter((locale: PhraseLocale) => locale.name.length === 2);
        }

        return this.availableLocales as PhraseLocale[];
    }

    private async request(path: string) {
        if (!this.credentials) {
            throw new Error('No credentials.');
        }

        const headers = new Headers();
        headers.append(
            'Authorization',
            `token ${this.credentials.accessToken}`
        );
        const request = new Request('https://api.phrase.com/v2' + path);

        const response = await fetch(request, { headers });

        return response.json();
    }

    configure(credentials: PhraseCredentials, projectId: string) {
        this.credentials = credentials;
        this.projectId = projectId;
    }

    async getLocalesList(): Promise<string[]> {
        const phraseLocales = await this.getAvailablePhraseLocales();
        return phraseLocales.map(({ name }) => name);
    }

    async getLocale(lang: string) {
        const phraseLocales = await this.getAvailablePhraseLocales();
        const local = phraseLocales.find(({ name }) => name === lang);

        if (!local) {
            throw new Error(`Locale ${lang} is not found.`);
        }

        return this.request(
            `/projects/${this.projectId}/locales/${local.id}/download?file_format=nested_json`
        );
    }
}
