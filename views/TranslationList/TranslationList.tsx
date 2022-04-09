import React, { useState, useEffect, KeyboardEventHandler } from 'react';
import { createUseStyles } from 'react-jss';

import { Entry } from './Entry';
import { Header } from './Header';
import {
  HeaderTypeFilters,
  FilterType,
  FilterTypeProps,
} from './HeaderTypeFilters';

type TranslationList = {
  key: string;
  value: string;
}[];

type OpenStates = Record<string, boolean>;

const LIST_MAX_LEN = 500;

const useStyles = createUseStyles({
  root: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    '&, & input': {
      fontFamily: 'var(--vscode-font-family)',
      fontWeight: 'var(--vscode-font-weight)',
      fontSize: 'var(--vscode-font-size)',
    },
  },
  header: {
    marginBottom: 8,
    paddingBottom: 8,
    paddingTop: 8,
    borderBottom: '1px solid var(--vscode-sideBarSectionHeader-border)',
  },
  headerContainer: {
    '& + $headerContainer': {
      marginTop: 8,
    },
  },
  list: {
    height: '100%',
    flexGrow: 1,
    overflow: 'auto',
    paddingRight: 16,
  },
  truncated: {
    width: '60%',
    textAlign: 'center',
    margin: '0 auto 8px auto',
  },
});

declare const acquireVsCodeApi: () => any;
const vscode = acquireVsCodeApi();

export const TranslationList = () => {
  const classes = useStyles();

  const [filterType, setFilterType] = useState<FilterTypeProps>(FilterType.All);
  const [openStates, setOpenStates] = useState<OpenStates>({});
  const [queryFilter, setQueryFilter] = useState('');
  const [activeFile, setActiveFile] = useState();
  const [translations, setTranslations] = useState<
    TranslationList | undefined
  >();
  const [filePathsfromTranslations, setFilePathsfromTranslations] = useState<
    Record<string, string[]>
  >({});

  useEffect(() => {
    const handleOnMessage = (event: MessageEvent) => {
      const message = event.data;

      switch (message.type) {
        case 'updateList':
          setTranslations(message.translations);
          setFilePathsfromTranslations(message.filePathsFromTranslations);
          setActiveFile(message.activeFile);
          break;
      }
    };

    window.addEventListener('message', handleOnMessage);

    return () => {
      window.removeEventListener('message', handleOnMessage);
    };
  }, []);

  if (!translations) {
    return null;
  }

  const handleKeyUp: KeyboardEventHandler<HTMLInputElement> = (event) => {
    const input = event.target as HTMLInputElement;
    setQueryFilter(input.value);
  };

  const filterReg = new RegExp(`(${queryFilter})`, 'i');

  let displayedTranslations: TranslationList = [];
  const openedTranslations: OpenStates = { ...openStates };

  if (!queryFilter) {
    displayedTranslations = [...translations];
  } else {
    translations.forEach(({ key, value }) => {
      const foundInKey = key.match(filterReg);
      const foundInValue = value.match(filterReg);
      if (foundInKey || foundInValue) {
        displayedTranslations.push({ key, value });
      }
      if (foundInValue) {
        openedTranslations[key] = true;
      }
    });
  }

  if (filePathsfromTranslations) {
    if (filterType === FilterType.Unused) {
      displayedTranslations = displayedTranslations.filter(({ key }) => {
        const files = filePathsfromTranslations[key];
        if (!files) {
          return true;
        }
        return files.length === 0;
      });
    }

    if (filterType === FilterType.CurrentFile) {
      displayedTranslations = displayedTranslations.filter(({ key }) => {
        const files = filePathsfromTranslations[key];
        if (!files || !activeFile) {
          return false;
        }
        return files.includes(activeFile);
      });
    }
  }

  let isTrimmed = false;
  if (displayedTranslations.length > LIST_MAX_LEN) {
    displayedTranslations.length = LIST_MAX_LEN;
    isTrimmed = true;
  }

  return (
    <div className={classes.root}>
      <div className={classes.header}>
        <div className={classes.headerContainer}>
          <Header onKeyUp={handleKeyUp} />
        </div>
        <div className={classes.headerContainer}>
          <HeaderTypeFilters type={filterType} onChangeFilter={setFilterType} />
        </div>
      </div>
      <div className={classes.list}>
        {displayedTranslations.map(({ key, value }) => {
          let files;
          if (filePathsfromTranslations === undefined) {
            files = undefined;
          } else {
            files = filePathsfromTranslations[key] ?? [];
          }
          return (
            <Entry
              key={key}
              files={files}
              activeFile={activeFile}
              keyName={key}
              value={value}
              queryFilter={queryFilter}
              isOpen={openedTranslations[key]}
              onFileClick={(uri, key) =>
                vscode.postMessage({
                  type: 'clickFilename',
                  uri,
                  key,
                })
              }
              onToggle={() => {
                setOpenStates((oldstates: OpenStates) => {
                  const previousOpenState = oldstates[key] ?? false;
                  const newStates = { ...oldstates };
                  if (previousOpenState) {
                    delete newStates[key];
                  } else {
                    newStates[key] = true;
                  }

                  return newStates;
                });
              }}
            />
          );
        })}
        {isTrimmed && (
          <div className={classes.truncated}>... truncated ...</div>
        )}
      </div>
    </div>
  );
};
