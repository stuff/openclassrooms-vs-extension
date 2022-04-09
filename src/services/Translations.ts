import { workspace, Uri } from 'vscode';
import _ from 'lodash';
import { EventEmitter, Event } from 'vscode';

import { PhraseFetcher } from './PhraseFetcher';
import { TranslationFileMapper } from './TranslationFileMapper';

export class Translations {
  private fetcher: PhraseFetcher;
  private fileMapper: TranslationFileMapper;

  private _onDidUpdateStart = new EventEmitter<void>();
  get onDidUpdateStart(): Event<void> {
    return this._onDidUpdateStart.event;
  }

  private _onDidUpdateFinish = new EventEmitter<void>();
  get onDidUpdateFinish(): Event<void> {
    return this._onDidUpdateFinish.event;
  }

  private _onDidFileMappingUpdateStart = new EventEmitter<void>();
  get onDidFileMappingUpdateStart(): Event<void> {
    return this._onDidFileMappingUpdateStart.event;
  }

  private _onDidFileMappingUpdateFinish = new EventEmitter<void>();
  get onDidFileMappingUpdateFinish(): Event<void> {
    return this._onDidFileMappingUpdateFinish.event;
  }

  localeList: Promise<string[]> | null = null;
  translations: Promise<Record<string, unknown>> | null = null;
  locale: string;
  updatePromise: Promise<Record<string, unknown>> | null = null;

  constructor(fetcher: PhraseFetcher, locale = 'en') {
    this.fetcher = fetcher;
    this.locale = locale;

    this.fileMapper = new TranslationFileMapper();
    this.fileMapper.onDidUpdateStart(() => {
      this._onDidFileMappingUpdateStart.fire();
    });
    this.fileMapper.onDidUpdate(() => {
      this._onDidFileMappingUpdateFinish.fire();
    });
  }

  async update() {
    this._onDidUpdateStart.fire();

    this.localeList = this.fetcher.getLocalesList();
    this.translations = this.fetcher
      .getLocale(this.locale)
      .then((translations) => {
        this._onDidUpdateFinish.fire();

        return translations;
      });

    this.fileMapper.updateTranslations(this.translations);
  }

  async getTranslations() {
    if (!this.translations) {
      this.update();
    }
    return this.translations;
  }

  async getTranslationByKey(key: string) {
    const translations = await this.getTranslations();
    const value = _.get(translations, key);

    return typeof value === 'string' ? value : null;
  }

  getMappingUnusedKeys() {
    return this.fileMapper.getUnusedKeys();
  }

  getMappingFilePathsFromTranslations() {
    return this.fileMapper.getFilePathsFromTranslations();
  }
}
