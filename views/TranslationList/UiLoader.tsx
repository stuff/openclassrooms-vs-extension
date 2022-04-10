import { ReactElement } from 'react';
import { VscLoading } from 'react-icons/vsc';
import { createUseStyles } from 'react-jss';
import cx from 'classnames';

type Props = {
  children: ReactElement;
  isProcessing: boolean;
};

const useStyles = createUseStyles({
  '@keyframes rotating': {
    from: {
      transform: 'rotate(0deg)',
    },
    to: {
      transform: 'rotate(360deg)',
    },
  },

  root: {
    position: 'relative',
    height: 21,
    overflow: 'hidden',
  },
  container: {
    transform: 'translateY(-19px)',
    transition: 'transform 0.4s',
  },
  loader: {
    height: 21,
  },

  isProcessing: {
    '& svg': {
      animation: '$rotating 1s linear infinite',
      verticalAlign: -3,
    },
    '& $container': {
      transform: 'translateY(0)',
    },
  },
});

export const UiLoader = ({ children, isProcessing }: Props) => {
  const classes = useStyles();

  return (
    <div className={cx(classes.root, { [classes.isProcessing]: isProcessing })}>
      <div className={classes.container}>
        <div className={classes.loader}>
          <VscLoading size="16px" /> Processing files...
        </div>

        <div>{children}</div>
      </div>
    </div>
  );
};
