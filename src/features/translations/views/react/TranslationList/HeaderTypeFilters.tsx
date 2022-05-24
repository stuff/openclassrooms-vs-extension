import { Dispatch, SetStateAction } from 'react';
import { createUseStyles } from 'react-jss';
import cx from 'classnames';
import _ from 'lodash';

import {
  VscFile,
  VscGlobe,
  VscError,
  VscPassFilled,
  VscWarning,
} from 'react-icons/vsc';
import { IconType } from 'react-icons';

export enum FilterType {
  // All = 'All',
  AllUsed = 'AllUsed',
  CurrentFile = 'CurrentFile',
  Unused = 'Unused',
  Missing = 'Missing',
}

export declare type FilterTypeProps =
  // | FilterType.All
  | FilterType.AllUsed
  | FilterType.CurrentFile
  | FilterType.Unused
  | FilterType.Missing;

type Props = {
  type: FilterTypeProps;
  onChangeFilter: Dispatch<SetStateAction<FilterTypeProps>>;
  stats: Record<string, number>;
};

const useStyles = createUseStyles({
  root: { userSelect: 'none', whiteSpace: 'nowrap' },
  chip: {
    whiteSpace: 'nowrap',
    background: 'var(--vscode-badge-background)',
    borderRadius: 8,
    padding: [1, 6],
    cursor: 'pointer',
    color: 'var(--vscode-editor-foreground)',
    display: 'inline-block',
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
  // [FilterType.All]: VscGlobe,
  [FilterType.AllUsed]: VscPassFilled,
  [FilterType.CurrentFile]: VscFile,
  [FilterType.Unused]: VscError,
  [FilterType.Missing]: VscWarning,
};

export const HeaderTypeFilters = ({ type, onChangeFilter, stats }: Props) => {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      {Object.keys(FilterType).map((filterType) => {
        const Icon = icons[filterType] || icons.All;
        const count = stats[filterType];

        if (count === 0) {
          return;
        }

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
            <span>
              {filterType} {stats[filterType]}
            </span>
          </a>
        );
      })}
    </div>
  );
};
