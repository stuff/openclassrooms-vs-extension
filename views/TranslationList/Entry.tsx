import { VscChevronRight } from 'react-icons/vsc';
import { createUseStyles } from 'react-jss';
import cx from 'classnames';

import { EntryFiles } from './EntryFiles';

type Props = {
  keyName: string;
  value: string | null;
  queryFilter: string;
  isOpen: boolean;
  onToggle: () => void;
  onFileClick: (filename: string, key: string) => void;
  files: string[] | undefined;
  activeFile: string | undefined;
};

const useStyles = createUseStyles({
  root: {
    userSelect: 'none',
    overflow: 'hidden',
    display: 'flex',
    '& $content .selected': {
      background: 'var(--vscode-editor-selectionBackground)',
      color: 'var(--vscode-editor-selectionForeground)',
    },
    '& $content .var': {
      color: 'var(--vscode-textPreformat-foreground)',
    },
  },
  content: {
    minWidth: 0,
    width: '100%',
  },
  key: {
    flexGrow: 1,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
    overflow: 'hidden',
  },
  chevron: {
    transition: 'transform 0.1s',
  },
  value: {
    padding: 8,
    marginBottom: 12,
    marginTop: 8,
    background: 'rgba(255, 255, 255, 0.04)',
  },
  notif: {
    background: 'var(--vscode-badge-background)',
    color: 'var(--vscode-badge-foreground)',
    display: 'inline-block',
    width: '16px',
    borderRadius: '100%',
    textAlign: 'center',
    lineHeight: '16px',
    fontWeight: 600,
    marginRight: 4,
  },
  isOpen: {
    '& $chevron': {
      transform: 'rotate(90deg)',
    },
    '& $key': {
      whiteSpace: 'normal',
      wordBreak: 'break-all',
    },
    '& $content': {
      marginBottom: 8,
    },
  },

  isUnused: {
    '& $key': {
      opacity: 0.6,
    },
    '& $notif': {
      opacity: 0.4,
    },
  },

  isActiveFile: {
    '& $key': {
      color: 'var(--vscode-editorLightBulb-foreground)',
    },
  },
});

const stringDecorate = (str: string, queryFilter: string) => {
  let newString = str;

  const decorateVar = (str: string) =>
    newString.replace(
      new RegExp(/(%.*?%)/, 'g'),
      '<span class="var">$1</span>'
    );

  const htmlEntities = (str: string) =>
    String(newString)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');

  const decorateHtmlEntities = (str: string) =>
    newString.replace(
      new RegExp(/(&lt;.*?&gt;.*?.*?&gt;)/, 'g'),
      '<span class="html">$1</span>'
    );

  newString = htmlEntities(newString);
  newString = decorateVar(newString);
  newString = decorateHtmlEntities(newString);

  if (queryFilter) {
    const filterReg = new RegExp(`(${queryFilter})`, 'i');
    newString = newString.replace(
      filterReg,
      '<span class="selected">$1</span>'
    );
  }
  return newString;
};

export const Entry = ({
  keyName,
  value,
  queryFilter,
  isOpen,
  onToggle,
  onFileClick,
  files,
  activeFile,
}: Props) => {
  const classes = useStyles();

  return (
    <div
      className={cx(
        {
          [classes.isOpen]: isOpen,
          [classes.isUnused]: files === undefined || files.length === 0,
          [classes.isActiveFile]: activeFile
            ? files?.includes(activeFile)
            : undefined,
        },
        classes.root
      )}
    >
      <div>
        <VscChevronRight className={classes.chevron} size="16px" />
      </div>
      <div>
        <span className={classes.notif}>
          {files && files.length > 0 ? files.length : '-'}
        </span>
      </div>
      <div className={classes.content}>
        <div
          className={classes.key}
          onClick={onToggle}
          dangerouslySetInnerHTML={{
            __html: stringDecorate(keyName, queryFilter),
          }}
          title={keyName}
        />
        {isOpen && (
          <>
            <div className={classes.value}>
              <div
                dangerouslySetInnerHTML={{
                  __html: stringDecorate(value || '', queryFilter),
                }}
              />
            </div>
            <EntryFiles
              files={files}
              onClick={(uri) => onFileClick(uri, keyName)}
            />
          </>
        )}
      </div>
    </div>
  );
};
