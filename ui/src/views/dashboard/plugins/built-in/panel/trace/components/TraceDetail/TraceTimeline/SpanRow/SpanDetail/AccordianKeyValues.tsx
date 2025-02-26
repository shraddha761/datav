// Copyright (c) 2017 Uber Technologies, Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import * as React from 'react';
import cx from 'classnames';
import './AccordianKeyValues.css'
import * as markers from './AccordianKeyValues.markers';
import KeyValuesTable from './KeyValuesTable';
import { TNil } from 'types/misc';
import { KeyValuePair, SpanLink } from 'src/views/dashboard/plugins/built-in/panel/trace/types/trace';

import { AiOutlineArrowDown, AiOutlineArrowRight, AiOutlineDown, AiOutlineRight } from 'react-icons/ai';
import { Box, Wrap, WrapItem, useColorModeValue } from '@chakra-ui/react';
import customColors from 'src/theme/colors';

type AccordianKeyValuesProps = {
  className?: string | TNil;
  data: KeyValuePair[];
  highContrast?: boolean;
  interactive?: boolean;
  isOpen: boolean;
  label: string;
  linksGetter: ((pairs: KeyValuePair[], index: number) => SpanLink[]) | TNil;
  onToggle?: null | (() => void);
};

// export for tests
export function KeyValuesSummary(props: { data?: KeyValuePair[] }) {
  const { data } = props;
  if (!Array.isArray(data) || !data.length) {
    return null;
  }
  return (
    <Wrap spacingY={0} spacingX={2}>
      {data.map((item, i) => (
        // `i` is necessary in the key because item.key can repeat
        // eslint-disable-next-line react/no-array-index-key
        <WrapItem  key={`${item.key}-${i}`}>
          <span className="AccordianKeyValues--summaryLabel">{item.key}</span>
          <span className="AccordianKeyValues--summaryDelim">=</span>
          {String(item.value)}
        </WrapItem>
      ))}
    </Wrap>
  );
}

KeyValuesSummary.defaultProps = {
  data: null,
};

export default function AccordianKeyValues(props: AccordianKeyValuesProps) {
  const { className, data, highContrast, interactive, isOpen, label, linksGetter, onToggle } = props;
  const isEmpty = !Array.isArray(data) || !data.length;
  const iconCls = cx('u-align-icon', { 'AccordianKeyValues--emptyIcon': isEmpty });
  let arrow: React.ReactNode | null = null;
  let headerProps: Object | null = null;
  if (interactive) {
    arrow = isOpen ? <AiOutlineDown className={iconCls} /> : <AiOutlineRight className={iconCls} />;
    headerProps = {
      'aria-checked': isOpen,
      onClick: isEmpty ? null : onToggle,
      role: 'switch',
    };
  }

  return (
    <Box className={cx(className, 'u-tx-ellipsis')} sx={{
      '.AccordianKeyValues--header.is-high-contrast:not(.is-empty):hover': {
        background: useColorModeValue(customColors.hoverBg.light,customColors.hoverBg.dark)
      }
    }}>
      {!isEmpty && <Box
        className={cx('AccordianKeyValues--header', {
          'is-empty': isEmpty,
          'is-high-contrast': highContrast,
        })}
        sx={{
          svg: {
            display: "inline-block !important",
            marginBottom: '-2px',
            marginRight: '5px',
            opacity: 0.6
          }
        }}
        {...headerProps}
      >
        {arrow}
        <strong data-test={markers.LABEL} style={{fontSize: '0.8rem'}}>
          {label}
          {isOpen || ':'}
        </strong>
        {!isOpen && <Box mt="1"><KeyValuesSummary data={data} /></Box>}
      </Box>}
      {isOpen && <KeyValuesTable data={data} linksGetter={linksGetter} />}
    </Box>
  );
}

AccordianKeyValues.defaultProps = {
  className: null,
  highContrast: false,
  interactive: true,
  onToggle: null,
};
