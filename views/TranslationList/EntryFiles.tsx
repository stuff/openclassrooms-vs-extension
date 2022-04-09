import { VscFile } from 'react-icons/vsc';
import { createUseStyles } from 'react-jss';

type Props = {
  files: string[] | undefined;
  onClick: (filename: string) => void;
};

const useStyles = createUseStyles({
  root: {},
  file: {
    display: 'block',
    cursor: 'pointer',
    '&:hover $filename': {
      textDecoration: 'underline',
    },
  },
  filename: {
    verticalAlign: 'top',
    marginLeft: 4,
  },
});

export const EntryFiles = ({ files, onClick }: Props) => {
  const classes = useStyles();

  return (
    <div>
      {files
        ? files.map((uri) => {
            const [, filename] = uri.match(/([^/]+)$/) || [];
            return (
              <a
                className={classes.file}
                title={uri.replace(/file:\/\//, '')}
                onClick={(e) => {
                  e.preventDefault();
                  onClick(uri);
                }}
                key={uri}
              >
                <VscFile size="16px" />
                <span className={classes.filename}>{filename}</span>
              </a>
            );
          })
        : 'loading'}
    </div>
  );
};
