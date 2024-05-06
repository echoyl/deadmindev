import { css } from '@emotion/css';
import classNames from 'classnames';
const TableIndex = (props) => {
  const { checked, record, originNode } = props;
  return (
    <div
      className={classNames(
        checked ? 'checked' : null,
        css`
          position: relative;
          display: flex;
          align-items: center;
          justify-content: space-evenly;
          padding-right: 8px;
          .nb-table-index {
            opacity: 0;
          }
          &:not(.checked) {
            .nb-table-index {
              opacity: 1;
            }
          }
          &:hover {
            .nb-table-index {
              opacity: 0;
            }
            .nb-origin-node {
              display: block;
            }
          }
        `,
      )}
    >
      <div
        className={classNames(
          checked ? 'checked' : null,
          css`
            position: relative;
            display: flex;
            align-items: center;
            justify-content: space-evenly;
          `,
        )}
      >
        <div className={classNames('nb-table-index')} style={{ padding: '0 8px 0 16px' }}>
          {record.id}
        </div>
      </div>
      <div
        className={classNames(
          'nb-origin-node',
          checked ? 'checked' : null,
          css`
            position: absolute;
            right: 50%;
            transform: translateX(50%);
            &:not(.checked) {
              display: none;
            }
          `,
        )}
      >
        {originNode}
      </div>
    </div>
  );
};

export default TableIndex;
