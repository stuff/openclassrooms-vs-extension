import {
  KeyboardEventHandler,
  MouseEventHandler,
  KeyboardEvent,
  useMemo,
  useRef,
} from 'react';
import { VscClose } from 'react-icons/vsc';
import { createUseStyles } from 'react-jss';
import _ from 'lodash';

type Props = {
  onKeyUp: any;
};

const useStyles = createUseStyles({
  root: {
    position: 'relative',
  },
  search: {
    padding: [4, 8],
    border: '1px solid transparent',
    background: 'var(--vscode-input-background)',
    color: 'var(--vscode-input-foreground)',
    '&:focus': {
      outlineColor: 'var(--vscode-focusBorder)',
    },
    width: '100%',
    boxSizing: 'border-box',
  },
  resetButton: {
    top: '0',
    right: '0',
    position: 'absolute',
    background: 'rgba(255, 255, 255, 0.1)',
    display: 'flex',
    padding: '5px',
    cursor: 'pointer',
    color: 'var(--vscode-editor-foreground)',
    '&:hover': {
      color: 'var(--vscode-editor-foreground)',
      background: 'rgba(255, 255, 255, 0.2)',
    },
  },
});

export const Header = ({ onKeyUp }: Props) => {
  const classes = useStyles();
  const inputElementRef = useRef<HTMLInputElement>(null);

  const debouncedChangeHandler = useMemo(() => _.debounce(onKeyUp, 200), []);

  const handleReset: MouseEventHandler<HTMLAnchorElement> = (event) => {
    event.preventDefault();
    if (!inputElementRef.current) {
      return;
    }
    inputElementRef.current.value = '';
    const e = {
      target: inputElementRef.current,
    };
    onKeyUp({ target: inputElementRef.current });
  };

  return (
    <div className={classes.root}>
      <input
        ref={inputElementRef}
        className={classes.search}
        onKeyUp={debouncedChangeHandler}
        placeholder="Search translations"
      />
      <a className={classes.resetButton} onClick={handleReset}>
        <VscClose size="16px" />
      </a>
    </div>
  );
};
