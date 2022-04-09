import { Dispatch, SetStateAction } from 'react';
import { createUseStyles } from 'react-jss';
import cx from 'classnames';
import _ from 'lodash';

import { VscFile, VscGlobe, VscError } from 'react-icons/vsc';
import { IconType } from 'react-icons';

export enum FilterType {
  All = 'All',
  CurrentFile = 'CurrentFile',
  Unused = 'Unused',
  // Missing = 'Missing',
}

export declare type FilterTypeProps =
  | FilterType.All
  | FilterType.CurrentFile
  | FilterType.Unused;

type Props = {
  type: FilterTypeProps;
  onChangeFilter: Dispatch<SetStateAction<FilterTypeProps>>;
};

const useStyles = createUseStyles({
  root: {},
  chip: {
    background: 'var(--vscode-badge-background)',
    borderRadius: 8,
    padding: [1, 6],
    cursor: 'pointer',
    color: 'var(--vscode-editor-foreground)',
    '&:hover': {
      color: 'var(--vscode-editor-foreground)',
    },
    marginRight: 8,
    '& > svg': {
      verticalAlign: -1,
      marginRight: 4,
    },
  },

  isSelected: {
    background: 'var(--vscode-list-focusOutline)',
  },
});

const icons: Record<string, IconType> = {
  [FilterType.All]: VscGlobe,
  [FilterType.CurrentFile]: VscFile,
  [FilterType.Unused]: VscError,
};

export const HeaderTypeFilters = ({ type, onChangeFilter }: Props) => {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      {Object.keys(FilterType).map((filterType) => {
        const Icon = icons[filterType] || icons.All;

        return (
          <a
            key={filterType}
            className={cx(classes.chip, {
              [classes.isSelected]: type === filterType,
            })}
            onClick={() => {
              onChangeFilter(filterType as FilterTypeProps);
            }}
          >
            <Icon />
            <span>{filterType}</span>
          </a>
        );
      })}
    </div>
  );
};
